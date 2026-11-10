# Adaptive learning engine — transparent and bounded

## Principle
Start rule-based. Do not label a proprietary algorithm "OODA" merely because it adapts. An explicit observe–orient–decide–act cycle is appropriate: observe evidence, orient to skill/prerequisites, decide next activity, act, then measure.

## Inputs
Child profile, authorized curriculum band, prerequisite mastery, attempt correctness, misconception tags, hint count, elapsed time (used only for friction/accessibility, never speed ranking), activity representation, recency and parent override.

## Example mastery update (MVP heuristic, not psychometrically validated)
- Score initialized to 0.35 when a skill is introduced; use score only as internal recommendation signal.
- Independent correct: +0.12; correct with hint: +0.05; incorrect: -0.08; clamp [0,1].
- A mastery state requires score >= 0.8 **and** at least 3 independent correct items in 2 formats **and** a delayed check.
- Repeated misconception twice: route to concrete representation or prerequisite; never just repeat an identical problem.
- Low-confidence or missing evidence: label "in progress", not "mastered".
- These thresholds are configurable and must be validated with educator feedback; they are not formal measures of learning.

## Recommendation policy
1. Exclude content outside parent-approved age/mode or unreviewed lessons.
2. Identify prerequisite gaps and due spaced reviews.
3. Prefer due review, then one active objective, then next unlocked objective.
4. Choose CPA stage: concrete on new/misunderstood skill, pictorial after supported success, abstract after robust independent success.
5. Adjust item difficulty within a bounded skill range; never auto-jump grade bands.
6. Surface a human-readable reason to parent and preserve parent override.

## Hint ladder
- H0: repeat or simplify wording without answer.
- H1: direct attention to relevant objects or quantity.
- H2: offer ten-frame, number bond or physical manipulation.
- H3: guide one intermediate step.
- H4: worked example, then new analogous practice item.
No deceptive praise; affirm effort and strategy rather than false correctness.

## AI integration (post-MVP)
- AI may rephrase approved explanations, translate reviewed lessons, draft **unpublished** lesson variants and suggest parent-facing insights.
- AI must receive only minimal pseudonymous state; no names, photos, birthdates or unredacted observations.
- Validate JSON schema, approved vocabulary, math truth and policy constraints before display.
- Never use an unrestricted child-facing conversational agent or model-generated answer keys.
- Every generated lesson must be flagged `draft` until human review.
- Provide deterministic fallback if provider fails, exceeds latency budget or produces invalid output.

## Evaluation harness
- Golden tests for addition/subtraction and number-bond correctness.
- Property tests: generated answer matches evaluator; no impossible distractors; locale-safe numerals.
- Simulated learner traces: rapid success, persistent misconception, hint dependence, inactivity, review lapse.
- Fairness checks for language level and accessibility settings.
- Adversarial tests: prompt injection in parent notes/content, malicious lesson fields, attempts to reveal private data.
