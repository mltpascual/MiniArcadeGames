# C4 Context — Pixel Playground

## System Overview

**Short Description:** A fully client-side browser-based mini games arcade featuring 11 classic games with local leaderboards, achievements, social sharing, and player profiles.

**Long Description:** Pixel Playground is a static single-page application that delivers a curated collection of 11 classic arcade games through a polished, neo-retro interface. The system runs entirely in the browser with zero server dependencies. Game scores, achievements, favorites, and settings are persisted in localStorage. All games use HTML5 Canvas with procedural 8-bit sound generation via the Web Audio API. Social sharing opens external URLs for Twitter/X and Facebook.

## Personas

| Persona | Type | Description | Goals | Key Features Used |
|---------|------|-------------|-------|-------------------|
| Casual Player | Human User | A person looking for quick entertainment during breaks | Play games without friction, track personal bests | Game playing, score display, sound controls |
| Competitive Player | Human User | A player motivated by achievement hunting | Unlock all achievements, share high scores | Achievements, social sharing, profile stats |
| Returning Player | Human User | A person who visits regularly | Quick access to favorite games, track progress | Favorites, profile, settings persistence |

## System Features

| Feature | Description | Personas |
|---------|-------------|----------|
| Game Catalog | Browse, search, and filter 11 arcade games by category | All players |
| Game Playing | Play games with keyboard and touch controls | All players |
| Local Leaderboards | Per-game score rankings stored in localStorage | Competitive Player |
| Achievements | Unlock badges for gameplay milestones | Competitive Player |
| Favorites | Star games for quick access via FAVS filter tab | Returning Player |
| Social Sharing | Share scores to Twitter/X, Facebook, or clipboard | Competitive Player |
| Game Tutorials | First-play overlay showing controls and tips | Casual Player |
| Player Profile | View play history, stats, and achievement progress | Returning Player |
| Settings | Configure difficulty, sound, theme, reset tutorials | All players |

## External Systems and Dependencies

| System | Type | Integration | Purpose |
|--------|------|-------------|---------|
| Twitter/X | Social Platform | Intent URL (client-side) | Social sharing |
| Facebook | Social Platform | Sharer URL (client-side) | Social sharing |
| Google Fonts | CDN | Link tags in HTML | Silkscreen + Outfit fonts |
| Static Host (Vercel) | Hosting | Serves built files | Deployment |

**Note:** There are no server-side dependencies, no database, no authentication service, and no API calls at runtime.

## System Context Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │          Pixel Playground SPA                  │  │
│  │     (React 19 + TypeScript + Vite)             │  │
│  │                                                │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │  │
│  │  │ 11 Game │  │   UI    │  │  gameStore   │  │  │
│  │  │ Canvases│  │  Pages  │  │ (localStorage)│  │  │
│  │  └─────────┘  └─────────┘  └──────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────┐  ┌────────────────────────────┐  │
│  │  localStorage  │  │   Web Audio API            │  │
│  │  (persistence) │  │   (procedural sound)       │  │
│  └───────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │                              │
         │ Social Share Links           │
         ▼                              ▼
  ┌──────────────┐            ┌──────────────┐
  │  Twitter/X   │            │   Facebook   │
  │  (share URL) │            │  (share URL) │
  └──────────────┘            └──────────────┘
```

## Key Characteristics

- **Zero runtime dependencies**: No API calls, no server, no database at runtime
- **Offline-capable**: After initial load, all functionality works without internet
- **Privacy-first**: No data leaves the browser (except voluntary social shares)
- **Statically deployable**: Build output is plain HTML/CSS/JS files

## Related Documentation

| Document | Path | Description |
|----------|------|-------------|
| Container Diagram | [c4-container.md](./c4-container.md) | Application containers |
| Component Index | [c4-component.md](./c4-component.md) | Logical components and relationships |
| Product Vision | [../conductor/product.md](../conductor/product.md) | Product goals and roadmap |
| Design System | [../DESIGN.md](../DESIGN.md) | Visual design tokens and component styling |
| README | [../README.md](../README.md) | Setup, usage, and deployment guide |
