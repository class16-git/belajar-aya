# Slice A extension: age 3–4 caregiver-led cards (review guide)

Status: **implemented, agent-checked, awaiting human content review.** Hidden in production until approved.

Every non-Islamic age 3–4 objective now has a printable, bilingual (EN/ID) offline card. Islamic objectives for
this age stay blocked on the owner decisions and qualified religious review (ADR-0010).

| Card | Objective | Framework |
|---|---|---|
| `lesson-pre-dress-001` Big-button practice | `mont.age3_4.dressing` | Montessori |
| `lesson-pre-sounds-001` I spy a first sound | `mont.age3_4.sound-games` | Montessori |
| `lesson-pre-prewrite-001` Pegs and finger tracing | `mont.age3_4.prewriting` (physical safety flag) | Montessori |
| `lesson-pre-3period-001` Rough, smooth, soft | `mont.age3_4.three-period` | Montessori |
| `lesson-pre-count10-001` Counting into the egg box | `math.age3_4.count-10` | Maths |
| `lesson-pre-pattern-001` Spoon, fork, spoon, fork | `math.age3_4.ab-patterns` | Maths |
| `lesson-pre-shapes-001` Shape hunt | `math.age3_4.shapes-2d` | Maths |
| `lesson-pre-length-001` Which is longer? | `math.age3_4.compare-lengths` | Maths |
| `lesson-robo-ramps-001` Ramp races | `robo.age3_4.ramps-balance` (physical safety flag) | Robotics/STEM |

(The existing `lesson-robo-arrows-001` covers `robo.age3_4.arrow-paths`.)

## Safety rules applied to every card
- Adult within arm's reach; stop when interest fades.
- Only objects bigger than the child's fist; no choking-hazard materials (`hazards.chokingRisk: false`, tested).
- Adult does any cutting; blunt plastic forks only; low ramps on the floor; nothing around necks.

## When a learner sees them
Only for a learner aged 3 or older **after the parent confirms the age transition** on the dashboard
(E2E-tested: the same 3-year-old gets no age 3–4 cards before confirmation).

## Approve when happy
`pnpm content:approve -- --reviewer "<initials>" --role parent lesson-pre-dress-001 lesson-pre-sounds-001 lesson-pre-prewrite-001 lesson-pre-3period-001 lesson-pre-count10-001 lesson-pre-pattern-001 lesson-pre-shapes-001 lesson-pre-length-001 lesson-robo-ramps-001 lesson-robo-arrows-001`

Evidence: `packages/curriculum/src/curriculum-bible.test.ts`, `apps/web/e2e/slice-a.spec.ts`, screenshots
`artifacts/screenshots/{mobile,tablet}-6{0,1}-*.png`.
