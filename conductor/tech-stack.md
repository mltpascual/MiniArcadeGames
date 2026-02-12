# Tech Stack — Pixel Playground

## Primary Languages

| Language | Version | Usage |
|----------|---------|-------|
| TypeScript | 5.9.3 | All application code (client + server + shared) |
| CSS | Tailwind CSS 4.1 | Styling via utility classes |
| SQL | MySQL dialect | Database schema and queries (via ORM) |

## Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 7.1 | Build tool and dev server |
| Tailwind CSS | 4.1 | Utility-first styling |
| Framer Motion | 12.x | Animations and transitions |
| Wouter | 3.x | Client-side routing (lightweight) |
| shadcn/ui | Latest | UI component primitives (Radix-based) |
| Lucide React | 0.453 | Icon library |
| TanStack React Query | 5.x | Server state management |
| tRPC React Query | 11.x | Type-safe API client |
| Sonner | 2.x | Toast notifications |
| Recharts | 2.x | Data visualization (leaderboard charts) |

## Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 4.21 | HTTP server |
| tRPC Server | 11.x | Type-safe API procedures |
| Drizzle ORM | 0.44 | Database queries and schema management |
| Drizzle Kit | 0.31 | Migration generation and execution |
| mysql2 | 3.x | MySQL driver |
| jose | 6.1 | JWT session management |
| Superjson | 1.x | Rich serialization (Date, BigInt, etc.) |
| Zod | 4.x | Input validation schemas |

## Infrastructure

| Component | Technology | Notes |
|-----------|-----------|-------|
| Database | MySQL / TiDB | Managed cloud instance |
| File Storage | AWS S3 | Via `@aws-sdk/client-s3` |
| Authentication | Manus OAuth | Session cookies + JWT |
| Hosting | Vercel (target) | Serverless functions + static assets |

## Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| pnpm | 10.4 | Package manager |
| Vitest | 2.1 | Test runner |
| Prettier | 3.x | Code formatting |
| esbuild | 0.25 | Server bundle for production |
| tsx | 4.x | TypeScript execution for dev server |

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| tRPC over REST | End-to-end type safety, no manual API contracts |
| Drizzle over Prisma | Lighter weight, SQL-like API, better for simple schemas |
| Wouter over React Router | Minimal bundle size for a game-focused app |
| Canvas over DOM games | 60fps game loops without React re-render overhead |
| Web Audio API over audio files | Procedural sound generation, no asset downloads |
| Superjson | Preserves Date objects across tRPC boundary |
