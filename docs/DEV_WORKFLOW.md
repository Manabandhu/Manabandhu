# Dev Workflow

Commands:
- `npm run dev`
- `npm run frontend`
- `npm run backend`

Quality gates:
- `npm run -w frontend typecheck`
- `npm run -w frontend lint` (if configured)
- `cd backend && ./mvnw test`

Recommended before merge:
1. run frontend typecheck
2. run backend tests
3. verify login flow in mock or api mode
