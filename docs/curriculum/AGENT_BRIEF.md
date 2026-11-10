# Expansion authoring brief (all content agents)

You are writing **original** Atlas learning content for a family: ages 2–3 through Grade 6, in English and Bahasa
Indonesia.

## Contract
The contract is `packages/curriculum/src/units.ts`. Read it first. Then copy the shape of the two references:
- `content/units/g2/math/unit-g2-math-place-value-hundreds.json`
- `content/readings/age2_3/reading-age2_3-little-cat-bath.json`

**Check your files** with:
```sh
pnpm --filter @atlas/curriculum units:check -- <your directory>
```
Fix every error before you finish. The check also reports near-duplicates against everything else in the corpus.

## Hard rules
1. **Write only inside the directories you own.** Never edit other files, never run `git`, and never run the indexer
   or the tests of other packages. The lead integrates your work.
2. **Never mark content approved.**
   - Every file has `reviewStatus: "agent_reviewed"`. For Islamic content it is `"draft"`.
   - `review` holds `agentChecks` only.
   - `provenance` is `{ "origin": "ai_drafted", "batch": "<your batch name>", "createdAt": "2026-11-10" }`.
   - Never fill in `reviewedBy`, a scholar, or `verification: "verified"`.
3. **Never invent sources, citations, studies, statistics, hadith or verse references.**
   - Use `kind: "original"` with `verification: "not_applicable"` for your own material.
   - A factual claim in a reading goes in `factChecks`, with one of these statuses:
     - `common_knowledge`: general school science a reviewer can check;
     - `invented_example`: the text clearly says it is made up;
     - `needs_source`.
   - Prefer content that does not depend on unverifiable specifics.
4. **One unit is one distinct, complete learning experience.** No translated duplicates. No renamed copies. No
   "part 2" that repeats part 1 with other numbers. Each unit teaches a different objective or a genuinely different
   step in a progression. Use `prerequisites`, citing your own unit ids or ones that already exist, to build coherent
   sequences.
5. **Indonesian is natural, adapted Bahasa Indonesia**, not word-for-word translation:
   - use Indonesian names, foods, places and everyday life where natural;
   - keep the same number of paragraphs or items in each language.
6. **Age-appropriate and safe.**
   - Ages 2–4 never use choking-size items, beads, coins, magnets, button batteries, dried beans or balloons.
   - The adult does all cutting.
   - Water is only a few centimetres deep, with an adult right there.
   - Hazard words in materials or steps need the matching hazard flag, or a safety note that names them.
   - Electronics use only sealed battery holders with AA/AAA batteries, an adult present, and no mains electricity.
   - No screens for ages 2–3.
7. **Maths must be exactly right.**
   - Every assessment answer containing a number needs `check: { expression, result }`. The validator evaluates it.
   - The correct choice's first number must equal the result.
   - Distractors should reflect real misconceptions. Map them in `distractorMisconceptions`, and describe each one in
     `misconceptions`.
8. **Questions have exactly one defensible answer.**
   - Put the correct choice at index 0 (`answer: 0`); display order is shuffled server-side.
   - An inference answer must not be stated word for word in the text.
9. **Child-facing tone is calm and warm.** No streaks, points, timers, shaming, or comparisons with other children.
10. **No real people's private data.** Historical figures are fine when facts are common knowledge.

## Quality bar
Write as an experienced teacher would for a premium product:
- concrete materials found at home;
- specific guided examples with real numbers or words;
- practice that varies;
- assessment that checks the objective;
- remediation that changes the representation, not just "try again".

Aim for about 6–10 KB of substance per unit.

## Final report
Keep it under 150 words:
- files written, with a count per level;
- the `units:check` result for your directory;
- anything you deliberately left for human or scholarly review.
