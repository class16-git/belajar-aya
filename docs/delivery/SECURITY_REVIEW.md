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

## Independent review (Codex, 2026-11-10) — triage
| ID | Claim | Verified? | Resolution |
|---|---|---|---|
| F1 | Concurrent attempts on different items can lose mastery updates | Plausible (needed two open items, e.g. two tabs) | Per-(child, skill) advisory lock around the mastery read-modify-write; starting a session abandons other open items |
| F2 | `ATLAS_ENV=preview` on a production deploy shows unreviewed content and seeds demo data | Yes (misconfiguration path) | `VERCEL_ENV=production` forces production in the app and seeding; Vercel build exits before migrations on the mismatch; unit-tested |
| F3 | Hint request racing an answer can record "independent" evidence | Yes | Attempt and hint claims both require unchanged `tries` **and** `hintsUsed`; loser gets 409 |
| F4 | Concurrent start/next creates several open sessions / active items | Yes — reproduced (3 open sessions) | Partial unique indexes (one open session per child, one active item per session) + conflict handling; regression test fails without them |
| F5 | CSRF check trusts `X-Forwarded-Host` | Low risk (browsers can't send it cross-site without CORS; SameSite=Lax) | Forwarded headers ignored; optional exact `ATLAS_PUBLIC_ORIGIN` allowlist; unit-tested |
| F6 | Error logs include exception messages | Yes | Production logs record error name/code only |
| F7 | Midnight refresh fires up to a minute late | **Not reproducible** — lands at 00:00:00.000 for Codex's own example, NY and the NZ DST day; function is not used at runtime | Regression tests added; no code change |

Not yet independently reviewed (per Codex scope note): a route-by-route review of every API handler and the PIN/password/rate-limit implementations by someone other than the author.

**Final review round:** see [PR1_FINAL_RELEASE_READINESS.md](PR1_FINAL_RELEASE_READINESS.md) §3–§4 for re-verification of F1–F7 and
nine further findings (self-review and an independent fresh-context agent), all fixed except signup email
enumeration (accepted risk).

**Severity gate:** no open P0/P1 findings.
