# Delivery roadmap and acceptance criteria

## Phase 0 — foundation (1–2 weeks estimate)
- Confirm curriculum references, legal/consent assumptions, design direction and private hosting.
- Scaffold monorepo, CI, authentication, data model, locale system and component library.
- Deliver clickable UI and test plan.
**Gate:** two child profiles; secure parent gate; responsive navigation; CI green.

## Phase 1 — usable MVP (3–6 weeks estimate)
- Grade 1 number bonds to 10 with interactive ten-frame and deterministic grader.
- 10+ reviewed toddler offline cards; print view; parent observations.
- Mastery engine, attempt persistence, parent dashboard and spaced review.
- Privacy export/delete, basic monitoring, E2E and accessibility checks.
**Gate:** parent can create both profiles, complete sessions, inspect progress, print offline card and export/delete records.

## Phase 2 — curriculum breadth (4–8 weeks estimate)
- Grade 1 math: add/subtract to 20, place value, shapes, measurement, word problems.
- Preschool and KG foundations in mathematics and language.
- Curriculum authoring/review process and coverage dashboard.
**Gate:** every published activity has objective, prerequisites, reviewed content, deterministic assessment or parent observation rubric.

## Phase 3 — adaptive enrichment (after evidence)
- Validate mastery rules with actual family observations.
- Add optional safe AI explanations with guardrails, fallbacks and cost caps.
- Expand Grade 2–6 curriculum iteratively.
**Gate:** model behavior passes safety tests; no unreviewed AI lesson is child-visible.

## Prioritized backlog
| Epic | P0 deliverable | Definition of done |
|---|---|---|
| Identity | Parent account + two profiles | Authorization E2E passes |
| Curriculum | Versioned skills and 2 sample lessons | Schema and prerequisite validation |
| Math UI | Interactive ten-frame + number bonds | Touch, keyboard and grading tests |
| Offline | Toddler cards + print | Safety notes and print QA |
| Adaptation | Rule-based recommendations | Golden traces and explainability |
| Reporting | Mastery + misconception dashboard | Evidence drill-down accurate |
| Privacy | Consent/export/delete | Full lifecycle test |
| Quality | CI, lint, tests, a11y | No blocking failures |

## Test scenarios
1. Grade 1 learner solves 6+4 independently using ten-frame; skill score updates.
2. Learner answers 6+4 as 9 twice; system recommends concrete number-bond practice, not harder work.
3. Learner uses hint; success is not counted as independent mastery.
4. Toddler parent prints matching card; no child screen use is required.
5. Parent switches EN↔ID without losing attempt history.
6. Child mode cannot open parent dashboard or inspect another child's records.
7. Parent exports then deletes data; app no longer exposes records.
8. AI unavailable; all core lessons still work.
9. Unreviewed lesson fails publication check.
10. Delayed review after prior success tests retention rather than assuming mastery.

## Claude Code execution contract
- Implement one phase at a time; commit after each independently testable vertical slice.
- Provide file tree, commands, architecture decision records and test results.
- Never claim code works without executing relevant tests.
- Ask for secrets, hosting credentials or legal decisions only when genuinely blocking.
- Do not expand to unreviewed full K–6 generated content before validating MVP.
