# Mobile Money to Stellar Bridge

[![CI](https://github.com/sublime247/mobile-money/actions/workflows/ci.yml/badge.svg)](https://github.com/sublime247/mobile-money/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/sublime247/mobile-money/branch/main/graph/badge.svg)](https://codecov.io/gh/sublime247/mobile-money)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/sublime247/mobile-money/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready backend service that bridges African mobile money providers (MTN, Airtel, Orange) with the Stellar blockchain network, enabling seamless cross-border payments and remittances.

## 🌟 What We're Building

This platform solves a critical problem in African financial infrastructure: **connecting traditional mobile money systems with blockchain technology**. We enable:

- **Cross-border remittances** with lower fees than traditional services
- **Instant settlements** using Stellar's fast blockchain
- **Financial inclusion** by bridging mobile money (used by 500M+ Africans) with global crypto markets
- **Compliance-first** approach with built-in KYC, AML monitoring, and transaction limits
- **Developer-friendly** APIs (REST + GraphQL) for easy integration

### Real-World Use Cases

1. **Remittances**: Send money from Europe/US to Africa instantly via Stellar, recipient withdraws to mobile money
2. **Cross-border payments**: Pay suppliers in different African countries without expensive wire transfers
3. **Savings in stable assets**: Convert volatile local currency to USDC/XLM via mobile money
4. **Merchant payments**: Accept crypto payments, settle in local mobile money
5. **DeFi access**: Bridge between mobile money and Stellar DeFi protocols

## 🚀 Key Features

### Core Functionality
- **Mobile Money Integration**: MTN, Airtel, Orange Money support
- **Stellar Blockchain**: Native XLM and custom asset support (USDC, anchored assets)
- **Dual API**: RESTful API + GraphQL for flexible integration
- **Real-time Processing**: Background job queues with BullMQ and Redis
- **WebSocket Support**: Live transaction updates and notifications

### Security & Compliance
- **KYC/AML**: Multi-tier verification with transaction limits
- **2FA**: TOTP-based two-factor authentication
- **RBAC**: Role-based access control with Casbin
- **Rate Limiting**: Intelligent rate limiting and DDoS protection
- **Audit Logging**: Comprehensive audit trails for compliance
- **Session Security**: IP tracking, device fingerprinting, anomaly detection

### Financial Features
- **Dynamic Fees**: VIP tiers with volume-based discounts
- **Transaction Limits**: Provider-specific and KYC-based limits
- **Vault System**: Secure fund storage and management
- **Accounting Integration**: QuickBooks and Xero sync
- **Dispute Management**: Full dispute workflow and resolution
- **Fee Bumping**: Automatic Stellar transaction fee adjustment

### Developer Experience
- **TypeScript**: Full type safety and IntelliSense
- **Docker Support**: Development and production containers
- **Database Migrations**: Automated schema management
- **Comprehensive Testing**: Unit, integration, E2E, and load tests
- **CI/CD**: GitHub Actions with automated testing and deployment
- **API Documentation**: OpenAPI/Swagger specs
- **Webhook Support**: Zapier/Make.com integration

### Stellar Protocol Support (SEP)
- **SEP-10**: Stellar Web Authentication
- **SEP-12**: KYC API
- **SEP-24**: Hosted Deposit and Withdrawal
- **SEP-31**: Cross-Border Payments
- **SEP-38**: Quotes and Price Streams

## 📋 Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PostgreSQL** 16+
- **Redis** 7+
- **Docker** (optional, for containerized development)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sublime247/mobile-money.git
cd mobile-money
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mobilemoney

# Redis
REDIS_URL=redis://localhost:6379

# Stellar Network
STELLAR_NETWORK=testnet  # or 'mainnet'
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_ISSUER_SECRET=S...  # Your Stellar secret key

# Mobile Money Providers
MTN_API_KEY=your_mtn_api_key
MTN_API_SECRET=your_mtn_secret
AIRTEL_API_KEY=your_airtel_key
ORANGE_API_KEY=your_orange_key

# Security
JWT_SECRET=your_jwt_secret_min_32_chars
SESSION_SECRET=your_session_secret

# Optional: Email notifications
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# Optional: SMS notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Database Setup

```bash
# Run migrations
npm run migrate:up

# Seed development data (optional)
NODE_ENV=development npm run seed
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

### Docker Development

```bash
# Start all services (app, PostgreSQL, Redis)
npm run docker:dev

# Stop services
npm run docker:dev:down
```

Includes hot reload and debugger on port `9229`.

The development compose stack now also starts a local provider mock server on
`http://localhost:4010` and points MTN/Airtel traffic at it automatically.
Use `?scenario=success|failed|pending` or `x-mock-scenario` to control mock
responses, and `?delayMs=...` or `x-mock-delay-ms` to simulate timeouts.

To run only the mock server outside Docker:

```bash
npm run provider-mock:dev
```

### Docker Production

```bash
docker-compose up -d
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

Minimum coverage requirements: 70% (branches, functions, lines, statements)

### Watch Mode

```bash
npm run test:watch
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Load Testing

```bash
# Basic load test
npm run test:load

# Stress test
npm run test:load:stress

# Transaction-focused test
npm run test:load:transactions
```

### Mutation Testing

```bash
npm run test:mutation
```

## API Documentation

### Interactive docs (Swagger UI)

The API spec is generated at runtime directly from the Zod validation schemas — there is no manually maintained YAML or JSON file to keep in sync.

**Accessing the docs locally**

1. Start the server in development mode:
   ```bash
   npm run dev
   ```
2. Open your browser at:
   ```
   http://localhost:3000/docs
   ```
   Swagger UI loads with the full spec, including request/response shapes, examples, and a "Try it out" button for every endpoint.

3. The raw OpenAPI 3.0 JSON is also available at:
   ```
   http://localhost:3000/docs/openapi.json
   ```

**Docs are not available in production** — both `/docs` and `/docs/openapi.json` return `404` when `NODE_ENV !== 'development'`.

### How the spec stays in sync

The source of truth is **`src/openapi/schemas/`**, not `openapi.yaml`.

| File / folder | Purpose |
|---|---|
| `src/openapi/registry.ts` | Calls `extendZodWithOpenApi(z)` once; exports the shared registry |
| `src/openapi/schemas/*.ts` | One file per domain — Zod schemas annotated with `.openapi({ description, example })` |
| `src/openapi/paths/*.ts` | Route registrations (`registry.registerPath(...)`) per domain |
| `src/openapi/generator.ts` | Assembles the spec via `OpenApiGeneratorV3` on every server start |
| `src/routes/docs.ts` | Mounts Swagger UI and the JSON endpoint, dev-only |

**To update the docs:** edit or add a schema in `src/openapi/schemas/`, then restart the server (`npm run dev` uses `tsx watch` so it restarts automatically). The change appears in `/docs` immediately — no manual sync step.

> `openapi.yaml` in the repo root is a legacy file kept only for the SDK generator script (`npm run sdk:generate`). It is no longer the source of truth and will be removed in a future cleanup.
>
> **Backlog:** point `sdk:generate` at `http://localhost:3000/docs/openapi.json` instead of `openapi.yaml`. The dev server would need to be running during SDK generation, but it would mean the SDK always reflects the live Zod schemas with no manual sync. Once that's done, `openapi.yaml` can be deleted entirely.

---

## 📚 API Reference

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication via JWT token:

```bash
Authorization: Bearer <your_jwt_token>
```

Or API key for admin operations:

```bash
X-API-Key: <your_api_key>
```

### Core Endpoints

#### Health Checks

```bash
GET /health              # Service health status
GET /ready               # Readiness probe (checks DB and Redis)
```

#### Transactions

```bash
POST   /api/transactions/deposit      # Deposit from mobile money to Stellar
POST   /api/transactions/withdraw     # Withdraw from Stellar to mobile money
GET    /api/transactions              # List transactions (paginated)
GET    /api/transactions/:id          # Get transaction details
POST   /api/transactions/:id/cancel   # Cancel pending transaction
POST   /api/transactions/:id/dispute  # Create dispute
```

#### User Management

```bash
POST   /api/auth/register             # Register new user
POST   /api/auth/login                # Login
POST   /api/auth/logout               # Logout
POST   /api/auth/2fa/enable           # Enable 2FA
POST   /api/auth/2fa/verify           # Verify 2FA code
GET    /api/users/profile             # Get user profile
PUT    /api/users/profile             # Update profile
```

#### KYC

```bash
POST   /api/kyc/submit                # Submit KYC documents
GET    /api/kyc/status                # Check KYC status
POST   /api/kyc/upload                # Upload document
```

#### Vaults

```bash
POST   /api/vaults                    # Create vault
GET    /api/vaults                    # List user vaults
GET    /api/vaults/:id                # Get vault details
POST   /api/vaults/:id/transfer       # Deposit/withdraw from vault
```

#### Admin

```bash
GET    /api/admin/users               # List all users
GET    /api/admin/transactions        # All transactions
POST   /api/admin/fees/configurations # Create fee config
GET    /api/stats                     # System statistics
```

### GraphQL API

```bash
POST /graphql
```

GraphQL Playground available at `http://localhost:3000/graphql` in development.

Example query:

```graphql
query {
  transactions(limit: 10) {
    id
    amount
    status
    provider
    createdAt
  }
}

mutation {
  createDeposit(input: {
    amount: "10000"
    phoneNumber: "+237670000000"
    provider: MTN
  }) {
    id
    status
    referenceNumber
  }
}
```

### Webhooks

Configure webhooks to receive real-time notifications:

```bash
POST   /api/webhooks                  # Create webhook
GET    /api/webhooks                  # List webhooks
DELETE /api/webhooks/:id              # Delete webhook
```

Supported events:
- `transaction.completed`
- `transaction.failed`
- `transaction.pending`
- `kyc.approved`
- `kyc.rejected`

## 🔐 Security Features

### Transaction Limits

#### Per-Transaction Limits

| Limit | Amount | Purpose |
|-------|--------|---------|
| Minimum | 100 XAF | Prevent spam |
| Maximum | 1,000,000 XAF | Fraud prevention |

#### KYC-Based Daily Limits

| KYC Level | Daily Limit | Requirements |
|-----------|-------------|--------------|
| Unverified | 10,000 XAF | Email verification only |
| Basic | 100,000 XAF | ID document + selfie |
| Full | 1,000,000 XAF | Proof of address + video verification |

#### Provider-Specific Limits

| Provider | Min | Max | Notes |
|----------|-----|-----|-------|
| MTN | 100 XAF | 500,000 XAF | Most common |
| Airtel | 100 XAF | 1,000,000 XAF | Higher limits |
| Orange | 500 XAF | 750,000 XAF | Higher minimum |

### AML Monitoring

Automatic flagging of suspicious transactions:

- Single transaction > 1,000,000 XAF
- 24-hour total > 5,000,000 XAF
- Rapid structuring (3+ mixed transactions in 15 minutes)

### Rate Limiting

- Export endpoints: 5 requests/hour
- API endpoints: Configurable per endpoint
- GraphQL: Query complexity limits

## 🏗️ Architecture

### Technology Stack

**Backend**
- Node.js + TypeScript
- Express.js (REST API)
- Apollo Server (GraphQL)
- PostgreSQL (primary database)
- Redis (caching, sessions, queues)

**Blockchain**
- Stellar SDK
- Horizon API integration
- Custom asset support

**Background Jobs**
- BullMQ (job queues)
- Node-cron (scheduled tasks)

**Security**
- Helmet (HTTP headers)
- Bcrypt (password hashing)
- JWT (authentication)
- Speakeasy (2FA)
- Casbin (RBAC)

**Monitoring**
- Datadog APM
- Sentry (error tracking)
- Prometheus metrics
- Custom health checks

### Project Structure

```
mobile-money/
├── src/
│   ├── auth/              # Authentication & authorization
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── crypto/            # HSM and encryption
│   ├── graphql/           # GraphQL schema & resolvers
│   ├── jobs/              # Background jobs
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── queue/             # Job queue management
│   ├── routes/            # API routes
│   ├── scripts/           # Utility scripts
│   ├── services/          # Business logic
│   │   ├── mobilemoney/   # Mobile money integrations
│   │   └── stellar/       # Stellar blockchain services
│   ├── stellar/           # Stellar SEP implementations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   ├── websocket/         # WebSocket server
│   └── index.ts           # Application entry point
├── tests/                 # Test files
│   ├── e2e/              # End-to-end tests
│   ├── integration/      # Integration tests
│   ├── load/             # Load tests
│   └── unit/             # Unit tests
├── migrations/           # Database migrations
├── contracts/            # Stellar smart contracts
├── .github/              # GitHub Actions workflows
└── docker/               # Docker configurations
```

## 🔄 Database Migrations

### Create Migration

```bash
npm run migrate:create -- migration_name
```

### Run Migrations

```bash
npm run migrate:up
```

### Rollback

```bash
npm run migrate:down
```

### Check Status

```bash
npm run migrate:status
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Quality

Pre-commit hooks automatically run:
- ESLint (linting)
- Prettier (formatting)
- TypeScript type checking
- Tests

Bypass hooks (not recommended):
```bash
git commit --no-verify
```

### Good First Issues

Check out issues labeled [`good first issue`](https://github.com/sublime247/mobile-money/labels/good%20first%20issue) for beginner-friendly tasks.

## 📊 Monitoring & Observability

### Metrics

Prometheus metrics available at `/metrics`:

- Transaction counts by status
- API response times
- Queue depths
- Error rates
- Provider availability

### Health Checks

```bash
# Liveness probe
curl http://localhost:3000/health

# Readiness probe (checks dependencies)
curl http://localhost:3000/ready
```

### Logging

Structured JSON logging with levels:
- `error`: Critical errors
- `warn`: Warnings and anomalies
- `info`: General information
- `debug`: Detailed debugging (dev only)

### Error Tracking

Sentry integration for production error monitoring:

```bash
SENTRY_DSN=your_sentry_dsn
```

## 🚢 Deployment

### Environment Variables

Required for production:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
STELLAR_NETWORK=mainnet
STELLAR_ISSUER_SECRET=S...
JWT_SECRET=...
SESSION_SECRET=...
```

### Docker Deployment

```bash
docker build -t mobile-money:latest .
docker run -p 3000:3000 --env-file .env mobile-money:latest
```

### Kubernetes

Example deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mobile-money
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mobile-money
  template:
    metadata:
      labels:
        app: mobile-money
    spec:
      containers:
      - name: mobile-money
        image: mobile-money:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: mobile-money-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
```

## 📈 Performance

### Benchmarks

- **API Response Time**: < 100ms (p95)
- **Transaction Processing**: < 5s (end-to-end)
- **Throughput**: 1000+ req/s
- **Database Queries**: < 50ms (p95)

### Optimization Tips

1. Enable Redis caching
2. Use connection pooling
3. Implement CDN for static assets
4. Enable compression middleware
5. Use database indexes
6. Implement query result caching

## 🐛 Troubleshooting

### Common Issues

**Database connection fails**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify DATABASE_URL format
postgresql://user:password@host:port/database
```

**Redis connection fails**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

**Stellar transactions fail**
```bash
# Verify network configuration
echo $STELLAR_NETWORK  # Should be 'testnet' or 'mainnet'

# Check Horizon connectivity
curl https://horizon-testnet.stellar.org
```

**Tests failing**
```bash
# Clear test database
npm run migrate:down
npm run migrate:up

# Clear Jest cache
npm test -- --clearCache
```

## 🚨 Error Handling

The Mobile Money Bridge uses standardized error codes for consistent error handling across the API. All errors follow a consistent format with specific error codes that map to appropriate HTTP status codes.

### Error Code Format

Error codes are string constants organized by category:
- **Validation errors (4000-4099)** - HTTP 400 (e.g., INVALID_INPUT, MISSING_FIELD)
- **Authentication errors (4010-4019)** - HTTP 401 (e.g., UNAUTHORIZED, INVALID_CREDENTIALS)
- **Authorization errors (4030-4039)** - HTTP 403 (e.g., FORBIDDEN, INSUFFICIENT_PERMISSIONS)
- **Resource errors (4040-4049)** - HTTP 404 (e.g., NOT_FOUND, TRANSACTION_NOT_FOUND)
- **Conflict errors (4090-4099)** - HTTP 409 (e.g., CONFLICT, DUPLICATE_REQUEST)
- **Rate limit errors (4290-4299)** - HTTP 429 (e.g., RATE_LIMIT, ACCOUNT_LOCKED)
- **Server errors (5000+)** - HTTP 500+ (e.g., INTERNAL_ERROR, DATABASE_ERROR)

### Usage Example

```typescript
import { ERROR_CODES } from './constants/errorCodes';

// Throw an error with a specific code
throw createError(ERROR_CODES.INVALID_INPUT);

// The error handler will automatically map to the correct HTTP status
// INVALID_INPUT maps to HTTP 400 Bad Request
```

### Error Code Reference

See [src/constants/errorCodes.ts](../src/constants/errorCodes.ts) for the complete list of error codes and their descriptions.

### HTTP Status Mapping

The `getHttpStatus` function maps error codes to HTTP status codes:
- 400 Bad Request: Validation/input errors
- 401 Unauthorized: Authentication errors
- 403 Forbidden: Authorization/permission errors
- 404 Not Found: Resource not found errors
- 409 Conflict: State/conflict errors
- 429 Too Many Requests: Rate limit/quota exceeded
- 500 Internal Server Error: Server/database errors
- 502 Bad Gateway: External provider errors

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org) for blockchain infrastructure
- Mobile money providers (MTN, Airtel, Orange) for API access
- Open source community for amazing tools and libraries

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/sublime247/mobile-money/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sublime247/mobile-money/discussions)

## 🗺️ Roadmap

- [ ] Additional mobile money providers (Vodacom, Tigo)
- [ ] Mobile SDKs (iOS, Android)
- [ ] Merchant dashboard
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Stablecoin integration (USDC, USDT)
- [ ] DeFi protocol integrations
- [ ] Automated market making

---

**Built with ❤️ for financial inclusion in Africa**
