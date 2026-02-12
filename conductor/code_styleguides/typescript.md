# TypeScript Style Guide — Pixel Playground

## General Rules

- Strict mode enabled (`"strict": true` in tsconfig)
- Never use `any` — define proper types or use `unknown` with type guards
- Prefer `const` over `let`; never use `var`
- Use template literals over string concatenation
- Use optional chaining (`?.`) and nullish coalescing (`??`) over manual checks

## Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Variables, functions | camelCase | `gameState`, `submitScore()` |
| Constants | UPPER_SNAKE_CASE | `VALID_GAMES`, `MAX_SCORE` |
| Types, interfaces | PascalCase | `Score`, `GameConfig` |
| Enums | PascalCase (members too) | `GameStatus.Playing` |
| React components | PascalCase | `GameTutorial`, `ShareScore` |
| Hooks | camelCase with `use` prefix | `useAuth()`, `useSoundEngine()` |
| Files (components) | PascalCase.tsx | `SnakeGame.tsx` |
| Files (utilities) | camelCase.ts | `tutorialData.ts` |
| Test files | kebab-case.test.ts | `favorites-badges.test.ts` |

## Types

```typescript
// Prefer type inference where obvious
const score = 42; // number inferred

// Explicit types for function signatures
function submitScore(game: string, score: number): Promise<void> { ... }

// Use Drizzle inference for database types
type User = typeof users.$inferSelect;
type InsertScore = typeof scores.$inferInsert;

// Use Zod for runtime validation + type extraction
const scoreInput = z.object({
  game: z.string(),
  score: z.number().int().min(0),
});
type ScoreInput = z.infer<typeof scoreInput>;
```

## Functions

- Keep functions under 30 lines; extract helpers for longer logic
- Limit parameters to 3; use options object for more
- Use arrow functions for callbacks and inline handlers
- Use `function` declarations for top-level exports (hoisting)

## React Patterns

```typescript
// Component structure
export default function GamePage() {
  // 1. Hooks (state, refs, queries)
  // 2. Derived values
  // 3. Event handlers
  // 4. Effects
  // 5. Return JSX
}

// Never setState in render phase
// ❌ if (condition) setState(value);
// ✅ useEffect(() => { if (condition) setState(value); }, [condition]);

// Stabilize query inputs
const [date] = useState(() => new Date());
const { data } = trpc.items.getByDate.useQuery({ date });
```

## Imports

Order imports in this sequence:

1. React and framework imports
2. Third-party libraries
3. Internal aliases (`@/`, `@shared/`)
4. Relative imports
5. Type-only imports

```typescript
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { VALID_GAMES } from "./constants";
import type { Score } from "@shared/types";
```

## Error Handling

```typescript
// tRPC procedures: throw TRPCError
throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });

// Async operations: try/catch at procedure level
try {
  await db.insert(scores).values(data);
} catch (error) {
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to save score" });
}

// Frontend: handle all query states
const { data, isLoading, isError } = trpc.scores.getLeaderboard.useQuery({ game });
if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage />;
if (!data?.length) return <EmptyState />;
```
