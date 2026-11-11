> **Historical record (Phase 0 + 1, before the first production deployment).** Atlas is now live; this file is
> kept as evidence of that phase only. For the current state see the [README](../../README.md),
> [FINAL_HANDOVER.md](FINAL_HANDOVER.md), [RELEASES.md](RELEASES.md) and [release-manifest.json](release-manifest.json).

# PR #1 — Final release-readiness report

| | |
|---|---|
| PR | class16-git/belajar-aya#1 (`claude/github-repo-access-nkrthi` → `main`) |
| Last commit verified on GitHub CI | `49a6cf38b1c7cb7428c4bb05e2509caefe169681` — CI run 42749955530 ✅ success |
| Commit verified in this report | `d14a500c2fdd35519d2d264d6d2c9dcafc70840a` (this report is committed on top of it) |
| Pushed? | PR #1 was merged at `49a6cf3` (merge `e23b2a9`) before these fixes were pushed. They were rebased onto `main` without conflicts and pushed with owner approval as follow-up PR #2. The identical CI steps were run locally (below); GitHub CI runs on PR #2. |
| Data used | Synthetic only (demo family "Kakak"/"Adek" with fake DOBs, `@example.test` emails) |
| Author of this report | The coding agent (self-assessment). Independent evidence is labelled as such. |

## 1. Decision

**READY FOR OWNER APPROVAL** — on these conditions, in order:
1. Owner approves pushing the local commits; GitHub CI must then pass on the new head. (If it fails, the status
   reverts to CHANGES REQUIRED.)
2. Owner performs the product acceptance steps that only a human can do (§9).

All known release-blocking defects (P0/P1) found by self-review, by Codex and by the independent agent are fixed and
covered by regression tests. This does **not** mean the application is bug-free or completely secure; a human
security review / penetration test is still required before inviting external families (spec launch gate).

## 2. Test evidence (local run of the CI sequence on `d14a500`)

| Stage | Command | Result |
|---|---|---|
| Privacy scan | `pnpm privacy:scan` | ✅ no private files or values tracked |
| Curriculum validation | `pnpm content:validate` | ✅ 13 skills, 19 lessons (1 draft, 18 agent_reviewed, 0 human-reviewed) |
| Lint | `pnpm lint` | ✅ 7/7 |
| Types (strict) | `pnpm typecheck` | ✅ 8/8 |
| Unit / property / integration | `pnpm test` | ✅ **81 passed** (shared 18, curriculum 14, assessment 11, adaptive 16, ai 4, web 18) |
| Dependency audit | `pnpm audit --prod --audit-level high` | ✅ no known vulnerabilities |
| Production build (preview label) | `next build` | ✅ |
| E2E + accessibility + visual | `pnpm test:e2e` | ✅ **31 passed**, 0 failed, 0 flaky; axe WCAG 2.1 A/AA: **0 violations** |
| Concurrency + regression repeat | `playwright test -g "concurrency\|final review regressions" --repeat-each 10` | ✅ **80/80** |

GitHub CI history on this PR: runs 1–4 all ✅ (heads d693b75, cfe5e63, b37eb56, 49a6cf3).

## 3. Previous findings (Codex review) — re-verification

| # | Original issue & root cause | Current implementation | Evidence beyond "test passes" | Tests | Remaining risk | Status |
|---|---|---|---|---|---|---|
| F1 | Mastery read-modify-write not serialised across items → lost updates | `pg_advisory_xact_lock(child,skill)` taken after the item claim and **before** reading mastery, inside the same transaction (`learning.ts` submitAttempt). Root cause also removed: one open session per child, other open items abandoned, stale-session items unanswerable (N4) | Code trace: under READ COMMITTED the second tx blocks on the lock and reads the committed row. Mastery `attempts` equals attempt-row count after races | E2E race tests; mastery count invariant | Lock is per (child, skill) only; no cross-skill invariants exist today | **VERIFIED FIXED** |
| F2 | Deploy identity came only from a configurable label | `VERCEL_ENV=production` forces production rules in app, seeding and build; build fails before DB access on a mislabel; **plus** database role marker (R-F2) checked before migrate/seed | Ran real build: preview×2 on fresh DB ✅; production build against synthetic DB refused before migrations | `vercel-build.test.ts`, `db-role.test.ts` (4), `catalog.test.ts` | Non-Vercel hosts rely on `ATLAS_ENV` + DB marker (`db-role production` step in runbook) | **VERIFIED FIXED** |
| F3 | Hint and attempt claimed different columns | Both claims require unchanged `tries` **and** `hintsUsed` **and** an open session | Code trace of both interleavings: loser gets 409; no attempt can be `independent` once a hint exists | E2E race test (×10) | A losing request shows the generic error; child presses "Try again" | **VERIFIED FIXED** |
| F4 | Session start / next item not atomic | Partial unique indexes (1 open session/child, 1 active item/session) + conflict handling; start is transactional | Reproduced before fix (3 open sessions); test fails with indexes dropped; upgrade migration verified (§5) | E2E race tests | Indexes live in SQL migration only (not expressible in `schema.prisma`; documented) | **VERIFIED FIXED** |
| F5 | Origin check trusted `X-Forwarded-Host` | Ignores forwarded headers; exact `ATLAS_PUBLIC_ORIGIN` allowlist when set | Unit tests incl. scheme/port mismatch and `null` origin | `http.test.ts` | `ATLAS_PUBLIC_ORIGIN` must be set in production (runbook) | **VERIFIED FIXED** |
| F6 | Logger serialised exception messages | Production logs: error name + code only. Rate-limit keys hashed (R-F6) | Code review of all log/audit call sites | — (no log-capture test) | Next.js framework's own logging of *unhandled* page-render errors is outside our logger | **PARTIALLY FIXED** (app-level fixed; framework-level residual documented) |
| F7 | Claimed: midnight refresh up to 1 min late | No change needed | Codex's own example lands at 00:00:00.000; also NY and NZ DST-end day; function unused at runtime (age recomputed per request) | `age.test.ts` | — | **NOT REPRODUCIBLE** (no defect) |

## 4. New findings in this review

Source: **S** = self-review (author), **I** = independent fresh-context agent (did not author the code).
Every fix had a regression test that failed before the fix.

| ID | Sev | Source | File | Scenario → impact | Fix | Status |
|---|---|---|---|---|---|---|
| N3 / R-F1 | Medium | S + I | `api/auth/signin`, `api/auth/signup` | Child in child mode POSTs to sign-up → new session cookie → escapes the lock without PIN (reproduced: 201) | 403 `PARENT_GATE` while in child mode | Fixed |
| R-F2 | Medium | I | `scripts/vercel-build.mjs`, `seed-lib.ts` | Neon DB also attached to Production → preview builds migrate unmerged schema and seed public demo login into production | DB role marker in `atlas_meta.database_role`, checked before migrate/seed; docs: untick Production | Fixed |
| N4 / R-F8 | Low–Med | S + I | `learning.ts` | Item created in a session that was ended concurrently stays answerable (reproduced: 200) | Claims require `session.endedAt IS NULL` | Fixed |
| N2 / R-F5 | Low–Med | S + I | `http.ts` parseBody | Chunked body without Content-Length buffered fully before size check | Streaming reader with 32 KB byte cap | Fixed |
| N1 / R-F3 | Low | S + I | `http.ts` clientIp | Spoofed left-most XFF (and, in my first fix, `x-real-ip` off-Vercel) bypasses per-IP limits | Right-most XFF; platform headers only when `VERCEL=1` | Fixed |
| N7 / R-F4 | Low | S + I | `child-mode/exit` | 4-digit PIN guessable over ~1–2 weeks across sessions | +20/day per account cap | Fixed |
| R-F6 | Low | I | `rate-limit.ts`, `privacy.ts` | Plain emails stored forever in limiter; survive deletion | SHA-256 keys, deleted with family, stale-row cleanup | Fixed |
| R-F7 | Low | I | `api/auth/signin` | Third party locks parent out with 8 bad passwords / 15 min | Per (email, IP) 8/15 min + per-email 30/h | Fixed |
| N5 | Low | S | `seed-private.ts` | Private seed against a remote/production DB would delete-and-recreate the real family | Refuses non-localhost DATABASE_URL | Fixed |
| B1 | (build bug in my own R-F2 fix) | S (caught by build verification) | `db-role.ts` | Marker table in `public` made Prisma treat a fresh DB as non-empty (P3005) | Marker moved to `atlas_meta` schema | Fixed + test |
| UX1 | P2 | S (visual QA) | dashboard/family/child form | Grade shown as "Grade 1" in Indonesian UI | Localised labels ("Kelas 1") | Fixed + E2E assertion |
| N6 | Low | S + I | `api/auth/signup` | 409 `EMAIL_EXISTS` confirms an account exists | Not fixed — needs email-verification flow (ADR-0002 backlog) | **Accepted risk (owner)** |

No critical or high findings were identified by either reviewer in the code as it stands.

Areas reviewed with no finding: child-mode guard on all 22 API routes and every parent page; cross-family IDOR on all
id-taking routes/pages; scrypt + timing-safe compare; hashed session tokens; strict schemas rejecting client
`correct`/scores; no answer key in any pre-completion payload (incl. hint templates); export excludes secrets;
delete cascades; consent withdrawal blocks learning; AI disabled with PII guard; no `dangerouslySetInnerHTML`/`eval`;
no secrets in the repository.

## 5. Database migration verification
| Check | Result |
|---|---|
| Fresh DB: `prisma migrate deploy` (3 migrations) + `migrate status` | ✅ applied; "schema is up to date"; both partial unique indexes present |
| Upgrade from previous schema (2 migrations) with 2 open sessions and 2 active items for one child | ✅ migration closed the older session, abandoned the older item, then enforced uniqueness (a third open session is rejected) |
| Preview build on fresh DB, twice (idempotent) | ✅ claim "synthetic" → migrate → seed → build; second run confirms marker and re-seeds |
| Production build against the synthetic DB | ✅ refused before migrations or seeding |
| Freshly claimed DB can still be migrated | ✅ (`db-role.test.ts`) |

## 6. Concurrency results
| Test | Before fix | After fix |
|---|---|---|
| 3 concurrent session starts | 3 open sessions (reproduced with indexes dropped) | 1 open session, 30/30 repeats |
| 4 concurrent "next item" | multiple active items possible | 1 active item, same id returned |
| Double answer + hint race | stale "independent" evidence possible | ≤1 attempt per try; never independent after a hint; mastery count == attempts |
| Old tab's item after new session | answerable | 409 |
| Item stranded in ended session (N4) | 200 | 409 |

## 7. UI/UX verification
- 81 screenshots regenerated on `d14a500` at 390/820/1440 px (`artifacts/screenshots/`), covering all 12 spec screens and
  states (intro, concrete/pictorial/abstract, hint+representation, wrong, supported, correct, worked example, summary,
  offline error, PIN gate, print view, Indonesian dashboard).
- Automated: no horizontal overflow at any viewport; every child control ≥ 44 px; axe 0 violations; keyboard-only flow;
  reduced motion.
- Manual inspection this round: child runner (mobile), Indonesian dashboard (tablet), print card (desktop). One defect
  found and fixed (UX1). Behaviour change visible to users: if a hint and an answer collide, the child sees the generic
  "Something went wrong — Try again" screen (rare; acceptable, owner may prefer a softer message).
- This is **agent QA**, not human UX approval.

## 8. Independent review evidence
| Reviewer | Independent of author? | Evidence | Outcome |
|---|---|---|---|
| Codex (OpenAI), via owner | Yes — different vendor/model; review pasted into the conversation by the owner | Report text in the conversation (F1–F7) | 6 confirmed + fixed, 1 not reproducible |
| Fresh-context Claude sub-agent | Partially — did not author the code and had no conversation context, **but is the same model family as the author**; read-only, reviewed commit `49a6cf3` | Report (R-F1–R-F8) in the session transcript | 2 medium + 6 low; all fixed except enumeration (accepted risk) |
| GitHub Copilot code review | **No evidence of a review.** The request was accepted by the API, but PR #1 currently shows no requested reviewers and no Copilot review. Whether Copilot review is enabled for the org could not be determined with available tools. | GitHub API: `requested_reviewers` empty, reviews `[]` | Not performed |
| Human reviewer | **None yet** | — | Required before release |

## 9. Outstanding risks and owner actions
| Item | Owner action |
|---|---|
| Unpushed commits; GitHub CI not yet run on them | Approve push; confirm CI green |
| UX / child experience not human-approved | Try with Kakak (preview guide: `PREVIEW_DEPLOYMENT.md`) |
| 18 lessons/cards agent-checked only → production shows nothing | `pnpm content:approve` after review (educator recommended) |
| No human security review / pen-test | Required before inviting external families |
| Self-hosted auth: no email verification, reset, 2FA; signup enumeration | Accept for private family use, or adopt managed auth (ADR-0002) |
| Consent text not legally reviewed (PDP Law / COPPA) | Counsel review |
| Hosting, region, backups, GitHub Pages / legacy site, repo visibility (public) | Decide (ADR-0006, ADR-0007) |
| Framework-level error logging (F6 residual) | Accept, or add a log drain filter in production |
| Mastery thresholds are unvalidated heuristics | Educator validation (Phase 3) |

## 10. Commits in this round (local, unpushed)
- `d14a500` fix: final security review — child-mode escape, stale items, DB identity guard, rate limits
- (this report) docs: PR #1 final release-readiness report
