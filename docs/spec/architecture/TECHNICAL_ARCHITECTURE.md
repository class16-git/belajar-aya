# Technical architecture and repository design

## Recommended stack
- Monorepo: pnpm + Turborepo; TypeScript strict mode.
- Frontend: Next.js App Router + React + Tailwind CSS + accessible component primitives.
- Backend: Next.js server routes for MVP, separate domain services/modules; Zod input validation.
- Database: PostgreSQL + Prisma ORM with row ownership enforced server-side (consider Postgres RLS as defense in depth).
- Authentication: mature managed auth provider with parent-only accounts and child profiles (no child email required).
- Content: versioned JSON/YAML authored in repository, schema-validated in CI, imported via idempotent seed.
- Tests: Vitest (unit), Playwright (E2E), axe accessibility checks, property-based tests for generators.
- Deployment: Vercel or equivalent + managed Postgres, region chosen by parent after privacy review.
- AI: server-side adapter interface with provider-independent contracts; disabled by default.

## Target application tree (Claude Code to create)
```text
apps/web/
  app/(parent)/dashboard/ ...
  app/(child)/learn/ ...
  app/api/ ...
  components/learning/{ten-frame,number-bonds,bar-model,manipulatives}/
packages/
  curriculum/       # schema, skills, lessons, translations
  adaptive/         # deterministic decision engine
  assessment/       # grading, misconception classifier
  database/         # Prisma schema, migrations, seeds
  ui/               # design tokens, accessible primitives
  ai/               # guarded optional provider adapter
  shared/           # types, auth and validation
content/
  toddler/ preschool/ kindergarten/ elementary/g1/ ...
tests/ e2e/ scripts/ docs/
```

## Core entities
- ParentUser(id, authProviderId, locale, createdAt)
- Family(id, ownerId, settingsJson, consentVersion)
- ChildProfile(id, familyId, displayNameOrNickname, birthMonthYearOptional, level, locale, accessibilityPrefs)
- Skill(id, domain, band, prerequisites[], metadata, version)
- Lesson(id, skillId, mode, cpaStage, contentVersion, reviewStatus)
- Activity(id, lessonId, generatorVersion, presentationJson)
- Attempt(id, childId, skillId, activityId, answerJson, correct, hintCount, misconceptionCodes[], createdAt)
- MasteryState(childId, skillId, score, confidence, lastEvidenceAt, nextReviewAt, modelVersion)
- ParentObservation(id, childId, skillId, note, observedAt)
- ConsentRecord(id, familyId, version, grantedAt, revokedAt)
- AuditEvent(id, actorId, action, targetType, createdAt)

## APIs
- `GET /api/skills?childId=` returns eligible curated skills, authorization required.
- `POST /api/activities/next` returns one activity with no answer key in client payload.
- `POST /api/attempts` grades on server and returns safe feedback + hint progression.
- `GET /api/parent/progress?childId=` returns explainable progress and evidence.
- `POST /api/parent/observations` records offline evidence.
- `GET /api/parent/export` produces portable JSON; `DELETE /api/parent/family` starts verified deletion.
- All routes require ownership checks, rate limits, input validation and audit where appropriate.

## Security boundaries
- Child mode is a limited UI session scoped to one child profile; parent controls require fresh parent authentication/PIN.
- Never trust client-submitted `correct` or mastery scores.
- Keep answer keys, AI API keys and parental data server-side.
- Avoid third-party trackers and ad SDKs.
- Protect against IDOR by checking family ownership on every query.
- Encryption in transit and at rest; backups with retention and deletion policies.

## Offline/PWA strategy
- Cache static UI and approved printable cards only initially.
- Queue offline observations locally only if parent opts in; encrypt or avoid sensitive storage.
- Resolve sync conflicts via append-only attempts and server reconciliation.

## Observability
- Track API errors, item-generation validation failures, crash rates and content-version drift.
- Do not collect raw child free-text responses in analytics vendors.
- Log model versions, curriculum versions and rule IDs for recommendation traceability.

## Engineering gates
`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, curriculum schema validation, security scan and accessibility checks must pass before merge.
