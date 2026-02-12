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
| **Forms** | Use `react-hook-form` with `zod` resolvers. Show inline validation errors. Use proper `autocomplete` attributes. |
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

### 2.1 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `GameTutorial`, `ShareScore` |
| Hooks | camelCase with `use` prefix | `useScoreSubmit`, `useSoundEngine` |
| Constants | UPPER_SNAKE_CASE | `VALID_GAMES`, `NEW_GAMES` |
| Types/Interfaces | PascalCase | `Score`, `InsertUser` |
| Files (components) | PascalCase.tsx | `SnakeGame.tsx` |
| Files (utilities) | camelCase.ts | `tutorialData.ts` |
| Database columns | camelCase | `userId`, `createdAt` |
| API routes | camelCase | `submitScore`, `getLeaderboard` |

**Rules:**
- Use intention-revealing names: `elapsedTimeInDays` not `d`.
- Function names should be verbs: `submitScore`, `toggleFavorite`.
- Boolean variables should read as questions: `isAuthenticated`, `hasPlayed`.
- Avoid abbreviations unless universally understood (`id`, `url`, `api`).

### 2.2 Functions and Components

**Keep functions small and focused.** Each function should do one thing.

- React components: under 200 lines. Split into sub-components when exceeding this.
- tRPC router files: under 150 lines. Split into `server/routers/<feature>.ts` when growing.
- Helper functions in `db.ts`: pure data access, no business logic.
- Procedures in `routers.ts`: orchestrate helpers, validate input, return results.

**Rules:**
- Limit function arguments to 3 or fewer. Use an options object for more.
- Never call `setState` or navigation in the render phase — wrap in `useEffect`.
- Use `useRef` for game state that changes during `requestAnimationFrame` loops to avoid re-renders.
- Stabilize query inputs with `useState` or `useMemo` to prevent infinite re-fetch loops.

### 2.3 Error Handling

- Use `try/catch` at the procedure level in tRPC routers.
- Throw `TRPCError` with appropriate codes (`NOT_FOUND`, `FORBIDDEN`, `BAD_REQUEST`).
- Frontend: handle `isLoading`, `isError`, and empty states in every component that fetches data.
- Show user-friendly error messages via toast — never expose stack traces.
- Use `ErrorBoundary` at the app level to catch unhandled React errors.

### 2.4 TypeScript

- Enable `strict` mode. Never use `any` — define proper types.
- Infer database types from Drizzle schema: `typeof users.$inferSelect`.
- Use Zod schemas for all tRPC input validation — types flow end-to-end.
- Export shared types from `shared/types.ts` for client-server contracts.

### 2.5 Code Organization

```
Feature implementation order:
1. Schema (drizzle/schema.ts) → pnpm db:push
2. Query helpers (server/db.ts)
3. tRPC procedures (server/routers.ts)
4. Frontend UI (client/src/pages/*.tsx)
5. Tests (server/*.test.ts)
```

- Keep related code close together. A feature's backend and frontend should be developed in sequence.
- Extract reusable UI into `client/src/components/`.
- Extract shared logic into `client/src/hooks/`.
- Static data belongs in `client/src/data/`.
- Never import server code from client code or vice versa — use `shared/` for cross-boundary types.

---

## 3. Security

*Synthesized from: api-security-best-practices, find-bugs*

### 3.1 Authentication and Authorization

| Principle | Implementation |
|-----------|---------------|
| Session management | JWT-signed cookies via `server/_core/cookies.ts` |
| Protected routes | Use `protectedProcedure` for any user-specific data |
| Admin routes | Check `ctx.user.role === 'admin'` in procedure middleware |
| Frontend auth | Use `useAuth()` hook — never manipulate cookies directly |
| OAuth redirects | Always use `window.location.origin` — never hardcode domains |

### 3.2 Input Validation

- **Validate all inputs** using Zod schemas in tRPC procedure `.input()`.
- Validate game IDs against the `VALID_GAMES` array — never trust client-provided game slugs.
- Validate score values are non-negative integers.
- Sanitize any user-generated text before storing or displaying.

```typescript
// Example: Always validate game IDs
.input(z.object({
  game: z.string().refine(g => VALID_GAMES.includes(g)),
  score: z.number().int().min(0),
}))
```

### 3.3 Database Security

- Use Drizzle ORM for all queries — never construct raw SQL strings.
- Parameterize all dynamic values through Drizzle's query builder.
- Never store file bytes in database columns — use S3 for file storage, database for metadata.
- Use `ssl: { rejectUnauthorized: true }` for remote database connections.

### 3.4 API Security Checklist

- All traffic over HTTPS (enforced by deployment platform).
- Rate limiting on score submission and authentication endpoints.
- No sensitive data in URL parameters — use request body for mutations.
- CORS configured to allow only the application origin.
- Environment variables for all secrets — never commit `.env` files.
- Server-side API keys (`BUILT_IN_FORGE_API_KEY`) never exposed to the client.

### 3.5 Common Vulnerabilities to Watch

| Vulnerability | Prevention |
|--------------|-----------|
| XSS | React auto-escapes JSX. Never use `dangerouslySetInnerHTML`. |
| SQL Injection | Drizzle ORM parameterizes all queries. Never use raw SQL. |
| CSRF | Session cookies use `SameSite=Lax`. Mutations use POST via tRPC. |
| Broken Auth | All protected procedures verify `ctx.user` before executing. |
| Mass Assignment | Zod schemas whitelist allowed input fields explicitly. |

---

## 4. Testing

*Synthesized from: e2e-testing-patterns*

### 4.1 Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit/Integration | Vitest | Server procedures, shared logic, data validation |
| Component | Vitest + Testing Library | React component rendering (future) |
| E2E | Playwright (recommended) | Critical user journeys (future) |

### 4.2 Current Test Structure

Tests live in `server/*.test.ts` and run with `pnpm test` (Vitest).

**Naming convention:** `<feature>.test.ts` — e.g., `favorites-badges.test.ts`, `share-score.test.ts`.

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
| Input validation | Verify Zod schemas reject invalid data |
| Business logic | Test shared functions (achievements, scoring, categories) |
| Data integrity | Verify game IDs, category mappings, tutorial data completeness |
| Edge cases | Empty arrays, boundary values, missing optional fields |

### 4.4 Testing Rules

- **Every new feature must include tests** before delivery.
- Tests must be independent — no shared mutable state between tests.
- Use descriptive test names that explain the expected behavior.
- Run `pnpm test` before every checkpoint save.
- Aim for coverage of all tRPC procedures and shared utility functions.

### 4.5 E2E Testing (Future)

When implementing E2E tests, follow these patterns:

- Use **Playwright** with TypeScript.
- Add `data-testid` attributes to key interactive elements.
- Implement the **Page Object Model** for reusable page interactions.
- Focus on critical user journeys: play a game → submit score → view leaderboard.
- Isolate tests with fresh state — reset localStorage and database between runs.
- Use `test.describe.parallel` for independent test suites.

---

## Quick Reference

### File Touch Points for New Features

```
1. drizzle/schema.ts      → Add/modify tables
2. pnpm db:push            → Apply migrations
3. server/db.ts            → Add query helpers
4. server/routers.ts       → Add tRPC procedures
5. client/src/pages/*.tsx  → Build UI
6. server/*.test.ts        → Write tests
7. pnpm test               → Verify
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run all tests |
| `pnpm check` | TypeScript type checking |
| `pnpm db:push` | Generate and apply migrations |
| `pnpm format` | Format code with Prettier |

---

*This document was generated by the Dev Orchestrator, synthesizing principles from 8 specialized development skills: frontend-design, ui-ux-pro-max, web-design-guidelines, code-reviewer, find-bugs, clean-code, api-security-best-practices, and e2e-testing-patterns.*
