# Pixel Playground — Mini Games Arcade

A collection of 11 classic arcade games reimagined with a neo-retro aesthetic. Built as a fully client-side static web app with local leaderboards, achievements, favorites, and social sharing. Play Snake, Tetris, Flappy Bird, and more — all in your browser, no server required.

## Key Features

- **11 Playable Games** — Snake, Flappy Bird, Dino Jump, Tetris, Pong, Space Invaders, Minesweeper, Breakout, 2048, Memory Match, Whack-a-Mole
- **Local Leaderboards** — Per-game score rankings stored in your browser
- **Achievements** — Unlockable badges for gameplay milestones
- **Favorites** — Star your favorite games for quick access
- **Social Sharing** — Share scores to Twitter/X, Facebook, or clipboard from game-over screens
- **Game Tutorials** — Animated first-play overlays showing controls and tips
- **Search & Filter** — Find games by name or category (Classic, Puzzle, Action, Brain, Reflex)
- **Procedural Sound** — Web Audio API-generated 8-bit sound effects and music
- **Dark/Light Themes** — Switchable themes with system preference detection
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Player Profiles** — Track play history, stats, and achievement progress
- **Zero Server Dependencies** — Everything runs in the browser, deployable as static files

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Game Catalog](#game-catalog)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19, TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Framer Motion |
| **UI Components** | shadcn/ui (Radix primitives) |
| **Routing** | Wouter (lightweight client-side router) |
| **Data Persistence** | Browser localStorage via gameStore service |
| **Game Rendering** | HTML5 Canvas + requestAnimationFrame |
| **Audio** | Web Audio API (procedural 8-bit sound) |
| **Build** | Vite 7 |
| **Testing** | Vitest |
| **Package Manager** | pnpm |

---

## Prerequisites

- **Node.js** 18 or higher
- **pnpm** 10 or higher (`npm install -g pnpm`)

No database, no API keys, no environment variables required.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mltpascual/MiniArcadeGames.git
cd MiniArcadeGames
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Development Server

```bash
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) with hot module replacement enabled.

---

## Architecture

### Directory Structure

```
mini-games-arcade/
├── client/                     # Application source
│   ├── index.html              # HTML entry point (loads Google Fonts)
│   ├── public/                 # Static assets served at /
│   └── src/
│       ├── components/         # Reusable components
│       │   ├── GameLayout.tsx   # Shared game page wrapper (nav, canvas sizing)
│       │   ├── GameTutorial.tsx # First-play tutorial overlay
│       │   ├── ShareScore.tsx   # Social sharing buttons
│       │   └── ui/             # shadcn/ui primitives
│       ├── contexts/           # React contexts (Theme, GameSettings)
│       ├── data/               # Static data (tutorial content)
│       ├── hooks/              # Custom hooks (sound engine, score submit)
│       ├── lib/                # Utilities
│       │   └── gameStore.ts    # localStorage service (scores, favorites, achievements)
│       ├── pages/              # Page components (11 games + 5 feature pages)
│       ├── App.tsx             # Router and providers
│       ├── index.css           # Global styles, theme tokens, custom utilities
│       └── main.tsx            # React entry point
├── shared/                     # Shared code
│   └── achievements.ts        # Achievement definitions and unlock logic
├── vercel.json                 # Vercel deployment configuration
├── DESIGN.md                   # Design system documentation
├── DEPLOYMENT.md               # Deployment guide
├── DEVELOPMENT_GUIDELINES.md   # Coding standards and best practices
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Test configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

### Data Flow

```
User Action → React Component → gameStore (localStorage) → UI Update
     │
     └─→ Canvas Game Loop (requestAnimationFrame)
              │
              └─→ Game Over → useScoreSubmit → gameStore.submitScore()
                                                    │
                                                    └─→ Achievement Check → gameStore
```

### Game Architecture

Each game is a self-contained React component that renders an HTML5 `<canvas>` element. Games share common infrastructure through:

- **`GameLayout`** — Wraps every game page with navigation, score display, and responsive canvas sizing
- **`GameTutorial`** — Shows controls and tips on first play (localStorage-persisted)
- **`ShareScore`** — Renders social sharing buttons on game-over screens
- **`useSoundEngine`** — Procedural Web Audio API sound generation (8-bit bleeps, music)
- **`useScoreSubmit`** — Handles score submission to localStorage and achievement checking

Games use `requestAnimationFrame` for their render loops and manage state internally via `useRef` to avoid React re-render overhead during gameplay.

### Data Persistence

All data is stored in the browser's `localStorage` via a centralized `gameStore` service:

| Data | Storage Key | Description |
|------|-------------|-------------|
| Scores | `pixel_playground_scores` | Array of score entries with game, score, playerName, timestamp |
| Achievements | `pixel_playground_achievements` | Array of unlocked achievement records |
| Favorites | `pixel_playground_favorites` | Array of favorited game IDs |
| Player Name | `pixel_playground_player_name` | User's display name |
| Tutorial State | `tutorial_seen_{gameId}` | Boolean per game for tutorial dismissal |
| Theme | `theme` | Current theme preference (dark/light/system) |
| Sound Settings | `sfx_volume`, `music_volume` | Volume levels (0-100) |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Start Vite dev server with HMR |
| `build` | `pnpm build` | Build for production to `dist/` |
| `preview` | `pnpm preview` | Preview the production build locally |
| `check` | `pnpm check` | Run TypeScript type checking (no emit) |
| `test` | `pnpm test` | Run all Vitest tests |
| `format` | `pnpm format` | Format code with Prettier |

---

## Testing

The project uses Vitest for testing. Test files are located in `client/src/lib/` with the `.test.ts` extension.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Run a specific test file
pnpm vitest client/src/lib/gameStore.test.ts
```

### Test Coverage

| Test File | Coverage Area |
|-----------|--------------|
| `gameStore.test.ts` | Score submission, leaderboard queries, favorites CRUD, achievements, player name, data isolation |

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

Each game features procedural 8-bit sound effects, a tutorial overlay on first play, local leaderboard integration, achievement tracking, and social sharing on game-over screens.

---

## Deployment

### Vercel (Recommended)

The project includes a `vercel.json` configuration file. For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Quick start:**

1. Push the code to GitHub
2. Import the repository on [vercel.com/new](https://vercel.com/new)
3. Set **Framework Preset** to "Vite"
4. Set **Build Command** to `pnpm build`
5. Set **Output Directory** to `dist`
6. Deploy — no environment variables needed

### Other Static Hosts

The build output is plain HTML/CSS/JS files. Deploy to any static host:

```bash
# Build for production
pnpm build

# Output is in dist/
# Upload dist/ contents to your host
```

**Requirements for SPA routing:** Configure your host to rewrite all routes to `index.html`. The `vercel.json` already handles this for Vercel. For Netlify, add a `_redirects` file: `/* /index.html 200`.

---

## Troubleshooting

### Build fails with TypeScript errors

Run `pnpm check` locally to identify type errors before pushing.

### Games not loading (blank canvas)

Check the browser console for errors. Common causes include missing font files (Silkscreen, Outfit) or Content Security Policy blocking inline scripts. The games require HTML5 Canvas support.

### Sound not playing

Browsers require a user interaction before playing audio. The sound engine initializes on the first click/tap. If sound is still not working, check the volume settings in the Settings page.

### Tutorial not showing

Tutorials are shown once per game and the seen-state is stored in `localStorage`. To reset tutorials, go to Settings and use the "Reset Tutorial" section, or clear your browser's localStorage for the site.

### Scores/data lost

All data is stored in the browser's `localStorage`. Clearing browser data, using incognito mode, or switching browsers will result in data loss. This is by design — the app is fully client-side with no server-side persistence.

---

## Documentation

The project includes comprehensive documentation:

| Document | Path | Description |
|----------|------|-------------|
| **Design System** | `DESIGN.md` | Colors, typography, components, spacing, animations |
| **Development Guidelines** | `DEVELOPMENT_GUIDELINES.md` | Coding standards, UI/UX, security, testing policies |
| **Deployment Guide** | `DEPLOYMENT.md` | Step-by-step deployment instructions |
| **C4 Architecture** | `C4-Documentation/` | System context, containers, and component diagrams |
| **Project Context** | `conductor/` | Product vision, tech stack, workflow, and tracks |

---

## License

MIT
