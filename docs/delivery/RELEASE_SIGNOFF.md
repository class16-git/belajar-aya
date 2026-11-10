# Release sign-off

This file holds the current gates only. Per-release provenance is in [RELEASES.md](RELEASES.md). The Phase 1
sign-off (PR #1, 18 lessons) is kept in git history.

| Gate | Owner | Status | Evidence / date |
|---|---|---|---|
| Engineering readiness: lint, types, unit, E2E, a11y, full-lockfile audit, privacy scan, content validation | Coding agent | ✅ agent-certified on each PR (not independent verification) | CI `verify`; FINAL_HANDOVER §2 |
| Independent audit findings ATL-01 to ATL-15 | Coding agent (fixes); independent re-audit pending | ✅ fixed, with a regression test for each | FINAL_HANDOVER §4 |
| Production deployment authorisation | Owner | ✅ given: "full autonomy for merge deploy etc" (2026-11-10) | conversation record |
| Content approval of lessons, cards, books and passages | Owner (parent) | ✅ recorded per item as `owner`, under the owner's explicit standing approval. Items corrected after the audit await re-review. | content files; `pnpm release:manifest -- --ids` |
| Educator review of approved content | Educator | ☐ recommended, not given | |
| Islamic studies: qualified scholar and translation review | Named qualified reviewers | ☐ not given; nothing published | ADR-0010 |
| Final UX / child-experience acceptance | Owner | ☐ not given | UX_BENCHMARK.md, screenshots |
| Limited-scope release statement | Owner | ☐ not signed | RELEASE_SCOPE.md |
| Data handling, consent text, legal review | Owner (+ counsel) | ☐ | |
| Database point-in-time restore rehearsal (Neon) | Owner | ☐. A synthetic dump-and-restore rehearsal passed. | RELEASE_RUNBOOK §3 |

Record approvals with name or initials and the date. Never include child information.
