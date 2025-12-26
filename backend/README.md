# ManaBandhu Backend

Spring Boot backend for ManaBandhu application.

## Tech Stack

- Java 21
- Spring Boot 3.2.1
- PostgreSQL (Neon Cloud)
- Redis (Upstash)
- Firebase Admin SDK
- Google Cloud Platform

## Setup

### Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL (or Neon account)
- Redis (Upstash account recommended)
- Firebase Service Account Key
- Google Cloud Service Account Key (optional)

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL=postgresql://user:password@host/database
REDIS_URL=redis://default:password@endpoint.upstash.io:6379
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_CREDENTIALS=./gcloud-service-key.json
JWT_SECRET=your-jwt-secret-key
```

### Upstash Redis Setup

1. Create a free account at [Upstash](https://upstash.com)
2. Create a new Redis database
3. Copy the connection URL (format: `redis://default:password@endpoint.upstash.io:6379`)
4. Add it to your `.env` file as `REDIS_URL`

### Firebase Setup

1. Download your Firebase service account key from Firebase Console
2. Save it as `serviceAccountKey.json` in the backend directory
3. Update the path in `.env`

### Running Locally

```bash
./mvnw spring-boot:run
```

The server will start at `http://localhost:9090`

## Docker

### Build and Run

```bash
docker build -t manabandhu-backend .
docker run -p 9090:9090 --env-file .env manabandhu-backend
```

### Using Docker Compose

From the root directory:

```bash
docker-compose up
```

This starts PostgreSQL, Redis, and the backend service.

## API Endpoints

### Public

- `GET /api/public/health` - Health check

### Protected (Requires Firebase Auth)

- `GET /api/users/me` - Get current user
- `POST /api/users` - Create user
- `PUT /api/users/me` - Update current user

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Deployment

### Google Cloud Platform

```bash
cd backend
./deploy.sh
```

Make sure to:
1. Configure `gcloud` CLI
2. Update `app.yaml` with your project settings
3. Set environment variables in GCP Console

### Environment Variables in GCP

Set these in Google Cloud Console > App Engine > Settings:

```
DATABASE_URL
REDIS_URL
FIREBASE_SERVICE_ACCOUNT
```

## Development

### Database Migrations

The application uses JPA's `ddl-auto=update` for development. For production, consider using Flyway or Liquibase.

### Caching

Upstash Redis is used for caching user data with SSL/TLS encryption. Cache keys:
- `users::{firebaseUid}` - User profile cache

### Testing

```bash
./mvnw test
```

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/manabandhu/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data transfer objects
│   │   │   ├── exception/       # Exception handlers
│   │   │   ├── model/           # JPA entities
│   │   │   ├── repository/      # Data repositories
│   │   │   ├── security/        # Security filters
│   │   │   └── service/         # Business logic
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
├── Dockerfile
└── app.yaml
```
