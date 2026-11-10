# ADR-0009: Curriculum objectives registry and coverage
Status: accepted (2026-11-10)

**Context.** The Curriculum & Islamic Education Bible defines scope from age 2 to Grade 6 across Montessori, Singapore-style
maths (CPA), robotics/STEM and Islamic studies. Atlas only modelled skills for toddler and Grade 1 maths.

**Decision.**
- `content/objectives/<framework>.json` holds original planning objectives (`<fw>.<stage>.<slug>`), bilingual titles,
  strand, stage, prerequisites (cross-stage DAG), delivery and assessment mode, review flags and links to implementing
  skills. Objectives are planning data and never child-facing.
- Stages `age2_3, age3_4, age4_5, k, g1…g6` map to age bands (new `prek` band). Stage informs content readiness; grade is
  parent-set; placement comes from mastery.
- Lessons gain optional `framework`, `objectiveIds`, `copyrightStatus`, `namcReferenceStatus`, `reviewFlags`,
  `arabicPhrases`, `religiousReview` (backwards compatible).
- Coverage (`planned → draft → awaiting review/religious review → published`) is computed from content; the report
  `docs/curriculum/COVERAGE_REPORT.md` is generated and CI fails when stale. Parents see the matrix and a review queue in
  Curriculum.
- Adaptive engine: parent focus no longer unlocks prerequisites; open items are invalidated when grade/mode/age band
  changes or the lesson is withdrawn.

**Consequences.** Planning objectives are visible to parents as "planned"; adding a lesson only requires linking its skill
or `objectiveIds`. No external syllabus text is stored; NAMC/Singapore alignment requires licensed sources and educators.
