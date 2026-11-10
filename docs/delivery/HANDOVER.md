# Handover — Atlas Phase 0 + 1

## What you are receiving
- Branch `claude/github-repo-access-nkrthi` (PR to `main`), not merged, **not deployed**.
- No live or staging URL exists: deployment needs a host, database and your authorisation (ADR-0006).
- Evidence: TEST_REPORT.md, UX_QA_REPORT.md, SECURITY_REVIEW.md, RELEASE_SIGNOFF.md, `artifacts/screenshots/`.

## Try it without installing anything
Follow [PREVIEW_DEPLOYMENT.md](PREVIEW_DEPLOYMENT.md) to get a private Vercel preview link (synthetic data only).

## Try it locally (≈5 minutes)
Follow README "Quick start". Sign in as the synthetic demo parent, then:
1. **Family** → *Start learning* for Kakak → pick an activity → try a ten-frame item, ask for help, answer wrong once.
2. **Grown-ups** → PIN `1357` → **Progress** → open *Evidence* on a skill; read *Suggested next* (rule + reason).
3. **Activity cards** → open a card → toggle A4/Letter → Print → record an observation for Adek.
4. Switch **EN/ID**; visit **Privacy** to export or delete.

To use your real children's profiles **locally only**: copy `config/learners.private.example.json` to
`config/learners.private.json`, edit it, run `pnpm db:seed:private`. Never commit that file.

## Your decisions needed before release
1. UX approval (try it with your Grade 1 child; review toddler cards yourself).
2. Content review: `pnpm content:approve --reviewer "<initials>" --role parent --all-agent-reviewed`
   (or per lesson) and commit via PR. Production shows nothing until this is done.
3. Hosting + region + backups (e.g. Vercel + managed Postgres in Singapore/Jakarta, or Docker on a VPS).
4. What happens to the old GitHub Pages site and its custom domain when this merges.
5. Make the repository private (recommended) before real use.
6. Legal review of the consent text.

## Deployment runbook (when authorised)
1. Provision PostgreSQL 16; create a least-privilege app role. Enable automated backups + restore test.
2. Set env vars in the host's secret store (never in git): `DATABASE_URL`, `ATLAS_ENV=production`,
   `ATLAS_SECURE_COOKIES=true`, `ATLAS_PUBLIC_ORIGIN=https://<your-domain>`.
   Never set `ATLAS_ENV` to `preview` in Production (on Vercel the build refuses to run if you do). Do not set `ATLAS_CONTENT_MIN_REVIEW` below `reviewed` (it is ignored anyway).
3. Use a **separate** production database (never the preview one). On Vercel the build marks it `production` on first
   deploy and refuses databases marked `synthetic`. Elsewhere run `pnpm --filter @atlas/database db-role production` first.
   Then `pnpm install --frozen-lockfile && pnpm db:migrate` (backup first), then `pnpm build` and `pnpm --filter @atlas/web start`,
   or `docker build -t atlas . && docker run -e DATABASE_URL=… -p 3000:3000 atlas` (run `pnpm db:migrate` as a release step).
4. Smoke test: `GET /api/health` → `{"ok":true,"db":true,"ai":"disabled"}`; sign up a test parent; delete it.
5. Put behind HTTPS on a trusted proxy that sets `X-Forwarded-For`.
6. Rollback: redeploy previous build; restore DB backup only if a migration must be undone.
7. Use GitHub environments with required reviewers for production; never give coding agents production credentials.

## Credentials handoff
No credentials were created or used. Secrets go only into the hosting provider's secret manager and are entered by
the owner. Never paste secrets into chat, issues or commits.

## Operations
- Logs: JSON lines on stdout (`event`, ids, codes only — no names/DOB/notes). Errors: `level:"error"`.
- Health: `/api/health` (DB + curriculum version).
- Content changes: edit `content/**`, `pnpm content:validate`, PR review, approve, deploy.
- Age/placement: recomputed per request in each learner's timezone; no cron jobs needed.
- Costs: AI = 0 (disabled). Expected hosting: small Postgres + one small web instance.

## Known limitations
- Auth: no email verification, password reset or 2FA (ADR-0002).
- Only Grade 1 number bonds/counting are interactive; other G1 skills are planned (not child-visible).
- Toddler/preschool transition at age 3 is a parent notice only; no preschool content yet.
- Audio prompts/TTS not implemented (toggle shown as "coming soon").
- PWA/offline caching not implemented (not promised in Phase 1).
- Mastery thresholds are heuristics awaiting educator validation (ADR-0005).

## Next iteration backlog (prioritised)
1. Owner/educator content review + Indonesian copy review (P0 for release).
2. Managed auth or verification/reset/2FA; production hosting + backups (P0 for external families).
3. G1: add/subtract within 10, compare to 20 (P1); CSP nonces (P2); audio prompts (P1).
4. Preschool cards for the 3+ transition; coverage dashboard (Phase 2).
5. Validate mastery rules against family observations (Phase 3) before any optional AI.
