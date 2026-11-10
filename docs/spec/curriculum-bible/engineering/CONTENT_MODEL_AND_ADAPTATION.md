# Content data model, authoring pipeline and adaptive logic

## Proposed normalized entities
`CurriculumFramework` → `Strand` → `Stage` → `LearningObjective` → `Lesson` → `Activity` → `AssessmentItem` → `ReviewRecord` → `Publication`.

## Lesson required fields
`id`, `version`, `title`, `locale`, `framework_tags`, `stage_min`, `stage_max`, `grade_tags`, `objective_ids`, `prerequisites`, `materials`, `duration_minutes`, `screen_mode`, `offline_equivalent`, `instruction`, `worked_examples`, `item_generator_id`, `answer_key_server_only`, `misconceptions`, `hint_ladder`, `accessibility`, `safety_flags`, `content_sources`, `copyright_status`, `educator_review`, `religious_review` (if applicable), `parent_approval`, `publication_status`.

## Adaptive decision rules
1. Read server-trusted profile settings, exact age in configured timezone, grade, consent and learning accommodations.
2. Apply safety and parent-configured screen-time policy first; invalidate previously active items if policy changes.
3. Filter by approved publication, framework, prerequisites, grade band and age-appropriate presentation.
4. Rank eligible lessons by mastery evidence, spaced-review due dates, parent focus and variety. Parent focus cannot unlock prerequisites.
5. Present concrete before pictorial before abstract, unless diagnostic evidence supports entry at a later representation.
6. Grade and update mastery server-side in atomic transactions; double submits, hints and retries must be idempotent or version guarded.
7. Recommend offline manipulatives and parent observation; do not use time-on-screen as a success metric.
8. Never send learner names, DOBs, notes, email or raw answers to third-party AI by default.

## Example JSON lesson (synthetic)
```json
{
  "id": "math-g1-bonds-10-001",
  "title": "Make Ten with Counters",
  "framework_tags": ["montessori-informed", "singapore-cpa"],
  "stage_min": "G1", "stage_max": "G1", "grade_tags": [1],
  "objective_ids": ["G1-MATH-BOND10"],
  "prerequisites": ["K-COUNT-10"],
  "materials": ["10 counters", "two bowls"],
  "duration_minutes": 8,
  "screen_mode": "blended",
  "offline_equivalent": "Split ten counters into two groups and explain the parts.",
  "publication_status": "draft",
  "copyright_status": "original"
}
```

## QA
Content schema validation; mathematical property tests; safety checks; no answer-key leaks; no publication without required approvals; child-mode and cross-family API isolation; snapshot/visual checks on phone and tablet; bilingual translation QA; Arabic text rendering; scholar signoff for Islamic content.
