# ADR-0001: Monorepo and stack
Status: accepted (2026-11-10)

**Decision.** pnpm workspaces + Turborepo, TypeScript strict (`noUncheckedIndexedAccess`), Next.js 15 App Router,
React 19, Tailwind CSS 3, Prisma 6 + PostgreSQL 16, Zod 4, Vitest 3 (+ fast-check), Playwright 1.63 (+ axe).
Domain logic lives in framework-free packages (`shared`, `curriculum`, `assessment`, `adaptive`, `ai`) consumed
as TypeScript source via `transpilePackages`; only `apps/web` knows about HTTP and React.

**Why.** Matches `docs/spec/architecture/TECHNICAL_ARCHITECTURE.md`. Pure packages make the engine
unit-testable with golden traces and reusable by a future mobile client.

**Deviations from the target tree.** `packages/ui` is folded into `apps/web/src/components` (one consumer today).
Versions are pinned exactly and were all published ≥ 2 weeks before adoption. Tailwind 3 (not 4) and Prisma 6
(not 7) were chosen for stability.
