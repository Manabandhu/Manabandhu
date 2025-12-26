# ManaBandhu Monorepo

A full-stack application with React Native frontend and Spring Boot backend.

## Project Structure

```
.
├── frontend/           # React Native + Expo app
├── backend/            # Spring Boot application
└── package.json        # Monorepo root configuration
```

## Tech Stack

### Frontend
- React Native + Expo
- TypeScript
- NativeWind (TailwindCSS)
- Firebase Auth
- Zustand (State Management)

### Backend
- Spring Boot 3.x
- Java 21
- PostgreSQL (Neon Cloud)
- Redis (Upstash)
- Firebase Admin SDK
- Google Cloud Platform

## Prerequisites

- Node.js 18+
- Java 21
- Maven
- Docker (optional)

## Getting Started

### Root Level

```bash
npm install
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Run Both (Development)

```bash
npm run dev
```

## Environment Variables

### Frontend (.env in frontend/)
```
EXPO_PUBLIC_API_URL=http://localhost:9090
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_client_id
```

### Backend (.env in backend/)
```
DATABASE_URL=postgresql://user:password@host/database
REDIS_URL=redis://default:password@endpoint.upstash.io:6379
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccountKey.json
GOOGLE_CLOUD_PROJECT=your_project_id
```

## Deployment

### Google Cloud Platform

```bash
npm run deploy:gcp
```

## Development

- Frontend runs on Expo dev server
- Backend runs on http://localhost:9090
- PostgreSQL on Neon Cloud
- Redis on Upstash (serverless)

## License

Private
