# Atlas: Family Learning OS

A calm, private, bilingual (English / Bahasa Indonesia) learning platform for one family, from age 2 to Grade 6. It
has three parts:
- caregiver-led Montessori-inspired activity cards;
- short, server-graded Singapore-style maths and robotics practice;
- a rights-aware Reading Garden.

A transparent, rule-based adaptive engine and a parent dashboard tie them together.

> **Status: live as a limited-scope family pilot** at <https://atlas.ichlasulamalsudarmi.com> (Vercel project
> `atlas`, Neon Postgres).
>
> | | |
> |---|---|
> | Live commit and deployment | Reported by <https://atlas.ichlasulamalsudarmi.com/api/health> (`release`, `deployment`). Every merge to `main` deploys, so this README does not hard-code a commit |
> | Last verified release manifest | [`docs/delivery/release-manifest.json`](docs/delivery/release-manifest.json) (Git SHA, deployment id, curriculum version, content digest, verification timestamp), history in [`docs/delivery/releases/`](docs/delivery/releases/) |
> | Curriculum version | `2026.11.0` |
> | Content digest (what children can see) | `0fcf3ab0a7bd5fdb`. It changes only when visible content changes |
>
> - **What is released:** the scope is in [`docs/delivery/RELEASE_SCOPE.md`](docs/delivery/RELEASE_SCOPE.md), and the
>   owner's sign-off on it is still outstanding.
> - **Release history:** [`docs/delivery/RELEASES.md`](docs/delivery/RELEASES.md).
> - **Recording releases:** after each release, `pnpm release:record` re-verifies production and writes a new
>   manifest. Because recording happens after deployment, the manifest on `main` can lag the live commit by one
>   documentation-only merge. The content digest is the stable check.
>
> Facts in this README were verified against the source on `main`, the production `/api/health` endpoint and the
> Vercel API on 2026-11-11. Planning documents were not taken as evidence of implementation.

**Principles:**
- No ads, trackers, streaks, leaderboards or child-facing AI chat.
- Works with **no AI provider**: grading, mastery and recommendations are deterministic, and production reports
  `"ai":"disabled"`.
- Montessori and Singapore Math are teaching descriptions only; no accreditation or official alignment is claimed.
- The previous static site is kept unchanged in [`legacy-site/`](legacy-site/).

## ⚠️ Privacy: this repository is public

- Never commit real child names, dates of birth or learner records.
- Real profiles live only in the git-ignored `config/learners.private.json`, and are loaded only into a **local**
  database with `pnpm db:seed:private`. Start from `config/learners.private.example.json`, which is synthetic.
- `pnpm privacy:scan`, which also runs in CI, fails if private values appear in tracked files.
- Learners are referred to only as "Kakak" (Grade 1) and "Adek" (toddler). Demo data, tests and screenshots use
  synthetic profiles only.

## 1. What families can do today (in production)

| Area | Implemented and live |
|---|---|
| Parent platform | Parent accounts, with sign-up limited to an allow-list in production; consent; parent PIN; child mode with a PIN to exit; EN/ID interface; dashboard with mastery evidence and "suggested next" reasons; printable cards (A4 or Letter); observations; data export and hard delete |
| Interactive practice (Kindergarten and Grade 1) | Server-generated, server-graded items with a hint ladder, misconception feedback and a CPA progression (ten-frames, number bonds, equations, bar models, picture stories, robot grids) |
| Adaptive engine | Rule-based mastery, with secure, mastered, lapse and delayed-review states (§4) |
| Reading Garden | 12 linked external books; 4 original passages, graded on the server; reading journeys; reading history (§2.5) |
| Learning units (expansion) | **162 owner-approved units and 55 readings** across all 10 levels (Montessori, maths, STEM, literacy; original readings). Children open units from `/learn`, with a server-graded check; parents see attempts, secure/next-review status and misconceptions on the dashboard |
| Parent review tools | `/units`, unit guides, readings and the `/review` queue (approve or reject, export, `apply-reviews.mjs`) |

**Adaptive engine detail:**
- A skill is **secure** after at least 3 independent correct answers in at least 2 formats, with a score of 0.8 or
  more.
- It becomes **mastered** after a delayed check. A mastered skill whose score drops below 0.6 **lapses** back to
  learning.
- Spaced reviews come at 3, 7, 14 and 30 days.
- Prerequisites are enforced. The parent can choose a focus, but it cannot skip prerequisites.

**Reading Garden detail:**
- Children see only books a parent has placed on their own shelf.
- Every external link goes through a PIN gate. Parents can turn external links off entirely.

Production shows children only **human-reviewed** content. `/api/health` reports what is visible:
**55 lessons and cards, 12 books and 4 passages; 0 expansion units and 0 expansion readings**.

## 2. Modules: implemented versus planned

The planning registry has 120 original bilingual objectives, from age 2 to Grade 6, with a validated prerequisite
graph. Of these, **35 are published**, 2 are awaiting review, 1 is a draft, 1 is awaiting religious review and **81
are planned with no content yet**. The authoritative per-stage table, regenerated and checked in CI, is
[`docs/curriculum/COVERAGE_REPORT.md`](docs/curriculum/COVERAGE_REPORT.md).

| Module | Live for children (human-reviewed) | Authored, awaiting review (not visible) | Not yet built |
|---|---|---|---|
| **Montessori** (practical life, sensorial, language, maths, culture) | Toddler: 13 printable cards. Ages 3–4, 4–5 and Kindergarten: cards for every non-Islamic objective | 1 card corrected after the audit; 20 new expansion units (age 2 to Grade 6) | Published Montessori material for Grades 1–6 |
| **Singapore-style maths (CPA)** | **Kindergarten (complete):** teen numbers, bonds to 20, picture word problems. **Grade 1:** counting to 20, bonds to 10, add/sub within 10, bar-model stories | 22 expansion units (Kindergarten to Grade 6: place value, regrouping, multiplication, fractions, decimals, area, volume, ratio, percentages, algebra) | Grade 1 to 20 and tens/ones; interactive maths for Grades 2–6 |
| **STEM / robotics** | Ages 3–5 and Kindergarten unplugged cards. **Grade 1:** robot trace and debug on screen, floor-grid and sensor cards | 1 card (linkage arm, rebuilt without split pins); 20 expansion units (unplugged algorithms up to sealed-battery circuits and a Grade 6 robot) | Interactive STEM for Grades 2–6 |
| **Literacy** | Reading Garden journeys for all 10 stages | 20 expansion literacy units (phonological awareness up to argument writing; Indonesian taught by syllable, English by individual sound) | Phonics practice on screen; audio |
| **Islamic education** | **Nothing published** | 1 draft card; 20 draft expansion units; 10 draft readings. All are `draft`, waiting for a **named qualified scholar** (ADR-0010) | Everything, pending the owner's decisions and a scholar review |
| **Reading Garden** | 12 Book Dash titles (link-only); 4 original passages | 3 corrected passages; 5 pilot passages; 31 expansion readings (pre-reader scripts to Grade 6 articles) | Indonesian external books (Let's Read and StoryWeaver are unverified); licensed in-app reader; narration |

**Islamic education:** the owner specified an Ahlussunnah wal Jama'ah, Ash'ari–Maturidi framework.
- Al-Qawl al-Jaliyy is listed only as an **unverified** source; nothing is cited from it.
- Open questions for the scholar are in [`docs/islamic/SOURCE_REGISTRY.md`](docs/islamic/SOURCE_REGISTRY.md).

**Reading Garden:** all 9 book sources other than Book Dash are unverified (one, SIBI, is unreachable).

**Expansion programme:** the target is 1,500 units plus 1,500 readings.
- **Authored:** 183 units and 71 readings (12.2% and 4.7%).
- **Visible to children:** 162 units and 55 readings.
- **Not visible:**
  - 30 Islamic drafts (a scholar is required);
  - 5 readings with `needs_source` claims;
  - 1 safety-critical reading awaiting an official-guidance check;
  - 1 unit awaiting the owner's worldview decision.

The owner gave approval as a blanket instruction (2026-11-11), applied only after automated validation and independent
QA. It was not an item-by-item reading. See
[`docs/delivery/DELIVERY_DASHBOARD.md`](docs/delivery/DELIVERY_DASHBOARD.md), and the generated
[`docs/delivery/CONTENT_DASHBOARD.md`](docs/delivery/CONTENT_DASHBOARD.md) and
[`content-dashboard.json`](docs/delivery/content-dashboard.json). Child-facing use of expansion units, with
assessment results recorded as evidence, is live for approved units.

## 3. Content publication safeguards (fail closed)

- **Review states.** Lessons and passages move `draft` → `agent_reviewed` → `reviewed` (human) → `published`.
  - Production (`ATLAS_ENV=production`, the default for production builds) shows only items with a **human** review
    record.
  - Previews (`ATLAS_ENV=preview`, synthetic data only) may show `agent_reviewed` content.
- **No agent approval.** AI-drafted content cannot be marked reviewed without a human record. Content text may not
  claim approval. A source cannot be "verified" without a person's name.
- **Islamic and Arabic content** also needs an approved `religiousReview` with a named scholar and date (ADR-0010).
  The agent never sets this.
- **Books** follow `discovered` → `rights_pending` → `metadata_reviewed` → `educational_reviewed` → `published`.
  - Production needs a human educational review and a link check.
  - Titles stay **link-only** unless title-level rights are verified (ADR-0011).
- **Expansion validators** (`pnpm --filter @atlas/curriculum units:check`). They check:
  - **Structure:** prerequisites (existence, level, cycles), EN/ID parity, near-duplicates.
  - **Maths and questions:** every numeric answer is recomputed with exact rational arithmetic. Answers must be
    defensible. Test items may not reuse worked-example numbers.
  - **Safety:** hazard words need a flag or a named safety note. No small items for under-5s. No standing water.
    Electrical safety notes are required.
  - **Facts:** factual claims are listed, and `needs_source` blocks publication.
- **Human review workflow.**
  1. The parent approves or rejects items in `/review`. Decisions are stored per family.
  2. They export the decisions from the same page.
  3. A maintainer runs `node apps/web/scripts/apply-reviews.mjs <export.json>`. It refuses items whose version
     changed, and never touches religious-review records.

## 4. Security and privacy

- **Authentication and sessions.**
  - Self-hosted parent auth (ADR-0002) with scrypt password hashing.
  - Sessions in `httpOnly` cookies with `SameSite=Lax`.
  - In production, sign-up is limited to `ATLAS_SIGNUP_ALLOWED_EMAILS`.
- **Request protection.** Every state-changing route checks the request origin and validates its input with zod.
  The routes are rate-limited, and the family is checked on every resource to prevent cross-family (IDOR) access.
- **Child mode** (ADR-0008). Parent pages and APIs are refused in child mode, and leaving it needs the PIN.
- **Security headers.**
  - Content-Security-Policy, `X-Frame-Options: DENY`, `nosniff`, `no-referrer`, a restrictive Permissions-Policy
    and COOP.
  - A per-request **nonce + `strict-dynamic` CSP** runs in **report-only** mode before being enforced. Reports go
    to `/api/csp-report`, which keeps only path, directive and blocked origin.
- **Data rights.** Families can export and hard-delete their data. Review decisions are included in the export.
- **Database safeguards.** The database stores a role marker:
  - `vercel-build.mjs` refuses to migrate unless the marker matches the environment (`production`, or `synthetic`
    for previews);
  - the E2E tests refuse any database that is not local, named `*test*`, and marked `synthetic` (ATL-01).
- **Dependencies.** `pnpm audit` is clean (no known vulnerabilities). CI audits the full lockfile, dev tools included.
- **Reviews.** The independent audit findings ATL-01 to ATL-15 are fixed with regression tests (see
  [`docs/delivery/FINAL_HANDOVER.md`](docs/delivery/FINAL_HANDOVER.md) §3a). There is also
  [`docs/delivery/SECURITY_REVIEW.md`](docs/delivery/SECURITY_REVIEW.md).

## 5. Architecture, CI/CD and deployment

```text
GitHub (main) ──push──▶ GitHub Actions "verify" ──▶ Vercel (project atlas, root apps/web, region sin1)
                                                    │  vercel-build.mjs: Prisma generate → db-role check
                                                    │  → prisma migrate deploy → next build
                                                    ▼
                                         Neon Postgres (Vercel integration)
                                         production DB marked "production";
                                         preview deployments use a DB marked "synthetic"
```

- **Stack:**
  - pnpm workspaces and Turborepo;
  - Next.js 15 App Router with React 19, and Tailwind;
  - Prisma 6 on PostgreSQL 16, and Zod 4;
  - Vitest 4 with fast-check, and Playwright with axe.
- **CI** (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`:
  - frozen install;
  - privacy scan;
  - content validation, plus checks that the coverage report and content dashboard are current;
  - lint, strict typecheck and unit tests;
  - three dependency audits;
  - migrations into a disposable Postgres marked `synthetic`;
  - preview build, then E2E with accessibility and visual QA.
- **Deploy:** merging to `main` deploys to production. Pull requests get Vercel preview deployments.
- **Release records:**
  - [`docs/delivery/RELEASES.md`](docs/delivery/RELEASES.md) is the human-readable history.
  - [`docs/delivery/release-manifest.json`](docs/delivery/release-manifest.json) is the latest **verified**
    manifest. Older ones are in [`docs/delivery/releases/`](docs/delivery/releases/).
- **Recording a release:** `pnpm release:record` (read-only). It fails unless the live content digest equals the
  digest of the checked-out commit.
- **Rollback:** [`docs/delivery/RELEASE_RUNBOOK.md`](docs/delivery/RELEASE_RUNBOOK.md).

## 6. Local setup

You need Node ≥ 22 (the Vercel build uses 26.x), pnpm 10, and PostgreSQL 16 (or run `docker compose up -d db`).

```bash
pnpm install
cp .env.example apps/web/.env            # set DATABASE_URL
cp apps/web/.env packages/database/.env
pnpm db:migrate                           # apply all migrations
pnpm db:seed                              # synthetic demo family
pnpm dev                                  # http://localhost:3000
```

Demo sign-in (synthetic): `demo.parent@example.test` / `demo-password-123`, parent PIN `1357`.

**E2E locally:**
1. Create the database with `createdb atlas_test`.
2. Run `DATABASE_URL=postgresql://…/atlas_test pnpm db:migrate`.
3. Mark it synthetic: `DATABASE_URL=… pnpm --filter @atlas/database db-role synthetic`.
4. Build: `cd apps/web && ATLAS_ENV=preview NODE_ENV=production pnpm exec next build`.
5. Run the tests with `pnpm test:e2e`.

| Command | What it does |
|---|---|
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | ESLint, strict TypeScript, and Vitest unit and property tests across all packages |
| `pnpm test:e2e` | Playwright E2E, axe accessibility checks and screenshots (needs a built app and a synthetic `atlas_test` database) |
| `pnpm content:validate` | Lesson schema, prerequisite graph, publication gate, and Reading Garden rights |
| `pnpm --filter @atlas/curriculum units:check [path]` | Expansion validators, run on the files on disk |
| `pnpm --filter @atlas/curriculum index` | Regenerate the content index after adding or editing content files |
| `pnpm curriculum:coverage` / `pnpm content:dashboard` | Regenerate the coverage report and the content dashboard (CI checks both are current) |
| `pnpm content:approve -- --reviewer "AB" --role parent <ids…>` | Record a **human** lesson review |
| `pnpm content:religious-approve` | Record a qualified scholar's review (never run by the agent) |
| `pnpm library:approve -- --reviewer "AB" --role parent --link-checked <ids>` / `pnpm library:withdraw` | Human review or takedown of books and passages |
| `pnpm release:manifest` / `pnpm release:record` | Content digest of the checkout / verified production release manifest |
| `pnpm privacy:scan` | Fail if private learner data is tracked |
| `pnpm db:migrate` / `pnpm db:seed` / `pnpm db:seed:private` | Database |

## 7. Latest verified QA evidence

Run on 2026-11-11 against the content of `ac4b3c9` (`main`), locally on PostgreSQL 16 and Chromium:

| Gate | Result |
|---|---|
| Unit and property tests | ✅ 201 (curriculum 65, web 50, assessment 33, adaptive 31, shared 18, ai 4) |
| Playwright E2E | ✅ 100/100 tests (see the note below) |
| Lint and strict typecheck | ✅ all 7 workspace packages |
| Content | ✅ `content:validate` passes; expansion validators report 0 errors across 183 units and 71 readings; coverage report and dashboard current |
| Privacy and dependencies | ✅ privacy scan; `pnpm audit` reports no known vulnerabilities |
| CI | ✅ `verify` green on PR #16 and on `main` |
| Production | ✅ health check reports `ok` and `db`; release, digest and counts match the checkout; Vercel READY in production on the same SHA; build log shows the role check and migration `20261110140000_content_review_decisions` applied |

The E2E suite covers:
- security, IDOR and child-mode restrictions;
- every lesson on phone and tablet;
- Reading Garden;
- audit regressions ATL-03, 05, 06 and 12–15;
- all 143 expansion items rendered on a phone;
- the review queue, cross-family isolation and the apply CLI.

The independent content QA reports are in [`docs/curriculum/qa/`](docs/curriculum/qa/).

## 8. Known limitations and open items

- **Owner and expert gates:**
  - UX acceptance;
  - sign-off on the limited-scope statement;
  - educator review of owner-approved content;
  - an item-by-item educator review of the owner-approved expansion content;
  - a decision on `unit-g3-montessori-from-gathering-to-farming` (worldview);
  - a check of `reading-g5-when-the-ground-shakes` against official BNPB/BMKG guidance;
  - a named qualified scholar for all Islamic content;
  - legal review of consent and data handling;
  - a rehearsal of Neon point-in-time restore. Only a synthetic dump-and-restore has been rehearsed.
- **Curriculum gaps:**
  - no interactive maths or STEM beyond Grade 1;
  - 81 objectives have no content;
  - no audio or read-aloud for pre-readers.
- **Reading Garden:**
  - no verified Indonesian book source;
  - Book Dash title-level licences are unconfirmed, so books stay link-only;
  - no automated broken-link checker.
- **Facts marked `needs_source`:** the mangrove passage, two biographies and Grade 6 history.
- **Engineering:**
  - The generated content bundle is 1.5 MB for 143 items. It needs per-level lazy loading before going much past
    about 600 items.
  - The nonce CSP is report-only.
  - The Vercel deployments API sometimes returns a truncated build log.
  - Spaced-review intervals (3/7/14/30 days) differ from the Curriculum Bible's suggestion (1/7/30), pending an
    owner decision.

## 9. Key documents

| Topic | Document |
|---|---|
| Product Bible (redacted public copy) | [`docs/spec/product/PRODUCT_BIBLE.md`](docs/spec/product/PRODUCT_BIBLE.md), [`docs/spec/PRODUCT_BIBLE_README.md`](docs/spec/PRODUCT_BIBLE_README.md) |
| Reading Garden Product Bible | [`docs/spec/reading-garden/DIGITAL_LIBRARY_PRODUCT_BIBLE.md`](docs/spec/reading-garden/DIGITAL_LIBRARY_PRODUCT_BIBLE.md), [`docs/reading-garden/HANDOVER.md`](docs/reading-garden/HANDOVER.md) |
| Curriculum Bible | [`docs/spec/curriculum-bible/README.md`](docs/spec/curriculum-bible/README.md) (frameworks, progression matrix, grade by grade, guardrails, quality scorecard) |
| Curriculum coverage and expansion | [`COVERAGE_REPORT.md`](docs/curriculum/COVERAGE_REPORT.md), [`EXPANSION_PIPELINE.md`](docs/curriculum/EXPANSION_PIPELINE.md), [`AGENT_BRIEF.md`](docs/curriculum/AGENT_BRIEF.md), [`qa/`](docs/curriculum/qa/) |
| Islamic content governance | [ADR-0010](docs/adr/0010-islamic-content-governance.md), [`docs/islamic/SOURCE_REGISTRY.md`](docs/islamic/SOURCE_REGISTRY.md) |
| Architecture decisions | [`docs/adr/`](docs/adr/) (ADR-0001 to ADR-0011) |
| Releases | [`RELEASES.md`](docs/delivery/RELEASES.md), [`release-manifest.json`](docs/delivery/release-manifest.json), [`RELEASE_RUNBOOK.md`](docs/delivery/RELEASE_RUNBOOK.md), [`RELEASE_SCOPE.md`](docs/delivery/RELEASE_SCOPE.md), [`RELEASE_SIGNOFF.md`](docs/delivery/RELEASE_SIGNOFF.md) |
| Delivery status | [`FINAL_HANDOVER.md`](docs/delivery/FINAL_HANDOVER.md), [`DELIVERY_DASHBOARD.md`](docs/delivery/DELIVERY_DASHBOARD.md), [`SECURITY_REVIEW.md`](docs/delivery/SECURITY_REVIEW.md). [`HANDOVER.md`](docs/delivery/HANDOVER.md) is the historical Phase 0 + 1 record |

## Repository map

```text
apps/web/                 Next.js app: parent and child UI, API routes, middleware (CSP), E2E tests, scripts
packages/shared/          types, timezone-aware age engine, safety policy, PRNG, server crypto (scrypt)
packages/curriculum/      lesson, library and expansion schemas; publication gates; validators; manifest,
                          coverage, dashboard and release scripts
packages/assessment/      seeded item generators, server-side grader, misconception tags, hint ladder
packages/adaptive/        rule-based mastery model and explainable recommendation policy
packages/ai/              disabled-by-default guarded AI adapter (PII blocking, timeouts, fallbacks)
packages/database/        Prisma schema, 6 migrations, role marker, synthetic and private seeds
content/                  lessons and cards, objectives, skills, library (books, passages, journeys),
                          units/<level>/<framework>, readings/<level>
docs/                     spec (Product and Curriculum Bibles), adr, curriculum, islamic, reading-garden, delivery
artifacts/screenshots/    synthetic visual QA evidence (mobile, tablet, desktop)
legacy-site/              previous static GitHub Pages site (unchanged)
```

## Licence

No licence is granted; all rights are reserved by the owner (see `LICENSE-NOTE.md`).
