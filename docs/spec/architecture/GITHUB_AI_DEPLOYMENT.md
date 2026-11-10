# GitHub, AI development and deployed runtime: separation of concerns

## Core distinction
**GitHub hosts source code, not the AI brain or the running application by default.** Claude Code is a development-time coding agent operating on a checked-out repository. A deployed web application runs on hosting infrastructure (for example Vercel/Cloudflare plus managed Postgres) and continues serving users when Claude Code is closed. GitHub Actions can build/test/deploy on pushes, but GitHub Pages alone cannot host a full private server-side application or managed database.

## Architecture
```
Parent / child browser
       | HTTPS
Web hosting (Next.js app + server APIs) -- managed Postgres (private child profiles, progress)
       |                                    
       +-- deterministic rules, authored lessons, mastery engine (NO model required)
       +-- optional server-only AI provider API (only if enabled, guarded and budgeted)
       +-- private object storage for approved assets
GitHub private repo -- PR checks / GitHub Actions -- deployment pipeline -- hosting
Claude Code on developer machine or authorized runner -- branches/PRs --> GitHub
```

## Two distinct kinds of AI
1. **AI for building:** Claude Code reads specs, writes code, runs tests, previews UI, creates commits/PRs. It is not necessary for runtime after deployment.
2. **AI in the product:** Optional server-side model calls for bounded explanations, content drafting for adult review, or parent insights. A provider API requires an API key, budget, privacy review, availability handling, and explicit consent. Never expose API keys to browsers, commit secrets, or let child prompts go directly to a general model. Core lessons, math grading and adaptation work offline from external LLMs (but web deployment itself still needs hosting/network).

## Deployment options and trade-offs
- Recommended MVP: private GitHub + Next.js web host + managed PostgreSQL + protected CI. Simple operations, recurring hosting/database costs, online connectivity required.
- Lower vendor dependency: Dockerized Next.js + PostgreSQL on a VPS with backups, TLS, patching and monitoring; more operational responsibility.
- Static-only GitHub Pages: suitable for public prototype/demo only, not private child profiles or server-side personalization.
- Optional PWA caching: limited approved lessons can be available without network, with explicit sync conflict handling; not promised in Phase 1.

## Secure delivery pipeline
PR -> lint -> typecheck -> unit tests -> curriculum schema checks -> E2E + accessibility -> dependency/security checks -> preview environment with fake children -> visual screenshot review -> merge to protected main -> deploy staging -> smoke tests -> production deploy (manual approval for first release) -> monitor/rollback.
Use GitHub environments with protected production approvals, least-privilege secrets, pinned actions, migrations with rollback plans, and no real child data in CI or preview deployments. Never give coding agents unrestricted production credentials.

## Operating costs and reliability
Track hosting, database, storage, optional model token spend, error rates, latency and backups. Set AI spending caps, provider timeout/fallback, rate limits and disable switch. Runtime must continue operating when AI API is unavailable. Ensure export/delete, restore tests and retention policy.

## Definition of self-running
After deployment, parent can sign in and use approved curriculum, get adaptive recommendations, and view progress with Claude Code fully offline. Automated deployment only happens on reviewed merges; the app does not autonomously rewrite production code.
