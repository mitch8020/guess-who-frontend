# Guess Who Web App Frontend - Agent Context

> Frontend-specific context for Claude Code agents.
> For project-wide context, see `../.claude/CLAUDE.md`.

## Stack

Vite + React 19 + TypeScript + TanStack Router + TailwindCSS + Rollbar

## Project Structure

```text
src/
|-- api/                    # API client functions by backend module
|-- components/
|   |-- common/             # shared/reusable UI components
|   `-- <feature>/          # feature-specific components
|-- features/
|   |-- auth/
|   |-- rooms/
|   |-- invites/
|   |-- images/
|   `-- matches/
|-- hooks/                  # custom hooks
|-- layouts/                # route layout wrappers
|-- routes/                 # TanStack Router route files
|-- stores/                 # client-side local state contexts/reducers
|-- types/                  # request/response and domain types
|-- utils/
|-- routeTree.gen.ts
`-- main.tsx
```

## Conventions

### Component Pattern

- Use typed function components.
- Keep route components thin; move reusable behavior to `features/*` modules.
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils.

### Data Fetching

- Use TanStack Query for all backend data fetching.
- Query keys follow `[domain, id?, params?]` conventions.
- Mutations invalidate affected room/match query keys.
- Use router loaders for route-level prefetch and auth/session checks.

### Styling

- TailwindCSS utility-first styling.
- Shared variants in reusable UI components under `components/common`.
- Keep game-board sizing responsive with CSS grid and `minmax` constraints.

### Routing

- TanStack file-based routes in `src/routes`.
- Protected routes validate auth token or room guest token before render.
- Keep invite join route public.

### Forms

- Controlled forms for room creation, join-by-code, and action submission.
- Synchronous validation for required fields; async validation for invite code and room constraints.

### Error Handling

- Global error boundary reports to Rollbar.
- API client maps backend error codes to user-facing messages.
- Non-blocking toasts for transient network errors.

## Build & Test Commands

| Command | Purpose |
| ---------------- | -------------------------- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run test` | Run tests |
| `npm run check` | Prettier + lint autofix |

## Environment Variables

| Variable | Purpose | Required |
| ---------------- | -------------------------- | -------- |
| `VITE_API_BASE_URL` | Backend API base URL | Y |
| `VITE_WS_BASE_URL` | Backend websocket URL | Y |
| `VITE_ROLLBAR_CLIENT_TOKEN` | Rollbar browser token | Y |
| `VITE_ROLLBAR_ENV` | Rollbar environment tag | Y |

## Implementation Status

| Feature Area | Status | Notes |
| ---------------- | ------------- | -------------------- |
| `auth` | Not Started | |
| `rooms` | Not Started | |
| `invites` | Not Started | |
| `images` | Not Started | |
| `matches` | Not Started | |
| `shared app shell` | Not Started | |
