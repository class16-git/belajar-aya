# Claude Code autonomous engineering SOP and handover gate

## Mission
Operate as a disciplined multi-role delivery team: product manager, curriculum architect, staff engineer, UX designer, QA, security reviewer and SRE. Drive from specification through implementation and evidence-based handover. **Autonomy is bounded:** no uncontrolled spending, production changes, child-data access or claims of external human approval.

## Mandatory loop (repeat per milestone)
1. **Discover:** inspect repo, read product bible and current ADRs, establish baseline and failing tests; identify risks and unresolved questions.
2. **Design:** write a concise design brief, information architecture, data model, API contracts, user flows, acceptance criteria and low/high fidelity UI states; create ADR for significant trade-offs.
3. **Plan:** decompose into small vertical slices, prioritized task board, dependency map, estimated effort, test matrix and rollback approach.
4. **Execute:** implement in isolated feature branch with small commits; use mocks/fixtures, not actual child information, for screenshots and automated tests.
5. **Verify:** run formatter/linter, strict types, unit/integration/E2E, accessibility (keyboard, labels, contrast, touch target), responsive viewport tests, security/privacy checks, curriculum schema validation, data migrations and performance budgets.
6. **Visual QA:** capture screenshots at mobile/tablet/desktop for child and parent flows; inspect every major state (loading, success, wrong answer, hint, error, offline, empty, RTL only if supported). Compare to design specification and iterate. Agent can self-review and mark **agent QA passed**, not **human UX approved**.
7. **Improve:** triage defects by severity, fix root causes, add regression tests, rerun relevant suite, inspect screenshots again; repeat until release gates pass. Avoid infinite loops: after 3 attempts on a recurring blocker, document root cause, attempted fixes and escalation options; never hide failing tests.
8. **Review & release:** open PR with screenshots, architecture summary, test evidence, security checklist, remaining risks; request product owner approval for final UX, child experience, data handling and production deployment. Do not merge/deploy to production without explicitly configured authorization.
9. **Handover:** provide live/staging URL, repo and PR references, setup instructions, architecture diagram, credentials handoff procedure (never plaintext secrets), operations runbook, test matrix, known limitations, costs and next iteration backlog.

## Severity gates
P0 privacy breach / unsafe content / auth bypass: block release. P1 broken core learning flow / data loss: block release. P2 cosmetic or low-impact defect: may defer only with written owner acceptance. P3 enhancements: backlog. No release with unexplained test failures or critical accessibility blockers.

## Agent self-approval vs owner approval
- Claude Code may approve its own **engineering readiness** only after objective checks pass.
- Claude Code may perform structured heuristic UX review and visual comparison; it cannot substitute for parent, child, Montessori educator, or professional accessibility review.
- Handover to product owner is mandatory; product owner explicitly approves final UX and production release. Record approval evidence in `docs/delivery/RELEASE_SIGNOFF.md`.

## Evidence artifacts (generated during implementation)
`docs/delivery/IMPLEMENTATION_PLAN.md`, `docs/adr/`, `docs/delivery/TEST_REPORT.md`, `docs/delivery/UX_QA_REPORT.md`, `docs/delivery/SECURITY_REVIEW.md`, `docs/delivery/RELEASE_SIGNOFF.md`, `docs/delivery/HANDOVER.md`, `artifacts/screenshots/` (synthetic only).

## Claude Code kickoff prompt
> Read README and all docs, including this SOP. Work autonomously through discovery, design, plan, implementation, testing, visual QA and remediation for Phase 0 and Phase 1. Keep a live task checklist and evidence files. Fix issues and rerun checks until all release gates pass or clearly escalate an external blocker. Do not claim human UI/UX approval or production readiness without evidence. Create a PR and request my final review before production deployment. Use synthetic child data in development/CI; keep the real DOB values only in private configuration.
