# Learner identity, chronological age and adaptive developmental placement

## Initial private seed profiles
- Adek (toddler): date of birth `[private DOB]` (ISO local calendar date), toddler / Montessori early childhood. Exact age verified in private fixtures only.
- Kakak (Grade 1): date of birth `[private DOB]` (ISO local calendar date), currently Grade 1 (parent-confirmed; do not infer grade solely from age). Exact age verified in private fixtures only.
- Birth dates are private personal information about minors: only include in private development seed fixtures; do not expose in public repos, screenshots, telemetry, or third-party AI requests. Use placeholders in public demo seeds. Parents must be able to edit names, DOB, timezone, school grade and learning preferences.

## Required age calculation
1. Persist DOB as a DATE-only field, not a timestamp. Persist learner timezone as an IANA timezone, default `Asia/Jakarta`, editable by parent.
2. On each new session, server computes **current local calendar date** using a trusted server clock and learner timezone; never use a stale age recorded at onboarding. Client may display age but server decides placement.
3. Calculate exact age in completed years/months/days using calendar arithmetic (month lengths and leap years), not `days/365` or milliseconds divided by 30 days. Test birthdays, month ends, leap-day births, DST timezones, clock skew and dates in the future.
4. Recompute on session start and at learner-local midnight if session remains open. On relevant birthday transitions invalidate cached recommendations and refresh eligible content; do not interrupt an in-progress activity.
5. Log `age_at_recommendation`, `local_date`, `timezone`, `placement_version`, `curriculum_version`, `decision_reason` in privacy-restricted recommendation evidence.
6. No automatic grade promotion or forced change of learning level on birthdays. DOB informs safety bands, interface defaults and candidate lessons; demonstrated mastery, parent-approved grade and Montessori observations govern placement.
7. Avoid exact ages in analytics exports unless explicitly needed. Support account export and deletion.

## Adaptive decision hierarchy
Hard safety restrictions (especially under 3) > parent-defined boundaries and language > verified prerequisite mastery > recent evidence and confidence > age-appropriate recommendations > interests and variety. Chronological age is context, not a performance label.

### Adek (toddler): under 3
Parent-facing offline activity cards: sorting, matching, object permanence, sensory baskets, movement, practical life, oral language and simple quantity exposure. No autonomous child chat, prolonged screen sessions, performance pressure, or AI-generated unsafe physical activities. Always include supervision and choking hazard guidance. At age 3, propose new activities but require parent confirmation before introducing a different screen-use mode.

### Kakak (Grade 1): Grade 1
Begin with diagnostic, low-pressure number sense and Singapore Math CPA progressions; use ten frames, manipulatives, number bonds, simple word problems and bar-model readiness. Grade 1 placement remains until changed by parent/educator; allow prerequisite remediation or enrichment independently of age. Record Montessori observation notes alongside digital attempts.

## Recommendation pseudocode
```
localDate = dateInIanaTimezone(serverNow(), learner.timezone)
age = exactCalendarAge(learner.dob, localDate)
safetyBand = safetyPolicy(age, parentalControls)
prereqCandidates = approvedCurriculum.filter(gradeAndPrerequisitesAndSafety)
ranked = rankByMasteryGapsReviewScheduleInterests(prereqCandidates)
return { ageDisplay: age, recommendation: ranked[0], rationale, version }
```

## Acceptance tests
- Synthetic toddler DOB 2024-05-20 => 2y 5m 21d on 2026-11-10 Asia/Jakarta (real-learner case verified only in private fixtures).
- Synthetic Grade 1 DOB 2019-08-15 => 7y 2m 26d on 2026-11-10 Asia/Jakarta (real-learner case verified only in private fixtures).
- Exact birthday correctly advances age; timezone boundaries do not advance early.
- Learning recommendation adjusts after newly observed mastery and scheduled review, without changing grade automatically.
- Changing timezone or correcting DOB recalculates safely, with parent confirmation and audit entry.
- Production logs, public demo, AI prompts and screenshots contain no real child identifiers or DOB.
