This repository contains a Go backend and a Next.js frontend with API, E2E and performance tests.

Quick orientation
- Backend: `bugtracker-backend/` — Go (modules) with packages under `internal/` (handlers, db, models). Example entry: [bugtracker-backend/cmd/bugtracker/main.go](bugtracker-backend/cmd/bugtracker/main.go#L1).
- Frontend: `bugtracker-frontend/` — Next.js app (React) with components in `src/components` and tests in the same folder. See [bugtracker-frontend/src/components/CommentSection.test.tsx](bugtracker-frontend/src/components/CommentSection.test.tsx#L1).
- Tests: `tests-api/` (API Playwright tests), `tests-e2e/` (Playwright E2E), `tests-perf/` (k6 perf script).

How the pieces fit
- The frontend calls the backend API (default base URL when run locally: `http://localhost:8080/api`). Backend handlers live in `bugtracker-backend/internal/handlers` and models in `bugtracker-backend/internal/models`.
- Local development typically uses Docker Compose (`docker compose up --build` from repo root) to start frontend (port 3000) and backend (port 8080).

Developer workflows (commands you can run)
- Full Docker quick-start: run `docker compose up --build` from the repo root. (Recommended for parity.)
- Backend local dev: `cd bugtracker-backend && go mod download && go run cmd/bugtracker/main.go`.
- Backend tests: `cd bugtracker-backend && go test ./... -v`.
- Frontend dev: `cd bugtracker-frontend && npm install && npm run dev` (Next dev server on port 3000). `npm run build` and `npm start` for prod.
- Frontend unit tests: `cd bugtracker-frontend && npm test` (Jest + Testing Library). Integration/playwright tests: `npm run test:integration`.
- API/E2E: run Playwright under `tests-api` and `tests-e2e` (they depend on services being available).

Project-specific patterns and conventions
- Backend packages are under `internal/` (private to module). Tests use helper files like `test_helpers.go` and rely on an in-memory or test DB in `internal/testutil` — look for `test_helpers.go` alongside the package tests.
- HTTP routes follow `/bugs` and `/bugs/{id}` plus nested comments under `/bugs/{bugId}/comments` (see `bugtracker-backend/README.md` for exact contract).
- Frontend tests colocate with components (e.g. `src/components/*.test.tsx`) and use `@testing-library/react` conventions. Jest coverage is enabled via `npm test` in frontend.
- Frontend uses Next 15 with Turbopack (`next dev --turbopack` in `package.json`). When editing pages/components, use the `src/` and `app/` locations.

Integration and CI notes
- Jenkins pipeline files live under `jenkins/` — CI uses Docker Compose in some pipelines. For local CI-like runs prefer the Docker Compose quick-start.
- Tests that rely on services (API/E2E) expect the backend API to be reachable at `http://localhost:8080` and the frontend at `http://localhost:3000` unless overridden.

When editing code, pay attention to
- Request/response JSON shapes described in `bugtracker-backend/README.md`. Tests and frontend components assume these fields (`id`, `title`, `description`, `status`, `priority`, `created_at`).
- Backend internal API structure: add new handlers under `internal/handlers` and wire them in `cmd/bugtracker/main.go`.
- Frontend component tests use `jest` + `@testing-library/react`; match existing test patterns when adding tests.

Files to inspect for examples
- API surface and docs: [bugtracker-backend/README.md](bugtracker-backend/README.md#L1)
- Frontend scripts and test setup: [bugtracker-frontend/package.json](bugtracker-frontend/package.json#L1)
- Example component test: [bugtracker-frontend/src/components/CommentSection.test.tsx](bugtracker-frontend/src/components/CommentSection.test.tsx#L1)

If something is missing
- Ask for the preferred local dev flow (Docker-first vs local binaries) and any env variable overrides (no global .env is present in repo root).
- If you need to run tests that require external services, start the stack with Docker Compose first.

Keep instructions short and concrete; reference the files above when making code changes.