# ADR-0011: Reading Garden — rights-aware catalog and external-navigation threat model

Status: accepted (2026-11-10). Context: Product Bible v3, `docs/spec/reading-garden/`.

## Decision
1. **Catalog as reviewed content, not a production database seed.** Sources, books, reading journeys and
   Atlas-original passages live in `content/library/` (zod-validated, indexed at build, reviewed in pull requests).
   Nothing is fetched or seeded as a side effect of a build. Family data (shelves, reading events, the external-links
   switch) lives in Postgres behind family-scoped routes.
2. **Rights are per title, with evidence, and never inferred.** Each book records a rights status, the source
   licence, whether the *title page itself* confirmed the licence, attribution text, and evidence (URL, exact quote,
   date, checked by agent/human). A source-level open licence never substitutes for title-level evidence
   (`SOURCE_OPEN_LICENSE_TITLE_UNCONFIRMED`). Only `OPEN_LICENSE_VERIFIED`, `DIRECT_PERMISSION` or
   `PUBLIC_DOMAIN_VERIFIED` with title-level confirmation may ever be hosted; validation fails otherwise.
3. **Access modes.** `external_link` is the only enabled mode. `provider_embed` is rejected by validation until a
   provider permission and a CSP/sandbox/cookie/tracking review exist. `atlas_hosted` requires verified title rights.
   Publisher covers are not hot-linked (privacy and rights); Atlas draws original typographic covers.
4. **Publication fails closed.** States `discovered → rights_pending → metadata_reviewed → educational_reviewed →
   published` (+ `withdrawn`). Production shows only `published`, which needs a human educational review **and** a
   human link review; previews show `metadata_reviewed`+. The agent can prepare metadata but validation rejects any
   `educational_reviewed`/`published` book without a human record. `pnpm library:approve --link-checked` and
   `pnpm library:withdraw --reason` are for humans; withdrawal hides a title everywhere immediately on deploy.
5. **Parent-approved shelves.** A child sees only books a parent put on *their* shelf (per child), never the whole
   catalog. Hidden/withdrawn/unpublished books 404 in child mode.
6. **Listening and decoding are separate**, recorded as structured 0–3 rubric levels with no free text, audio or
   video. Reading data never changes maths mastery and never promotes a grade.
7. **Rights-clean digital comprehension** uses Atlas-original passages (EN/ID) graded on the server; the client gets
   choices in a fixed shuffled order and answers by display position, so the answer key never leaves the server.

## External-navigation threat model
| Threat | Control | Test |
|---|---|---|
| Open redirect / URL injection | Destination comes only from the reviewed catalog (by book id); catalog URLs must be https, on the source's allow-listed host, with no query string or fragment | `library.test.ts`, `reading-garden.spec.ts` (unknown ids 404) |
| Child wanders off-site | Child mode needs the parent PIN (server-verified, rate-limited per session and per account) to open a link; the session stays in child mode; toddler stages have no child screen use | E2E: wrong PIN 401, right PIN returns catalog URL, popup opens |
| Leaking child data to third parties | No child id, name, DOB or session data in URLs; `rel="noopener noreferrer"`, `referrerPolicy="no-referrer"`, new tab; no embeds/iframes; no hot-linked images | E2E asserts href equals catalog URL and excludes child id |
| Third-party site behaviour (ads, tracking) | Parent interstitial names the host and warns; family-wide switch turns all external links off (parent and child views) | E2E: switch off removes the link; child API returns 403 |
| Cross-family access (IDOR) | `ownedChild` on every parent route; child routes resolve the child from the session only | E2E: other family's shelf/events/history → 404, data untouched |
| Child mode reaching parent areas | `parentRoute` / `requireParentPage` reject child-mode sessions | E2E: 403 on parent APIs, redirect from `/library` |
| Client-forged grades | Strict schemas reject extra fields; grading is server-side; answers must cover exactly the passage's questions; passage must be for the child's own stage | E2E: forged `correct` → 400, other-stage passage → 404 |
| Over-collection of data | Reading events store ids and small integers only (DB CHECK constraints bound ratings); history can be deleted per child; export includes reading data | E2E: delete history, export contents |

## Consequences
- Most providers could not be verified from the agent environment (browser-only apps or unreachable hosts), so the
  first catalog is small (12 Book Dash titles, link-only) and has no Indonesian-language external books yet. The
  Atlas-original passages and "any book" routines cover Indonesian and Grades 2–6 meanwhile.
- A future licensed native reader (bible Phase 3) needs per-title imports with evidence, attribution display,
  takedown handling and a security review; it is deliberately out of scope here.
