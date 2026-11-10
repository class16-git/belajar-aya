# Atlas — milestone handover (2026-11-10)

**Production:** https://atlas.ichlasulamalsudarmi.com · Vercel project `atlas` · Neon Postgres (role marker `production`).
**Deployed version:** see §3 and [RELEASES.md](RELEASES.md).

**Status: READY FOR OWNER ACCEPTANCE (limited-scope pilot).**
- All 15 independent-audit findings have a fix and a regression test.
- The open items are owner gates:
  - UX acceptance;
  - the scope sign-off;
  - re-review of 4 corrected items;
  - educator review;
  - the Islamic scholar review.
- The agent wrote these fixes, so they have **not** been verified independently. A re-audit by a separate reviewer is
  recommended.

## 1. What is complete and live
| Area | What families get |
|---|---|
| Platform | Parent accounts (sign-up limited to the owner's email), consent, parent PIN, child mode with PIN exit, IDOR protection on every route, rate limits, export and hard delete, EN/ID UI, "Made with ❤ by Ayah, for Kakak and Adek" footer |
| Curriculum architecture | 120 bilingual planning objectives age 2 → Grade 6 (Montessori, Singapore-style maths, robotics/STEM, Islamic studies) with a validated prerequisite graph; coverage report and review queue; fail-closed publication (production shows only human-reviewed content); separate qualified religious-review gate |
| Toddler (age 2–3) | 13 printable caregiver cards, observations, no child screen time |
| Ages 3–4, 4–5, Kindergarten | Printable cards for every non-Islamic objective (33 cards); suggestions follow age after the parent confirms the transition |
| Kindergarten maths (complete) | Teen numbers (ten-frames, sentences), number bonds within 20 (diagram, sentences), picture word problems (stories with counters) + printable "draw the story" card |
| Grade 1 maths | Counting to 20, number bonds to 10, addition and subtraction within 10 (concrete → pictorial → abstract), bar-model story problems |
| Grade 1 robotics | On-screen "where will the robot stop?" and "fix the robot's path" (exactly one correct answer, guaranteed), floor-grid rubric card, sensor notebook card |
| Adaptive engine | Rule-based mastery (≥ 3 independent correct in ≥ 2 formats + delayed check), CPA progression, misconception routing to concrete work or weak prerequisites, parent focus that cannot skip prerequisites, varied child choices, Kindergarten = K + Grade 1 skills |
| Reading Garden | Rights-aware library (12 Book Dash titles, link-only with evidence), per-child parent-approved shelves, PIN gate before external sites, family links switch, reading journeys for all 10 stages, 7 original EN/ID comprehension passages (server-graded), reading history with delete, Reading card on every dashboard |

Production content after Milestone A (from `pnpm release:manifest`): **55 lessons and cards, 12 books, 5 passages**.
Two cards and two passages are withheld until the owner re-reviews the audit corrections.

## 2. Evidence
| Gate | Result |
|---|---|
| Lint, strict typecheck | ✅ all 8 packages |
| Unit / property tests | ✅ 178 (generators over thousands of random items, grader golden cases, cross-lesson tag and hint coverage, engine traces, rights and publication rules) |
| Playwright E2E | ✅ 92 (core flows, security/IDOR, child-mode restrictions, every slice's lessons on phone and tablet, Reading Garden security, Kindergarten unlocks, audit regressions ATL-03, 05, 06, 12–15) |
| Accessibility | ✅ axe WCAG 2.1 AA: 0 violations on every page tested; ≥ 44 px child targets; no horizontal scroll at 390 px |
| Visual QA | Screenshots in `artifacts/screenshots/` (mobile/tablet/desktop); defects found during review were fixed (see each slice doc) |
| Production-mode smoke (local, `ATLAS_ENV=production`) | ✅ 13/13: sign-up → consent → PIN → learners → library (12 books, no preview badges) → shelf → child mode → activity → child shelf and passage → Islamic draft hidden |
| Content, coverage, privacy | ✅ `content:validate`, coverage report current, privacy scan (no learner data committed) |
| CI | ✅ `verify` workflow green on every merged PR |

## 3. Release reconciliation
See [RELEASES.md](RELEASES.md) for each release: commit, Vercel deployment, content digest, verified live counts and
rollback target. To verify a release yourself:
```sh
curl -s https://atlas.ichlasulamalsudarmi.com/api/health
pnpm release:manifest
```
In the first command's output, `release` is the commit and `contentDigest` identifies the visible content. The second
command, run on the same commit, must report the same digest.

## 3a. Independent audit remediation (Milestone A)
| ID | Priority | Fix | Regression test |
|---|---|---|---|
| ATL-01 | P0 | E2E refuses any database that is not local (or allow-listed), not named `*test*`, or not marked `synthetic` | `test-db-guard.test.ts` |
| ATL-02 | P1 | A mastered skill whose score falls below 0.6 lapses to learning and stops unlocking dependants | `engine.test.ts` ATL-02 |
| ATL-03 | P1 | The bond scaffold shows exactly `whole − part` fillable cells | E2E ATL-03 |
| ATL-04 | P1 | Fallback practice never offers a skill with unmet prerequisites (property test over 300 seeds) | `engine.test.ts` ATL-04 |
| ATL-05 | P1 | Comprehension checks are idempotent by `attemptId`; first try is recorded; assistance is recorded as unknown | E2E ATL-05 |
| ATL-06 | P1 | `/api/skills` uses the same eligibility as the child screen | E2E ATL-06 |
| ATL-07 | P3 | Limited-scope release statement ([RELEASE_SCOPE.md](RELEASE_SCOPE.md)); unsupported grades say "coming soon" | owner sign-off ☐ |
| ATL-08 | P1 | The invented study is labelled in EN/ID and teaches what to check; withheld for re-review | `library.test.ts` |
| ATL-09 | P1 | The K inference answer is no longer stated word for word; withheld for re-review | `library.test.ts` |
| ATL-10 | P0 | Linkage card uses tied wool instead of split pins; a schema rule matches hazard words against flags and safety notes; 2 cards withheld for re-review | `catalog.test.ts` ATL-10 |
| ATL-11 | P0 | vitest 4.1.12, minimatch 11.0.1; `pnpm audit` clean; CI audits the full lockfile | CI |
| ATL-12 | P0 | `/api/health` reports `contentDigest` and `deployment`; `pnpm release:manifest`; release record; rollback runbook; restore rehearsal | E2E ATL-12, `catalog.test.ts` |
| ATL-13 | P2 | Answer choices follow the radio-group keyboard pattern | E2E ATL-13 |
| ATL-14 | P2 | Per-request nonce plus `strict-dynamic` CSP, report-only first, with a redacted report endpoint | E2E ATL-14, `csp.test.ts` |
| ATL-15 | P1 | Completion is shown only after a confirmed finish; "Try again" re-sends it; finishing is idempotent | E2E ATL-15 |

## 4. Outstanding limitations (honest list)
- **Islamic studies:** nothing published. Needs the owner's decisions (madhhab, verified edition of al-Qawl al-Jaliyy,
  recitation convention) and a named qualified scholar and translation reviewer (ADR-0010). The agent never approves it.
- **Grades 2–6:** journeys and reading passages exist, but there are no maths, Montessori or robotics lessons yet; the
  learn page says "coming soon" for those grades.
- **Grade 1 gaps:** compare numbers to 20, tens and ones, addition/subtraction to 20, measurement/time/money; Grade 1
  Montessori cards.
- **Reading Garden:** no Indonesian external books (Let's Read / StoryWeaver / SIBI could not be verified from the agent
  environment); Book Dash title-level licences unconfirmed (link-only); no automated broken-link checker; no licensed
  in-app reader or narration.
- **Audio:** no read-aloud for pre-readers (stories are read by a grown-up).
- **Approvals:** content approved under the owner's standing approval is recorded as `owner`. An educator review is
  still recommended. Book link checks were done by the agent and are recorded as agent checks.
- **Awaiting the owner's re-review after audit corrections:**
  - passages `passage-g6-advert-report` and `passage-k-red-kite`;
  - cards `lesson-robo-k-linkage-001` and `lesson-prek-world-cycles-001`.
- **CSP:** the nonce policy is report-only. The switch to enforcing is in RELEASE_RUNBOOK §4.
- **Spaced review intervals** remain 3/7/14/30 days (bible suggests 1/7/30; owner decision).

## 5. Recommended next milestones
1. **Grade 1 completion:** compare to 20, tens and ones, add/sub to 20 (make-ten strategy), measurement/time/money,
   Grade 1 Montessori cards.
2. **Grade 2 maths slice** (place value to 1000, add/sub with regrouping, bar models), then Grades 3–6 systematically.
3. **Indonesian Reading Garden:** verify Let's Read / StoryWeaver in a normal browser, add titles with evidence.
4. **Audio prompts** for pre-readers (licensed or original TTS, parent toggle).
5. **Islamic studies** once the owner's decisions and a qualified reviewer are in place.
6. **Operations:** scheduled link checker, uptime check on `/api/health`, Vercel/Neon backups review.
