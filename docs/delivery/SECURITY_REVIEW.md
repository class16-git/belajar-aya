# Security and privacy review (agent self-review)

Scope: Phase 0/1 code in this PR. Not a penetration test; the spec's launch gate requires one before inviting
external families.

## Threat model checklist (docs/spec/safety/CHILD_SAFETY_PRIVACY.md)
| Threat | Control | Verified by |
|---|---|---|
| Unauthorised family data access (IDOR) | every child lookup scoped by `familyId` of the session; 404 on mismatch | E2E #19 |
| Child bypasses parent gate | server-side `childModeChildId` lock; parent pages redirect; parent APIs 403 incl. sign-out/locale; PIN scrypt + rate limit + audit | E2E #10 |
| Client-forged grading/mastery | strict Zod schema rejects extra fields; grading + mastery computed server-side; answer key never serialised | E2E #14, unit |
| Malicious curriculum JSON / XSS | strict schemas, markup characters rejected, React text rendering only, CSP | unit, E2E #15 (note rendered as text) |
| CSRF | Origin == Host required on all mutations; SameSite=Lax cookies | smoke test |
| Credential attacks | scrypt, constant-work dummy hash, rate limits per IP and per email | E2E #21 |
| Oversized payload DoS | 32 KB body cap before parsing | E2E #22 |
| Prompt injection / AI leaks | no AI provider wired; adapter blocks name/DOB/email/note fields, timeouts, output validation, always falls back | unit (ai) |
| Excessive telemetry | no analytics or third-party scripts; logs contain ids and codes only | code review |
| Exposed credentials | no secrets in repo; `.env*` and private configs git-ignored; privacy scan in CI | privacy scan |
| Dependency compromise | exact pins, lockfile, `pnpm audit` in CI, SHA-pinned GitHub Actions, `permissions: contents: read` | audit clean |
| Real child data in public repo | redacted spec, synthetic seeds/screens, private seed refuses CI, privacy scan | ADR-0007 |

## Headers
CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`), `X-Content-Type-Options`,
`Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Permissions-Policy`, COOP; `X-Powered-By` removed.
Known gap: `script-src 'unsafe-inline'` is required by Next.js inline bootstrap without nonces (P2: add nonce-based CSP).

## Data lifecycle
Consent recorded with version + timestamp and audited; withdrawal pauses child data collection. Export = full JSON
without secrets. Delete = verified (password + typed DELETE), cascades to all family data including audit rows; a
log line without identifiers is emitted. Backups: none locally; production retention/expiry policy is an owner
decision before launch.

## Accepted risks / follow-ups (owner)
- Self-hosted auth lacks email verification, password reset and 2FA (ADR-0002).
- Rate limiting keyed by `x-forwarded-for` must be configured behind a trusted proxy in production.
- Legal review (Indonesian PDP Law; COPPA if offered in the US) of consent text not yet done; the UI says so.
- Repository is public; recommend making it private before real use.

**Severity gate:** no open P0/P1 findings in agent review.
