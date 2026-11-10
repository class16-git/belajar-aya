# Belajar Aya — Product Vision

## North Star
Build an interactive Montessori learning environment for **Fatimah (Aya)**, age 6, gifted (IQ ~133, Biru temperament), on iPad — that helps her become:
- independent and ordered
- observant and curious
- confident with concrete → abstract reasoning
- capable of explaining her thinking
- eager to explore beyond the screen

**Core learning loop:**
```
SEE / TOUCH / MOVE
      ↓
NOTICE
      ↓
REPEAT
      ↓
DISCOVER A PATTERN
      ↓
NAME THE IDEA
      ↓
APPLY IT
      ↓
TRANSFER IT
      ↓
TEACH / EXPLAIN IT
```

## Child Profile
- Age 6, gifted ISF Montessori SD student
- iPad-first, touch-only, no keyboard
- Indonesian language primary
- Perfectionist (Copybook risk) — mantra: *Done > Perfect*
- Needs: logical explanations, private correction, process praise, challenges at her level
- Strength: analytical, logical, strong sense of fairness, needs to understand *why*

## Current State (v2)
- **Skip Counting app** — 6 stages: BUILD → JUMP → SEE PATTERN → NEXT → MISSING → DETECTIVE
- **Five Great Lessons** — 5 lessons × 4–5 experiences each, fully interactive
- **Platform:** GitHub Pages, single HTML files, offline-capable
- **No gamification** — no points, no streaks, no timers, no leaderboards
- **Progress:** localStorage per experience, parent panel

## Gaps vs. Framework
| Framework Requires | Current State | Priority |
|---|---|---|
| Practical Life experiences | None | Medium |
| Sensorial experiences | None | Medium |
| Language experiences | None | High |
| Full Mathematics (0-10, decimal, ops) | Skip counting only | High |
| Cultural Studies | Five Great Lessons partial | Medium |
| Offline missions per activity | None | High |
| Child profile/progress model | Basic localStorage | Medium |
| Accessibility audit | None | High |
| Content schema (structured) | Inline HTML | Medium |
| 7-10 maturity iterations | 0 formal cycles | High |

## Non-Goals (per framework)
- No account / cloud identity
- No behavioral tracking
- No leaderboards or loot mechanics
- No replacing physical Montessori materials
- No passive video content

## Platform
- iPad Safari (primary)
- Single HTML files — no build step, no framework overhead
- Works offline (service worker future)
- GitHub Pages deployment
- Google Fonts CDN

## Philosophy
This is **not** a worksheet app wearing Montessori colors.
Every interaction must have: manipulation, self-correction, isolation of difficulty, concrete-to-abstract progression, child agency, offline transfer.
