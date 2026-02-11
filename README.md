# Pixel Playground — Mini Games Arcade

A collection of 11 classic arcade games reimagined with a neo-retro aesthetic. Built as a fullstack web application with user accounts, leaderboards, achievements, and social sharing. Play Snake, Tetris, Flappy Bird, and more — all in your browser.

## Key Features

- **11 Playable Games** — Snake, Flappy Bird, Dino Jump, Tetris, Pong, Space Invaders, Minesweeper, Breakout, 2048, Memory Match, Whack-a-Mole
- **Leaderboards** — Per-game score rankings with global and personal bests
- **Achievements** — Unlockable badges for gameplay milestones
- **Favorites** — Star your favorite games for quick access
- **Social Sharing** — Share scores to Twitter/X, Facebook, or clipboard from game-over screens
- **Game Tutorials** — Animated first-play overlays showing controls and tips
- **Search & Filter** — Find games by name or category (Classic, Puzzle, Action, Brain, Reflex)
- **Procedural Sound** — Web Audio API-generated 8-bit sound effects and music
- **Dark/Light Themes** — Switchable themes with system preference detection
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **User Profiles** — Track play history, stats, and achievement progress

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Game Catalog](#game-catalog)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Routing** | Wouter (lightweight client-side router) |
| **State/Data** | tRPC 11 + TanStack React Query |
| **Backend** | Express 4, tRPC adapters, Node.js |
| **Database** | MySQL / TiDB via Drizzle ORM |
| **Auth** | Manus OAuth (session cookies + JWT) |
| **Build** | Vite 7 (frontend) + esbuild (server bundle) |
| **Testing** | Vitest |
| **Package Manager** | pnpm |

---

## Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js** 22 or higher
- **pnpm** 10 or higher (`npm install -g pnpm`)
- **MySQL** 8+ or **TiDB** (for the database)
- **Git** for version control

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/mini-games-arcade.git
cd mini-games-arcade
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs all frontend and backend dependencies in a single command. The project is a monorepo with shared `node_modules`.

### 3. Environment Setup

Create a `.env` file in the project root with the required environment variables. See the [Environment Variables](#environment-variables) section for the full list. At minimum, you need:

```env
DATABASE_URL=mysql://user:password@localhost:3306/mini_games_arcade
JWT_SECRET=your-random-secret-string-at-least-32-chars
```

### 4. Database Setup

Push the Drizzle schema to your database:

```bash
pnpm db:push
```

This command generates SQL migrations from `drizzle/schema.ts` and applies them to the database specified in `DATABASE_URL`.

### 5. Start the Development Server

```bash
pnpm dev
```

This starts the Express server with Vite middleware for hot module replacement. The app will be available at [http://localhost:3000](http://localhost:3000).

The dev server watches for file changes in both the `client/` and `server/` directories, automatically reloading as needed.

---

## Architecture

### Directory Structure

```
mini-games-arcade/
├── client/                     # Frontend (React + Vite)
│   ├── index.html              # HTML entry point (loads Google Fonts)
│   ├── public/                 # Static assets served at /
│   └── src/
│       ├── _core/hooks/        # Auth hook (useAuth)
│       ├── components/         # Reusable components
│       │   ├── GameLayout.tsx   # Shared game page wrapper (nav, canvas sizing)
│       │   ├── GameTutorial.tsx # First-play tutorial overlay
│       │   ├── ShareScore.tsx   # Social sharing buttons
│       │   └── ui/             # shadcn/ui primitives
│       ├── contexts/           # React contexts (Theme, GameSettings)
│       ├── data/               # Static data (tutorial content)
│       ├── hooks/              # Custom hooks (sound engine, score submit)
│       ├── lib/                # Utilities (tRPC client, cn helper)
│       ├── pages/              # Page components (11 games + 5 feature pages)
│       ├── App.tsx             # Router and providers
│       ├── const.ts            # Frontend constants and OAuth helpers
│       ├── index.css           # Global styles, theme tokens, custom utilities
│       └── main.tsx            # React entry point with tRPC/QueryClient setup
├── server/                     # Backend (Express + tRPC)
│   ├── _core/                  # Framework plumbing (DO NOT EDIT)
│   │   ├── index.ts            # Server entry point
│   │   ├── context.ts          # tRPC context builder (injects user)
│   │   ├── env.ts              # Environment variable access
│   │   ├── oauth.ts            # Manus OAuth callback handler
│   │   ├── trpc.ts             # tRPC instance + procedure helpers
│   │   └── vite.ts             # Vite dev middleware + static serving
│   ├── db.ts                   # Database query helpers
│   ├── routers.ts              # tRPC procedures (all API endpoints)
│   ├── storage.ts              # S3 file storage helpers
│   └── *.test.ts               # Vitest test files
├── drizzle/                    # Database schema and migrations
│   ├── schema.ts               # Table definitions (users, scores, achievements, favorites)
│   └── relations.ts            # Drizzle relation definitions
├── shared/                     # Code shared between client and server
│   ├── achievements.ts         # Achievement definitions and unlock logic
│   ├── const.ts                # Shared constants
│   └── types.ts                # Shared TypeScript types
├── vercel.json                 # Vercel deployment configuration
├── DESIGN.md                   # Design system documentation
├── DEPLOYMENT.md               # Detailed deployment guide
├── todo.md                     # Feature tracking
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Test configuration
├── drizzle.config.ts           # Drizzle Kit configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

### Request Lifecycle

1. **Browser** sends a request to the server
2. **Express** routes the request:
   - `/api/oauth/*` → Manus OAuth handler
   - `/api/trpc/*` → tRPC middleware
   - Everything else → Vite (dev) or static files (prod) with SPA fallback
3. **tRPC context** extracts the session cookie and resolves the current user
4. **Procedures** in `routers.ts` execute business logic, calling `db.ts` helpers
5. **Drizzle ORM** translates queries to MySQL and returns typed results
6. **Superjson** serializes the response (preserving `Date` objects, etc.)
7. **React Query** caches the result and updates the UI

### Data Flow

```
User Action → React Component → trpc.*.useQuery/useMutation
                                        ↓
                              tRPC Procedure (server)
                                        ↓
                              Drizzle ORM → MySQL/TiDB
                                        ↓
                              JSON Response (via Superjson)
                                        ↓
                              React Query Cache → UI Update
```

### Game Architecture

Each game is a self-contained React component that renders an HTML5 `<canvas>` element. Games share common infrastructure through:

- **`GameLayout`** — Wraps every game page with navigation, score display, and responsive canvas sizing
- **`GameTutorial`** — Shows controls and tips on first play (localStorage-persisted)
- **`ShareScore`** — Renders social sharing buttons on game-over screens
- **`useSoundEngine`** — Procedural Web Audio API sound generation (8-bit bleeps, music)
- **`useScoreSubmit`** — Handles leaderboard score submission via tRPC mutation

Games use `requestAnimationFrame` for their render loops and manage state internally via `useRef` to avoid React re-render overhead during gameplay.

---

## Database Schema

The application uses four tables:

```
users
├── id          (int, PK, auto-increment)
├── openId      (varchar(64), unique, not null)  — Manus OAuth identifier
├── name        (text)                           — Display name
├── email       (varchar(320))                   — Email address
├── loginMethod (varchar(64))                    — OAuth provider
├── role        (enum: user | admin)             — Access level
├── createdAt   (timestamp)
├── updatedAt   (timestamp)
└── lastSignedIn (timestamp)

scores
├── id          (int, PK, auto-increment)
├── userId      (int, FK → users.id)
├── game        (varchar(32))                    — Game identifier slug
├── score       (int)                            — Points achieved
├── wave        (int, nullable)                  — Space Invaders wave
├── lines       (int, nullable)                  — Tetris lines cleared
└── createdAt   (timestamp)

achievements
├── id            (int, PK, auto-increment)
├── userId        (int, FK → users.id)
├── achievementId (varchar(64))                  — Achievement identifier
└── unlockedAt    (timestamp)

favorites
├── id          (int, PK, auto-increment)
├── userId      (int, FK → users.id)
├── gameId      (varchar(32))                    — Game identifier slug
└── createdAt   (timestamp)
```

---

## API Reference

All API endpoints are tRPC procedures accessible via `/api/trpc`. The frontend consumes them through typed `trpc.*` hooks.

### Authentication

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `auth.me` | Query | Public | Returns current user or null |
| `auth.logout` | Mutation | Protected | Clears session cookie |

### Scores & Leaderboard

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `submitScore` | Mutation | Protected | Submit a game score (with optional wave/lines) |
| `getLeaderboard` | Query | Public | Get top 50 scores for a game |
| `getPersonalBests` | Query | Protected | Get user's best score per game |

### Achievements

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getMyAchievements` | Query | Protected | Get all unlocked achievements |
| `unlockAchievement` | Mutation | Protected | Unlock a specific achievement |

### Favorites

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getMyFavorites` | Query | Protected | Get user's favorited game IDs |
| `toggleFavorite` | Mutation | Protected | Add or remove a game from favorites |

### Game Stats

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getGamePlayCounts` | Query | Public | Get play counts per game (for HOT badges) |

### Profile

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getProfile` | Query | Protected | Get user profile with stats summary |

---

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL/TiDB connection string. Format: `mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET` | Secret key for signing session cookies. Use a random 32+ character string. |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `OWNER_OPEN_ID` | Project owner's Manus open ID |
| `OWNER_NAME` | Project owner's display name |
| `BUILT_IN_FORGE_API_URL` | Server-side Forge API URL |
| `BUILT_IN_FORGE_API_KEY` | Server-side Forge API bearer token |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Forge API bearer token |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Forge API URL |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_TITLE` | Application title | Mini Games Arcade |
| `VITE_APP_LOGO` | URL to custom logo image | — |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint URL | — |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | — |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Start development server with HMR |
| `build` | `pnpm build` | Build frontend (Vite) and backend (esbuild) for production |
| `start` | `pnpm start` | Run the production server from `dist/` |
| `check` | `pnpm check` | Run TypeScript type checking (no emit) |
| `test` | `pnpm test` | Run all Vitest tests |
| `format` | `pnpm format` | Format code with Prettier |
| `db:push` | `pnpm db:push` | Generate and apply database migrations |

---

## Testing

The project uses Vitest for testing. Test files are located in `server/` with the `.test.ts` extension.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Run a specific test file
pnpm vitest server/favorites-badges.test.ts
```

### Test Coverage

| Test File | Tests | Coverage Area |
|-----------|-------|--------------|
| `auth.logout.test.ts` | Auth flow, session management |
| `tutorials-and-search.test.ts` | Tutorial data completeness, search/filter logic, category mapping |
| `favorites-badges.test.ts` | Favorites CRUD, NEW/HOT badge logic, game ID validation |
| `share-score.test.ts` | Share URL generation, platform-specific text, all 11 games |
| `achievements.test.ts` | Achievement definitions, unlock conditions |
| `profile.test.ts` | Profile data aggregation |

---

## Game Catalog

| Game | Route | Category | Controls |
|------|-------|----------|----------|
| **Snake** | `/snake` | Classic | Arrow keys / Swipe |
| **Flappy Bird** | `/flappy-bird` | Action | Space / Tap |
| **Dino Jump** | `/dino-jump` | Action | Space / Up / Tap |
| **Tetris** | `/tetris` | Puzzle | Arrow keys + Up to rotate / Swipe + Tap |
| **Pong** | `/pong` | Classic | Up/Down arrows / Drag |
| **Space Invaders** | `/space-invaders` | Action | Left/Right + Space / Tilt + Tap |
| **Minesweeper** | `/minesweeper` | Puzzle | Click / Tap (long-press to flag) |
| **Breakout** | `/breakout` | Action | Left/Right / Drag |
| **2048** | `/2048` | Puzzle | Arrow keys / Swipe |
| **Memory Match** | `/memory-match` | Brain | Click / Tap |
| **Whack-a-Mole** | `/whack-a-mole` | Reflex | Click / Tap |

Each game features procedural 8-bit sound effects, a tutorial overlay on first play, leaderboard integration, achievement tracking, and social sharing on game-over screens.

---

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration file. For detailed step-by-step instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick start:**

1. Push the code to GitHub
2. Import the repository on [vercel.com/new](https://vercel.com/new)
3. Add all required environment variables in the Vercel dashboard
4. Deploy

The build produces a bundled Express server (`dist/index.js`) that runs as a Vercel serverless function, with static assets served from `dist/public/`.

### Other Platforms

The application is a standard Node.js Express server. It can be deployed to any platform that supports Node.js:

```bash
# Build for production
pnpm build

# Start the production server
pnpm start
```

The server reads `PORT` from the environment (defaults to 3000) and serves both the API and the static frontend.

---

## Troubleshooting

### Build fails with TypeScript errors

Run `pnpm check` locally to identify type errors before pushing. The build command does not run type checking — it relies on esbuild for fast bundling.

### Database connection issues

Ensure your `DATABASE_URL` includes SSL parameters if connecting to a remote database:

```
mysql://user:pass@host:port/db?ssl={"rejectUnauthorized":true}
```

### Games not loading (blank canvas)

Check the browser console for errors. Common causes include missing font files (Silkscreen, Outfit) or Content Security Policy blocking inline scripts. The games require HTML5 Canvas support.

### OAuth callback not working

The OAuth flow uses `window.location.origin` to construct redirect URLs dynamically. Ensure your deployment URL is registered as an allowed redirect origin in your Manus OAuth application settings.

### Sound not playing

Browsers require a user interaction before playing audio. The sound engine initializes on the first click/tap. If sound is still not working, check the volume settings in the Settings page.

### Tutorial not showing

Tutorials are shown once per game and the seen-state is stored in `localStorage`. To reset tutorials, go to Settings and use the "Reset Tutorial" section, or clear your browser's localStorage for the site.

---

## License

MIT
