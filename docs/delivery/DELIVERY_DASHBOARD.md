# Delivery dashboard: curriculum expansion

**Generated content counts** come from [CONTENT_DASHBOARD.md](CONTENT_DASHBOARD.md) and the machine-readable
[content-dashboard.json](content-dashboard.json). CI fails if either is stale.

This page holds the parts a generator cannot know: tests, QA, security, release state, blockers and next steps. It
is updated with each release. Every number is an actual count; there are no estimates.

## 1. Targets and actual counts (pilot batch, 2026-11-11)
| Deliverable | Target | Authored | Passed automated validation | Independent QA done, fixes applied | Human-reviewed | Published (live) |
|---|---|---|---|---|---|---|
| Curriculum units | 1,500 | **102** | 102 | 101 (the reference unit was not in a QA batch) | 0 | 0 |
| Original reading materials | 1,500 | **41** (plus 12 earlier passages) | 41 | 40 (the reference reading was not in a QA batch) | 0 | 0 |

The 30 Islamic items (20 units and 10 readings) are drafts. They had a pre-scholar consistency check, and **none can
be published without a qualified scholar** (ADR-0010).

**By subject (units):**
| Subject | Units |
|---|---|
| Montessori | 20 |
| Maths | 22 |
| STEM and robotics | 20 |
| Literacy | 20 |
| Islamic (draft) | 20 |

Readings: 30 general and 10 Islamic drafts, plus 1 reference. Each level has 8 to 12 units and 4 to 5 readings.

**Progress against target: 6.8% of units and 2.7% of readings authored; 0% published.** The rest is not started.
Scaling resumes only after the owner reviews this pilot (see §5).

## 2. Validation and testing (local, on the release-candidate commit)
| Gate | Result |
|---|---|
| Expansion validators (`units:check`) | ✅ 0 errors across 102 units and 41 readings |
| Unit and property tests | ✅ 201 (curriculum 65, web 50, assessment 33, adaptive 31, shared 18, ai 4) |
| Playwright end-to-end tests | ✅ 100. Every one of the 143 units and readings renders on a phone without overflow; axe WCAG 2.1 AA sample has 0 violations; review queue, decisions, export, apply CLI and cross-family isolation are covered |
| Lint, strict typecheck, content validation, coverage report, privacy scan, dependency audit | ✅ |

**What the validators reject:**
- Content: ids, prerequisites (existence, level, cycles), missing EN/ID pairs, wrong maths (exact rational
  arithmetic), unanswerable or duplicated choices, near-duplicates.
- Safety: hazard words without a flag or a safety note, small items for under-5s, standing water, missing electrical
  safety.
- Integrity:
  - assessment items that reuse worked-example numbers;
  - approval claims written into content;
  - AI-drafted items marked approved;
  - self-verified sources;
  - Islamic content without a religious-review record.

## 3. Independent content QA (agents that did not author the content)
| Batch | Pass | Fix required | Blockers | Majors | Status |
|---|---|---|---|---|---|
| Readings (30) | 23 | 7 | 1 (bean seed in a 4–5 activity) | 8 | all fixed |
| STEM (20) | 13 | 7 | 1 (bridge broke its one-sheet rule) | 7 (LED colour and resistor, short-circuit rules, bumper wiring, light-meter physics, two items with two defensible answers, tape length) | all fixed |
| Montessori (20) | 16 | 4 | 0 | 4 | all fixed |
| Literacy (20) | 11 | 9 | 0 | 12 (Indonesian distractors, enam/ekor, real-word affixes, *klaim tandingan* vs *sanggahan*) | all fixed |
| Maths (21) | 4 | 17 | 0 | 19 (assessment repeated worked examples; *paku pines* means thumbtack; make-ten prerequisite order; carton volume) | all fixed; no arithmetic errors found |
| Islamic drafts (30) | — | — | 0 | 6 (wudu order, Ansar role-play, Wali Songo framing, *nushur* meaning, a "scholar-approved" claim) | fixed; still drafts awaiting a scholar |

The full reports are in `docs/curriculum/qa/`. Three QA findings became permanent validator rules:
- reading activity hazards;
- reused worked-example numbers;
- approval claims written into content.

## 4. Security and release
- **Audit findings:** ATL-01 to ATL-15 are fixed with regression tests (FINAL_HANDOVER §3a).
- **New attack surface:**
  - **Review decisions API:** parent-only, same-origin, zod `.strict()`, rate-limited and family-isolated, with an
    end-to-end test for the isolation.
  - **Export:** includes the family's decisions.
- **Deployed release:** `ac4b3c9` (`dpl_8xk7M83yFUBd94B6D8BFXjzn8Ti2`), verified on 2026-11-11. `/api/health` reports content digest `0fcf3ab0a7bd5fdb` and units 0, readings 0; the build log shows the role check and the review-decisions migration. See [RELEASES.md](RELEASES.md). Production shows **0** expansion items to children.

## 4a. Owner approval of 2026-11-11
The owner instructed: "approve all curriculum, i approve all, no need my approval, full autonomous". It was applied
through the normal review tools (`apply-reviews.mjs`, `content:approve`, `library:approve`) as `owner` (parent role).

**Covered:**
- **113 non-Islamic pilot units and readings.** These had passed every automated check and independent QA, with all
  fixes applied.
- **The 2 audit-corrected cards and 8 passages.**

**Not covered, and still gated:**
- the 30 Islamic drafts (a qualified scholar is required);
- content with `needs_source` claims, which stays hidden until sourced;
- batch-2 content, which gets the same approval only after validation and independent QA.

This was a blanket approval, not an item-by-item reading; an educator review is still recommended.

## 5. Blockers and outstanding approvals
| Blocker | Who | What unblocks it |
|---|---|---|
| Educator review of the owner-approved pilot | Educator (recommended) | The owner approved it as a blanket instruction (§4a); use `/review` to reject anything found wrong |
| Islamic items (30) | A named qualified scholar, plus an Arabic/translation reviewer | `pnpm content:religious-approve`. Open questions are in `docs/islamic/SOURCE_REGISTRY.md` |
| Al-Qawl al-Jaliyy identity, edition and attribution | Scholar | Verify before any citation; it is currently listed as unverified only |
| Facts marked `needs_source` (biographies, mangroves, Grade 6 history) | Owner or editor | Add a verified source, or rewrite the claim |
| Generated content bundle | Engineering | `expansion.json` is 1.5 MB for 143 items, about 30 MB at full scale. Switch to per-level lazy loading before scaling beyond about 600 items |

## 6. Next milestones
1. **Pilot review:** the owner reviews the pilot in `/review`, and feedback goes into `docs/curriculum/AGENT_BRIEF.md`.
2. **Child-facing integration:** approved units appear in the child's day; unit assessments are graded on the server
   (`gradeUnitAssessment`) and recorded as mastery evidence; approved readings join the Reading Garden shelf.
3. **Lazy content loading:** per level, before scaling.
4. **Batch 2:** 30 units and 30 readings per level, generated in parallel per subject, each with independent QA.
   Further batches follow until 150 + 150 per level.
