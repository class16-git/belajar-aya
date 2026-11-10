# ADR-0003: Curriculum content is versioned JSON in the repo, not database rows
Status: accepted

**Decision.** Skills and lessons live in `content/**` and are validated (Zod, prerequisite DAG, publication gate)
by tests, CI and at server start (fail closed). The database stores only ids plus `contentVersion`,
`generatorVersion` and `curriculumVersion` on every activity/recommendation for traceability. The `Skill`,
`Lesson` and `Activity` tables in the spec's entity list are therefore represented by content files +
`ActivityInstance`.

**Why.** Reviewable diffs, PR-based human review, no seed drift between environments, simpler rollback.
**Revisit** when an authoring console (Phase 2) needs runtime editing.
