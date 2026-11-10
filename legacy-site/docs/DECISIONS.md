# Decisions

## Architecture
1. **Single HTML files** — no framework, no build step. Chosen for simplicity, portability, and GitHub Pages compatibility.
2. **Inline CSS/JS** — all in one file per app. No bundling.
3. **Vanilla JS only** — no React/Vue/Svelte. Keeps it dependency-free.
4. **Web Speech API** — TTS for Piko narration. No external audio assets.
5. **localStorage** — progress persistence. No cloud, no account.

## Content
6. **Indonesian throughout** — Aya's native language, Fildzah's comfort language.
7. **No timers, no leaderboards** — Montessori-aligned. No streak pressure.
8. **Emoji-first visuals** — no image assets needed, works offline.
9. **Process praise only** — "Hebat! Kamu menemukan polanya!" not "Pintar!"
10. **Skip counting first** — Numbers lesson, CPA progression (Concrete → Pictorial → Abstract).

## Five Great Lessons
11. **Wonder before information** — story screen before any activity.
12. **Experiences not quizzes** — interactive demos, not multiple-choice tests.
13. **Classification is open** — no wrong answers in classify/sort activities.
14. **One dominant idea per screen** — isolation of difficulty.
15. **Offline transfer prompts** — "coba di dunia nyata!" included in each activity.

## What Was Rejected
- ❌ Points/scores per session
- ❌ Leaderboards
- ❌ Daily streak notifications
- ❌ Loot boxes / rewards
- ❌ Timed challenges
- ❌ Comparing Aya to other children
- ❌ External analytics / tracking

## Pending Decisions
- [ ] Practical Life activities: which specific missions?
- [ ] Language activities: movable alphabet implementation approach
- [ ] Service worker for full offline — complexity vs. value?
- [ ] Multi-child profiles — or stay single-child?
- [ ] Content schema migration — from inline HTML to JSON data files?
