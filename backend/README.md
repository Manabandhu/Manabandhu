# ManaBandhu Backend

Spring Boot backend for ManaBandhu application.

## Tech Stack

- Java 21
- Spring Boot 3.2.1
- PostgreSQL
- Redis
- Firebase Admin SDK

## Prerequisites

- Java 21
- Maven 3.9+
- PostgreSQL
- Redis
- Firebase Service Account Key

## Setup

### 1. Environment Variables

Create a `.env` file in the backend directory with:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/manabandhu
REDIS_URL=redis://localhost:6379
FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccountKey.json
JWT_SECRET=your-jwt-secret-key
```

### 2. Firebase Setup

1. Download your Firebase service account key from Firebase Console
2. Save it as `serviceAccountKey.json` in the backend directory
3. Update the path in the `.env` file

### 3. Running Locally

```bash
./mvnw spring-boot:run
```

The server will start at `http://localhost:9090`

## API Documentation

Access Swagger UI at: `http://localhost:9090/swagger-ui.html`

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## Database Migrations

The application uses Flyway for database migrations. Migrations are automatically applied on startup.

## Testing

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
│   │       ├── application.properties
│   │       └── db/migration/
│   └── test/
├── pom.xml
└── Dockerfile
```
