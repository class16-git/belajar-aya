# Cycles 4–7 Ready to Fire

## CYCLE 4 — Practical Life + Sensorial
**Scope:** Add 4 Practical Life experiences (pouring, tong transfer, buttoning, handwashing) and 3 Sensorial (pink tower, brown stairs, sound cylinders). These are the Montessori foundation exercises that prepare the hand and eye for math and language. Each has: demonstration video embed (YouTube iframe, muted), step-by-step instruction, self-check. Purely motor/sensory — no reading required.

**Trigger:** After cycles 2+3 QA return clean.

---

## CYCLE 5 — Language Experiences  
**Scope:** Add Montessori language pre-reading experiences: (1) Sandpaper letters — tap to hear sound, see movement pattern. (2) Movable alphabet — drag letter shapes to spell simple CVC words from a word family. (3) Picture dictation — child draws then labels with moveable letters. All Indonesian phonograms where applicable. IPA/BAHASA phoneme mapping needed.

**Trigger:** After cycle 4 deployed.

---

## CYCLE 6 — Math Expansion (Skip Counting → Full Math)
**Scope:** Expand the skip-counting app (index.html) from just skip counting to full Montessori math: (1) Number rods (1-10 visual). (2) Spindle box (quantity vs symbol). (3) Cards and counters (1-10 arranged). (4) Teen board (11-19 construction). (5) Tens board (20-99). (6) Decimal system (1 → 10 → 100 → 1000 operations). These build ON the skip counting foundation already laid.

**Trigger:** After cycle 5 deployed.

---

## CYCLE 7 — Cultural Studies + Service Worker
**Scope:** (1) Cultural extensions for each Great Lesson — globe work, continent maps, flags, landforms. (2) Service worker for offline PWA capability. (3) Parent facilitation guide — printable offline activity cards with QR codes linking to app experiences.

**Trigger:** After cycle 6 deployed.

---

## CYCLE 8 — Real-Child Testing
**Scope:** Coordinated test session with Aya (and ideally 1-2 other children). Document: time-on-task per experience, confusion points (where does she stop and wait?), verbal questions she asks, what she finds boring. Incorporate Ibu Fildzah observation notes. Update ITERATION_LOG with findings.

**Trigger:** After cycle 7 deployed. Requires Ayah/Ibu present.

---

## CYCLE 9 — Polish + Regression
**Scope:** Full regression test across all 3 apps (index.html, five-great-lessons.html, + any new files). Performance optimization (lazy load large experiences). Error boundary — graceful degradation if JS fails. Loading states for slow renders. Analytics-ready event hooks (not yet active, but structured for future).

**Trigger:** After cycle 8 findings incorporated.

---

## CYCLE 10 — First Meaningful Release
**Scope:** Final QA by Codex. Package all apps for distribution. Write README with setup instructions. Generate share link for family/testing group. Set version tag v1.0.0. Release readiness scorecard — must hit 6/10 to ship.

**Trigger:** After cycle 9 clean.

---

## BLOCKER: iPad Real-Device Test
This must happen at least once before Cycle 10. Specifically:
1. BUILD game drag-drop — do dots land in baskets?
2. Pattern Discovery number board — do taps register?
3. Five Great Lessons offline mission — does Aya understand the activity?

If any of these fail on real iPad hardware, fix before Cycle 8.
