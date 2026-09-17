# QA Log — Codex Independent Reviews
## Belajar Aya Montessori Learning

Format per finding:
```
ID | SEVERITY | CATEGORY | EVIDENCE | WHY IT MATTERS | RECOMMENDED CHANGE | ACCEPTANCE TEST | STATUS
```

---

## Pre-Adoption Audit (Before Cycle 1)
**Auditor:** Ichi (baseline review)
**Date:** 2026-09-17

### Skip Counting v2 (index.html)

| # | Severity | Category | Issue | Fix | Test | Status |
|---|----------|----------|-------|-----|------|--------|
| 1 | HIGH | Engineering | `startApp()` never called on body onload — app didn't start | Added `onload="startApp()"` to body | Load page, home screen appears | FIXED |
| 2 | HIGH | Engineering | `initPattern()` never defined — calling undefined function | Added `initPattern()` + `renderPattern()` | Tap "Lihat Pola Piko" — experience loads | FIXED |
| 3 | HIGH | Engineering | Missing game localStorage save used `size` instead of `state.missing.size` | Patched to `state.missing.size` | Complete missing number game, refresh, progress loads | FIXED |
| 4 | HIGH | Engineering | Choice buttons colored by live state not captured roundSize | Patched to use `state.next.roundSize` and `state.missing.roundSize` | Render a round, check button color matches game size | FIXED |
| 5 | HIGH | UX | Piko hop CSS arc broken on iPad (CSS `--from-x` overflow) | Replaced with `transition: left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)` | Watch Piko hop — smooth arc, no jitter | FIXED |
| 6 | HIGH | UX | Missing distractors always smaller than correct answer | Changed to bi-directional distractors (direction = random < 0.5 ? 1 : -1) | Play missing number game, see distractors both above and below | FIXED |
| 7 | MEDIUM | UX | Confetti fires on every tap, not just meaningful completion | Confetti now only on correct completion | Watch — confetti only on correct answer | FIXED |
| 8 | MEDIUM | UX | Praise messages: "Aya jenius!", "Pintar!" | Replaced with pattern-reasoning messages | Play games, praise messages focus on process/pattern | FIXED |
| 9 | MEDIUM | Engineering | Intro screen HTML existed but no JS to show it | Added `initIntro()` and intro flow in `startApp()` | Fresh load shows intro before home | FIXED |
| 10 | MEDIUM | Engineering | Pattern Discovery screen existed but no JS logic | Added `initPattern()` + `renderPattern()` | Tap "Lihat Pola Piko", board renders | FIXED |
| 11 | LOW | UX | Dot animation 30ms delay caused jank on low-end iPad | Changed to 5ms delay | Smooth dot cascade on all iPad generations | FIXED |
| 12 | LOW | UX | Active/highlighted choice colors indistinguishable | Made active = gold, highlighted = green | Both colors visually distinct | FIXED |
| 13 | LOW | UX | Dead code: `state.jump.size = state.jump.size` | Removed | No functional impact | FIXED |
| 14 | LOW | Content | Mixed Indonesian/English parent panel label | Fixed to Indonesian | Parent panel all-Indonesian | FIXED |
| 15 | MEDIUM | Engineering | iPad Safari BUILD game: setPointerCapture causes pointerup.clientX=0 | Rewrote drag system with lastX/lastY tracking in pointermove, touchend fallback | Drag dots on iPad Safari — dots land correctly | UNVERIFIED — needs real iPad |

### Five Great Lessons (five-great-lessons.html)

| # | Severity | Category | Issue | Fix | Test | Status |
|---|----------|----------|-------|-----|------|--------|
| F1 | HIGH | UX | Confetti on every tap — not just meaningful completion | Confetti now fires only on meaningful completions | Confetti only appears on learning milestones | FIXED |
| F2 | MEDIUM | UX | No offline mission prompts ("Try this in real life!") | Add to every experience | Each experience has a real-world extension prompt | **PENDING** |
| F3 | MEDIUM | UX | No child profile (name/avatar) | Add profile screen to localStorage | Child can set their name and see it | **PENDING** |
| F4 | MEDIUM | UX | Parent panel lacks offline extension suggestions | Add offline mission text to each experience | Parent panel shows what to do offline | **PENDING** |
| F5 | LOW | UX | No "Lima Pelajaran" link on skip counting home screen | Add CTA to five-great-lessons.html | Link visible on homepage | **PENDING** |
| F6 | MEDIUM | Engineering | Accessibility: no keyboard navigation alternatives | Add keyboard support (Tab, Enter, Arrow keys) | Can navigate app without touch | **PENDING** |
| F7 | MEDIUM | Content | Some Indonesian text has Cyrillic/Russian character artifacts | Clean text: "появились" → "muncul" | All text purely Indonesian | PARTIAL |
| F8 | LOW | Engineering | No content schema — all experience data is inline HTML | Plan migration to JSON data files | Data-driven content, not hardcoded | **PENDING** |

---

## Cycle 1 Findings
[tbd — to be filled after Codex review]

---

## Release Readiness
**Current Score:** ~2/10 (functional but immature)
**Target:** 6/10 before first meaningful release
**Blockers:**
- iPad pointer bug unverified
- No offline missions
- No accessibility baseline
- No content schema
- Child profile missing
