# Atlas — Family Learning OS

A calm, private, bilingual (English / Bahasa Indonesia) learning space for a family:
**caregiver-led offline Montessori-inspired cards** for toddlers and **short guided Singapore-Math-style
practice** (ten-frames, number bonds, CPA progression) for early primary learners, with a transparent
rule-based adaptive engine and a parent dashboard.

> Status: **Phase 0 + Phase 1 vertical slice — agent QA passed, awaiting owner UX approval.**
> Not deployed. See [`docs/delivery/HANDOVER.md`](docs/delivery/HANDOVER.md).

- No ads, trackers, streaks, leaderboards or child-facing AI chat.
- Works with **no AI provider at all** — grading, mastery and recommendations are deterministic.
- Montessori and Singapore Math are pedagogical descriptors only; no accreditation or official alignment is claimed.
- The previous static site is preserved unchanged in [`legacy-site/`](legacy-site/).

## ⚠️ Privacy: this repository is public

Never commit real child names, dates of birth or learner records. Real profiles live only in the git-ignored
`config/learners.private.json` (copy from `config/learners.private.example.json`, which is synthetic) and are
loaded only into a **local** database with `pnpm db:seed:private`. `pnpm privacy:scan` (also run in CI) fails if
private values appear in tracked files. Learners are referred to only by the nicknames "Kakak" (Grade 1) and
"Adek" (toddler); demo data, tests and screenshots use these nicknames with **synthetic** birth dates.

## Quick start (local)

Requirements: Node 22, pnpm 10, PostgreSQL 16 (or `docker compose up -d db`).

```bash
pnpm install
cp .env.example apps/web/.env            # adjust DATABASE_URL if needed
cp apps/web/.env packages/database/.env
pnpm db:migrate                           # apply migrations
pnpm db:seed                              # synthetic demo family
pnpm dev                                  # http://localhost:3000
```

Demo sign-in (synthetic): `demo.parent@example.test` / `demo-password-123`, parent PIN `1357`.

## Commands

| Command | What it does |
|---|---|
| `pnpm lint` / `pnpm typecheck` | ESLint and strict TypeScript across all packages |
| `pnpm test` | Vitest unit + property tests (age engine, content, generators, mastery traces, AI guard, i18n) |
| `pnpm test:e2e` | Playwright E2E + axe accessibility + responsive screenshots (needs a built app and `atlas_test` DB) |
| `pnpm content:validate` | Curriculum schema, prerequisite graph and publication-gate validation |
| `pnpm content:approve --reviewer "AB" --role parent <lesson-id…>` | Record a **human** content review |
| `pnpm privacy:scan` | Fail if private learner data is tracked |
| `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:seed:private` | Database |

E2E locally: `createdb atlas_test`, then
`DATABASE_URL=postgresql://…/atlas_test pnpm db:migrate`,
`cd apps/web && DATABASE_URL=… ATLAS_ENV=preview NODE_ENV=production pnpm build && pnpm test:e2e`.

## Curriculum (age 2 → Grade 6)

`content/objectives/` holds 120 original planning objectives across Montessori, Singapore-style maths (CPA),
robotics/STEM and Islamic studies (see `docs/spec/curriculum-bible/`, ADR-0009). Coverage:
[`docs/curriculum/COVERAGE_REPORT.md`](docs/curriculum/COVERAGE_REPORT.md) (`pnpm curriculum:coverage`), audit:
[`AUDIT_GAP_MATRIX.md`](docs/curriculum/AUDIT_GAP_MATRIX.md), next slice:
[`VERTICAL_SLICE_RECOMMENDATION.md`](docs/curriculum/VERTICAL_SLICE_RECOMMENDATION.md). Islamic content additionally needs a
qualified religious review (`pnpm content:religious-approve`, ADR-0010) and is never approved by the agent.

## Content review gate

Lessons have `reviewStatus`: `draft` → `agent_reviewed` → `reviewed` (human) → `published`.
Children never see drafts. **Production (`ATLAS_ENV=production`, the default for production builds) only shows
human-reviewed content**, so the owner/educator must run `pnpm content:approve` before release. Previews
(`ATLAS_ENV=preview`, synthetic data only) may show `agent_reviewed` content.

## Repository map

```text
apps/web/                 Next.js App Router app (parent + child UI, API routes, E2E tests)
packages/shared/          types, exact timezone-aware age engine, safety policy, PRNG, crypto (server)
packages/curriculum/      content schema (Zod), catalog loader, publication gate, validate/approve scripts
packages/assessment/      seeded item generators, server-side grader + misconception tags, hint ladder
packages/adaptive/        rule-based mastery model and explainable recommendation policy
packages/ai/              disabled-by-default guarded AI adapter (PII blocking, timeouts, fallbacks)
packages/database/        Prisma schema, migrations, synthetic + private seeds
content/                  authored lessons (G1 interactive, toddler offline cards) and skill graph
docs/spec/                product bible (redacted public copy)
docs/adr/                 architecture decision records
docs/delivery/            plan, test report, UX QA, security review, sign-off, handover
artifacts/screenshots/    synthetic visual QA evidence (mobile / tablet / desktop)
legacy-site/              previous static GitHub Pages site (unchanged)
```

## Licence

No licence granted; all rights reserved by the owner (see `LICENSE-NOTE.md`).
