# ADR-0004: Content schema v2 and the human-review gate
Status: accepted

**Decision.** The starter JSON schema (kept in `docs/spec`) is extended: all learner/parent text is
bilingual `{en,id}`; markup characters are rejected; offline cards carry prep time, materials, steps, adult
wording, observation cues, clean-up, hazard flags and mandatory supervision; toddler cards may not declare a
choking risk; interactive lessons carry a generator id, CPA stage and a five-step hint ladder (H0–H4).
A new status `agent_reviewed` sits between `draft` and `reviewed`. `reviewed`/`published` require a recorded
human reviewer (`pnpm content:approve`).

**Visibility.** `ATLAS_ENV=production` (default for any production build) shows only `reviewed`+ content,
regardless of `ATLAS_CONTENT_MIN_REVIEW`. `preview` and `development` may show `agent_reviewed`. Drafts are never
shown. The agent cannot mark content as human-reviewed.
