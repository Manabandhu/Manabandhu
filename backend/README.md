# ManaBandhu Backend

Spring Boot backend for ManaBandhu application.

## Tech Stack

- Java 21
- Spring Boot 3.2.1
- PostgreSQL
- Redis
- JWT auth module

## Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL
- Redis
- JWT secret

## Setup

Copy `backend/.env.example` to `backend/.env` and update values:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/manabandhu
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
REDIS_URL=redis://localhost:6379
REDIS_SSL_ENABLED=false
JWT_SECRET=change-me-change-me-change-me-change-me
JWT_ACCESS_TTL_SECONDS=3600
JWT_REFRESH_TTL_SECONDS=2592000
```

`DATABASE_URL` accepts either:
- `postgresql://user:password@host:5432/dbname`
- `jdbc:postgresql://host:5432/dbname`

If using Supabase, prefer the pooler endpoint (many local networks cannot use direct `db.<ref>.supabase.co:5432`):

```env
DATABASE_URL=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
DATABASE_USERNAME=postgres.<project-ref>
DATABASE_PASSWORD=<db-password>
```

### 2. Auth Setup

1. Set JWT secret in environment
2. Save it as `serviceAccountKey.json` in the backend directory
3. Update the path in the `.env` file

### 3. Running Locally

```bash
./mvnw spring-boot:run
```

Server starts at `http://localhost:9090`.

## API Documentation

Swagger UI: `http://localhost:9090/swagger-ui.html`

Protected endpoints require:

All protected endpoints require a access token in the Authorization header:

```
Authorization: Bearer <access-token>
```

## Testing

```bash
./mvnw test
```
