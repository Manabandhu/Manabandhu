# ManaBandhu Monorepo

A full-stack application with:
- Expo/React Native frontend for iOS and Android
- Next.js frontend for web
- Spring Boot backend

## Project Structure

```
.
├── frontend/           # Mobile app (Expo + React Native)
├── frontend-web/       # Web app (Next.js)
├── backend/            # Spring Boot application
└── package.json        # Monorepo root configuration
```

## Tech Stack

### Frontend
- Mobile: React Native + Expo
- Web: Next.js + React
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

### Run mobile app (Expo)

```bash
npm run mobile
```

### Run web app (Next.js)

```bash
npm run web
```

### Run backend

```bash
npm run backend
```

### Run both (development)

```bash
npm run dev
```

### Run backend + web + mobile together

```bash
npm run dev:all
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
NEXT_PUBLIC_API_URL=http://localhost:9090
```

### Backend

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/manabandhu
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-change-me-change-me-change-me
JWT_ACCESS_TTL_SECONDS=3600
JWT_REFRESH_TTL_SECONDS=2592000
```

If using Supabase, prefer the pooler connection string:

```env
DATABASE_URL=jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
DATABASE_USERNAME=postgres.<project-ref>
DATABASE_PASSWORD=<db-password>
```

## Development

- Frontend: Expo dev server on port 9091
- Backend: `http://localhost:9090`

## License

Private
