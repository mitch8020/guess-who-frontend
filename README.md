# Guess Who Web App - Frontend

Frontend client for the Guess Who Web App. This app lets users sign in, create or join rooms, upload photos, and play multiplayer Guess Who matches in the browser.

## Tech Stack

- Vite + React + TypeScript
- TanStack Router
- TailwindCSS
- Rollbar (browser errors)

## Architecture Overview

Planned feature areas:

- `auth`: login entry and callback processing
- `rooms`: room list, room creation, lobby management
- `invites`: join-by-link and join-by-code flows
- `images`: upload and manage room image library
- `matches`: game board, turn actions, match summary

Shared layers:

- `api/`: typed API calls to backend
- `components/common/`: reusable UI primitives
- `stores/`: ephemeral client-only state (board highlights, local UI mode)

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.dev` in this directory:

```env
PORT=1073
VITE_API_BASE_URL=http://localhost:1000/api
VITE_WS_BASE_URL=ws://localhost:1000/ws
VITE_ROLLBAR_CLIENT_TOKEN=your_rollbar_browser_token
VITE_ROLLBAR_ENV=development
```

3. Start development server:

```bash
npm run dev
```

App runs at `http://localhost:1073` by default.

## Primary Routes (Planned)

- `/` - landing page (login + join by code)
- `/rooms` - room list
- `/rooms/new` - create room
- `/join/:code` - invite join page
- `/rooms/:roomId/lobby` - room lobby and start flow
- `/rooms/:roomId/images` - room image management
- `/rooms/:roomId/matches/:matchId` - active match board

## Development Workflow

```bash
# dev server
npm run dev

# production build
npm run build

# lint
npm run lint

# tests
npm run test

# prettier + lint autofix
npm run check
```

## Notes

- Match start UI must enforce at least 16 uploaded images.
- Board size selection supports at least 4x4, 5x5, and 6x6.
- Board order is randomized per player by backend and should never be inferred from client state.
