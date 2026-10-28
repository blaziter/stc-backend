# STC backend

Monolithic REST API. The service orchestrates booking workflows, calendar scheduling, notifications and secure integrations with OKIS data, database will be run on Azure Database for PostgreSQL and logs will be on Azure Log Analytics.

---

## Architecture Overview

```mermaid
flowchart TD
    FE["STC-Frontend\n(Web Client)"] <-->|REST / JSON| API["STC API Monolith\n(NestJS on Node.js)"]
    API <-->|SQL Queries| DB[("Azure DB PostgreSQL\n(STC-db)")]
    API <-->|REST Integration| OKIS["OKIS External API"]
    API -->|Structured Logs with Pino| AZLOG["Azure Log Analytics\n(AppRequests / Telemetry)"]
    API --- RL["Rate Limiting\n(@nestjs/throttler)"]

    subgraph Core Features
        API -.-> B["Booking & Calendar Management"]
        API -.-> N["Notification Engine"]
    end
```

### Key Responsibilities
- **Booking & Calendar Engine**: Manages reservations, scheduling conflicts, availability slots, and calendar state synchronization.
- **Notification Pipeline**: Dispatches automated email, push, or SMS notifications for calendar events and reservation updates.
- **External OKIS Integration**: Encapsulates external communications with the OKIS API using resilient HTTP client adapters (`@nestjs/axios`).
- **Traffic Control & Security**: Built-in granular rate limiting (`@nestjs/throttler`), payload validation, and JWT-based authentication.
- **Enterprise Observability**: High-throughput structured logging (`nestjs-pino`) streaming directly to Azure Log Analytics for latency monitoring (`DurationMs`), performance bucketing, and error tracking (`ResultCode: 500`).

---

## Prerequisites & Setup

### Requirements
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: [`pnpm`](https://pnpm.io/) (`v9.x` or later)
- **Database**: PostgreSQL 15+ (Local instance or Azure Database for PostgreSQL)
- **Docker**: (Optional) For containerized local development and deployment

### 1. Environment Configuration

Create a `.env` file in the project root based on the configuration matrix below:

```bash
cp .env.example .env
```

#### Environment Variables Matrix

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`, `test`) |
| `PORT` | No | `3000` | Port on which the HTTP server listens |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (`postgresql://<user>:<pwd>@<host>:5432/<db>?sslmode=require`) |
| `JWT_SECRET` | **Yes** | — | Cryptographic secret for signing access tokens |
| `JWT_EXPIRES_IN` | No | `1d` | Lifetime of issued JWT tokens (e.g., `15m`, `1d`, `7d`) |
| `OKIS_API_BASE_URL` | **Yes** | — | Target base URL for the upstream OKIS service |
| `OKIS_API_KEY` | **Yes** | — | Integration credentials / token for OKIS API |
| `AZURE_LOG_ANALYTICS_WORKSPACE_ID` | Conditional | — | Required in production for telemetry shipping |
| `AZURE_LOG_ANALYTICS_SHARED_KEY` | Conditional | — | Secret key for Azure Log Analytics ingestion |

### 2. Installation

Install project dependencies using `pnpm`:

```bash
pnpm install
```

### 3. Running the Service

#### Local Development
Starts the application with hot-reloading and human-readable, pretty-printed logs:

```bash
pnpm run dev
```

#### Production Mode
Compile TypeScript to JavaScript and launch the production cluster:

```bash
pnpm run build
pnpm run start:prod
```

#### Docker Deployment
Build and run the container locally:

```bash
# Build the Docker image
docker build -t stc-backend:latest .

# Run container with environment configuration
docker run -d --name stc-backend -p 3000:3000 --env-file .env stc-backend:latest
```

---

## Authentication

The API enforces stateless authentication via **JSON Web Tokens (JWT)** on all protected endpoints using Passport (`@nestjs/passport`) and `@nestjs/jwt`.

### Request Authorization Header

Clients must include their valid Bearer token in the standard `Authorization` HTTP header:

```http
Authorization: Bearer <access_token>
```

### Example Authenticated Request

```bash
curl -X GET https://api.stc.domain.com/v1/bookings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Authentication Flow
1. **Login**: Client submits credentials to `POST /api/v1/auth/login`.
2. **Token Issuance**: API validates credentials via `bcrypt` against PostgreSQL and returns a signed JWT access token.
3. **Guard Verification**: Protected endpoints use `JwtAuthGuard` to validate token signature, expiration (`exp`), and user claims before handing execution to controllers.
4. **Unauthorized Responses**:
   - Missing or malformed header: `401 Unauthorized`
   - Expired or invalid signature: `401 Unauthorized`
   - Insufficient permissions/roles: `403 Forbidden`

---

## API Documentation & Endpoints

When running locally in development mode, interactive OpenAPI / Swagger documentation is available at:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs-json`

### Core Domain Routing

| Module | Route Prefix | Primary Operations |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | User login, token refresh, profile retrieval |
| **Bookings** | `/api/v1/bookings` | Slot reservation, status updates, cancellations |
| **Calendar** | `/api/v1/calendar` | Event scheduling, conflict detection, availability feeds |
| **Notifications** | `/api/v1/notifications` | Dispatch event reminders, email/SMS triggers |
| **OKIS Integration** | `/api/v1/okis` | Proxied synchronizations with upstream enterprise services |
| **Health & Probes** | `/health` | Liveness and readiness probes (`@nestjs/terminus`) |

---

## Testing & Code Quality

The repository uses [Vitest](https://vitest.dev/) for unit and integration testing, paired with [Oxlint](https://oxc.rs/) for high-speed static analysis.

```bash
# Run unit test suite
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate test coverage report
pnpm run test:cov

# Run End-to-End (e2e) test suite
pnpm run test:e2e

# Run linter
pnpm run lint

# Format code according to .prettierrc
pnpm run format
```

---

## Observability & Logging

- **Logger**: Uses `pino` (`nestjs-pino`) with asynchronous streaming to stdout.
- **Log Format**: JSON in production environments; formatted with `pino-pretty` in local development (`pnpm run dev`).
- **Telemetry Ingestion**: Azure Log Analytics ingests runtime logs into the `AppRequests` table. You can query endpoint health, trace `DurationMs`, identify error spikes (`ResultCode == 500`), and inspect request throughput directly from the Azure Portal Query Hub.

---

## Authentication

The API enforces stateless authentication via **JSON Web Tokens (JWT)** on all protected endpoints using Passport (`@nestjs/passport`) and `@nestjs/jwt`.

### Request Authorization Header

Clients must include their valid Bearer token in the standard `Authorization` HTTP header:

```http
Authorization: Bearer <access_token>
```

### Example Authenticated Request

```bash
curl -X GET https://api.stc.domain.com/v1/bookings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Authentication Flow
1. **Login**: Client submits credentials to `POST /api/v1/auth/login`.
2. **Token Issuance**: API validates credentials via `bcrypt` against PostgreSQL and returns a signed JWT access token.
3. **Guard Verification**: Protected endpoints use `JwtAuthGuard` to validate token signature, expiration (`exp`), and user claims before handing execution to controllers.
4. **Unauthorized Responses**:
   - Missing or malformed header: `401 Unauthorized`
   - Expired or invalid signature: `401 Unauthorized`
   - Insufficient permissions/roles: `403 Forbidden`

---

## API Documentation & Endpoints

When running locally in development mode, interactive OpenAPI / Swagger documentation is available at:

- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs-json`

### Core Domain Routing

| Module | Route Prefix | Primary Operations |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | User login, token refresh, profile retrieval |
| **Bookings** | `/api/v1/bookings` | Slot reservation, status updates, cancellations |
| **Calendar** | `/api/v1/calendar` | Event scheduling, conflict detection, availability feeds |
| **Notifications** | `/api/v1/notifications` | Dispatch event reminders, email/SMS triggers |
| **OKIS Integration** | `/api/v1/okis` | Proxied synchronizations with upstream enterprise services |
| **Health & Probes** | `/health` | Liveness and readiness probes (`@nestjs/terminus`) |

---

## Testing & Code Quality

The repository uses [Vitest](https://vitest.dev/) for unit and integration testing, paired with [Oxlint](https://oxc.rs/) for high-speed static analysis.

```bash
# Run unit test suite
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Generate test coverage report
pnpm run test:cov

# Run End-to-End (e2e) test suite
pnpm run test:e2e

# Run linter
pnpm run lint

# Format code according to .prettierrc
pnpm run format
```

---

## Observability & Logging

- **Logger**: Uses `pino` (`nestjs-pino`) with asynchronous streaming to stdout.
- **Log Format**: JSON in production environments; formatted with `pino-pretty` in local development (`pnpm run dev`).
- **Telemetry Ingestion**: Azure Log Analytics ingests runtime logs into the `AppRequests` table. You can query endpoint health, trace `DurationMs`, identify error spikes (`ResultCode == 500`), and inspect request throughput directly from the Azure Portal Query Hub.

