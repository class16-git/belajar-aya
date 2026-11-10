# Atlas — milestone handover (2026-11-10)

**Production:** https://atlas.ichlasulamalsudarmi.com · Vercel project `atlas` · Neon Postgres (role marker `production`).
**Deployed version:** see "Release reconciliation" below (filled in after the final deploy was verified).

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

Production content (from `/api/health`): **57 lessons and cards, 12 books, 7 passages** visible.

## 2. Evidence
| Gate | Result |
|---|---|
| Lint, strict typecheck | ✅ all 8 packages |
| Unit / property tests | ✅ 153 (generators over thousands of random items, grader golden cases, cross-lesson tag and hint coverage, engine traces, rights and publication rules) |
| Playwright E2E | ✅ 85 (core flows, security/IDOR, child-mode restrictions, every slice's lessons on phone and tablet, Reading Garden security, Kindergarten unlocks) |
| Accessibility | ✅ axe WCAG 2.1 AA: 0 violations on every page tested; ≥ 44 px child targets; no horizontal scroll at 390 px |
| Visual QA | Screenshots in `artifacts/screenshots/` (mobile/tablet/desktop); defects found during review were fixed (see each slice doc) |
| Production-mode smoke (local, `ATLAS_ENV=production`) | ✅ 13/13: sign-up → consent → PIN → learners → library (12 books, no preview badges) → shelf → child mode → activity → child shelf and passage → Islamic draft hidden |
| Content, coverage, privacy | ✅ `content:validate`, coverage report current, privacy scan (no learner data committed) |
| CI | ✅ `verify` workflow green on every merged PR |

## 3. Release reconciliation
Filled in after the final deploy (see the end of this file).

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
- **Approvals:** content approved under the owner's standing approval is recorded as `owner`; an educator review is
  still recommended. Link checks for books were done by the agent and recorded as such.
- **Spaced review intervals** remain 3/7/14/30 days (bible suggests 1/7/30; owner decision).

## 5. Recommended next milestones
1. **Grade 1 completion:** compare to 20, tens and ones, add/sub to 20 (make-ten strategy), measurement/time/money,
   Grade 1 Montessori cards.
2. **Grade 2 maths slice** (place value to 1000, add/sub with regrouping, bar models), then Grades 3–6 systematically.
3. **Indonesian Reading Garden:** verify Let's Read / StoryWeaver in a normal browser, add titles with evidence.
4. **Audio prompts** for pre-readers (licensed or original TTS, parent toggle).
5. **Islamic studies** once the owner's decisions and a qualified reviewer are in place.
6. **Operations:** scheduled link checker, uptime check on `/api/health`, Vercel/Neon backups review.
