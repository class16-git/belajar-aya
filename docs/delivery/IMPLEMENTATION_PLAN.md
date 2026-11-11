> **Historical record (Phase 0 + 1, before the first production deployment).** Atlas is now live; this file is
> kept as evidence of that phase only. For the current state see the [README](../../README.md),
> [FINAL_HANDOVER.md](FINAL_HANDOVER.md), [RELEASES.md](RELEASES.md) and [release-manifest.json](release-manifest.json).

# Implementation plan — Phase 0 + Phase 1

## Discovery (baseline)
- Repo held a static GitHub Pages site (HTML/JS, custom domain). No tests, no backend. Repository is **public**.
- Product bible (docs/spec) requires a private, server-backed app; real learner data must not be committed (ADR-0007).
- Environment: Node 22, pnpm 10, local PostgreSQL 16, pre-installed Chromium for Playwright.
- Risks identified up front: public repo vs. child data; no managed-auth credentials; no hosting credentials;
  no human content reviewer; GitHub Pages cannot host the app.

## Architecture summary
```text
Browser (parent / child mode) ──HTTPS──> Next.js app (apps/web)
   pages (server components, guards)      API routes: Zod validation, Origin check, rate limits, ownership checks
                                           │
              ┌────────────────────────────┼─────────────────────────────┐
     @atlas/curriculum            @atlas/assessment               @atlas/adaptive
     content + schema +           seeded generators, server       mastery rules + explainable
     publication gate             grader, misconceptions, hints   recommendations (rule ids)
              └───────── @atlas/shared (age engine, safety policy) ──────┘
                                           │
                               @atlas/database (Prisma) ──> PostgreSQL
                               @atlas/ai (disabled; guarded adapter, never in the critical path)
```

## Delivered commits (vertical slices)
1. Move legacy site to `legacy-site/`; add redacted spec.
2. Monorepo + packages + content + web app + tests (Phase 0 foundation and Phase 1 slice).
3. Visual-QA fixes, security upgrades, CI, Docker, docs (this document set).

## Task checklist
| Area | Item | Status |
|---|---|---|
| Phase 0 | Monorepo, strict TS, lint, CI workflow | ✅ |
| Phase 0 | Parent auth, consent gate, PIN, child mode | ✅ |
| Phase 0 | Data model + migrations + synthetic seed | ✅ |
| Phase 0 | EN/ID locale system (typed, parity-tested) | ✅ |
| Phase 0 | Component primitives + design tokens | ✅ |
| Phase 0 | Two child profiles, responsive navigation | ✅ |
| Phase 1 | Ten-frame + number bonds + equation keypad, deterministic server grader | ✅ |
| Phase 1 | Hint ladder H0–H4, feedback, retry, worked example, session summary | ✅ |
| Phase 1 | 13 toddler offline cards, A4/Letter print, observations | ✅ (agent-checked; human review pending) |
| Phase 1 | Mastery engine, delayed check, spaced review, explainable recommendations | ✅ |
| Phase 1 | Parent dashboard: skills, evidence drill-down, misconceptions, due reviews, offline suggestions | ✅ |
| Phase 1 | Consent, export, delete; audit; health endpoint; structured logs | ✅ |
| Phase 1 | Exact timezone-aware age engine; birthday/transition handling | ✅ |
| Phase 1 | E2E, axe, responsive screenshots | ✅ |
| Release | Human UX approval, content review, hosting, production deploy | ⏳ owner |

## Test matrix
| Concern | Unit | E2E |
|---|---|---|
| Age (birthdays, month ends, leap day, DST, TZ boundary, future DOB) | shared/age.test.ts | onboarding ages |
| Content schema, DAG, XSS, publication gate (scenario 9) | curriculum/catalog.test.ts | draft lesson cannot start |
| Generators (property-based), grader, misconceptions, hints | assessment/items.test.ts | answer key never sent |
| Mastery + recommendations (scenarios 1, 2, 3, 10) | adaptive/engine.test.ts | core-flows learning tests |
| AI unavailable (scenario 8), PII blocking | ai/guard.test.ts | whole suite runs with AI disabled |
| Parent gate, IDOR (scenario 6) | — | core-flows security tests |
| Print + observation (scenario 4), locale (5), export/delete (7) | i18n parity | core-flows |
| Accessibility, responsive, touch targets, reduced motion, keyboard | — | a11y-visual.spec.ts |

## Rollback
App is not deployed. Code rollback = revert the PR. Migrations are additive; for a deployed DB, restore from
backup taken before `prisma migrate deploy` (see HANDOVER runbook).
