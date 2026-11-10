# ADR-0007: Real learner data and a public repository
Status: accepted

The product bible contains real names and dates of birth of two minors; the repository is **public**.
Decision: the committed spec copy is redacted; all seeds, tests, screenshots and CI use synthetic learners;
real values live only in git-ignored `config/learners.private.json`, loaded by `pnpm db:seed:private` into a local
DB (refuses to run in CI/production) and checked by a local-only test of the exact ages. `pnpm privacy:scan` blocks
commits of private files/values. Recommendation to owner: make the repository private before production use.
