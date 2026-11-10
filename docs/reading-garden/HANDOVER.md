# Reading Garden — handover (2026-11-10)

Status: **implemented, tested, merged under the owner's standing approval.** Production shows the Reading Garden
pages, journeys and settings, but **no books or passages** until a person reviews them. That is the fail-closed gate
working as designed.

## What exists
- **Parent:** Reading Garden (`/library`) with learner switcher, journey card, per-child shelf, suggestions for the
  stage, filters, external-links switch; book page (`/library/[id]`) with original cover, prompts, Montessori/maths/STEM
  extensions, shelf controls, structured reading record, full rights panel with evidence; leaving-Atlas interstitial
  (`/library/go/[id]`); journeys for all 10 stages (`/library/journey/[stage]`); passage review with answer key;
  reading history with delete (`/library/history`); Reading card on every learner's dashboard.
- **Child:** "Reading Garden" button on `/learn` → own shelf only, book page with "I finished it!" and a parent-PIN
  gate for the external site, and stage-appropriate reading practice with server grading.
- **Content:** 9 sources (1 verified), 12 Book Dash titles (link-only), 10 journeys, 7 original EN/ID passages.
- **Data:** additive migration `20261110120000_reading_garden` (ReadingEvent, ShelfEntry, Family.libraryExternalLinks,
  CHECK constraints). Export includes reading data; family deletion cascades.
- **Docs:** ADR-0011 (rights + threat model), AUDIT_GAP_REPORT.md, SOURCE_VERIFICATION.md, UX_BENCHMARK.md, the v3
  spec copy in `docs/spec/reading-garden/`.

## Evidence
| Gate | Result |
|---|---|
| Lint / typecheck | ✅ all packages |
| Unit tests | ✅ 145 (12 new catalog/rights/grading tests) |
| E2E (Playwright) | ✅ 72, incl. 8 Reading Garden scenarios (parent journey ×2 viewports, leaving/links-off, child mode + PIN gate + grading, IDOR and child-mode restrictions, toddler stage + export) |
| Accessibility | ✅ axe WCAG 2.1 AA: 0 violations on library, journey, book, leaving, child shelf and passage pages |
| Visual QA | screenshots `artifacts/screenshots/*-9{0..4}-*.png`; 4 defects found and fixed (UX_BENCHMARK.md) |
| Content validation | ✅ rights/publication rules enforced in `pnpm content:validate` and CI |
| Privacy scan | ✅ no learner data committed; the bundle's private learner file was **not** copied |

Separate gates still open: **content QA** (owner/educator review of books and passages), **owner UX acceptance**,
and **Islamic reading shelf** (blocked on ADR-0010 decisions and scholar review).

## Your next steps
1. Read `docs/reading-garden/SOURCE_VERIFICATION.md` and, in a normal browser, confirm Book Dash title licences
   (optional for link-only) and check each link.
2. Publish the books you are happy with:
   `pnpm library:approve -- --reviewer "<initials>" --role parent --link-checked <book ids>`
3. Review and approve passages (shown with answer keys at `/library/passage/<id>`):
   `pnpm library:approve -- --reviewer "<initials>" --role parent <passage ids>`
4. Withdraw anything later with `pnpm library:withdraw -- --reason "<why>" <book id>`.

## Known blockers
- Indonesian external books: Let's Read / StoryWeaver / SIBI could not be verified from the agent environment.
- No automated broken-link checker yet (needs a scheduled job with network access to provider hosts).
- No licensed native reader or narration (bible Phase 3; needs per-title permissions).
