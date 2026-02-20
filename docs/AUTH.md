# Authentication

Auth providers:
- `mock` (default): local non-network auth for development.
- `api`: backend JWT auth (`/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`).

Frontend entrypoint:
- `frontend/services/auth/index.ts`

Token flow:
1. Login/signup returns access + refresh token.
2. Access token attached to API calls.
3. On 401, client attempts refresh once.
4. If refresh fails, user is signed out.
