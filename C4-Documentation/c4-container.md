# C4 Container Diagram — Pixel Playground

## Container Overview

Pixel Playground is a **single-container application** — a static SPA that runs entirely in the browser. There are no server containers, database containers, or API containers.

## Container: React SPA

| Property | Value |
|----------|-------|
| **Name** | React Single-Page Application |
| **Type** | Static Web Application (Client-Side Only) |
| **Technology** | React 19, TypeScript, Tailwind CSS 4, Vite, HTML5 Canvas, Web Audio API |
| **Deployment** | Static files served by any web host (Vercel, Netlify, GitHub Pages) |

**Purpose:** Delivers the entire application — game catalog, 11 playable games (rendered on HTML5 Canvas), local leaderboards, achievements, player profiles, settings, and social sharing. All game logic and data persistence runs client-side in the browser using localStorage.

### Internal Layers

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Game Engine | HTML5 Canvas + requestAnimationFrame | 11 canvas-based games at 60fps |
| Sound Engine | Web Audio API | Procedural 8-bit sound generation |
| UI Layer | React + shadcn/ui + Framer Motion | Pages, components, layouts |
| Data Layer | localStorage via gameStore.ts | Scores, achievements, favorites, settings |
| Routing | Wouter | Client-side SPA navigation |
| Tutorial System | localStorage flags | First-play overlays per game |
| Share System | URL construction | Twitter/X and Facebook intent URLs |

### Routes (16)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Game catalog with search, filter, favorites |
| `/snake` | SnakeGame | Classic snake game |
| `/flappy-bird` | FlappyBirdGame | Flappy bird clone |
| `/dino-jump` | DinoGame | Chrome dino runner |
| `/tetris` | TetrisGame | Block stacking puzzle |
| `/pong` | PongGame | Table tennis vs AI |
| `/space-invaders` | SpaceInvadersGame | Alien shooter |
| `/minesweeper` | MinesweeperGame | Mine detection puzzle |
| `/breakout` | BreakoutGame | Brick breaker |
| `/2048` | Game2048 | Number merge puzzle |
| `/memory-match` | MemoryMatchGame | Card matching |
| `/whack-a-mole` | WhackAMoleGame | Reaction game |
| `/leaderboard` | Leaderboard | Local score rankings |
| `/achievements` | Achievements | Badge collection |
| `/profile` | Profile | Player stats |
| `/settings` | Settings | Preferences |

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

## External Dependencies

| From | To | Protocol | Description |
|------|-----|----------|-------------|
| React SPA | Google Fonts | HTTPS (CDN) | Silkscreen + Outfit fonts |
| React SPA | Twitter/X | HTTPS (intent URL) | Social sharing (outbound only) |
| React SPA | Facebook | HTTPS (sharer URL) | Social sharing (outbound only) |
| Static Host | Browser | HTTPS | Serves built HTML/CSS/JS files |

**Note:** There are no server-side API calls, no database connections, and no authentication flows at runtime.

## Build and Deployment

| Attribute | Value |
|-----------|-------|
| Build Command | `pnpm build` |
| Output Directory | `dist/` |
| Output Contents | `index.html` + `assets/*.js` + `assets/*.css` |
| Environment Variables | None required |
| Node.js Requirement | >= 18 (build-time only) |
| SPA Routing | All routes rewrite to `index.html` |

## Related Documentation

| Document | Path |
|----------|------|
| System Context | [c4-context.md](./c4-context.md) |
| Component Index | [c4-component.md](./c4-component.md) |
