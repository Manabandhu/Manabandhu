# ManaBandhu Backend

Spring Boot backend for ManaBandhu application.

## Tech Stack

- Java 21
- Spring Boot 3.2.1
- PostgreSQL
- Redis
- JWT authentication

## Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL
- Redis

## Setup

Create `.env` in `backend/` with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/manabandhu
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-change-me-change-me-change-me
JWT_ACCESS_TTL_SECONDS=3600
JWT_REFRESH_TTL_SECONDS=2592000
```

## Run locally

```bash
./mvnw spring-boot:run
```

Server starts at `http://localhost:9090`.

## API Documentation

Swagger UI: `http://localhost:9090/swagger-ui.html`

Protected endpoints require:

```http
Authorization: Bearer <access-token>
```

## Testing

```bash
./mvnw test
```
