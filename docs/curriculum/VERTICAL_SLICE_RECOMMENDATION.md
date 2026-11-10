# Recommended first complete vertical slice

## Recommendation: Slice B — Grade 1 addition & subtraction within 10, with bar-model word problems

> **Status (2026-11-10): implemented and agent-checked; awaiting your content review.** See
> [`SLICE_B_REVIEW.md`](SLICE_B_REVIEW.md) for what was built, the evidence, and the approval command.

**Objectives:** `math.g1.add-sub-10` (skills `MATH-G1-ADD-10`, `MATH-G1-SUB-10`) and `math.g1.word-problems-1`
(`MATH-G1-WORD-1`). Prerequisite `math.g1.bonds-10` is already published.

### Why this slice first
1. **Serves the current learner directly.** The Grade 1 learner has published counting and number-bond lessons; this is the
   next unlocked objective in the prerequisite graph, so it plugs straight into the adaptive engine.
2. **Complete end to end with today's architecture.** Server-side generators, misconception tags, hint ladders, CPA
   progression, mastery and delayed review all exist; the slice adds content and generators, not new infrastructure.
3. **No dependency on unresolved decisions.** Unlike Islamic studies (madhhab, scholar, edition) or robotics hardware,
   it needs only your content review.
4. **Introduces the first new CPA representation** the bible emphasises (bar model) and the first transfer items (stories).

### Scope (definition of done)
| Part | Content |
|---|---|
| Lessons (EN/ID) | Add with counters (concrete) → add with number bond / part-whole (pictorial) → add equations (abstract); same three for subtract; one bar-model story lesson |
| Generators (server-side) | `add-within-10`, `sub-within-10` (take-away and missing-part forms), `bar-model-story` (one-step, original contexts) with property tests |
| Misconceptions | counting on from the wrong number, subtracting the wrong way, adding instead of subtracting in stories, off-by-one |
| Hint ladders | H0–H4 per lesson (manipulative → diagram → targeted prompt → worked example) |
| Bible unit structure | diagnostic (3 items) → practice (6 varied) → transfer (story) → exit (2 independent) |
| Offline equivalents | parent card per lesson (e.g. "ten small objects split into two groups and explain the parts") |
| Tests | generator property tests, golden mastery traces, E2E session per lesson, a11y + screenshots (phone/tablet) |
| Review | you (or an educator) review in the Curriculum review queue; only then `content:approve` |

### Estimate
About one working session for implementation and tests, plus your review time. Nothing is published until you approve.

## Next slices (proposed order)
1. **Slice A extension — age 3–4 physical cards** (practical life, sound games, arrows/paths, counting to 10) so the
   toddler profile has age-appropriate cards ready at the 3rd-birthday transition (offered only after parent confirmation).
2. **Slice E — Islamic adab & duas (ages 2–5)**, authored as drafts once you decide the madhhab, reviewer and editions;
   published only after qualified religious review. The draft mealtime card is the template.
3. **Slice D — Grade 1 unplugged robotics** (grid robot, debug the path) with rubric assessment.
4. **Slice C — Kindergarten phonics and concrete maths**, then Grades 2–6 systematically.
