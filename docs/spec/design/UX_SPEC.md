# UX and interaction specification

## Product style
Calm, warm, Montessori-inspired visual language: neutral background, tactile material colors, restrained animations, high legibility, generous spacing, minimal chrome. **Original design**, not a reproduction of Synthesis screenshots.

## Child Grade 1 learning screen
- Header: objective in plain language, optional audio and parent-controlled pause/exit.
- Center-left: large interactive concrete/pictorial model (ten-frame, counters, number line, number-bond circles).
- Center-right/below: one question, 2–4 answer options or number entry, "I need help" and "Check".
- Feedback: gentle, precise and actionable; if wrong, show representation and allow another attempt.
- Never autoplay endless next problems; offer clear finish after a short set.

## Toddler parent card
- Objective, preparation time, safe materials, steps, example adult wording, observation cues, cleanup, and "repeat another day".
- Print mode in A4 and letter paper.
- Child-facing display optional and never required for successful completion.

## Parent dashboard
- Per-child overview: active domains, mastered/in progress/due review, recent misconceptions and recommended offline activities.
- Skill map with prerequisite links and evidence drill-down.
- Session controls: target minutes, allowed subjects, audio, locale, accessibility, AI enabled/disabled.
- Privacy center: consent, export, delete and model usage disclosure.

## Design tokens (starting point, adjust through testing)
- Spacing: 4/8/12/16/24/32 px scale.
- Touch target: at least 44×44 CSS px, preferably larger for child controls.
- Typography: highly legible sans serif, 18–24px body in child mode, responsive scaling.
- Contrast: target WCAG AA; do not convey correctness through color alone.
- Animation: <300ms subtle transitions, honor reduced-motion preference.

## Screen inventory
1. Parent sign-in and consent
2. Family onboarding
3. Child profile selector
4. Parent dashboard
5. Curriculum explorer
6. Child lesson selection
7. Grade 1 activity runner
8. Hint and feedback states
9. Session summary
10. Toddler activity card and print view
11. Parent observations
12. Privacy/settings

## Microcopy examples
- EN: "Let's make 10. How many more counters do we need?"
- ID: "Ayo buat jumlahnya jadi 10. Perlu berapa keping lagi?"
- EN: "Try placing the counters in the empty spaces."
- ID: "Coba letakkan keping di kotak yang masih kosong."
- Avoid: "Wrong!", "Too slow!", public rank, fake praise.

## Accessibility and internationalization
All visible strings via locale keys, not hard-coded JSX. Support EN/ID and adjustable audio. Use semantic controls, keyboard support for parent mode, screen-reader labels and device-size testing (tablet portrait, mobile portrait, desktop).
