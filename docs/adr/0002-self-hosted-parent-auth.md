# ADR-0002: Self-hosted parent authentication for Phase 1
Status: accepted for MVP; revisit before inviting external families

**Context.** The spec recommends a mature managed auth provider. That needs an account, credentials, a data
processor agreement and a jurisdiction decision — owner decisions not available to the agent.

**Decision.** Email + password (scrypt N=16384, per-user salt, constant-time compare, dummy hash for unknown
emails), opaque 256-bit session tokens stored only as SHA-256 in Postgres, `HttpOnly` + `SameSite=Lax` cookies
(`Secure` in production), Origin-header CSRF check on all mutations, Postgres-backed rate limits (sign-up, sign-in
per IP and per email, PIN, delete). Children never have accounts. This is real auth, not mock auth, so there is no
dev-only bypass to disable in production.

**Consequences.** No email verification or password reset yet (P1 backlog). Before external families: adopt a
managed provider (or add verification/reset/2FA), and pen-test. Migration path: map provider subject → `ParentUser`.
