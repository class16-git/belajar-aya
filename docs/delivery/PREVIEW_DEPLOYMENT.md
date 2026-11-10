# Preview deployment (Vercel + Neon, synthetic data only)

A private test link for clicking through Atlas on a phone or tablet. It uses **only the made-up demo family**
(Kakak and Adek with fake birth dates). Never add real children to the preview.

Cost: free (Vercel Hobby + Neon free tier). Region: Singapore. About 10 minutes, all in your browser.

## 1. Create the Vercel project
1. Go to <https://vercel.com/signup> and sign up with **GitHub**.
2. **Add New → Project** → *Import Git Repository* → choose `class16-git/belajar-aya`.
   If asked, install the Vercel GitHub app on `class16-git` and give it access to **only** this repository.
3. On the configure screen set **Root Directory = `apps/web`** (click *Edit*). Leave everything else as is —
   the build and install commands come from `apps/web/vercel.json`.
4. Click **Deploy**. The first build **will fail** with "DATABASE_URL is not set" — that is expected; the database
   is added next. (A build of `main` would also fail because `main` still holds the old site; that is harmless.)

## 2. Add the database (Neon)
1. In the project, open **Storage → Create Database → Neon (Serverless Postgres)**.
2. Region: **Singapore (ap-southeast-1)**. Plan: Free.
3. Connect it to the project for the **Preview** environment (Development is optional).
   Vercel adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED` automatically — you never copy a password.

## 3. Add three settings
**Settings → Environment Variables**, environment **Preview** only:

| Name | Value |
|---|---|
| `ATLAS_ENV` | `preview` |
| `ATLAS_CONTENT_MIN_REVIEW` | `agent_reviewed` |
| `ATLAS_SECURE_COOKIES` | `true` |

## 4. Keep it private
**Settings → Deployment Protection**: keep **Vercel Authentication** on for Preview deployments (the default).
Only you (signed in to Vercel) can open the link.

## 5. Deploy the branch
**Deployments** → find the deployment for branch `claude/github-repo-access-nkrthi` → **⋯ → Redeploy**.
New pushes to the PR redeploy automatically. When it is ready, open the link and sign in:

- Email `demo.parent@example.test`, password `demo-password-123`, parent PIN `1357` (all synthetic).
- Check `/api/health` shows `"ok":true`.

Each deploy re-seeds the demo family, so demo progress resets after every push.

## What the build does
`apps/web/scripts/vercel-build.mjs`: generate Prisma client → apply migrations (direct connection) →
seed the synthetic demo family **only when `ATLAS_ENV=preview`** → `next build`.
A production environment (`ATLAS_ENV` unset or `production`) never seeds and shows only human-reviewed lessons.

## Troubleshooting
| Symptom | Fix |
|---|---|
| "DATABASE_URL is not set" | Step 2 not done, or the database is not connected to **Preview** |
| Signed in but no activities for Kakak | `ATLAS_ENV=preview` / `ATLAS_CONTENT_MIN_REVIEW=agent_reviewed` missing for Preview |
| Anything else | Copy the build log error into the chat with Claude |
