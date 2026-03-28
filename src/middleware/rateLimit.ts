import { Request, Response } from "express";
import rateLimit, { Store, Options, IncrementResponse } from "express-rate-limit";
import { redisClient } from "../config/redis";

/**
 * Atomic Lua script for sliding-window rate limiting.
 *
 * KEYS[1] = rate limit key (e.g. "rl:global:127.0.0.1")
 * ARGV[1] = window duration in milliseconds
 * ARGV[2] = max requests allowed in the window
 *
 * Returns: { current_count, reset_time_ms }
 *   - current_count: number of hits in the current window (after this request)
 *   - reset_time_ms: absolute epoch ms when the window resets
 */
const RATE_LIMIT_LUA = `
local key        = KEYS[1]
local window_ms  = tonumber(ARGV[1])
local max        = tonumber(ARGV[2])
local now_ms     = tonumber(redis.call('TIME')[1]) * 1000 + math.floor(tonumber(redis.call('TIME')[2]) / 1000)

local data = redis.call('HMGET', key, 'count', 'reset')
local count = tonumber(data[1]) or 0
local reset = tonumber(data[2]) or (now_ms + window_ms)

if now_ms >= reset then
  count = 0
  reset = now_ms + window_ms
end

count = count + 1
redis.call('HMSET', key, 'count', count, 'reset', reset)
redis.call('PEXPIREAT', key, reset)

return { count, reset }
`;

/** How long (ms) to wait for Redis before falling back to allow-through */
const REDIS_TIMEOUT_MS = 200;

/**
 * Custom express-rate-limit store backed by Redis with atomic Lua scripts.
 * Falls back to allowing requests through when Redis is unavailable.
 */
class RedisRateLimitStore implements Store {
  private readonly prefix: string;
  private readonly windowMs: number;

  constructor(prefix: string, windowMs: number) {
    this.prefix = prefix;
    this.windowMs = windowMs;
  }

  private key(identifier: string): string {
    return `${this.prefix}:${identifier}`;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const redisKey = this.key(key);

    try {
      const result = await Promise.race<unknown>([
        redisClient.eval(RATE_LIMIT_LUA, {
          keys: [redisKey],
          arguments: [String(this.windowMs), String(Number.MAX_SAFE_INTEGER)],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis timeout")), REDIS_TIMEOUT_MS),
        ),
      ]);

      const [totalHits, resetTimeMs] = result as [number, number];
      return {
        totalHits,
        resetTime: new Date(resetTimeMs),
      };
    } catch (err) {
      // Graceful degradation: log and allow the request through
      console.warn("[rateLimit] Redis unavailable, allowing request through", {
        key: redisKey,
        error: (err as Error).message,
      });
      return {
        totalHits: 0,
        resetTime: new Date(Date.now() + this.windowMs),
      };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.key(key);
    try {
      await Promise.race<unknown>([
        redisClient.eval(
          `
          local data = redis.call('HMGET', KEYS[1], 'count', 'reset')
          local count = tonumber(data[1]) or 0
          if count > 0 then
            redis.call('HSET', KEYS[1], 'count', count - 1)
          end
          return 1
          `,
          { keys: [redisKey], arguments: [] },
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis timeout")), REDIS_TIMEOUT_MS),
        ),
      ]);
    } catch (err) {
      console.warn("[rateLimit] Redis decrement failed", {
        key: redisKey,
        error: (err as Error).message,
      });
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = this.key(key);
    try {
      await Promise.race<unknown>([
        redisClient.del(redisKey),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis timeout")), REDIS_TIMEOUT_MS),
        ),
      ]);
    } catch (err) {
      console.warn("[rateLimit] Redis resetKey failed", {
        key: redisKey,
        error: (err as Error).message,
      });
    }
  }
}

export interface RateLimiterConfig {
  /** Unique prefix to namespace this limiter's keys in Redis */
  prefix: string;
  /** Time window in milliseconds */
  windowMs: number;
  /** Max requests per window */
  max: number;
  /** Custom message on 429 */
  message?: object;
  /** Skip rate limiting entirely (useful for tests) */
  skip?: boolean;
}

/**
 * Creates an express-rate-limit middleware backed by Redis.
 *
 * Uses atomic Lua scripts to guarantee correctness across any number of
 * concurrent API nodes. Falls back to allow-through on Redis timeout.
 */
export function createRedisRateLimiter(config: RateLimiterConfig) {
  const { prefix, windowMs, max, message, skip } = config;

  if (skip || process.env.NODE_ENV === "test") {
    return (_req: Request, _res: Response, next: () => void) => next();
  }

  const store = new RedisRateLimitStore(prefix, windowMs);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    message: message ?? { error: "Too many requests, please try again later." },
    // Use the real client IP even behind a proxy
    keyGenerator: (req: Request) =>
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      "unknown",
  } as Partial<Options>);
}

// ─── Pre-built limiters ────────────────────────────────────────────────────────

/** Global API limiter: 100 req / 15 min (overridable via env) */
export const globalRateLimiter = createRedisRateLimiter({
  prefix: "rl:global",
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
});

/** Stellar / SEP endpoints: 20 req / min */
export const stellarRateLimiter = createRedisRateLimiter({
  prefix: "rl:stellar",
  windowMs: 60_000,
  max: 20,
});

/** SEP-24 interactive deposit/withdrawal: 10 req / min */
export const sep24RateLimiter = createRedisRateLimiter({
  prefix: "rl:sep24",
  windowMs: 60_000,
  max: 10,
  message: { error: "Too many requests, please try again later" },
});

/** SEP-31 cross-border payments: 10 req / min (strict) */
export const sep31RateLimiter = createRedisRateLimiter({
  prefix: "rl:sep31",
  windowMs: 60_000,
  max: 10,
  message: { error: "Too many requests, please try again later." },
});

/** SEP-12 KYC: 20 req / min */
export const sep12RateLimiter = createRedisRateLimiter({
  prefix: "rl:sep12",
  windowMs: 60_000,
  max: 20,
});

/** Export endpoint: 5 req / 15 min */
export const exportRateLimiter = createRedisRateLimiter({
  prefix: "rl:export",
  windowMs: 15 * 60_000,
  max: 5,
});
