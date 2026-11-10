# Release record

One row per production release. Each row ties a commit to the curriculum that was live and the deployment that
served it. Rows are filled in only after the checks in [RELEASE_RUNBOOK.md](RELEASE_RUNBOOK.md) §2 pass.

**How each column is filled in:**
- **Content digest:** run `pnpm release:manifest` on that commit. From the ATL-12 release onwards, `/api/health` also reports `contentDigest`, and the two values must match.
- **Verified live:** the values `/api/health` returned on the production domain.
- **Rollback target:** the previous production deployment, which must be READY.

| Released (UTC) | Commit / PR | Vercel deployment | Content digest (`reviewed`) | Verified live (lessons / books / passages) | Human approvals in this release | Rollback target |
|---|---|---|---|---|---|---|
| 2026-11-10 | `6888295` (PR #15, expansion pipeline and pilot batch 1) | `dpl_8rfGguCCmxRq5pNS43ZryusWoGE4` READY | `0fcf3ab0a7bd5fdb` (health and CLI agree) | `release: 6888295`; 55 / 12 / 4 (mangrove passage withheld: claim needs a source) | None. The 5 pilot passages are `agent_reviewed` and hidden. | `dpl_BVXvr2SC2bze58e6fUHUoiLZdvGU` (`826469e`) READY |
| 2026-11-10 | `826469e` (PR #14, audit remediation ATL-01 to ATL-15) | `dpl_BVXvr2SC2bze58e6fUHUoiLZdvGU` READY, aliased to the domain | `b06e1f6435e6b0b4` (health and CLI agree) | `release: 826469e`; 55 / 12 / 5. Build log: "Database role confirmed"; "Applying migration `20261110130000_reading_attempts`" | 5 K lessons recorded as `owner`, under the owner's explicit standing approval. 2 cards and 2 passages were withdrawn for re-review. | `dpl_8a3WZqVe8Vt8fqVnsL3LLDKNfjgr` (`0d97af9`) READY |
| 2026-11-10 | `0d97af9` (PR #13, Kindergarten maths) | `dpl_8a3WZqVe8Vt8fqVnsL3LLDKNfjgr` READY | `88019be7c54dc76f` (from the checkout; health had no digest yet) | `release: 0d97af9`; 52 / 12 / 7 | None new. The 5 K lessons stayed `agent_reviewed` and hidden. | `dpl_CyTRnkMJLWzua65ADY4xgPdnAouy` (`3a2e074`, PR #12) READY |
| 2026-11-10 | `3a2e074` (PR #12, Reading Garden publication) | `dpl_CyTRnkMJLWzua65ADY4xgPdnAouy` READY | not recorded (before ATL-12) | `{"ok":true,"db":true}` (health had no counts yet) | Books and passages approved by `owner`, under the owner's standing approval | earlier production deployment |

The Vercel build log for `0d97af9` could not be read through the API: only 12 lines came back. PR #13 added no
migration. The previous migration, `20261110120000_reading_garden`, was applied in production during an earlier
deployment (logged as "Applying migration").
