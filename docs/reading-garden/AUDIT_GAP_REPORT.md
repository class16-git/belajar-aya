# Reading Garden — Phase 0 audit and gap report (2026-11-10)

Inspected: README, ADRs 0001–0010, delivery docs, Prisma schema and migrations, guards (`parentRoute`,
`childRoute`, `ownedChild`, `requireParentPage`, `requireChildPage`), publication gates, rate limiting, export/delete,
CI workflow and E2E database guard. Current `main` already had child mode with a PIN gate, IDOR protection,
same-origin checks, production fail-closed publication for lessons, and a synthetic-only E2E database guard. No
release-blocking safety defect was found before starting.

## Gap matrix (bible v3 vs Atlas before → after this change)
| Requirement | Before | After | Remaining |
|---|---|---|---|
| Library / reading features | none | Reading Garden for parents and children | — |
| BookSource / BookEdition entities | none | `content/library/sources.json`, `books/*.json` (zod), per-title rights + evidence | Prisma-backed catalog only if imports become dynamic (not needed now) |
| Rights decisions (UNKNOWN … PUBLIC_DOMAIN_VERIFIED) | none | statuses + `SOURCE_OPEN_LICENSE_TITLE_UNCONFIRMED`; hosting/embeds blocked unless verified | Human title-level checks (SOURCE_VERIFICATION.md) |
| Publication states, fail closed | lessons only | books: discovered → … → published/withdrawn; production = human educational + link review | Owner review of the 12 books |
| 12–20 metadata-only candidates | none | 12 Book Dash titles (verified source policy, credits, ISBN) | Indonesian external titles blocked on source verification |
| Access modes | — | `external_link` only; embeds and hosting disabled by validation | Phase 3 licensed reader |
| Parent gate for external links | — | interstitial (parent), PIN gate (child), family-wide off switch | — |
| Reading journeys age 2 → G6 | none | 10 stages × 5 strands, routines, any-book prompts, separate listening/decoding rubric | Educator review of wording |
| Comprehension | none | 7 Atlas-original EN/ID passages (K–G6), server-graded, evidence paragraph feedback | Owner/educator review; more passages per stage |
| Reading history, delete, export | none | structured `ReadingEvent`, per-child delete, included in export, family delete cascades | — |
| Parent progress | none | Reading card on every learner's dashboard; listening vs decoding averages | Trend charts over time |
| Montessori / maths / STEM extensions | — | per book (original wording) | — |
| Islamic reading shelf | none | not started (needs owner decisions and qualified scholar review, ADR-0010) | Owner decisions |
| Narration / audio | none | none (only when licensed) | Phase 3 |
| Broken-link / source-status checks | none | not automated (agent environment cannot reach most hosts) | Scheduled checker with an allow-listed network |
| Dyslexia-friendly options | none | large type, generous line height; no "cure" claims | Optional font/spacing toggle |
| Analytics | none | none (no screen-minute optimisation, no comparisons) | Privacy-preserving aggregates if wanted |
