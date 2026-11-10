# Project Atlas — Family Learning OS

**Status:** Product specification / implementation blueprint  
**Audience:** Claude Code, product owner, curriculum reviewers, engineers  
**Initial users:** 2.5-year-old toddler and 7-year-old Grade 1 learner  
**Curriculum orientation:** North American Montessori-inspired + Singapore Math pedagogy  
**Deployment:** Private GitHub repository, web application, mobile/tablet responsive

## Vision
Build an age-appropriate, bilingual (Bahasa Indonesia / English) learning environment spanning toddler, preschool, kindergarten and elementary. Pair Montessori's prepared environment, autonomy and concrete exploration with Singapore Math's concrete-pictorial-abstract progression and a transparent, bounded adaptive engine. This is an original product, **not a clone of Synthesis's proprietary interface, content, algorithms or trademarks**.

## Read this first
1. `docs/product/PRODUCT_BIBLE.md` — comprehensive product definition.
2. `docs/curriculum/CURRICULUM_FRAMEWORK.md` — scope, sequence and pedagogical constraints.
3. `docs/architecture/TECHNICAL_ARCHITECTURE.md` — implementation plan and repository architecture.
4. `docs/ai/ADAPTIVE_ENGINE.md` — mastery, recommendation and hinting rules.
5. `docs/safety/CHILD_SAFETY_PRIVACY.md` — non-negotiable child protection rules.
6. `docs/design/UX_SPEC.md` — child and parent interaction model.
7. `docs/delivery/ROADMAP_ACCEPTANCE.md` — milestones and definition of done.
8. `prompts/CLAUDE_CODE_MASTER_PROMPT.md` — copy/paste instructions for Claude Code.

## Operating principles
- Parent-controlled and private by default; no advertising, social features, leaderboards or manipulative streaks.
- For ages under 3, prioritize **offline, caregiver-led Montessori activities**; screen experiences are primarily for the parent.
- For Grade 1, use guided, short, accessible practice with explicit error explanations.
- Curriculum standards are mapped to *specific published references only after verification*; do not imply Montessori or Singapore Math accreditation.
- Start with a deterministic adaptation engine and authored, reviewed content. AI is optional and constrained.
- Track evidence of mastery rather than merely time spent or points earned.

## Suggested launch
First deliver a vertical slice: parent onboarding, two learner profiles, Grade 1 number bonds (0–10), toddler offline matching cards, mastery tracking, adaptive recommendation and parent progress dashboard. Expand after validation.

## Repository note
This ZIP is a **specification starter**, not a working application. Claude Code should create the application in this repository according to the enclosed specifications and acceptance tests.


## November 2026 update: child age, deployment and autonomous delivery
> Redaction note: real learner names and dates of birth were removed from this public copy of the specification. See `config/learners.private.example.json` (synthetic) and keep real values only in the git-ignored `config/learners.private.json`.
- `docs/product/LEARNER_PROFILES_AGE_ENGINE.md` defines exact age-from-DOB calculations, timezone rules, adaptive age/grade separation and safety policies.
- `docs/architecture/GITHUB_AI_DEPLOYMENT.md` explains how Claude Code builds from GitHub while the deployed product runs independently, with or without an AI provider.
- `docs/delivery/AUTONOMOUS_CLAUDE_CODE_SOP.md` defines the design → build → test → visual QA → improve → handover loop and objective release gates.
- `config/learners.private.example.json` is a private-configuration **example containing real DOBs**; keep this entire repository private, or replace these values with synthetic data before any public push. Never commit production learner records.
