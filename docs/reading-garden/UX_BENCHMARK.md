# Reading Garden — UI/UX benchmark review (2026-11-10)

**Method and limits.** This is a heuristic desk review against widely known interaction *principles* of four
reference products, using Atlas screenshots captured by the automated browser tests (phone 390 px, tablet 820 px).
The reviewer did not use the reference apps hands-on in this session, and no art, layout, character, wording or
animation from them was copied. Owner UX acceptance is a separate gate.

| Principle (reference) | What the reference is known for | Atlas Reading Garden | Verdict |
|---|---|---|---|
| Interaction clarity (Synthesis) | One clear task at a time, visible reasoning, no clutter | Passage on the left, questions on the right (stacked on phones); one primary button; feedback points to the evidence paragraph instead of revealing the answer | Meets |
| Scaffolded progression (KooBits) | Small steps, hints before answers, levelled content | Journeys by stage with five strands; listening and decoding rated separately; "look again at paragraph n" scaffold | Meets for comprehension; no levelled hint ladder for reading yet |
| Intuitive reading progression (Khan Academy Kids) | Child picks from a curated shelf, adult controls breadth | Child sees only books a parent placed on *their* shelf, plus practice for their stage; parent controls breadth, hides titles, turns links off | Meets |
| Age-appropriate delight (BabyBus) | Bright, friendly, big targets | Calm palette by design (Montessori, no over-stimulation); original covers with simple motifs; large type and 44 px+ targets | Deliberately calmer; meets "age-appropriate", trades excitement for focus |
| No dark patterns | — | No streaks, points, leaderboards, timers or comparisons; "I finished it" gives recognition and a prompt to talk with a grown-up | Meets (tested in i18n copy rules) |
| Safety at the edges | — | Parent interstitial names the external host; child PIN gate; nothing opens inside Atlas frames | Meets |
| Accessibility | — | axe WCAG 2.1 AA: 0 violations on every Reading Garden page tested; visible focus; labelled forms; covers are decorative with titles as text; reduced-motion honoured by the child shell | Meets baseline; screen-reader walkthrough by a person still recommended |
| Bilingual | — | Full EN/ID UI and passages; books state their edition language and do not pretend to be bilingual | Meets |

## Defects found during visual QA and fixed
1. Book covers stretched to card height and left white bands; cover titles too small to read → covers now keep
   their own height and use larger type.
2. Book cards said "Open card" (activity-card wording) → "View book".
3. Child shelf links had an `aria-label` that did not match the visible title (axe `label-content-name-mismatch`)
   → visible title is the accessible name.
4. "Answer every question first" stayed visible after answering; question titles overlapped card borders → message
   clears on change; legends sit inside their cards.
5. Pre-existing (found while building slice B): keypad answers kept old digits after "I need help" — fixed earlier.

## Recommendations (not blocking)
- Add Indonesian-language external books as soon as Let's Read or StoryWeaver is verified (biggest content gap).
- Optional "comfortable reading" toggle (larger spacing, alternative font) for early readers — without dyslexia
  claims.
- A per-stage hint ladder for comprehension (re-read sentence → highlight keyword → worked example).
- Owner/educator review of the 7 passages for cultural fit and reading level.
