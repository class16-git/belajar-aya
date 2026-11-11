# Release and rollback runbook

Production is the Vercel project `atlas`, serving https://atlas.ichlasulamalsudarmi.com, with a Neon Postgres database
whose role marker is `production`. Every merge to `main` deploys to production. Preview deployments use their own
database, whose role marker is `synthetic`; they seed only the synthetic demo family.

## 1. Before merging
1. CI `verify` is green on the PR head. It runs:
   - lint, typecheck and unit tests;
   - a dependency audit of production dependencies and of the full lockfile;
   - E2E tests against a disposable database marked `synthetic`;
   - privacy scan and content validation.
2. Run `pnpm release:manifest` on the PR head. Note the `contentDigest` and the visible counts. They are what
   production will show.
3. Any content whose visibility changes must have its human review recorded in the content files: who reviewed it,
   their role and the date. The agent never records an approval on its own initiative.

## 2. After the deploy (verification)
1. Check the production health endpoint:
   ```sh
   curl -s https://atlas.ichlasulamalsudarmi.com/api/health
   ```
   Confirm that:
   - `release` is the merge commit;
   - `contentDigest` and `visible` equal the values from §1.2;
   - `minReview` is `reviewed`.
2. In Vercel, the production deployment for that commit is READY and aliased to the domain.
3. In the build log, `vercel-build.mjs` runs the database role check, which fails the build if the marker is not
   `production`. Prisma then prints either "Applying migration …" or "No pending migrations". The deployments API
   sometimes returns a shortened log: if so, record that it was unreadable rather than guessing. Every migration so far is additive (expand only). Migrations must stay additive, so
   that the previous build still runs against the new schema.
4. Run `pnpm release:record` on a checkout of the deployed commit, or on a later commit whose `content/` and
   `packages/curriculum/src` are identical to it. It only reads. It fails unless:
   - the live health check is ok;
   - the live content digest and curriculum version equal the checkout's;
   - the Vercel deployment, when the API is reachable, is READY in production on that commit.

   It writes `docs/delivery/releases/<date>-<sha>.json` and `docs/delivery/release-manifest.json`, schema
   `atlas-release-manifest/1`.
5. Add a row to [RELEASES.md](RELEASES.md).

## 3. Rollback
**Code (minutes):**
- Vercel, then Deployments, then select the rollback target from RELEASES.md, then **Instant Rollback**. With the CLI:
  `vercel rollback <deployment-url>`.
- This does not touch the database. It is safe because migrations are additive.
- Re-run §2.1 and record the rollback in RELEASES.md.
- Content-only problems can also be withheld without a code rollback, by un-approving the item:
  - lessons: set `reviewStatus` back to `agent_reviewed`;
  - books: run `pnpm library:withdraw -- --reason …`.

**Database (only if data is damaged):**
1. Neon, then the project, then **Restore**: create a branch from a point in time just before the incident.
2. Check the branch's role marker:
   ```sql
   SELECT "role" FROM atlas_meta.database_role WHERE "id" = 1;
   ```
   It must be `production`.
3. Point `DATABASE_URL` in the Vercel production environment at the branch, then redeploy.
4. Never point tests at a restored production branch. The E2E guard refuses anything not marked `synthetic` (ATL-01).

**Restore rehearsal (synthetic, 2026-11-10):**
- Steps: `pg_dump -Fc` of the seeded `atlas_test` database, then `pg_restore` into a fresh database.
- Result: identical row counts (1 family) and 5 applied migrations. The `synthetic` marker was preserved, so a
  restored copy keeps its identity.
- A Neon point-in-time restore has not been rehearsed. It is an owner action in the Neon console.

## 4. Switching the CSP to enforcing (ATL-14)
The nonce policy currently runs as `Content-Security-Policy-Report-Only`. Violations are logged by Vercel as
`csp_violation_report_only`. To enforce it:
1. Confirm there have been no such log lines for a week of normal use.
2. Send `nonceCsp` as `Content-Security-Policy` from `src/middleware.ts`.
3. Remove the static header from `next.config.ts`.
4. Run the ATL-14 E2E test.

## 5. Outstanding owner actions
- **Educator review:** an educator review of content approved under the owner's standing approval.
- **Re-review after audit corrections:**
  - passages `passage-g6-advert-report` and `passage-k-red-kite`;
  - cards `lesson-robo-k-linkage-001` and `lesson-prek-world-cycles-001`.
- **GitHub Pages:** the old site deployment is obsolete and failed with a timeout. Retiring it in the repository
  Settings, under Pages, is a separate decision for the owner.
