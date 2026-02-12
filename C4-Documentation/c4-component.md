# C4 Component Index — Pixel Playground

## Overview

All components exist within the single React SPA container. The application is organized into pages, reusable components, hooks, data modules, and a shared layer. There are no server-side components.

## Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      React SPA                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    App.tsx (Router)                       │ │
│  │  Wouter routes → ThemeProvider → Page components         │ │
│  └──────────┬──────────────────────────────────┬───────────┘ │
│             │                                  │              │
│  ┌──────────▼──────────┐    ┌──────────────────▼───────────┐ │
│  │    UI Pages (5)      │    │    Game Pages (11)            │ │
│  │  Home, Leaderboard,  │    │  SnakeGame, TetrisGame,      │ │
│  │  Achievements,       │    │  FlappyBirdGame, DinoGame,   │ │
│  │  Profile, Settings   │    │  PongGame, SpaceInvadersGame,│ │
│  │                      │    │  MinesweeperGame, Breakout,  │ │
│  │                      │    │  Game2048, MemoryMatchGame,  │ │
│  │                      │    │  WhackAMoleGame              │ │
│  └──────────┬───────────┘    └──────────┬──────────────────┘ │
│             │                           │                     │
│  ┌──────────▼───────────────────────────▼──────────────────┐ │
│  │              Shared Components                           │ │
│  │  GameLayout, GameTutorial, ShareScore, NavBar            │ │
│  └──────────┬──────────────────────────────────────────────┘ │
│             │                                                 │
│  ┌──────────▼──────────┐    ┌──────────────────────────────┐ │
│  │     Hooks            │    │     Data / Services          │ │
│  │  useScoreSubmit      │    │  gameStore.ts (localStorage) │ │
│  │  useSoundEngine      │    │  tutorialData.ts             │ │
│  │                      │    │  achievements.ts             │ │
│  └──────────────────────┘    └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Component Details

### Game Engine Layer

**Purpose:** 11 HTML5 Canvas game implementations with procedural sound.

| Game | File | Category | Controls |
|------|------|----------|----------|
| Snake | `pages/SnakeGame.tsx` | Classic | Arrow keys / Swipe |
| Flappy Bird | `pages/FlappyBirdGame.tsx` | Action | Space / Tap |
| Dino Jump | `pages/DinoGame.tsx` | Action | Space / Tap |
| Tetris | `pages/TetrisGame.tsx` | Puzzle | Arrow keys / Buttons |
| Pong | `pages/PongGame.tsx` | Classic | Arrow keys / Drag |
| Space Invaders | `pages/SpaceInvadersGame.tsx` | Action | Arrow+Space / Buttons |
| Minesweeper | `pages/MinesweeperGame.tsx` | Puzzle | Click / Tap |
| Breakout | `pages/BreakoutGame.tsx` | Classic | Arrow keys / Drag |
| 2048 | `pages/Game2048.tsx` | Puzzle | Arrow keys / Swipe |
| Memory Match | `pages/MemoryMatchGame.tsx` | Brain | Click / Tap |
| Whack-a-Mole | `pages/WhackAMoleGame.tsx` | Reflex | Click / Tap |

**Common game page structure:**
```
GameLayout wrapper → Canvas element → Game loop (requestAnimationFrame)
  ├── GameTutorial (first-play overlay, localStorage-persisted)
  ├── ShareScore (game-over social sharing)
  └── useScoreSubmit (score → gameStore → achievement check)
```

### UI Pages

| Component | File | Purpose | Key Dependencies |
|-----------|------|---------|-----------------|
| Home | `pages/Home.tsx` | Game catalog with search, category filter, favorites tab, NEW/HOT badges | gameStore, Framer Motion |
| Leaderboard | `pages/Leaderboard.tsx` | Per-game score rankings from localStorage | gameStore |
| Achievements | `pages/Achievements.tsx` | Achievement badge collection with progress tracking | gameStore, achievements.ts |
| Profile | `pages/Profile.tsx` | Player stats, play history, achievement summary | gameStore |
| Settings | `pages/Settings.tsx` | Difficulty, sound, theme, tutorial reset | localStorage |

### Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| GameLayout | `components/GameLayout.tsx` | Responsive game wrapper with back button, score display, canvas container |
| GameTutorial | `components/GameTutorial.tsx` | First-play tutorial overlay with controls and tips |
| ShareScore | `components/ShareScore.tsx` | Social sharing buttons (Twitter/X, Facebook, Copy Link) |
| NavBar | (in Home.tsx) | Sticky top navigation with game count and settings link |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| useScoreSubmit | `hooks/useScoreSubmit.ts` | Submits scores to localStorage, checks achievements |
| useSoundEngine | `hooks/useSoundEngine.ts` | Procedural 8-bit sound via Web Audio API |

### Data / Services

| Module | File | Purpose |
|--------|------|---------|
| gameStore | `lib/gameStore.ts` | Centralized localStorage service for all persistent data |
| tutorialData | `data/tutorialData.ts` | Tutorial content (controls, tips) for all 11 games |
| achievements | `shared/achievements.ts` | Achievement definitions and threshold check logic |

### gameStore API

| Function | Description |
|----------|-------------|
| `submitScore(game, score, playerName, extra?)` | Save a score entry |
| `getScores(game?)` | Get scores, optionally filtered by game |
| `getTopScores(game, limit)` | Get top N scores for a game |
| `getBestScore(game)` | Get personal best for a game |
| `getGamesPlayed()` | Get list of unique games played |
| `getFavorites()` | Get favorited game IDs |
| `toggleFavorite(gameId)` | Add or remove a favorite |
| `isFavorite(gameId)` | Check if a game is favorited |
| `getAchievements()` | Get all unlocked achievements |
| `unlockAchievement(id, game)` | Unlock an achievement |
| `getPlayerName() / setPlayerName()` | Get/set player display name |

## Related Documentation

| Document | Path |
|----------|------|
| System Context | [c4-context.md](./c4-context.md) |
| Container Diagram | [c4-container.md](./c4-container.md) |
| Design System | [../DESIGN.md](../DESIGN.md) |
