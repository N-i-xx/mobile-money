import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { transactionRoutes } from "./routes/transactions";
import { bulkRoutes } from "./routes/bulk";
import { transactionDisputeRoutes, disputeRoutes } from "./routes/disputes";
import { errorHandler } from "./middleware/errorHandler";
import { connectRedis, redisClient } from "./config/redis";
import { pool } from "./config/database";
import { globalTimeout, haltOnTimedout, timeoutErrorHandler } from "./middleware/timeout";
import { responseTime } from "./middleware/responseTime";
import { createQueueDashboard, getQueueHealth, pauseQueueEndpoint, resumeQueueEndpoint } from "./queue";
import { register } from "./utils/metrics";
import { metricsMiddleware } from "./middleware/metrics";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiter
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(metricsMiddleware);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(responseTime);

// Health & readiness
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/ready", async (req, res) => {
  const checks: Record<string, string> = { database: "down", redis: "down" };
  let allReady = true;

  try {
    await pool.query("SELECT 1");
    checks.database = "ok";
  } catch (err) {
    console.error("Database check failed", err);
    allReady = false;
  }

  try {
    if (redisClient?.isOpen) {
      await redisClient.ping();
      checks.redis = "ok";
    } else {
      checks.redis = "closed";
      allReady = false;
    }
  } catch (err) {
    console.error("Redis check failed", err);
    allReady = false;
  }

  res.status(allReady ? 200 : 503).json({
    status: allReady ? "ready" : "not ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});

// Timeout middleware
app.use(globalTimeout);
app.use(haltOnTimedout);

// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/transactions", transactionDisputeRoutes);
app.use("/api/transactions/bulk", bulkRoutes);
app.use("/api/disputes", disputeRoutes);

// Queue endpoints
app.get("/health/queue", getQueueHealth);
app.post("/admin/queues/pause", pauseQueueEndpoint);
app.post("/admin/queues/resume", resumeQueueEndpoint);

// Error handlers
app.use(timeoutErrorHandler);
app.use(errorHandler);

// Redis init
connectRedis()
  .then(() => {
    // Only log if not in test mode to keep test output clean
    if (process.env.NODE_ENV !== 'test') {
      console.log("Redis initialized");
    }
  })
  .catch((err) => {
    console.error("Redis failed", err);
    console.warn("Distributed locks not available");
  });

// Queue dashboard
const queueRouter = createQueueDashboard();
app.use("/admin/queues", queueRouter);

// --- START SERVER LOGIC ---
// We check if we are in a test environment to prevent port collisions
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app instance for Supertest integration tests
export default app;