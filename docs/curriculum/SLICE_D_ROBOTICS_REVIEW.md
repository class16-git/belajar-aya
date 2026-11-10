# Slice D: Grade 1 unplugged robotics (review guide)

Status: **implemented, agent-checked, awaiting human content review.** Hidden in production until approved.

| Item | Objective | Mode | Assessment |
|---|---|---|---|
| `lesson-robo-g1-trace-001` Where will the robot stop? | `robo.g1.debug-path` | on screen (pictorial) | server-graded, misconception tags |
| `lesson-robo-g1-debug-001` Fix the robot's path | `robo.g1.debug-path` | on screen (abstract) | server-graded, misconception tags |
| `lesson-robo-g1-grid-001` Floor-grid robot | `robo.g1.grid-robot` | printable card | 4-line rubric (plans, predicts, debugs, explains) |
| `lesson-robo-g1-sensors-001` Light and touch detectives | `robo.g1.sensors-observe` | printable card | portfolio (sensor notebook) |

## On-screen activities
- **Trace:** an arrow program on a 4×4 grid (5×5 at the hardest level) of 2–5 steps; the child picks which of four
  numbered stars the robot stops on. Distractors model real slips: stopping one step early, swapping left/right.
- **Debug:** the program should reach the flag but one arrow is wrong. The generator guarantees **exactly one**
  step can be changed to reach the flag (property-tested over 1,000 random puzzles), so there is never a second
  correct answer. Picking a neighbouring step is tagged.
- Paths never revisit a square and never leave the grid. Arrows are absolute (up/down/left/right), which suits
  6-year-olds better than robot-relative turns. Robot, stars and flag are different shapes, not colours only;
  screen readers hear the grid and "Step 2: left".
- Hints escalate to a dotted line showing where the program really goes.
- New tags: `TRACE_STOPPED_EARLY`, `LEFT_RIGHT_CONFUSION`, `DEBUG_ADJACENT_STEP`.

## Sequencing
Robot activities unlock once counting to 20 is secure (counting steps is part of the task), start with tracing,
and need both tracing and debugging success to become secure. Engine fix: when a skill has no concrete lesson, the
engine now falls back to the *nearest* stage above (pictorial before abstract) instead of whichever file sorts first.

## Physical safety (cards)
Floor grid away from stairs, walk don't run, adult does all cutting; never shine a torch into eyes; adult holds
the phone; torch battery cover screwed shut (button batteries). Both cards carry the `physical_safety` flag.

## Approve when happy
`pnpm content:approve -- --reviewer "<initials>" --role parent lesson-robo-g1-trace-001 lesson-robo-g1-debug-001 lesson-robo-g1-grid-001 lesson-robo-g1-sensors-001`

Evidence: `packages/assessment/src/slice-d.test.ts`, `packages/adaptive/src/engine.test.ts` (slice D traces),
`apps/web/e2e/slice-d.spec.ts`; screenshots `artifacts/screenshots/*-7{0,1,2}-*.png`.
