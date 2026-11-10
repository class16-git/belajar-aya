# PRODUCT BIBLE — Project Atlas

## 1. Executive summary
**Problem:** Conventional apps often impose a fixed age-based path, overuse gamification, and fail to connect hands-on Montessori practice with rigorous mathematics instruction. Parents lack a single, transparent view of learning objectives, misconceptions, mastery and recommended offline follow-up.

**Solution:** A private learning operating system for children aged approximately 2.5–12, launching with a toddler and a Grade 1 student. A Montessori-informed prepared environment organizes self-directed activities, Singapore Math structures mathematics progression, and a constrained adaptive system chooses the next appropriate activity.

**North-star outcome:** Demonstrable, transferable mastery of age-appropriate concepts while preserving curiosity, independence, well-being and family control.

**Non-goals:** Replace teachers, diagnose learning disabilities, certify Montessori fidelity, reproduce Synthesis proprietary assets, maximize screen time, offer open-ended AI chat to children, or autonomously assess developmental conditions.

## 2. Users and jobs-to-be-done
### Learner A: age 2.5
- Parent-guided, mostly offline Montessori activities; sensory sorting, vocabulary, classification, matching, counting readiness, fine motor and practical life.
- Parent reads instructions and observes evidence; child should not need to navigate a screen independently.
- Activities 3–10 minutes when child is interested; no forced completion or age-normative scoring.

### Learner B: age 7 / Grade 1
- Independent or lightly supported short sessions (about 10–20 minutes, adjustable).
- Learn via manipulatives, ten-frames, number lines, number bonds and visual bar models; verbalize reasoning.
- When incorrect, offer scaffolded hints before showing the solution.

### Parent / educator
- Configure language, session limits, curriculum priorities and consent.
- Review actual concept mastery and misconception history; print offline cards; choose activities.
- Override recommendations, annotate observations and export/delete records.

## 3. Product pillars
1. **Curriculum graph:** explicit skills, prerequisites, grade bands, learning objectives and evidence.
2. **Prepared environment:** inviting choices with limited cognitive load and a clear start/finish.
3. **Concrete → pictorial → abstract:** mathematics must preserve representations and reasoning.
4. **Adaptive practice:** bounded difficulty and evidence-based remediation.
5. **Parent cockpit:** understandable, actionable progress rather than vanity metrics.
6. **Offline bridge:** real objects and movement are first-class learning activities.
7. **Safety and trust:** age-appropriate, privacy-minimal, inspectable AI behavior.

## 4. Functional scope
### P0 / MVP
- Parent account, child profiles, age-appropriate modes, bilingual UI, tablet-first responsive design.
- Curated curriculum library and versioned skill graph.
- Grade 1 number sense 0–20, counting, compare, addition/subtraction to 10, number bonds, ten-frame interactions.
- Toddler offline cards: matching, sorting, naming, practical life, quantity 1–3 where appropriate.
- Activity runner with explicit state machine: introduction → concrete/pictorial exploration → answer → feedback → reflection → next recommendation.
- Deterministic item generator, misconception tags, attempt logging, mastery estimates, parent dashboard.
- Print-friendly offline activity sheets and parent observation log.
- Automated tests, accessibility checks, telemetry and secure deployment.

### P1
- Grade 1 addition/subtraction to 20, place value, measurement, shapes, early bar models, word problems.
- Preschool/KG language, phonological awareness, early literacy, geometry, cultural studies and sensorial activities.
- AI-assisted explanations behind safety controls and teacher/parent-reviewed content pipeline.
- Audio prompts, optional text-to-speech, local caching, richer analytics.

### P2
- Full Grade 2–6 scope, multiplication/division, fractions, decimals, geometry, data and multi-step problems.
- Cross-disciplinary modules: science, geography, language, culture, executive function, practical life.
- Curriculum authoring console, educator collaboration, printable packs, parent-approved multi-device sync.

## 5. Core learning loop
1. Select learner and objective.
2. Check prerequisites, recent attempts, mastery confidence and preferred representation.
3. Present one appropriately challenging activity.
4. Collect answer and optional reasoning without exposing unrestricted AI chat.
5. Classify correctness and misconception deterministically where possible.
6. Offer progressive hints (notice → representation → guided step), never shame.
7. Update mastery with traceable evidence; recommend next step or offline activity.
8. Show parent concise explanation: "Practicing making 10; confused 6+4 with 6+3 twice; try bead pairs."

## 6. Product requirements
| ID | Requirement | Priority | Verification |
|---|---|---|---|
| PR-01 | Separate parent and child interfaces | P0 | Child cannot access parent controls |
| PR-02 | Bilingual UI and content fields | P0 | Switch locale without losing progress |
| PR-03 | Deterministic graded math answers | P0 | Unit tests for generated problems |
| PR-04 | CPA stages attached to math skills | P0 | Skill metadata and UI inspection |
| PR-05 | Parent consent before child data collection | P0 | Consent gate and audit record |
| PR-06 | No open AI conversation for children | P0 | API and UI tests |
| PR-07 | Offline Montessori activity cards | P0 | Print preview and instructions |
| PR-08 | Explainable mastery and recommendations | P0 | Inspect evidence and rule IDs |
| PR-09 | Export/delete family data | P0 | End-to-end tests |
| PR-10 | Child-friendly touch targets and audio options | P1 | Accessibility audit |

## 7. Success metrics
- Skill transfer: child can solve an equivalent new problem after a delay.
- Mastery: number of independently demonstrated objectives, with confidence and recency.
- Hint dependence: proportion of correct attempts requiring assistance.
- Parent usefulness: percentage of recommended offline activities completed or marked helpful.
- Safety: zero unauthorized child access to parent data; zero open chat exposure.
- Guardrails: no session-time optimization, no compulsory streaks, no punitive messaging.

## 8. Risks and mitigations
- **Pedagogical mismatch:** have qualified Montessori and Singapore Math educators review scope and lesson patterns.
- **Over-screening toddlers:** default to parent-led printable/offline experiences.
- **Hallucinated AI lessons:** structured curriculum, retrieval-limited prompts, schema validation and human review.
- **False mastery:** varied items, spaced recall and representation transfer.
- **Privacy:** pseudonymous child IDs, strict access policies, deletion workflow, minimal analytics.
- **Curriculum licensing:** create original items; do not scrape or reproduce paid textbooks.

## 9. Decision log / open questions
- Initial deployment: private family-only or eventually public SaaS? Default private family-only.
- Content language: Bahasa Indonesia + English. Default parent-selectable.
- Hosting: Vercel + managed Postgres suggested; confirm provider and jurisdiction before production.
- AI provider: adapter-based, optional; no child-facing LLM in MVP.
- Scope: Grade 1 mathematics vertical slice first; toddler offline activities concurrently.


## Dynamic learner lifecycle (mandatory)
Adek (toddler): [private DOB]; Kakak (Grade 1): [private DOB]. All recommendations must use exact current age computed from server date and IANA learner timezone, and react to birthday transitions, new mastery evidence and parent preferences. Do not automatically change grade on birthdays. See `LEARNER_PROFILES_AGE_ENGINE.md`.

## Runtime independence and autonomous build
Claude Code is the engineering agent, not a runtime dependency. Deployed app runs deterministic mastery, lessons and recommendations without an LLM; optional AI must be explicit and protected. See `docs/architecture/GITHUB_AI_DEPLOYMENT.md`. Engineering must follow `docs/delivery/AUTONOMOUS_CLAUDE_CODE_SOP.md` until objective checks pass, then request owner approval and handover; agent self-review is not human signoff.
