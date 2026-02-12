# Workflow — Pixel Playground

## Development Methodology

The project follows a feature-driven development approach with test-first validation. This is a fully client-side static SPA — there is no server, database, or authentication layer.

## Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/*` | New features and enhancements |
| `fix/*` | Bug fixes |

### Commit Conventions

Use conventional commits:

```
feat: add social sharing to game-over screens
fix: center emoji symbols in Memory Match cards
docs: update DESIGN.md with badge component
chore: clean up QA markdown files
```

## Feature Development Process

### Adding a New Game

```
1. Add to todo.md as [ ] item
2. Create client/src/pages/NewGame.tsx (canvas-based with GameLayout)
3. Add game to games array in Home.tsx
4. Add category mapping in gameCategoryMap
5. Add tutorial data in client/src/data/tutorialData.ts
6. Add achievement definitions in shared/achievements.ts
7. Add route in client/src/App.tsx
8. Integrate useScoreSubmit, GameTutorial, ShareScore
9. Write tests and run pnpm test
10. Mark as [x] in todo.md
```

### Adding a New Feature

```
1. Add to todo.md as [ ] item
2. Define types in shared/types.ts or gameStore.ts
3. Add localStorage helpers in gameStore.ts if needed
4. Create custom hook in client/src/hooks/ if needed
5. Build UI in client/src/pages/ or components/
6. Write tests in client/src/lib/*.test.ts
7. Run pnpm test to verify
8. Mark as [x] in todo.md
```

## Quality Gates

| Gate | Requirement | Command |
|------|------------|---------|
| Type Safety | 0 TypeScript errors | `pnpm check` |
| Tests | All tests passing | `pnpm test` |
| Formatting | Prettier-compliant | `pnpm format` |
| Build | Clean production build | `pnpm build` |

## Testing Requirements

| Scope | Requirement |
|-------|------------|
| New features | Must include Vitest tests before delivery |
| Bug fixes | Must include regression test |
| Data validation | Test localStorage operations and edge cases |
| Business logic | Test shared functions (achievements, scoring, favorites) |

## Code Review Checklist

- TypeScript strict mode compliance (no `any`)
- Loading, error, and empty states handled in UI
- Mobile responsiveness verified
- Accessibility: keyboard navigation, ARIA labels
- No hardcoded colors — use semantic tokens
- localStorage operations wrapped in try/catch

## Deployment Procedure

1. Run `pnpm test` — all tests must pass
2. Run `pnpm build` — clean production build
3. Push to GitHub (`main` branch)
4. Import on Vercel (or any static host)
5. Build command: `pnpm build`, output: `dist`
6. No environment variables required

## Todo Tracking

The `todo.md` file at project root tracks all features, changes, and bugs:

- `[ ]` — Pending
- `[x]` — Completed
- Never delete items — keep as history
- Add new items before starting implementation
- Mark complete before saving checkpoint
