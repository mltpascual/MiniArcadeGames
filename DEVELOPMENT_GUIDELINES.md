# Development Guidelines — Pixel Playground

> This document synthesizes coding standards, UI/UX guidelines, security policies, and testing strategies for the Pixel Playground mini games arcade. All developers and AI agents should refer to this file throughout the development lifecycle.

---

## Table of Contents

- [1. UI/UX and Frontend](#1-uiux-and-frontend)
- [2. Code Quality and Best Practices](#2-code-quality-and-best-practices)
- [3. Security](#3-security)
- [4. Testing](#4-testing)

---

## 1. UI/UX and Frontend

*Synthesized from: frontend-design, ui-ux-pro-max, web-design-guidelines*

### 1.1 Design Identity

The project follows a **neo-retro "Pixel Playground"** aesthetic — dark charcoal base with vibrant triadic accents (indigo, coral, mint). Every design decision should reinforce this identity rather than defaulting to generic patterns.

| Token | Value | Usage |
|-------|-------|-------|
| Background | `oklch(0.145 0.02 280)` | Page and card backgrounds |
| Foreground | `oklch(0.95 0.01 280)` | Primary text |
| Indigo | `oklch(0.65 0.22 280)` | Primary accent, CTAs |
| Coral | `oklch(0.7 0.18 25)` | Secondary accent, warnings |
| Mint | `oklch(0.78 0.15 165)` | Success states, highlights |

**Font pairing:** Silkscreen (pixel headings) + Outfit (body text). Loaded via Google Fonts CDN in `client/index.html`.

### 1.2 Component Standards

**Use shadcn/ui primitives** for all interactive elements. Import from `@/components/ui/*`. Do not introduce alternative component libraries.

| Component | Guidelines |
|-----------|-----------|
| **Buttons** | Use `variant` and `size` props. Always include `focus-visible` ring. Add loading spinner via `disabled` state during mutations. |
| **Cards** | Use the `Card` component for game tiles. Apply hover transforms and glow effects via Tailwind utilities, not inline styles. |
| **Dialogs/Modals** | Use Radix Dialog. Always include keyboard dismiss (ESC) and backdrop click. |
| **Toast** | Use `sonner` for all transient notifications. Keep messages under 80 characters. |

### 1.3 Layout and Responsiveness

Design **mobile-first** with these breakpoints:

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | `< 640px` | Single column, touch controls, larger tap targets (min 44px) |
| Tablet | `640px – 1024px` | Two-column game grid |
| Desktop | `> 1024px` | Three-column game grid, full canvas sizing |

**Rules:**
- Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) — never media queries in CSS.
- Game canvases must scale proportionally using the `GameLayout` component.
- Navigation uses a sticky top bar on all viewports (no sidebar pattern for this public-facing app).
- All interactive elements must have visible focus rings for keyboard navigation.

### 1.4 Animations and Micro-interactions

Use **Framer Motion** for page transitions and card animations. Use CSS transitions for hover states and simple transforms.

**Rules:**
- Keep animations under 300ms for interactive feedback, up to 500ms for page transitions.
- Use `prefers-reduced-motion` media query to disable non-essential animations.
- Game canvases use `requestAnimationFrame` directly — not React animation libraries.
- Stagger grid animations with `delayChildren` and `staggerChildren` variants.

### 1.5 Theming

The app supports dark and light themes via `ThemeProvider` (default: dark). All colors use CSS custom properties defined in `client/src/index.css`.

**Rules:**
- Always pair `bg-{semantic}` with `text-{semantic}-foreground` — text color does not auto-inherit.
- If `defaultTheme="dark"`, ensure `.dark {}` in `index.css` has correct dark values.
- Never hardcode color values in components — use semantic tokens (`bg-background`, `text-foreground`, `bg-card`, etc.).
- Game overlays (tutorials, game-over, share) use explicit dark colors (`bg-[#1a1a2e]`) to maintain consistency regardless of theme.

### 1.6 Accessibility

- All images must have descriptive `alt` text.
- Interactive elements must be reachable via keyboard (Tab, Enter, Escape).
- Color contrast must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text).
- Use ARIA labels for icon-only buttons.
- Game controls must have both keyboard and touch alternatives.

---

## 2. Code Quality and Best Practices

*Synthesized from: clean-code, code-reviewer*

### 2.1 Architecture — Client-Side Only

This project is a **fully client-side static SPA**. There is no server, no database, and no authentication layer. All data persistence uses **localStorage**.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| UI Framework | React 19 + TypeScript | Component rendering and state management |
| Styling | Tailwind CSS 4 + shadcn/ui | Design system and component library |
| Build Tool | Vite | Development server and production bundling |
| Data Persistence | localStorage | Scores, achievements, favorites, settings |
| Routing | Wouter | Client-side SPA routing |
| Deployment | Static hosting (Vercel, Netlify, GitHub Pages) | No server runtime required |

### 2.2 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `GameTutorial`, `ShareScore` |
| Hooks | camelCase with `use` prefix | `useScoreSubmit`, `useSoundEngine` |
| Constants | UPPER_SNAKE_CASE | `VALID_GAMES`, `NEW_GAMES` |
| Types/Interfaces | PascalCase | `ScoreEntry`, `AchievementEntry` |
| Files (components) | PascalCase.tsx | `SnakeGame.tsx` |
| Files (utilities) | camelCase.ts | `tutorialData.ts`, `gameStore.ts` |

**Rules:**
- Use intention-revealing names: `elapsedTimeInDays` not `d`.
- Function names should be verbs: `submitScore`, `toggleFavorite`.
- Boolean variables should read as questions: `isFavorite`, `hasPlayed`.
- Avoid abbreviations unless universally understood (`id`, `url`, `api`).

### 2.3 Functions and Components

**Keep functions small and focused.** Each function should do one thing.

- React components: under 200 lines. Split into sub-components when exceeding this.
- Game pages are an exception — canvas-based games may be longer due to game loop logic.
- Helper functions in `gameStore.ts`: pure data access, no UI logic.

**Rules:**
- Limit function arguments to 3 or fewer. Use an options object for more.
- Never call `setState` or navigation in the render phase — wrap in `useEffect`.
- Use `useRef` for game state that changes during `requestAnimationFrame` loops to avoid re-renders.
- Stabilize references with `useState` or `useMemo` to prevent infinite re-render loops.

### 2.4 Error Handling

- Use `try/catch` in localStorage operations (see `gameStore.ts` `getJSON` helper).
- Handle empty states in every component that reads data (no scores yet, no achievements, etc.).
- Show user-friendly messages via toast — never expose stack traces.
- Game canvases should gracefully handle edge cases (window resize, focus loss, etc.).

### 2.5 TypeScript

- Enable `strict` mode. Never use `any` — define proper types.
- Export shared types from `shared/types.ts` and `client/src/lib/gameStore.ts`.
- Use Zod schemas for any form validation.

### 2.6 Code Organization

```
Feature implementation order:
1. Data types (shared/types.ts or gameStore.ts)
2. localStorage helpers (client/src/lib/gameStore.ts)
3. Hooks (client/src/hooks/*.ts)
4. Frontend UI (client/src/pages/*.tsx)
5. Tests (client/src/lib/*.test.ts)
```

- Keep related code close together.
- Extract reusable UI into `client/src/components/`.
- Extract shared logic into `client/src/hooks/`.
- Static data belongs in `client/src/data/`.
- Game-specific logic stays within the game page file.

---

## 3. Security

*Synthesized from: api-security-best-practices, find-bugs*

### 3.1 Client-Side Security Considerations

Since this is a fully client-side app, the security model is different from a server-rendered application. All data is stored in the user's browser and is inherently user-modifiable.

| Concern | Approach |
|---------|----------|
| Data integrity | localStorage scores are local-only — no competitive leaderboard to exploit |
| XSS | React auto-escapes JSX. Never use `dangerouslySetInnerHTML`. |
| Dependencies | Keep dependencies up to date. Run `pnpm audit` regularly. |
| Secrets | No API keys or secrets in the codebase — this is a static app. |
| Content Security | Use CSP headers via deployment platform (Vercel headers, etc.). |

### 3.2 Input Validation

- Validate all user inputs (player name, settings) before storing.
- Validate game IDs against known game lists before processing.
- Sanitize any user-generated text before displaying.

### 3.3 localStorage Best Practices

- Always wrap `localStorage.getItem` / `JSON.parse` in try/catch.
- Use a consistent key prefix (`pp_`) to avoid collisions with other apps.
- Never store sensitive data in localStorage.
- Handle quota exceeded errors gracefully.

---

## 4. Testing

*Synthesized from: e2e-testing-patterns*

### 4.1 Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit/Integration | Vitest | gameStore, shared logic, data validation |
| Component | Vitest + Testing Library | React component rendering (future) |
| E2E | Playwright (recommended) | Critical user journeys (future) |

### 4.2 Current Test Structure

Tests live in `client/src/lib/*.test.ts` and run with `pnpm test` (Vitest).

**Naming convention:** `<feature>.test.ts` — e.g., `gameStore.test.ts`.

**Test organization:**
```typescript
describe("Feature Name", () => {
  describe("sub-feature or scenario", () => {
    it("should do specific thing", () => {
      // Arrange → Act → Assert
    });
  });
});
```

### 4.3 What to Test

| Must Test | How |
|-----------|-----|
| Score management | Verify submit, retrieve, sort, and filter operations |
| Achievement logic | Verify threshold checks and deduplication |
| Favorites | Verify toggle, persistence, and retrieval |
| Data integrity | Verify game IDs, category mappings, tutorial data completeness |
| Edge cases | Corrupted localStorage, empty arrays, boundary values |

### 4.4 Testing Rules

- **Every new feature must include tests** before delivery.
- Tests must be independent — no shared mutable state between tests.
- Use descriptive test names that explain the expected behavior.
- Mock `localStorage` in test environment since Vitest runs in Node.
- Run `pnpm test` before every checkpoint save.

### 4.5 E2E Testing (Future)

When implementing E2E tests, follow these patterns:

- Use **Playwright** with TypeScript.
- Add `data-testid` attributes to key interactive elements.
- Implement the **Page Object Model** for reusable page interactions.
- Focus on critical user journeys: play a game → view score → check leaderboard.
- Isolate tests with fresh state — clear localStorage between runs.
- Use `test.describe.parallel` for independent test suites.

---

## Quick Reference

### File Touch Points for New Features

```
1. shared/types.ts or gameStore.ts  → Add types/storage helpers
2. client/src/hooks/*.ts            → Add custom hooks
3. client/src/pages/*.tsx           → Build UI
4. client/src/lib/*.test.ts         → Write tests
5. pnpm test                        → Verify
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite development server |
| `pnpm build` | Build static SPA for production |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run all tests |
| `pnpm check` | TypeScript type checking |
| `pnpm format` | Format code with Prettier |

---

*This document was generated by the Dev Orchestrator, synthesizing principles from 8 specialized development skills: frontend-design, ui-ux-pro-max, web-design-guidelines, code-reviewer, find-bugs, clean-code, api-security-best-practices, and e2e-testing-patterns.*
