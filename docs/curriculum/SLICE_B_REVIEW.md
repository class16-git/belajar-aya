# Slice B: Grade 1 addition & subtraction within 10, and bar-model stories (review guide)

Status: **implemented, agent-checked, awaiting human content review.** Nothing in this slice is visible in
production until you approve it. Previews (synthetic data only) show it.

Objectives: `math.g1.add-sub-10` (skills `MATH-G1-ADD-10`, `MATH-G1-SUB-10`) and `math.g1.word-problems-1`
(`MATH-G1-WORD-1`).

## Lessons (bilingual EN/ID, `reviewStatus: agent_reviewed`)

| Lesson | CPA | Generator | What the child sees |
|---|---|---|---|
| `lesson-g1-add-10-001` Add with counters | concrete | `add-counters` | Ten-frame with two groups (second group ringed, not colour-only); tap to count |
| `lesson-g1-add-10-002` Add with a number bond | pictorial | `add-bond` | Both parts known, whole is "?" |
| `lesson-g1-add-10-003` Addition sentences | abstract | `add-equation` | `4 + 3 = □`; at the hardest level, also `3 + □ = 9` |
| `lesson-g1-sub-10-001` Take away counters | concrete | `sub-takeaway` | Ten-frame; taken counters are crossed out (✕) and cannot be counted |
| `lesson-g1-sub-10-002` Subtract with a number bond | pictorial | `sub-bond` | Bond (whole + one part) beside `8 − 3 = □` |
| `lesson-g1-sub-10-003` Subtraction sentences | abstract | `sub-equation` | `8 − 3 = □`; at the hardest level, also `9 − □ = 4` |
| `lesson-g1-word-1-001` Story problems with bar models | pictorial | `bar-model-story` | Original one-step story (6 contexts × join/take-away) with a scaled bar model |

Every lesson has a 5-step hint ladder (H0 restate → H1 attention → H2 manipulative/diagram shown → H3 targeted
strategy → H4 worked example, then a new item), parent notes, and an offline equivalent card for the adult.

## Ranges (property-tested, 3,000+ random items per check)
- Addition: both addends ≥ 1, totals ≤ 5 / 4–8 / 6–10 by difficulty.
- Subtraction: wholes 3–5 / 5–8 / 6–10; never takes away 0 or everything; answers 1–10.
- Stories: both numbers ≥ 2 (so English never reads "1 apples"); difficulty 1 is mostly joining stories.
- Missing-part sentences only at difficulty 3 and recorded as their own format.

## Misconceptions detected server-side
| Tag | Example | Child feedback |
|---|---|---|
| `COUNT_ON_WRONG_START` | 4 + 3 → 6 ("4, 5, 6") | Say the first number, then count one more for each |
| `COUNT_BACK_WRONG_START` | 8 − 3 → 6 ("8, 7, 6") | Start at the whole, one step back for each taken |
| `WRONG_OPERATION` | 8 − 3 → 11; 4 + 3 → 1; take-away story answered by adding | Are we putting together, or taking away? |
| `COUNTED_TAKEN_AWAY` | 8 − 3 → 3 | That is how many were taken away |
| `PART_WHOLE_CONFUSION`, `WHOLE_AS_PART`, `ADDED_PARTS` | missing-part forms | (existing wording) |
| `COUNTING_ERROR` | off by one | Count again, one at a time |

Two of the same tag in a row sends the child back to concrete work, or to the weak prerequisite (for example,
repeated `WRONG_OPERATION` in stories while subtraction is not secure → concrete take-away).

## Sequencing (golden traces in `packages/adaptive/src/engine.test.ts`)
- Addition and subtraction unlock when number bonds are secure, and start with counters (concrete).
- "Secure" still needs ≥ 3 independent correct answers in ≥ 2 formats, then a delayed check before "mastered".
- Story problems unlock only when **both** addition and subtraction are secure; a parent focus cannot skip this.
- Joining and taking-away stories count as two formats, so the single story lesson can reach "secure".

### Bible unit structure (diagnostic → practice → transfer → exit)
This maps onto the existing engine rather than a new fixed-length unit: the first items act as the diagnostic,
CPA progression gives varied practice, the story lesson is the transfer task, and the independent first-try
evidence plus the delayed check act as the exit. A strict 3 / 6 / 1 / 2 unit would change session length for all
Grade 1 lessons, so it is left as an owner decision.

## What you need to check
1. Open each lesson in **Curriculum → review queue** (or the preview link) and read both languages.
2. Check the story contexts (`apps/web/src/lib/i18n/en.ts` and `id.ts`, `learn.story`) read naturally in Indonesian.
3. Approve when happy:
   `pnpm content:approve -- --reviewer "<initials>" --role parent lesson-g1-add-10-001 lesson-g1-add-10-002 lesson-g1-add-10-003 lesson-g1-sub-10-001 lesson-g1-sub-10-002 lesson-g1-sub-10-003 lesson-g1-word-1-001`

## Evidence
- Unit: generator range, determinism, answer/evaluator agreement, choice validity, misconception tags declared on
  each lesson, hint placeholders filled in both languages, golden grader cases.
- E2E (`apps/web/e2e/slice-b.spec.ts`): one session per lesson on phone and tablet (wrong answer → tagged
  attempt → hint → supported correct, never "independent"), axe WCAG 2.1 AA, no horizontal scroll, ≥ 44 px
  targets; story lock; next-up recommendation; Indonesian story rendering.
- Screenshots: `artifacts/screenshots/{mobile,tablet}-5{0..6}-*.png`.

## Fixed along the way
Pressing "I need help" after a wrong keypad answer used to keep the wrong digits in the answer box, so the next
digit was appended (for example "4" then "3" became "43") and the answer was rejected. The box is now cleared,
as "Try again" already did. This affected the existing `bond-equation` lesson too.
