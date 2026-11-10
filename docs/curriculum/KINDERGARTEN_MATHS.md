# Kindergarten mathematics (complete for the bible's K maths objectives)

Status: implemented and tested; recorded as owner-approved on 2026-11-10 under the owner's explicit blanket approval ("record new curriculum approval using a previous blanket approval, i approve everything") — not an item-by-item review; an educator review is still recommended.

| Objective | On screen | Offline |
|---|---|---|
| `math.k.tens-ones-intro` Teen numbers as ten and some ones | `lesson-k-teens-001` A full ten and some more (concrete, two ten-frames); `lesson-k-teens-002` Teen number sentences (abstract, `10 + 4 = □`, level 3 also `14 = 10 + □`) | — |
| `math.k.bonds-20` Number bonds within 20 | `lesson-k-bonds-20-001` Bonds within 20 (pictorial; level 1 always splits off the ten); `lesson-k-bonds-20-002` Bond sentences within 20 (abstract) | — |
| `math.k.picture-word-problems` Picture word problems | `lesson-k-picture-story-001` Story counters (pictorial: joining and taking-away stories within 10, counters to tap, read aloud by a grown-up) | `lesson-k-picture-problems-001` Draw the story |

## Engine
- Kindergarten learners draw on **Kindergarten + Grade 1** skills (`interactiveBandsForGrade`), so counting and
  bonds to 10 remain available; prerequisites decide what unlocks: counting → teen numbers and picture stories;
  bonds to 10 + teen numbers → bonds within 20. Grade 1 learners never see Kindergarten-only lessons.
- Each K skill has two formats (concrete/pictorial and abstract, or join/take-away stories), so "secure" still needs
  independent success in two formats plus the delayed check.
- Child choices now show **variety**: the suggestion, then one lesson from each other unlocked skill (unfinished
  first), then more lessons of the same skills.

## Mistakes recognised
`TEEN_ONES_ONLY` (counts only the loose counters, forgets the ten), plus `PART_WHOLE_CONFUSION`,
`WHOLE_AS_PART`, `ADDED_PARTS`, `COUNTING_ERROR` and, for stories, `WRONG_OPERATION`, `COUNTED_TAKEN_AWAY`,
`COUNT_ON_WRONG_START`, `COUNT_BACK_WRONG_START`. A cross-cutting test checks that every lesson declares every tag
its grader can emit and that every hint fills its placeholders in both languages.

## Age-appropriate UX
Large counters and 44 px+ targets, tap-to-count, one question at a time, no timers or scores; stories are meant to be
read aloud by a grown-up (no audio yet — see limitations).

## Fixed while building
- Scattered-dot items could be tagged "forgot the full ten-frame" (there is no frame) → tag limited to ten-frames.
- Two-digit keypad answers above 20 were rejected with an error screen → any 0–99 answer is graded "not yet".
- The dashboard and curriculum views only listed Grade 1 / three bands → they follow the learner's grade and show
  every band with skills.
