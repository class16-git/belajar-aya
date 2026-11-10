# Reading Garden — Delivery Plan for Claude Code

## First, inspect the actual repository
Read `README.md`, `docs/delivery/*.md`, `docs/adr/*.md`, existing Prisma schema, API guards, curriculum publication controls and tests. Determine whether `main` or a feature branch is current. This package is a specification, **not** proof that features exist. Do not replace working Atlas architecture or reset databases.

## Phase 0 — Audit and safety (must pass first)
- Inventory existing library/reading features, child-mode gates, authorization, publication model, migrations and Vercel environment separation.
- Resolve any release-blocking child safety, IDOR or destructive E2E database guard defects before testing or deploying new functionality.
- Produce ADR for rights policy and external-navigation threat model; document source verification gaps.

## Phase 1 — Curated catalog MVP
- Add BookSource, BookEdition, review/publication states and API routes with family-scoped permissions.
- Curate 12–20 *metadata-only* candidate books from verified sources, using synthetic reading records. No copyrighted content copies or unverified cover ingestion.
- Parent discovery, filters, detail, safe external link with parent gate, accessible responsive UI; toddler shelf parent-operated.
- Add broken-link and source-status checks; do not claim automatic checks have run without evidence.

## Phase 2 — Literacy journeys
- Implement grade/stage objectives, parent-led prompts, reading history, comprehension rubrics, curriculum links, and separate decoding/listening mastery.
- Test family isolation, child-mode restrictions, grading authority, accessibility and age-boundary behavior.

## Phase 3 — Licensed native reader
- Only after per-title license/permission review: import selected books, implement reader, narration where licensed, accessibility and offline caching where allowed.
- No automatic bulk harvesting; document attribution and takedown handling.

## Phase 4 — Adaptive literacy and optional AI
- Deterministic recommendations first; optional AI generates **draft** comprehension prompts only from licensed or original materials, with parent/educator approval and no learner PII sent externally.

## Acceptance criteria
- 100% of published books have human educational review, working source link and recorded access/rights decision.
- 0 unapproved hosted assets, 0 cross-family read/write access in tested routes, 0 parent-page access from child mode.
- No open redirect, no child PII in outbound URLs or logs, no demo seeding on production.
- Critical E2E journeys pass on tablet and mobile; keyboard/screen-reader baseline, reduced-motion and Indonesian/English UI pass review.
- Parent can remove a book from child shelf and delete reading history; permission withdrawal unpublishes affected hosted content.
- CI, security QA, content QA and UI/UX QA are distinct gates; owner approval required before merge/deploy.

## Autonomous loop
Inspect → design → threat model → implement small slice → write failing tests → fix → unit/integration/E2E → browser screenshots and accessibility → review → remediate → document evidence → handover. Escalate unavailable permissions, unverified licensing, curriculum interpretation and production access; never invent sign-offs or bypass restrictions.
