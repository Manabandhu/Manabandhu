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
- Bearer Auth
- Zustand (State Management)

### Backend
- Spring Boot 3.x
- Java 21
- PostgreSQL
- Redis
- Legacy provider Admin SDK

## Prerequisites

- Node.js 18+
- Java 21
- Maven

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

Create `.env` file with Legacy provider and API configuration:

```env
EXPO_PUBLIC_API_URL=http://localhost:9090
EXPO_PUBLIC_FIREBASE_API_KEY=your_legacy-provider_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_legacy-provider_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_legacy-provider_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
```

### Backend (.env in backend/)

Create `.env` file with database and service configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/manabandhu
REDIS_URL=redis://localhost:6379
FIREBASE_SERVICE_ACCOUNT=path/to/serviceAccountKey.json
JWT_SECRET=your_jwt_secret_key
```

## Development

- Frontend runs on Expo dev server (port 9091)
- Backend runs on http://localhost:9090
- PostgreSQL on localhost:5432
- Redis on localhost:6379

## License

Private
