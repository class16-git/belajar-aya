# ADR-0005: Mastery rules, unlocking and CPA selection
Status: accepted (heuristic — must be validated with educators)

- Score starts 0.35; independent correct +0.12, supported correct (hint or later try) +0.05, incorrect −0.08.
- **Secure** = score ≥ 0.8 AND ≥ 3 independent correct AND ≥ 2 formats → schedules a delayed check (20 h).
- **Mastered** only after an independent correct at/after the delayed check; spaced reviews at 3/7/14/30 days.
  A wrong answer at a check returns the skill to learning (never assumed).
- Dependants unlock when prerequisites are *secure* (not only mastered) so a child is not blocked for a day;
  mastery still needs the delayed check. Parent focus can pin a skill.
- Same misconception twice (since last independent success) → concrete stage at easiest difficulty, or the
  weak prerequisite. Never harder work.
- CPA: concrete when new/after errors, pictorial after any success, abstract after ≥2 consecutive independent
  correct with score ≥ 0.6. Difficulty bounded 1–3 within the skill; grade bands never jump.
- Every decision logs rule id, reason, local date, timezone, age, safety band and versions.
