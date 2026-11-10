# Test report

Run date: 2026-11-10 · Node 22.23.4 · pnpm 10.28.0 · PostgreSQL 16 · Chromium (Playwright 1.63.0)
All data synthetic. Results below are from actual runs in the build container.

## Static checks
| Command | Result |
|---|---|
| `pnpm lint` | ✅ 7/7 packages, 0 problems |
| `pnpm typecheck` | ✅ 8/8 tasks, 0 errors (strict + `noUncheckedIndexedAccess`) |
| `pnpm content:validate` | ✅ 13 skills, 19 lessons (1 draft, 18 agent_reviewed, 0 human-reviewed). Production-visible: 0 |
| `pnpm privacy:scan` | ✅ no private files/values tracked (checked against local private config) |
| `pnpm audit --prod` | ✅ no known vulnerabilities (after zod 4.6.7 upgrade and postcss/deepmerge-ts overrides) |
| `next build` (production, preview env) | ✅ first-load JS 103–109 kB per route |

## Unit / property tests — `pnpm test`
| Package | Tests | Result |
|---|---|---|
| @atlas/shared (age engine, safety) | 18 (17 + 1 private-fixture test, runs only where the git-ignored file exists) | ✅ |
| @atlas/curriculum | 14 | ✅ |
| @atlas/assessment (2,000-run property tests) | 11 | ✅ |
| @atlas/adaptive (golden traces) | 16 | ✅ |
| @atlas/ai | 4 | ✅ |
| @atlas/web (i18n parity, origin check, fail-closed build) | 9 | ✅ |
| **Total** | **72** | **✅ all pass** |

The real-learner age acceptance cases from the spec were verified locally from the private file
(both pass); they are not reproduced here.

## E2E — `pnpm test:e2e` (production build, `ATLAS_ENV=preview`)
**26 passed, 0 failed, 0 flaky** (≈60 s); the 3 concurrency tests also passed 30/30 with `--repeat-each 10`. axe (WCAG 2.0/2.1 A + AA) on 30+ screen states at mobile and
tablet: **0 violations**.

| # | Test | Spec scenario |
|---|---|---|
| 1–6 | Visual QA: parent + child states × mobile/tablet/desktop; no horizontal overflow; child targets ≥ 44 px; axe | UX gates |
| 7 | Keyboard-only sign-in and navigation | a11y |
| 8 | Reduced-motion honoured | a11y |
| 9 | Sign-up → consent → PIN → create Grade 1 + toddler profiles | Phase 0 gate |
| 10 | Child mode cannot open parent areas/other child; PIN required; failures audited | 6 |
| 11 | Independent success raises score; hint-supported success not independent; session summary | 1, 3 |
| 12 | Same error twice → R2 concrete remediation; retry allowed | 2 |
| 13 | Delayed check lapse is not mastery | 10 |
| 14 | Server grading ignores client `correct`; no answer key in payload; locked/draft lessons refused | PR-03, 9 |
| 15 | Print toddler card (A4/Letter), print CSS, observation log; toddler cannot enter screen mode | 4 |
| 16 | EN↔ID switch keeps attempt history | 5 |
| 17 | Export JSON then delete; all records gone; session invalid | 7 |
| 18 | Withdrawn consent pauses learning; export still available | PR-05 |
| 19 | IDOR across families → 404 | security |
| 20 | Unauthenticated → 401; DOB change needs confirmation; audit has no DOB values | security |
| 21 | Sign-in rate limit → 429 | security |
| 22 | Oversized body → 413 | security |
| 23 | CSP / nosniff / no x-powered-by | security |
| 24–26 | Concurrent session starts / item requests; double-submit + hint race; stale tab item rejected | review F1, F3, F4 |

Scenario 8 (AI unavailable) is covered by unit tests and by the whole E2E suite running with AI disabled.

## Defects found by testing and fixed
| ID | Sev | Defect | Fix | Regression test |
|---|---|---|---|---|
| T1 | P2 | Counted ten-frame counters announced as "Dot n" to screen readers | dedicated `counterCounted` label | E2E #11 |
| T2 | P2 | Evidence table scroll region not keyboard-focusable (axe) | `tabIndex=0`, `role=region`, label | axe in #1–6 |
| T3 | P2 | Card links announced "Open card : …" | explicit `aria-label` | E2E #15 |
| T4 | P1 | Advisories: zod <4.6.6 (memory exhaustion), postcss, deepmerge-ts | upgrade/overrides + 32 KB body cap | audit + E2E #22 |

## How to reproduce
See README "Commands". CI (`.github/workflows/ci.yml`) runs the same steps on every PR; its first run on
GitHub (PR #1, run 42741425627) passed all steps including E2E and accessibility.
