# Architecture

## Frontend
- `app/`: route composition.
- `services/auth`: auth provider interface and token/session handling.
- `shared/api`: HTTP clients and feature APIs.
- `store`: Zustand state.
- `src/config/env.ts`: validated environment access.

## Backend
- `core/security`: JWT token service + HTTP filter + websocket auth interceptor.
- `modules/*`: domain controllers/services.
- `shared/*`: DTO/entity/service abstractions.

Conventions:
- Keep route/screen files thin.
- Keep API/network/auth logic in services.
- Never log access/refresh tokens.
