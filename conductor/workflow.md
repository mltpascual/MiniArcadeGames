# Workflow — Pixel Playground

## Development Methodology

The project follows a feature-driven development approach with test-first validation. Each feature follows the Build Loop pattern: Schema, Helpers, Procedures, UI, Tests.

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

```
1. Add feature to todo.md as [ ] item
2. Update drizzle/schema.ts (if DB changes needed)
3. Run pnpm db:push to apply migrations
4. Add query helpers in server/db.ts
5. Add tRPC procedures in server/routers.ts
6. Build frontend UI in client/src/pages/
7. Write tests in server/*.test.ts
8. Run pnpm test to verify
9. Mark feature as [x] in todo.md
10. Save checkpoint
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
| Data validation | Test Zod schemas reject invalid input |
| Business logic | Test shared functions (achievements, scoring) |

## Code Review Checklist

- TypeScript strict mode compliance (no `any`)
- Input validation via Zod on all tRPC procedures
- Loading, error, and empty states handled in UI
- Mobile responsiveness verified
- Accessibility: keyboard navigation, ARIA labels
- No hardcoded colors — use semantic tokens
- No server secrets exposed to client

## Deployment Procedure

1. Run `pnpm test` — all tests must pass
2. Run `pnpm build` — clean production build
3. Push to GitHub (`main` branch)
4. Vercel auto-deploys from `main`
5. Verify environment variables are set in Vercel dashboard
6. Run database migrations if schema changed

## Todo Tracking

The `todo.md` file at project root tracks all features, changes, and bugs:

- `[ ]` — Pending
- `[x]` — Completed
- Never delete items — keep as history
- Add new items before starting implementation
- Mark complete before saving checkpoint
