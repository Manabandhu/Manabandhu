# Repository Refactor Plan

## 1) Repository audit summary

### App types detected
- **Frontend:** Expo + React Native + Expo Router (TypeScript)
- **Backend:** Spring Boot (Java), REST + WebSocket, PostgreSQL/JPA
- **Repo model:** npm workspace monorepo (`frontend`, `backend`)

### Previous auth flow (before refactor)
- Frontend authenticated through a third-party provider SDK and sent provider tokens to backend.
- Backend verified provider tokens in HTTP/WebSocket auth filters.
- User identity was coupled to a provider-specific UID field across backend/frontend (`providerUid`).

## 2) Usage map (pre-refactor)

### Frontend
- Auth SDK bootstrap and runtime session handling in legacy auth bootstrap module.
- Auth-bound API client and token helpers in `frontend/shared/api/client.ts` and `frontend/shared/api/auth-token.ts`.
- Realtime chat delivery in legacy realtime chat module.
- Storage helper in legacy storage URL helper.
- Provider-specific `providerUid` usage in chat/profile/user modules.

### Backend
- Provider admin SDK dependency in `backend/pom.xml`.
- Provider verification filter in legacy auth filter class.
- Provider bootstrap config in legacy auth provider config class.
- Auth controller token verification and signup flow in `backend/src/main/java/com/manabandhu/modules/user/components/controller/AuthController.java`.
- Provider-specific UID usage in user DTO/entity/service/repository layers.

## 3) Risk hotspots
- Duplicate/wrapper package structure in backend (`shared/*` + wrapper packages) increases change risk.
- Provider-specific identity field was deeply coupled across services.
- Realtime chat path was tightly coupled to provider database.
- Existing repo contains unrelated TS issues, so strict quality gates were expected to be noisy.

## 4) Target structure

### Frontend
- Keep route files thin under `app/`.
- Centralize auth/session/token behavior under `frontend/services/auth/*`.
- Centralize HTTP behavior in `frontend/shared/api/client.ts`.
- Keep env source of truth in `frontend/src/config/env.ts`.

### Backend
- JWT-based auth (access + refresh) with stateless filter.
- WebSocket auth using same JWT parser/service.
- Neutral user identifier (`authUserId`) instead of provider-specific naming.

## 5) Execution phases
1. Remove provider dependencies/config/runtime code paths.
2. Introduce JWT auth backend and frontend provider abstraction (`mock|api`).
3. Replace provider realtime/storage coupling with backend-driven alternatives.
4. Update docs/config and validate scans/build flows.

## 6) Deliverables
- removal log document
- `docs/ARCHITECTURE.md`
- `docs/AUTH.md`
- `docs/CONFIGURATION.md`
- `docs/DEV_WORKFLOW.md`
- `.env.example`
