# Repository Refactor Plan

## 1) Repository audit summary

### App types detected
- **Frontend:** Expo + React Native + Expo Router (TypeScript).
- **Backend:** Spring Boot (Java 17/21 mix), REST + WebSocket, PostgreSQL/JPA.
- **Repo model:** Monorepo with npm workspaces (`frontend`, `backend`).

### Current authentication flow (before refactor)
- Frontend signs in via Legacy provider SDK (`frontend/lib/legacy-provider.ts`) and stores auth session in Zustand (`frontend/store/auth.store.ts`).
- API client attaches Legacy provider ID token (`frontend/shared/api/client.ts` + other API wrappers directly reading access token).
- Backend validates incoming access tokens in security filter (`backend/src/main/java/com/manabandhu/core/security/Legacy providerAuthenticationFilter.java`).
- Backend auth endpoints create/verify Legacy provider users/tokens (`backend/src/main/java/com/manabandhu/modules/user/components/controller/AuthController.java`).

## 2) Legacy provider usage map

### Frontend runtime + config usage
- Legacy provider SDK bootstrap and services:
  - `frontend/lib/legacy-provider.ts`
  - `frontend/config/legacy-provider.ts`
  - `frontend/shared/constants/env.ts` (Legacy provider env validation)
- Legacy provider auth usage in screens/state/API:
  - `frontend/store/auth.store.ts`
  - `frontend/features/auth/screens/*` (login/signup/phone OTP)
  - `frontend/shared/api/client.ts`
  - `frontend/shared/api/auth-token.ts`
  - multiple API modules importing `@/lib/legacy-provider`
- Legacy provider Realtime Database chat usage:
  - `frontend/features/messaging/chat/chat/legacy-providerChat.ts`
  - `frontend/app/_layout.tsx`
  - `frontend/features/messaging/chat/screens/conversation.tsx`
- Legacy provider storage usage:
  - `frontend/shared/utils/legacy-providerStorage.ts`
  - `frontend/features/travel/rooms/rooms/storage.ts`
- Legacy provider-related identifiers in domain models:
  - `authUserId` referenced across user/chat/profile features.

### Backend usage
- Dependency:
  - `backend/pom.xml` (`com.google.legacy-provider:legacy-provider-admin`)
- Legacy provider configuration and initialization:
  - `backend/src/main/java/com/manabandhu/core/config/Legacy providerConfig.java`
  - `backend/src/main/resources/application.properties` (`auth.service-account`)
- Legacy provider auth verification:
  - `backend/src/main/java/com/manabandhu/core/security/Legacy providerAuthenticationFilter.java`
- Legacy provider auth endpoints:
  - `backend/src/main/java/com/manabandhu/modules/user/components/controller/AuthController.java`
- API docs/security naming references:
  - `backend/src/main/java/com/manabandhu/core/config/OpenApiConfig.java`
  - `backend/src/main/java/com/manabandhu/modules/user/components/controller/UserController.java`
- DTO/repository/service naming with `authUserId`:
  - user DTO/model/service/repository classes under both `shared/*` and non-shared package trees.

### Environment / docs references
- Legacy provider env references in frontend constants and backend properties.
- Legacy provider setup instructions in backend README.

## 3) Risk areas / hotspots
- **Dual/duplicated backend package trees** (`shared/*` + `modules/*` + top-level dto/service/repository) increase refactor risk.
- **Auth identity naming deeply coupled** via `authUserId` across backend + frontend.
- **Chat realtime coupling** depends on Legacy provider Realtime DB; removal needs graceful fallback (polling/websocket).
- **Potentially stale imports / dead paths** already present (repo has some inconsistencies), so strict compile verification is required after each phase.
- **Secret/env assumptions**: existing setup expects Legacy provider keys and service account.

## 4) Recommended target structure

### Frontend target
- Keep `app/` route-only.
- Consolidate business logic under `src/`:
  - `src/features/*` for domain logic.
  - `src/services/auth/*` for provider-based auth (`mock|api`).
  - `src/services/http/*` for API client, retry/timeout/error normalization.
  - `src/config/env.ts` for validated env.
  - `src/services/logger/*` for logging abstraction.
- Provide compatibility exports for existing imports where needed to avoid large breakage in one step.

### Backend target
- Replace Legacy provider filter with JWT access-token filter.
- Add token service + refresh flow under security/auth packages.
- Keep current endpoints stable where possible; add migration-safe auth endpoints:
  - login/register/refresh/logout/me.
- Gradually rename `authUserId` semantics to neutral `authUserId` (with migration path: temporary aliasing/serialization compatibility if needed).

## 5) Execution phases
1. Remove Legacy provider dependencies/config and produce replacement auth primitives.
2. Introduce non-Legacy provider auth layer (frontend `mock|api`, backend JWT endpoints).
3. Replace Legacy provider chat/storage usage with backend API/polling adapters.
4. Centralize config, error handling, logging, and network behavior.
5. Clean dead code + docs + quality scripts/tests.

## 6) Non-breaking migration path
- Keep frontend UI flow and route behavior unchanged.
- Keep API contract compatibility where practical while introducing new auth fields/endpoints.
- If identifiers are renamed internally, preserve old JSON keys temporarily where needed.

## 7) Deliverables to be produced
- `docs/FIREBASE_REMOVAL.md`
- `docs/ARCHITECTURE.md`
- `docs/AUTH.md`
- `docs/CONFIGURATION.md`
- `.env.example`
- `docs/DEV_WORKFLOW.md`
