# Batch 2 STEM QA (batch `expansion-batch2-stem`)

Reviewer: independent content QA (STEM and physical safety). This reviewer did not author the content.
Date: 2026-11-12. Scope: the 20 files `content/units/*/stem/unit-*.json` whose `provenance.batch` is
`expansion-batch2-stem`. No content files were edited.

`units:check` was run on all ten STEM directories. It reports no errors in these 20 files; the one corpus error it
counts is outside them. Everything below is a judgement the validator cannot make.

## Summary

| Severity | Count |
|---|---|
| Blocker | 0 |
| Major | 8 |
| Minor | 40 |

**Verdicts:** 7 files need fixes, 13 pass. A pass can still carry minor findings, which are recommended but do not block.

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| unit-age2_3-stem-clap-pat-patterns | pass | 0 | 0 | 3 |
| unit-age2_3-stem-sink-or-float-big-things | **fix required** | 0 | 1 | 2 |
| unit-age3_4-stem-boat-that-carries | **fix required** | 0 | 2 | 2 |
| unit-age3_4-stem-shadow-play-sunlight | pass | 0 | 0 | 2 |
| unit-age4_5-stem-cup-tower-shapes | pass | 0 | 0 | 2 |
| unit-age4_5-stem-repeat-cards-loops | **fix required** | 0 | 1 | 1 |
| unit-k-stem-if-red-then-hop | pass | 0 | 0 | 2 |
| unit-k-stem-sort-by-size-algorithm | pass | 0 | 0 | 3 |
| unit-g1-stem-ruler-lever-balance | pass | 0 | 0 | 1 |
| unit-g1-stem-seedlings-light-fair-test | pass | 0 | 0 | 2 |
| unit-g2-stem-ramps-and-wheels-pull-meter | **fix required** | 0 | 1 | 1 |
| unit-g2-stem-swap-sort-number-cards | pass | 0 | 0 | 2 |
| unit-g3-stem-catapult-design-iteration | pass | 0 | 0 | 3 |
| unit-g3-stem-magnet-strength-test | pass | 0 | 0 | 2 |
| unit-g4-stem-loops-inside-events | **fix required** | 0 | 1 | 3 |
| unit-g4-stem-water-filter-design | pass | 0 | 0 | 2 |
| unit-g5-stem-data-logging-sun-bottles | pass | 0 | 0 | 1 |
| unit-g5-stem-series-parallel-leds | **fix required** | 0 | 1 | 3 |
| unit-g6-stem-functions-return-values | pass | 0 | 0 | 1 |
| unit-g6-stem-line-follower-behaviour | **fix required** | 0 | 1 | 2 |

### Cross-cutting checks

- **Shallow water versus big objects (new defect class).** Rule 6 caps water at "a few centimetres", and the under-4
  rules require objects bigger than a fist. Together they create a physics trap. A floating object sinks into the water
  until it has pushed aside its own weight of water. A big wooden block, an apple or a loaded tub needs more than 5 cm of
  water to do that, so it **rests on the bottom** and looks as if it sank. This breaks the sink/float unit (age 2–3) and
  the boat unit (age 3–4). The fix is to choose objects that float high (low draft) and low-sided boats, not to make the
  water deeper.
- **Electrical arithmetic (G5 series/parallel), recomputed.** Two AA cells give 3.0 V nominal, or about 3.2 V when fresh.
  A red or yellow LED has Vf ≈ 1.8–2.1 V.
  - **Series:** two red LEDs, or a red and a yellow, need about 3.6–4.1 V, which is more than 3.2 V. They stay dark or
    glow faintly, as the unit says (it hedges with "or glow very faintly").
  - **Parallel:** each branch has about 1.0–1.4 V across its resistor:
    - 220 Ω gives about 5–6 mA;
    - 100 Ω gives about 10–14 mA.

    Both are below the 20 mA rating. The a3 figure of "about 5 mA per branch" is consistent with this.
  - A reversed LED on 3 V is safe.
  - Every LED path has a resistor. Both the safety notes and the misconception remediation forbid joining battery wires
    directly or through foil.
  - The wiring order is explicit for the series and parallel LED circuits and for the "and" circuit, but not for the
    "or" circuit (see G5).
- **Supervision.**
  - `independent_ok` is used only on paper-only units (G2 swap sort, G6 functions, G6 line follower), which is
    appropriate.
  - The two age 2–3 units are `adult_within_reach` and screen-free.
  - The age 3–4 boat unit is a water activity but is set to `adult_present`. See that file.
- **Choking and magnets.**
  - No under-4 unit uses small parts.
  - The G3 magnet unit restricts itself to large kit magnets, bans button magnets, and explains the swallowing risk.
    Assessment item a5 teaches the right response when a younger sibling wants the magnets.
  - Choking-risk flags are set wherever bottle caps, gravel, rubber bands or electronics appear (G1 and up).
- **Catapult projectiles.** Only paper balls are launched, into a cleared zone, with everyone behind the catapult. This
  is acceptable. The eye wording could be more explicit (minor).
- **Water filter.** "Never drink, taste or cook" appears in the title, the parent instruction, the child instruction, a
  safety note and assessment item a2. The unit also teaches that filtering does not remove germs or dissolved
  substances. This is good.
- **Mosquitoes (rule 15).** Every unit with standing water empties it the same day or daily (sink/float, boat, seedlings,
  water filter, sun bottles).
- **Sham machine checks.** Four items carry a `check` that is not a calculation: `"7" = "7"`, `"9" = "9"`,
  `"115" = "115"`, and a median written as a single number. They satisfy the validator but verify nothing. Each is listed
  per file. These are STEM units, not maths units, so a check is not required where the answer is not the result of
  arithmetic.
- **Terminology (rule 13).** Four files use *tarik-ulur* for "trade-off" (cup tower, ramps ×6, water filter). In
  Indonesian, *tarik-ulur* means haggling or dithering back and forth. Use *untung-rugi* ("apa untung-ruginya?") or
  *imbal balik*.
- **Science statements verified as correct:**
  - **Lever (G1):** 6 caps × 15 cm balances 6 × 15; 6 × 5 = 30 = 2 × 15, so the load balances at 2 caps and lifts at 3;
    at 10 cm it balances at 4.
  - **Ramp (G2):** for a 60 cm ramp rising 20 cm, the ideal pull is ⅓ of the load; with friction the 8 cm drag versus
    12 cm lift is plausible.
  - **Etiolation:** taller, pale seedlings in the dark.
  - **Magnets:** aluminium is not attracted; some stainless steel spoons are not attracted.
  - **Shadows** fall on the side away from the sun and are long in the morning.
  - **Swap sort:** the traces of 4, 2, 3, 1 (5 swaps, 4 passes), 3, 1, 2 (2 swaps) and the buggy 2, 7, 4 → 7, 4, 2 are
    correct.
  - **Line-follower:** the turn directions are correct.
  - **Functions:** the traces and the `best ← 0` negative-list bug are correct.

---

## unit-age2_3-stem-clap-pat-patterns — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Materials: "Two large cups" / "Dua gelas besar". In Indonesian, *gelas* usually means a drinking glass, which can break in a toddler activity. | EN: "Two large plastic cups of different colours". ID: "Dua gelas plastik besar berbeda warna". |
| 2 | minor | Rule 11. a1 (clap, pat, clap, pat, stop, and the child claps) is exactly guided example 0. | Change a1 to a new pattern, for example "Stamp, clap, stamp, clap… then stop" / "Hentak, tepuk, hentak, tepuk… lalu berhenti", with choices "Stamps, because stamp comes after clap" / "Claps again". |
| 3 | minor | a3 index 1 ("Moves away") is mapped to `PATTERN_IS_ONE_TIME`. For a toddler, walking away is usually a loss of interest, not a belief about patterns. | Reword index 1 to "Waits and does not expect the pattern to start again" / "Menunggu dan tidak menduga pola akan dimulai lagi". |

## unit-age2_3-stem-sink-or-float-big-things — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | Floating objects touch the bottom in 5 cm of water. A "big wooden block" (density ≈ 0.6) needs a draft of about 0.6 × its height: a 10 cm block needs 6 cm of water and rests on the bottom. A whole apple (density ≈ 0.8, about 7–8 cm across) needs 5–6 cm. In 5 cm of water both sit on the floor of the tub and look as if they "sank". a1 uses the block, and the extension claims "the apple … floats", so the activity can teach the opposite of its point. | Replace the floaters with objects that float high. Materials EN: "a plastic ball, a large bath sponge, an empty plastic food box with its lid on, a thin wooden chopping board or flat wooden block no thicker than 3 cm, a metal serving ladle, a smooth stone bigger than a fist". Mirror this in ID. Change a1 to "the plastic food box". Remove the apple from the extension, or change it to "Try a big empty plastic bottle with its cap on: it is big, yet it floats", with the same change in ID. Change guided example 2 accordingly. |
| 2 | minor | The apple is a bite-size choking risk at 2–3 if the toddler bites it (in materials and extension). | Removed by fix 1. If the apple is kept, add the safety note "The adult holds the apple; do not let your child bite it" / "Orang dewasa memegang apel; jangan biarkan anak menggigitnya". |
| 3 | minor | a3 asks "What does your child expect or say **after watching**?" An answer given after watching is an observation, not a prediction, so it cannot reveal `PUSHING_MAKES_IT_SINK`. | Change it to "Before you let go, ask 'What will it do?' What does your child expect?" / "Sebelum dilepas, tanya 'Nanti bagaimana?' Apa dugaan anak?". |

## unit-age3_4-stem-boat-that-carries — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | The test cannot end the way it is written. A 2 L ice-cream tub (about 300 cm² footprint, 10 cm sides) loaded with four fist-plus stones (about 1.2–1.6 kg) needs a draft of about 4–5 cm, so in 5 cm of water it touches the bottom **before** water comes over the edge. "It carries 4 before water comes over the edge" will not happen; the boat simply grounds. A fist-plus stone may also not fit inside a yoghurt tub. | Use low-sided boats and lighter cargo. Materials EN: "Two shallow plastic trays or lids with sides about 2–3 cm high: one small (such as a margarine-tub lid) and one wide (such as a lunch-box lid or a shallow takeaway tray)". Cargo: "five or six large wooden blocks or smooth stones, each bigger than your child's fist" (blocks are lighter, so the count is higher). Add to parent instruction 3: "If the boat touches the bottom of the basin, it counts as 'too full', just like water coming in." Mirror all changes in ID. |
| 2 | **major** | `safety.supervision` is `adult_present` for water play at age 3–4. The unit's own text says "Stay right beside the basin the whole time", and rule 6 says "with an adult right there". The enum understates the requirement that the app shows parents. | Set `"supervision": "adult_within_reach"`. |
| 3 | minor | Rule 11. a1 ("Why is the stone not sinking?") repeats guided example 0 ("Why didn't it sink?") word for word. | Use a new context: "Put teddy in the floating boat. Ask 'Teddy would sink in the water. Why is he staying up?'" / "Taruh boneka di perahu yang mengapung. Tanya 'Boneka bisa tenggelam di air. Kenapa sekarang tetap di atas?'". |
| 4 | minor | a2 index 1 says "The narrow boat, because it is taller", but a margarine tub is not taller than an ice-cream tub, so the choice is incoherent for the stated materials. | After fix 1, change the choice to "The small boat, because it is deeper" / "Perahu kecil, karena lebih dalam", or make index 1 "The small one, because it is smaller and lighter" mapped to a new `SMALLER_FLOATS_BETTER`. |

## unit-age3_4-stem-shadow-play-sunlight — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | The extension says to draw the shadow in the morning, then "later in the day" / "siang atau sore". *Siang* in Indonesian (around noon) contradicts the unit's own rule to avoid the hottest part of the day. | Change it to "then stand in the same spot in the late afternoon" / "lalu berdiri di tempat yang sama pada sore hari". |
| 2 | minor | Rule 11. a2 ("Turn so that your shadow is in front") is the same move as guided example 1. | Use a new context: "Ask 'Make teddy's shadow fall on the bucket.' What does your child do?", with answer "Moves teddy so teddy is between the sun and the bucket" and distractor "Puts teddy behind the bucket, away from the sun" (`SHADOW_ON_SUNNY_SIDE`). Mirror this in ID. |

## unit-age4_5-stem-cup-tower-shapes — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Terminology: in the ID rationale, "tarik-ulur rekayasa" for "trade-off" (see the cross-cutting checks). | Change it to "untung-rugi dalam rekayasa". |
| 2 | minor | a1 prompt: "What does your child predict **or explain after testing**?" The prediction and the explanation are different evidence. | Change it to "What does your child predict before the earthquake?" / "Apa tebakan anak sebelum gempa?". |

## unit-age4_5-stem-repeat-cards-loops — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | a3 cannot discriminate. With 2 cards inside a loop of "repeat 2 times", the mapped misconception `ADDS_LOOP_NUMBER` (cards + repeats) gives 2 + 2 = **4**, which is the keyed answer. So a child with the misconception scores correct. The distractor "3 moves" is not produced by `ADDS_LOOP_NUMBER`; it comes from counting the cards including the loop card (2 + 1). | Prompt EN: "Inside the loop: stamp, clap. Repeat 3 times. How many moves is that altogether?" Choices: ["6 moves", "2 moves", "5 moves"]. check `{ "expression": "2 × 3", "result": "6" }`. Map 1 → `LOOP_RUNS_ONCE` and 2 → `ADDS_LOOP_NUMBER`. Explanation: "Two moves, done three times: 2 × 3 = 6." Mirror all of this in ID ("Ulangi 3 kali", "6 gerakan / 2 gerakan / 5 gerakan"). |
| 2 | minor | Materials 2: EN "A loop of wool or a hair band drawn around the cards" ("drawn" is wrong), while ID omits the hair band (parity). | EN: "A loop of wool or a big paper ring laid around the cards that repeat". This matches the ID. |

## unit-k-stem-if-red-then-hop — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Rule 11. a1 (a non-matching card, so stand still) uses the same situation as guided example 0 (yellow card). | Change a1 to "The rule is 'If yellow, then touch your nose.' The card is red. What do you do?", with choices "Stand still" / "Touch your nose". Mirror this in ID. |
| 2 | minor | The extension's "spin round slowly" is repeated for every non-red card (5 of 8). There is no dizziness note. | Add to safety notes: "Spins are one slow turn; stop if your child feels dizzy" / "Berputar cukup satu putaran pelan; berhenti jika anak pusing". |

## unit-k-stem-sort-by-size-algorithm — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Practice 0 objects are near-ties: a spoon (15–20 cm) against a toothbrush (about 19 cm) against a pencil (about 17.5 cm), and a 30 cm ruler against a wooden spoon (about 30 cm). A K child cannot reliably find "the shortest" among ties. | EN: "five household objects that clearly differ by at least a finger's width, such as a teaspoon, a crayon, a toothbrush, a 30 cm ruler and a long wooden spoon (check them yourself first)". Mirror this in ID. |
| 2 | minor | The rationale says swapping two at a time "is **exactly** how computers sort lists". It is one of several methods (selection sort). | Change it to "is one way computers sort lists" / "adalah salah satu cara komputer mengurutkan daftar". |
| 3 | minor | Parent instruction 1 says "stand two strips side by side". Thin card strips will not stand up. | Change it to "hold two strips upright side by side with their bottoms touching the table" / "pegang dua potongan tegak berdampingan dengan bagian bawah menyentuh meja". |

## unit-g1-stem-ruler-lever-balance — **pass**

The lever numbers were checked and are correct (see the cross-cutting checks).

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | In practice 2 the grown-up sits on the seesaw, but the safety note says "only with an adult holding on". Nobody is free to hold on. | Change the note to "Seesaw tests need a second adult standing beside the seesaw, or the adult rider keeps both feet on the ground and lowers it slowly. Never jump off while the other person is up." Mirror this in ID. |

## unit-g1-stem-seedlings-light-fair-test — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Fair test: a sunny window sill in Indonesia is also hotter and dries the soil faster than a cupboard, so heat and water change along with light. | Parent instruction 2 EN: "Put LIGHT in a bright spot out of direct midday sun, and check that both cups' soil feels equally damp before watering." Add the same to the "same" list. Mirror this in ID. |
| 2 | minor | Rule 11. a2 repeats guided example 2 (tall, thin, yellow against short, green). | Change a2 to a transfer item: "Two cups of seedlings were grown under a box for 7 days, then one was moved to the window for 3 days. Which now has greener leaves?", with choices "The one moved to the window" / "The one still under the box" (`TALLEST_IS_HEALTHIEST` → change to a new `LIGHT_HAS_NO_EFFECT`). Mirror this in ID. |

## unit-g2-stem-ramps-and-wheels-pull-meter — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | The extension "tape two round pencils under a box as rollers" is wrong science (rule 14). Taped pencils cannot turn, so they become skids that **slide**. The child will measure about the same pull as dragging and conclude that rollers do not help. | EN: "Make rollers: lay three round pencils loose on the floor and rest the box on them; pull slowly and move the back pencil to the front as it rolls out. Compare the pull with dragging on the floor." ID: "Buat rol: letakkan tiga pensil bulat lepas di lantai dan taruh kotak di atasnya; tarik pelan dan pindahkan pensil paling belakang ke depan saat keluar. Bandingkan tarikannya dengan menyeret di lantai." |
| 2 | minor | Terminology: *tarik-ulur* is used six times for "trade-off" (objective, parent instruction 3, a5 prompt and choice, explanation, mastery). | Replace each with *untung-rugi* (for example "apa untung-ruginya?", "Tidak ada ruginya; lebih mudah dalam segala hal"). |

## unit-g2-stem-swap-sort-number-cards — **pass**

All traces were checked and are correct.

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | The a4 check `{ "expression": "7", "result": "7" }` is a sham. The answer is a row, not a calculation. | Remove the `check`, or change a4 to ask for a number: "How many swaps does Doni's robot make?" (pass 1: 2, pass 2: 0, so 2; check `"2 + 0"` = `"2"`). |
| 2 | minor | a1 index 2 ("3 swaps") is mapped to `COUNTS_COMPARISONS_AS_SWAPS`, but 3, 1, 2 has 2 comparisons per pass and 4 in all, so that misconception gives 2 or 4, not 3. | Change index 2 to "4 swaps" / "4 tukar" (2 comparisons × 2 passes), which keeps the mapping. |

## unit-g3-stem-catapult-design-iteration — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | The a1 check `{ "expression": "115", "result": "115" }` is a sham. A median is not arithmetic the validator can check. | Remove the `check`. The explanation already shows the ordering. |
| 2 | minor | The rationale says the catapult "stores energy in a stretched rubber band". In this V design most of the energy is stored in the **bent sticks**, with the bands holding them. | EN: "stores energy in its bent sticks and rubber bands". ID: "menyimpan energi di stik yang melengkung dan karet gelangnya". |
| 3 | minor | The eye safety wording is indirect ("keep faces back"). Children lean over the spoon to aim. | Add to safety notes: "Keep eyes out of the spoon's path: never look down along the arm while pressing or releasing" / "Jauhkan mata dari jalur sendok: jangan melihat menyusuri lengan ketapel saat menekan atau melepas". |

## unit-g3-stem-magnet-strength-test — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Guided example 1 says "the drinks can and the foil … are aluminium". In Indonesia many drink cans (canned milk, some coffee drinks) are **steel** and will stick, so a family's result can contradict the text. | Materials EN: "an empty aluminium soft-drink can". Guided example 1: add "(Some drink cans, such as canned milk, are steel and do stick: test yours!)". Mirror this in ID. |
| 2 | minor | "A big fridge magnet": many souvenir fridge magnets have a small disc magnet glued on the back that can come loose. | Change it to "a large flat flexible (rubbery sheet) fridge magnet with no small magnet glued on" / "magnet kulkas lembaran lentur yang besar, tanpa magnet kecil yang ditempel". |

## unit-g4-stem-loops-inside-events — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | Guided example 2's notation is ambiguous. `repeat 2 times: [repeat 4 times: jump; wave]` reads naturally as an inner loop body of "jump; wave", which gives 8 jumps and **8** waves (16 actions). The unit asserts 8 jumps and 2 waves (10). A unit about counting nested loops cannot leave the loop boundary implicit. | EN: "'When the clap happens: repeat 2 times: [ repeat 4 times: [jump] ; wave ]'. The wave is inside the outer loop but outside the inner one." ID: "'Saat ada tepukan: ulangi 2 kali: [ ulangi 4 kali: [lompat] ; lambaikan tangan ]'. Lambaian ada di dalam perulangan luar tetapi di luar perulangan dalam." Use the same `[ ]` convention in cpa.abstract and a1 ("repeat 3 times: [ repeat 2 times: [hop] ]"). |
| 2 | minor | Guided example 1's EN heading says "Forever with an **event** inside", but the inside is a condition ("if you touch the wall"). The ID ("pemeriksaan") is correct. This confuses the two ideas the unit separates. | Change it to "Forever with a check inside". |
| 3 | minor | Guided example 0: "The wall is 6 heel-to-toe steps from **Ayu**", but Bayu does the walking. | Change it to "from Bayu" / "dari Bayu". |
| 4 | minor | The a2 check `{ "expression": "9", "result": "9" }` is a sham. | Remove the `check`. |

## unit-g4-stem-water-filter-design — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Terminology: in guided example 2, "ada tarik-ulurnya". | Change it to "ada untung-ruginya". |
| 2 | minor | The `DISSOLVED_IS_PARTICLES` remediation says that after an hour "the mud settles to the bottom". Fine clay in garden soil often stays cloudy for hours, so the contrast may not appear. | Change it to "most of the mud settles and the water above gets clearer; the colour stays the same all the way down" / "sebagian besar lumpur mengendap dan air di atasnya lebih jernih; warnanya tetap sama dari atas sampai bawah". |

## unit-g5-stem-data-logging-sun-bottles — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | a3: "Three repeat readings of the same bottle **at the same time** were 29, 31 and 30 °C." One thermometer read three times at one moment would not vary by 2 °C, so the scenario is implausible. | EN: "Ani repeated the experiment on three sunny days. At 30 minutes the black bottle read 29 °C, 31 °C and 30 °C. What is the mean?" Mirror this in ID. |

## unit-g5-stem-series-parallel-leds — **fix required**

The electrical values were checked and are correct (see the cross-cutting checks).

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | Rule 15 requires an explicit wiring order, and the "or" circuit in guided example 2 does not give one: "red wire → both switch 1 and switch 2 side by side → both join to the resistor". It does not say which lead goes where. This is the circuit where a child is most likely to clip a switch output straight to black, making a foil short across the cells. | EN: "'Or' circuit (6 leads): lead 1 from the red wire to switch 1's left foil; lead 2 from the red wire to switch 2's left foil; lead 3 from switch 1's right foil to the resistor's first leg; lead 4 from switch 2's right foil to the same resistor leg; lead 5 from the resistor's other leg to the LED's long leg; lead 6 from the LED's short leg to the black wire. Nothing from a switch ever goes to the black wire." Mirror this in ID. Give the "and" circuit the same lead-by-lead form. |
| 2 | minor | The `CURRENT_REDIRECTS` remediation uses "a third LED on its own", but the materials list only 2 LEDs (rule 17). | Change it to "Compare LED B's brightness before and after unclipping A: it looks the same." Alternatively, add a third red LED and resistor to the materials. |
| 3 | minor | The `RESISTOR_ADDS_POWER` remediation compares 100 Ω with 220 Ω, but the materials say "2 resistors of about 100 to 220 ohms". The family may have two of the same value. | Materials EN: "2 resistors of 220 ohms, one for each LED, and 1 extra 100-ohm resistor for comparing brightness". Mirror this in ID. Both values stay within the rule-15 range. |
| 4 | minor | The parallel wiring clips a second lead onto "the same metal end" of the thin holder wire. Two jaws on a short stranded end slip easily, and a loose red end can touch a black clip. | Change it to "Branch B: clip a lead from the first leg of resistor A to the first leg of resistor B, and a lead from LED A's short leg to LED B's short leg." This joins the branches at component legs, not at the holder wire. |

## unit-g6-stem-functions-return-values — **pass**

All traces were checked and are correct.

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Guided example 2 prints "morning + 2 for a **forecast** of 31". Adding 2 is not a forecast and presents an invented rule as science. | Change it to "later prints morning + 2 to show what 2 degrees warmer would be" / "lalu mencetak pagi + 2 untuk menunjukkan suhu jika 2 derajat lebih hangat". |

## unit-g6-stem-line-follower-behaviour — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | Fix (a) in guided example 2 is presented as working, but its rule is logically broken. The rule is "when both read white after a turn, keep turning that way". With straddling sensors, "white, white after a turn" is exactly what happens after **every successful correction**, because the turn brings the line back between the sensors. The robot keeps turning until the other sensor sees black, turns back, and repeats, so it spins and wiggles in place and never drives forward on the gentle curve. The unit's own simulation method would expose this. | Replace (a) with: "(a) a memory variable last_seen that stores which sensor last read black, and a counter lost_ticks. When both read white, move forward and add 1 to lost_ticks; when either sensor reads black, set lost_ticks to 0. If lost_ticks reaches 3, the robot is lost: turn towards last_seen until a sensor reads black." Change the sentence about Laras to "Laras tests fix (a) on both the gentle curve and the sharp bend; it still follows the curve and now finds the line again after the bend." Mirror this in ID (`terakhir_terlihat`, `detak_tersesat`). Update the extension to use these variables. |
| 2 | minor | The a2 prompt says "The line **is** between the sensors. The left sensor **now** reads black", which contradicts itself. | Change it to "The line was between the sensors. Now the left sensor reads black …" / "Tadinya garis di antara sensor. Sekarang sensor kiri membaca hitam …". |
| 3 | minor | a4 has a fencepost ambiguity: "How many checks in 8 cm" with 2 cm between checks could be 4 moves or 5 checks if the check at the start counts. The G5 unit explicitly taught that "6 readings have 5 gaps". | Change it to "How many 2 cm moves fit in that distance?" / "Berapa gerakan 2 cm yang muat dalam jarak itu?" and keep the answer 4. |

---

## Verdict

No blockers. Seven files need fixes before human review:

- the two shallow-water units (sink/float, boat), because their physics does not work in 5 cm of water;
- repeat cards a3, because a misconception reaches the keyed answer;
- the ramps extension (taped rollers);
- the loops-in-events nested-loop notation;
- the series/parallel "or" wiring order;
- the line follower's memory fix.

The other 13 pass. Their minor findings are recommended. All 20 files keep `reviewStatus: "agent_reviewed"`. This review
is not a human approval.
