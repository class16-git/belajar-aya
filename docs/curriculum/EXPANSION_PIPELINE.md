# Content expansion pipeline and pilot batch (2026-11)

**Target:** 150 curriculum units and 150 reading materials per level, across 10 levels.

**Actual counts:** [CONTENT_DASHBOARD.md](../delivery/CONTENT_DASHBOARD.md). It is generated from the content
files, and CI fails if it is stale.

The audit was closed first (ATL-01 to ATL-15), so this expansion does not build on a defective learning engine.

## Gates every item must pass (automated; `pnpm content:validate`, unit tests, CI)
| Check | Where |
|---|---|
| Unique ids, valid prerequisites, objective links | `catalog.ts`, `library.ts` |
| EN/ID parity: same paragraphs, choices and hint ladder | schemas |
| Maths correctness | property tests over every generator (`@atlas/assessment`) |
| Answerability: answer key in range, evidence paragraph exists, the client never receives the key, the inference answer is not stated word for word | `library.ts`, `library.test.ts` |
| Near-duplicates: passages with word-trigram Jaccard ≥ 0.35 are rejected | `textSimilarity` |
| Factual sourcing: informational passages list their claims; `needs_source` blocks production; sources are never invented | `factChecks` |
| Physical hazards: hazard words need a flag or a safety note naming them; no choking hazards for toddlers or age 4–5 / K cards | `hazardKeywordIssues` |
| Licensing: books are link-only unless title rights are verified | `bookIssues` |
| Islamic content: a separate qualified religious-review gate | `publication.ts` |
| Publication: generated content is `agent_reviewed` and hidden in production until a person records a review | `isVisible`, `isPassageVisible` |

## Human review (cannot be done by the agent)
- **Passages:**
  `pnpm library:approve -- --reviewer "<initials>" --role parent|educator <passage ids>`
- **Lessons and cards:**
  `pnpm content:approve -- --reviewer "<initials>" --role parent|educator <lesson ids>`
- Before approving, read the item in preview: the parent **Reading Garden** or **Activity cards** pages show
  unapproved items with a preview badge. Check:
  - reading level;
  - cultural fit;
  - that each question has exactly one defensible answer;
  - for cards, a physical safety check.

## Pilot batch 1: Grades 2–6 reading (narrative, original, EN/ID)
| Passage | Level | Focus | Status |
|---|---|---|---|
| `passage-g2-paper-boat` | Grade 2 | literal, inference, sequence | agent_reviewed |
| `passage-g3-market-list` | Grade 3 | cause, strategy inference, vocabulary in context | agent_reviewed |
| `passage-g4-class-plant` | Grade 4 | motive, figurative language, main idea | agent_reviewed |
| `passage-g5-broken-window` | Grade 5 | character motive, evidence, interpreting dialogue, theme | agent_reviewed |
| `passage-g6-grandfathers-radio` | Grade 6 | figurative comparison, character traits, change over time, theme | agent_reviewed |

The pilot was narrative on purpose: it tests the pipeline without factual claims that would need sources the agent
cannot verify from its environment. Safety choices:
- the Grade 6 radio is battery-powered, with the batteries removed before opening;
- in Grade 5, the adults sweep up the broken glass.

**Before scaling:**
1. The owner (and ideally an educator) reviews this batch.
2. The feedback is folded into the writing checklist.
3. Only then are further batches generated, level by level.
