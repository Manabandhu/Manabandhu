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
- JWT authentication

## Prerequisites

- Node.js 18+
- Java 21
- Maven

## Getting Started

### Install dependencies

```bash
npm install
```

### Run frontend

```bash
npm run frontend
```

### Run backend

```bash
npm run backend
```

### Run both (development)

```bash
npm run dev
```

## Environment Variables

Use `.env.example` at repo root as the baseline.

Create `.env` file with API/auth configuration:

```env
EXPO_PUBLIC_API_URL=http://localhost:9090
EXPO_PUBLIC_AUTH_PROVIDER=mock
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_APPLE_TEAM_ID=your_apple_team_id
EXPO_PUBLIC_EAS_PROJECT_ID=your_eas_project_id
```

### Backend

```env
DATABASE_URL=postgresql://user:password@localhost:5432/manabandhu
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-change-me-change-me-change-me
JWT_ACCESS_TTL_SECONDS=3600
JWT_REFRESH_TTL_SECONDS=2592000
```

## Development

- Frontend: Expo dev server on port 9091
- Backend: `http://localhost:9090`

## License

Private
