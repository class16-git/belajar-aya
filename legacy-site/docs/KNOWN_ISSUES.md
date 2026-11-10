# Known Issues
## Belajar Aya — Active and Resolved

---

## Unresolved

| # | Severity | Category | Issue | Mitigation | ETA |
|---|----------|----------|-------|-----------|-----|
| K1 | HIGH | Engineering | iPad Safari BUILD game: setPointerCapture causes pointerup.clientX=0 — dots don't visually land | lastX/lastY tracking patch applied; needs real iPad verification | Cycle 1 |
| K2 | HIGH | Accessibility | No keyboard navigation — tab order, focus rings, arrow keys | Not started | Cycle 2 |
| K3 | MEDIUM | Content | Content schema: all experience data hardcoded in HTML | Migration to JSON data files planned | Cycle 3+ |
| K4 | MEDIUM | Engineering | No service worker for offline use | Architecture designed, implementation deferred | Cycle 4 |
| K5 | MEDIUM | UX | Five Great Lessons experiences have no "curiosity routing" — child can't branch to related content after completing | Per-framework: each experience should ask "Apa yang kamu penasaran?" and route | Cycle 3 |
| K6 | LOW | UX | No child profile persistence across sessions (future sessions start fresh) | Profile screen planned | Cycle 1 |

---

## Resolved This Session

| # | Resolution |
|---|-----------|
| R1 | `startApp()` never called — added `onload="startApp()"` to body |
| R2 | `initPattern()` undefined — added `initPattern()` and `renderPattern()` |
| R3 | Missing game localStorage wrong key — fixed to `state.missing.size` |
| R4 | Choice buttons colored by live state — fixed to captured roundSize |
| R5 | Piko hop CSS arc broken on iPad — replaced with cubic-bezier transition |
| R6 | Missing distractors always smaller — changed to bi-directional |
| R7 | iPad pointer capture coordinate bug — rewritten drag with lastX/lastY tracking |
| R8 | Praise messages: "Aya jenius!", "Pintar!" — replaced with pattern-reasoning messages |
| R9 | Intro screen had no JS — added `initIntro()` flow |
| R10 | Pattern Discovery screen had no JS — added full initPattern/renderPattern |
| R11 | Homepage no link to Five Great Lessons — added CTA button |
| R12 | No Five Great Lessons app — built 103KB app with 22 experiences, all Indonesian |
| R13 | No product docs — added: PRODUCT_VISION, CURRICULUM_ALIGNMENT, DECISIONS, ITERATION_LOG, QA_LOG |
| R14 | Montessori framework adopted — full 23-file doc set saved to vault and docs/ |
