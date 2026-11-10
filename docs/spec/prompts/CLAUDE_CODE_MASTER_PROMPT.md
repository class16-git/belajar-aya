# Claude Code master implementation prompt

You are the principal engineer, product designer and learning-platform architect implementing **Project Atlas — Family Learning OS** in this GitHub repository.

## Mandatory context
Read `README.md` and every document under `docs/`, plus curriculum schema and samples. Treat these as the product source of truth. The target learners are a 2.5-year-old (parent-led offline Montessori activities) and a 7-year-old Grade 1 student (interactive Singapore Math + Montessori). Support Bahasa Indonesia and English. Build an original product inspired by adaptive tutoring patterns; do not copy proprietary Synthesis content or design.

## Working style
Be proactive, production-minded, precise and incremental. Before coding, inspect repository state and produce a short implementation plan with dependencies, risks, file changes and acceptance criteria. Make reasonable reversible choices and document them in ADRs. Ask only questions that block safe implementation.

## Phase 1 implementation request
1. Scaffold a pnpm/Turborepo TypeScript monorepo with Next.js, Tailwind, Vitest, Playwright and Prisma/Postgres.
2. Build secure parent authentication and two child profiles, using mock/local development auth only if clearly labeled and disabled in production.
3. Build bilingual child and parent interfaces, including an interactive ten-frame, number bonds within 10, hint states and a calm learning flow.
4. Build parent-led toddler offline cards with print view and observation logging.
5. Implement server-graded deterministic activities and a transparent, testable rule-based mastery engine.
6. Build a parent dashboard showing skills, attempt evidence, misconception tags, due reviews and suggested offline activities.
7. Add parental consent, export and delete flows; protect all APIs with ownership authorization.
8. Add content validation, accessibility tests, seed data, local development documentation, CI and environment variable examples.

## Technical constraints
- Follow `docs/architecture/TECHNICAL_ARCHITECTURE.md` unless a justified ADR records a deviation.
- Enforce TypeScript strict mode and runtime schema validation.
- No unrestricted child-facing AI, no advertising, no public social features, no child names/photos sent to AI.
- No model-generated grading of basic math. No hardcoded production secrets.
- Ensure full functionality without any AI API key.
- Never publish draft/unreviewed content.

## Deliverables
- Working repository and `README` setup instructions.
- Database schema, migrations and seed scripts.
- Tested vertical slice for Grade 1 number bonds and toddler matching/sorting cards.
- Screenshots or local preview artifacts of key screens.
- Test report with exact commands and outcomes.
- Known gaps and prioritized next steps.

## Completion protocol
At each milestone: run lint, typecheck, unit tests and relevant E2E tests; report failures honestly, fix regressions, and commit descriptive changes. Do not mark milestone complete until acceptance criteria in `docs/delivery/ROADMAP_ACCEPTANCE.md` pass. Start by summarizing the architecture and proposed first five commits, then implement Phase 0 and Phase 1.


## Mandatory updated instructions (supersede any conflicting earlier text)
- Read `docs/product/LEARNER_PROFILES_AGE_ENGINE.md` and implement exact, timezone-aware age recalculation on every session and learner-local date change. Adek (toddler) DOB [private DOB]; Kakak (Grade 1) DOB [private DOB]. Grade is parent-controlled and not inferred from birthday. Handle age transitions proactively and safely.
- Read `docs/architecture/GITHUB_AI_DEPLOYMENT.md`; build a deployable application that runs independently of Claude Code. Core adaptive learning requires **no** AI API; optional runtime AI is server-side, opt-in, privacy-gated and resilient to outages.
- Follow `docs/delivery/AUTONOMOUS_CLAUDE_CODE_SOP.md` as the mandatory iterative engineering protocol. Design, implement, test, visually review, fix and repeat; generate evidence artifacts and PR. The agent can certify internal QA, but **cannot claim owner-approved UI/UX**. Final handover and production deployment require explicit owner signoff.
- Never use actual learner DOB/names in public demo data, screenshots, third-party model prompts, analytics, or CI. Ensure private repository and secure configuration. Do not commit real learner records into production source control.
