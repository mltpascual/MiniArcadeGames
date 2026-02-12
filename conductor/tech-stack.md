# Tech Stack — Pixel Playground

## Architecture

Pixel Playground is a **fully client-side static SPA**. No server, no database, no authentication. All data persists in the browser's localStorage.

## Primary Languages

| Language | Version | Usage |
|----------|---------|-------|
| TypeScript | 5.6 | All application code |
| CSS | Tailwind CSS 4 | Styling via utility classes |

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 6.x | Build tool and dev server |
| Tailwind CSS | 4.x | Utility-first styling |
| Framer Motion | 12.x | Animations and transitions |
| Wouter | 3.x | Client-side routing (lightweight) |
| shadcn/ui | Latest | UI component primitives (Radix-based) |
| Lucide React | 0.453 | Icon library |
| Sonner | 2.x | Toast notifications |
| next-themes | Latest | Dark/light theme switching |

## Data Persistence

| Technology | Purpose |
|-----------|---------|
| localStorage | Scores, achievements, favorites, settings, player name |
| `gameStore.ts` | Centralized typed helpers for all localStorage operations |

### Storage Key Schema

| Key | Data Type | Description |
|-----|-----------|-------------|
| `pp_scores` | `ScoreEntry[]` | All game score records |
| `pp_achievements` | `AchievementEntry[]` | Unlocked achievement records |
| `pp_favorites` | `string[]` | Favorited game IDs |
| `pp_games_played` | `string[]` | Unique games played (for achievements) |
| `pp_player_name` | `string` | Player display name |
| `pp_tutorial_seen_*` | `"true"` | Per-game tutorial dismiss state |
| `pp_sound_*` | Various | Sound/music settings |
| `pp_difficulty` | `string` | Game difficulty preference |

## Build and Deployment

| Aspect | Details |
|--------|---------|
| Build output | Static HTML/CSS/JS in `dist/` |
| Build command | `pnpm build` |
| Preview command | `pnpm preview` |
| Deployment | Any static host (Vercel, Netlify, GitHub Pages) |
| SPA routing | `vercel.json` rewrites all routes to `index.html` |

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| pnpm | 10.x | Package manager |
| Vitest | 2.1 | Test runner |
| Prettier | 3.x | Code formatting |

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| No server/database | Simplifies deployment, zero hosting costs, enables offline play |
| localStorage over IndexedDB | Simpler API, sufficient for score/achievement data volumes |
| Canvas over DOM games | 60fps game loops without React re-render overhead |
| Web Audio API over audio files | Procedural sound generation, no asset downloads |
| Wouter over React Router | Minimal bundle size for a game-focused app |
| Framer Motion | Rich animation primitives for card transitions and UI polish |

## File Structure

```
client/
  public/           ← Static assets (favicon, fonts)
  src/
    pages/           ← Page components (11 games + Home, Leaderboard, etc.)
    components/      ← Reusable UI (GameLayout, GameTutorial, ShareScore)
    hooks/           ← Custom hooks (useScoreSubmit, useSoundEngine)
    lib/             ← Utilities (gameStore.ts)
    data/            ← Static data (tutorialData.ts)
    App.tsx          ← Routes and layout
    main.tsx         ← React entry point
    index.css        ← Global styles and theme tokens
shared/
  achievements.ts    ← Achievement definitions and check logic
  types.ts           ← Shared TypeScript types
```
