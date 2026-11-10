# Curriculum audit and gap matrix (Curriculum & Islamic Education Bible v1)

Audit date 2026-11-10, against `docs/spec/curriculum-bible/` (progression matrix, grade-by-grade scope, frameworks,
Islamic scope, content model). Evidence = files in `content/` and code in `packages/`. Live numbers:
[`COVERAGE_REPORT.md`](COVERAGE_REPORT.md) (generated, CI-checked).

## 1. Headline
- The bible's scope is now captured as **120 original planning objectives** (`content/objectives/*.json`): 29 Montessori,
  37 maths, 20 robotics/STEM, 34 Islamic studies, across 10 stages (age 2–3 → Grade 6), with a cross-stage prerequisite
  graph (validated: no unknown prerequisites, no later-stage prerequisites, no cycles).
- **7 objectives (≈6 %) are published** (human-reviewed lessons in production): age-2–3 practical life, sensorial,
  naming and quantity 1–3; Grade 1 counting to 20 and number bonds to 10.
- **3 are in the review pipeline**: 1 robotics card (agent-checked, needs content review), 1 Islamic adab card (draft, needs
  qualified religious review), 1 sample draft maths lesson.
- **110 objectives have no lesson yet.** Robotics and Islamic studies have no published content at any stage; ages 3–6 and
  Grades 2–6 have no published content in any framework.

## 2. Gap matrix (what exists vs what the bible requires)

| Bible requirement | Before this change | Now | Remaining gap |
|---|---|---|---|
| Learning objectives age 2 → G6 | 13 skills (toddler + G1 maths only) | 120 objectives, bilingual titles, framework/strand/stage, delivery & assessment mode | Objectives are agent-drafted planning data: educator review of wording and sequence |
| Grade mappings | Interactive content hard-coded to G1; grade ignored (fixed in PR #3) | Stage → age band map (`age2_3…g6`), new `prek` band; grades 2–6 explicitly get "coming soon" | Interactive content exists only for K/G1 |
| Prerequisites | Within G1 maths only | Cross-stage DAG for all 120 objectives; parent focus can no longer bypass prerequisites | Prerequisites are planning hypotheses; validate with educator |
| Lesson content | 19 lessons (13 toddler cards, 5 G1 maths, 1 draft) | 21 (+1 robotics card age 3–4, +1 Islamic draft) | 110 objectives without lessons |
| Assessment items (server-side) | Generators for 2 G1 skills (count, bonds) | unchanged | No generators for add/sub, place value, measurement, word problems, any G2–G6 maths, any robotics debugging task |
| Physical Montessori activities | 13 toddler cards | 13 toddler + 1 preschool card | Ages 3–6 practical life, language (sound games, tactile letters, movable alphabet), culture; G1–G6 project cards |
| Singapore CPA representations | Ten-frame, scattered dots, number bond, equation | unchanged | Bar models, number line, place-value blocks, fraction models, area models |
| Robotics/STEM | none | 20 objectives; 1 unplugged card (age 3–4) | All stages; engineering-notebook/rubric assessment; hardware safety checklists |
| Islamic studies | none | 34 objectives (all flagged); religious review gate; 1 draft card | Everything, behind owner decisions + qualified scholar review (§4) |
| Review states (draft → subject reviewed → religious reviewed → parent approved → published) | draft / agent_reviewed / reviewed / published | + independent religious-review record and gate; agent cannot advance religious content past draft | "Parent approved" and "subject reviewed" are one human step today (`reviewed`); split if an external educator joins |
| Content model fields | Atlas lesson v2 | + `framework`, `objectiveIds`, `copyrightStatus`, `namcReferenceStatus`, `reviewFlags`, `arabicPhrases`, `religiousReview` | `duration_minutes`, `screen_mode`, `offline_equivalent`, `worked_examples` are implicit in today's fields; add when slices need them |
| Spaced review (G1: 1/7/30 days) | delayed check ≈ 1 day, then 3/7/14/30 days | unchanged | **Owner/educator decision**: adopt 1/7/30 exactly? (config change in `packages/adaptive/src/mastery.ts`) |
| Policy-change invalidation | Not enforced | Open items abandoned (409) when grade/mode/age band changes or lesson is withdrawn | — |
| Audio-first for ages 2–3 | none (cards are adult-read) | unchanged | Audio prompts / TTS (Phase 1 backlog) |
| Arabic rendering | n/a | RTL rendering with `lang="ar"` verified in review view (screenshots 41) | Font/diacritics QA by a reviewer on real devices |
| NAMC alignment | none claimed | `namcReferenceStatus` field (default `not_applicable`) | Owner to supply licensed NAMC scope & sequence for an educator-made mapping |

## 3. Per-stage summary (published / planned objectives)

| Stage | Montessori | Maths | Robotics | Islamic |
|---|---|---|---|---|
| Age 2–3 | 4/5 | 1/2 | 0/2 | 0/3 (1 draft) |
| Age 3–4 | 0/4 | 0/4 | 0/2 (1 in review) | 0/3 |
| Age 4–5 | 0/3 | 0/2 | 0/2 | 0/4 |
| K | 0/3 | 0/3 | 0/2 | 0/3 |
| G1 | 0/3 | 2/8 | 0/3 | 0/5 |
| G2–G6 | 0/11 | 0/18 | 0/9 | 0/16 |

## 4. Islamic studies: what is preserved and what is blocked
- Orientation recorded as specified: **Ahl al-Sunnah wa al-Jama'ah, Ash'ari–Maturidi**, with the requested
  **Shaykh Abdullah al-Harari** reference framework. "Allah mawjud bila makan" appears only as G4/G6 objectives flagged
  `theological_interpretation`, `scholar_wording_required`, `arabic_text`, `attribution`.
- Every Islamic objective and lesson requires qualified religious review; the agent can only author **draft**.
- **Unverified and not asserted:** the exact title/author/edition of *al-Qawl al-Jaliyy* (possible transliteration
  ambiguity), any passage attributed to Shaykh al-Harari, any Arabic wording, translation, hadith, or fiqh ruling.
- **Owner decisions needed** (bible §Open editorial decisions): default fiqh madhhab (e.g. Shafi'i); the verified Arabic
  edition intended; the qualified teacher/scholar who approves creed and worship lessons; Qur'an recitation/tajwid
  convention.

## 5. Not done in this change (by design)
No new lessons were published; no lesson was approved by the agent; nothing was merged or deployed.
