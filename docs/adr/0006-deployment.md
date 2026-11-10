# ADR-0006: Deployment target and the legacy GitHub Pages site
Status: proposed — requires owner decision

GitHub Pages cannot run server-side code or hold private child data, so Atlas needs a server host + managed
Postgres (e.g. Vercel + Neon/Supabase in a chosen region, or the provided Dockerfile on a VPS). **Nothing has been
deployed.** Merging this PR into `main` replaces the root of the repository; the old static site is kept under
`legacy-site/`, but GitHub Pages will stop serving it from the root (and its `CNAME`) unless Pages is re-pointed or
the site is moved to its own repo/branch. Owner to choose host, region, domain and Pages plan before merge.
