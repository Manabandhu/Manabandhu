# Firebase Removal Log

Removed or replaced:
- Frontend dependency `firebase` removed from `frontend/package.json`.
- Firebase SDK bootstrap/auth/storage modules replaced with provider-based auth service (`frontend/services/auth/index.ts`) and storage stubs.
- Realtime chat implementation replaced with backend polling adapter (`frontend/features/messaging/chat/chat/realtimeChat.ts`).
- Backend Firebase Admin dependency removed from `backend/pom.xml`.
- Backend security migrated from Firebase token verification filter to JWT filter/service.
- Backend auth endpoints now issue/refresh JWT tokens.
- Firebase env dependencies removed from runtime constants.

Compatibility notes:
- Existing auth UI flow remains, but provider is now `mock` by default.
- Set `EXPO_PUBLIC_AUTH_PROVIDER=api` to use backend JWT endpoints.
