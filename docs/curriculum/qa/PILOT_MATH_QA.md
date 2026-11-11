# Pilot maths QA (batch `expansion-pilot-math`)

Reviewer: Agent G5 (independent content QA, mathematics). Reviewed 2026-11-10/11. No content files were edited.

Scope: the 21 files under `content/units/*/math/unit-*.json` with `provenance.batch: "expansion-pilot-math"`.
The reference `unit-g2-math-place-value-hundreds` was not reviewed.
`pnpm --filter @atlas/curriculum units:check -- content/units` result: 102 units and 41 readings parsed, 0 errors.

Checks per file:
1. I recomputed every worked example, practice item, explanation, check and answer, and confirmed that index 0 is the only correct choice.
2. The CPA progression is genuine.
3. Misconceptions are real, and remediations change the representation.
4. The unit fits its grade in a Singapore-style progression, and its prerequisites come in the right order.
5. The Indonesian reads naturally and formats numbers consistently. Indonesian prose uses `.` for thousands and `,` for decimals. Machine `check` fields use English notation by design.
6. Safety, including split pins, coins and allergens.

Severity:
- **blocker**: must not ship (wrong maths, or a hard-rule or safety violation).
- **major**: a reviewer must fix it before approval.
- **minor**: polish, recommended.

Verdict:
- **pass**: no blocker or major.
- **fix required**: at least one blocker or major.

## Headline findings

- **No mathematical errors.** Every stated result, explanation and machine check is arithmetically correct. Every answer at index 0 is the only correct choice. Every distractor I recomputed matches the misconception it is mapped to, apart from the minor mapping slips listed below.
- **Units are distinct, not number-swapped copies.** Each unit has its own objective, contexts (warung, angkot, martabak, bak mandi, ojek, es buah), CPA materials and misconception set. The generator shows in shared scaffolding: the same mastery-rule tail "on two different days", the same review intervals, and similar parent-instruction shapes. That is acceptable.
- **Systemic major: assessment repeats the worked examples.** In 16 of 21 units, three to six of the five or six assessment items are the guided examples (or CPA and success-criteria examples) copied word for word with the same numbers. Examples: martabak 3/8, Pak Budi 8 + 7, 475 g + 348 g, the angkot every 6 and 9 minutes, the 40 × 25 × 30 aquarium, and Rp 40.000 shared 3 : 5. The assessment then measures recall of a shown solution, not the objective. **Fix for every affected unit:** keep the item type, distractor logic and misconception mapping, but change the numbers or context in at least 3 items per unit, so that no assessment prompt appears in `guidedExamples`, `cpa` or `successCriteria`. Recompute the `check` for each changed item.
- **Systemic minor: some checks only restate the answer.** Examples are `"expression": "15"` and `"4.64"`. These are listed per file. Where the answer is a choice or a position, a restating check is unavoidable. Elsewhere, prefer the real calculation.
- **Number formatting** is consistent. English uses `Rp 9,500`, `3,600 cm³` and `0.45`; Indonesian uses `Rp9.500`, `3.600 cm³` and `0,45`. The decimals unit explains the convention to parents, and the clock unit uses `7.30` in Indonesian. Small inconsistencies, where `1000` is written instead of `1.000` in Indonesian prose, are noted per file.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| k-math-compare-numbers-to-20 | pass | 0 | 0 | 4 |
| k-math-compare-lengths | pass | 0 | 0 | 4 |
| k-math-number-bonds-to-10 | pass | 0 | 0 | 3 |
| g1-math-tens-and-ones-to-100 | pass | 0 | 0 | 3 |
| g1-math-make-ten-addition | **fix required** | 0 | 2 | 2 |
| g1-math-time-half-hour | **fix required** | 0 | 1 | 4 |
| g2-math-addition-regrouping-1000 | **fix required** | 0 | 1 | 2 |
| g2-math-money-rupiah | **fix required** | 0 | 1 | 3 |
| g2-math-multiplication-equal-groups | **fix required** | 0 | 1 | 1 |
| g3-math-fractions-of-a-whole | **fix required** | 0 | 1 | 4 |
| g3-math-multiplication-division-bar-models | **fix required** | 0 | 1 | 2 |
| g3-math-perimeter | **fix required** | 0 | 1 | 4 |
| g4-math-area-of-rectangles | **fix required** | 0 | 1 | 2 |
| g4-math-equivalent-fractions | **fix required** | 0 | 1 | 2 |
| g4-math-factors-and-multiples | **fix required** | 0 | 1 | 4 |
| g5-math-adding-unlike-fractions | **fix required** | 0 | 1 | 3 |
| g5-math-decimals-to-thousandths | **fix required** | 0 | 1 | 4 |
| g5-math-volume-of-cuboids | **fix required** | 0 | 2 | 2 |
| g6-math-percentages | **fix required** | 0 | 1 | 2 |
| g6-math-ratio | **fix required** | 0 | 1 | 1 |
| g6-math-algebraic-expressions | **fix required** | 0 | 1 | 3 |

**Totals: 4 pass, 17 fix required. 0 blockers, 19 majors, 59 minors.**
16 of the majors are the assessment-reuse issue; the other 3 are unit-specific.

---

## Kindergarten

### unit-k-math-compare-numbers-to-20 (pass)
The CPA progression is good: spoons matched to cups, then ten-frames, then a number line. The conservation item (a5) is a well-chosen misconception check.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1 `check` | `10 + 9 = 19` builds the answer and does not compare anything. | Use `19 - 16` with result `3` only if the choice wording changes; otherwise accept it and note it as restating. |
| 2 | minor | assessment a5 `check` | `"expression": "10"` restates the answer. | Use `20 - 10` with result `10`, i.e. 20 blocks in all minus the close row. |
| 3 | minor | practice[0] | "Roll two large dice" only gives numbers 1 to 6, but the objective is numbers to 20. | Replace with "Turn over two number cards from 1 to 20". |
| 4 | minor | practice[1], safety | Counting kerupuk at snack time is eating, and kerupuk is often made with shrimp, but `allergens` is false. | Set `hazards.allergens: true` and add "Check crackers for shrimp or other allergens" to the safety notes, or use rice crackers. |

### unit-k-math-compare-lengths (pass)
Direct comparison, the fair start line, gaps and overlaps, and unit size (spans) are all genuine early-measurement ideas, in a sensible order.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | guidedExamples[0] | The demo needs two pencils of equal length, but no pencils are listed in materials. | Add "two pencils of the same length" to `materials`. |
| 2 | minor | assessment a4 `check` | `"15"` restates the answer. | Accept, or use `15 - 6` with result `9` and reword the item as "how much longer is the broom than the book". |
| 3 | minor | cpa.pictorial | Drawing three strips is thin as a pictorial step. | Add: "draw the blocks under each strip and write the count". |
| 4 | minor | ID text | "Selotip kertas" is unusual. "Satuan yang lebih panjang muat lebih sedikit kali" is awkward. | Use "lakban kertas (masking tape)" and "Satuan yang lebih panjang muat lebih sedikit, jadi hitungannya lebih kecil". |

### unit-k-math-number-bonds-to-10 (pass)
The number-bond representation is described correctly: a whole circle joined to two part circles. The zero-as-a-part misconception is well handled. The rambutan seed note is appropriate.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | ID masteryRule | "menyebut semua pecahan satu bilangan" says "fractions" (*pecahan*), which is the wrong maths term. | Use "menyebut semua cara memecah satu bilangan". |
| 2 | minor | ID guidedExamples[1] | "Bilang lanjut dari 5 ke 8" is unnatural. | Use "Hitung lanjut dari 5 ke 8". |
| 3 | minor | assessment | All five items are practised verbatim in the worked examples (8 kue, 7 and 0, and others). This is acceptable at K, where rehearsal is the goal, but transfer is not tested. | Change one or two items to new numbers, e.g. whole 9 with a part of 2. |

## Grade 1

### unit-g1-math-tens-and-ones-to-100 (pass)
Bundling straws, then sticks and dots with a hundred chart, then expanded form is a strong CPA sequence. Regrouping 13 loose straws into a bundle and the "no more than 9 loose" rule are good.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a3 `check` | `8*10 + 5` restates 85 and does not compare. | Accept, or reword as "how many more is 85 than 58?" with `85 - 58` = `27`. |
| 2 | minor | assessment a2 distractor 2 | `62` is mapped to FACE_VALUE, but it is "gives the whole number", a different error. | Add a misconception `GIVES_WHOLE_NUMBER` and map it. |
| 3 | minor | assessment | a2 and a3 reuse guided numbers (58 and 85, 6 tens). | Change a3 to, e.g., 74 and 47. |

### unit-g1-math-make-ten-addition (fix required)
The make-ten strategy is taught correctly, with egg-carton frames, then arrow drawings, then 7 + 3 + 3.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | prerequisites | `unit-g1-math-tens-and-ones-to-100` is a prerequisite for adding within 20. In a Singapore P1 order, numbers to 20 and make-ten come before numbers to 100. The tens-and-ones rationale itself says it prepares for make-ten. | Replace it with `unit-k-math-compare-numbers-to-20`; keep `unit-k-math-number-bonds-to-10`. |
| 2 | major | assessment a1, a4, a5 | These copy guided[0] (9 + 4), guided[2] (Pak Budi 8 + 7) and guided[3] (17 = 9 + ?) word for word. | E.g. a1 `9 + 6` = `15`, a4 Bu Sari's 6 + 8 rambutan = `14`, a5 `15 = 8 + ?` = `7`. Recompute the distractors (off by one, digits side by side, adding the givens). |
| 3 | minor | misconceptions LOSES_ONE_WHEN_SPLITTING | The description says "loses or double-counts… one too small". Double-counting gives one too many. | Use "Loses one object when splitting, giving an answer one too small." |
| 4 | minor | a3 distractor `3` | It is mapped to WRONG_PARTNER_OF_TEN, but 3 is the correct partner for 7; the child gives the moved part instead of the remainder. | Add `GIVES_MOVED_PART` ("answers with the amount moved to make ten") and map it. |

### unit-g1-math-time-half-hour (fix required)
The CPA design is good: the fold line on the plate, a short-hand-only start, and a note on Indonesian *setengah delapan* = 7.30. The Indonesian clock notation (`7.30`) is correct.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | ID materials, parentInstructions, preparation, safety | A split pin (paper fastener) is translated as "paku pines". In Indonesian that means a thumbtack or push pin, which is sharper and a different object. A parent following the Indonesian text would use a thumbtack. | Replace every "paku pines" with "paku keling kertas (split pin / paper fastener)". Better still, offer a pin-free option in materials: "or push a short pencil stub or a rolled paper plug through the centre". |
| 2 | minor | safety (G1) | A split pin is acceptable with the adult inserting it, and the hazards are flagged. It is still the riskiest item in the batch for homes with toddlers. | Make the pin-free fastener the default and the split pin the alternative. |
| 3 | minor | a1/a3/a5 `check` | `"3"`, `"7"` and `"9"` restate the hour. a3 ("Between 7 and 8") cannot really be checked. | Accept a3 as unavoidable. For a5, use `9 + 30/60` with result `9.5` only if the choice starts with 9.5; otherwise accept. |
| 4 | minor | a3 distractor `Between 6 and 7` | It is mapped to HALF_PAST_CONFUSION, which is about the long hand. The error is reading "half past 7" as "half way to 7". | Map it to READS_NEXT_HOUR, or add `HALF_TO_HOUR`. |
| 5 | minor | ID a5 explanation | "jarum panjang di 6 berarti lewat setengah jam" is awkward. | Use "jarum panjang di 6 berarti sudah 30 menit lewat pukul 9". |

## Grade 2

### unit-g2-math-addition-regrouping-1000 (fix required)
The maths is exact, including the distractors: 515 is no regrouping, 51115 is column sums, 723 and 813 forget the regrouped digit, and 790 and 700 are the same errors for 586 + 214. The compensation item is well designed.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a2, a5 | These copy the CPA and success criteria (358 + 267), guided[1] (475 g + 348 g) and guided[3] (399 + 245). | E.g. a1 `467 + 385` = `852` (distractors 742 and 71212); a2 `386 g + 457 g` = `843` (743, 833); a5 `298 + 356 → 300 + ?` = `354` (356, 358). |
| 2 | minor | practice[1] | Three-digit rupiah prices barely exist. | Use "grams on food labels, or prices in thousands (e.g. 125 thousand)". |
| 3 | minor | ID | `1000` in Indonesian prose. | Write `1.000` in the Indonesian title, objective and guided[2] text; keep the English as is. |

### unit-g2-math-money-rupiah (fix required)
The rupiah denominations are real (Rp500 and Rp1.000 coins; Rp2.000 to Rp20.000 notes). The thousands-as-units idea is good. The number format is explained to parents. Coins come with adult supervision and the choking flag is set; that is acceptable at G2.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1–a3, a5 | These are the guided examples word for word: 5.000 + 2.000 + 2.000 + 500, martabak 15.000 from 20.000, es teh + gorengan, and Bayu's 12.000 − 4.500. | E.g. a1 Rp10.000 + Rp2.000 + Rp1.000 + Rp500 = `13500`; a2 Rp13.000 paid with Rp20.000 = `7000`; a3 Rp6.500 + Rp2.000 = `8500`; a5 Rp15.000 − Rp7.500 = `7500`. |
| 2 | minor | guidedExamples[3] title | The title "Change with regrouping" / "Kembalian dengan meminjam" does not fit, because the method shown is counting up. | Use "Change across a thousand" / "Kembalian melewati ribuan". |
| 3 | minor | ID guidedExamples[0] | "Empat keping" is used for notes and a coin; *keping* is for coins. | Use "Empat lembar dan keping". |
| 4 | minor | prices | A gorengan at Rp3.500 is high for one piece. | Use "3 gorengan Rp3.500" or "gorengan Rp1.500". |

## Grade 2–3: multiplication and division

### unit-g2-math-multiplication-equal-groups (fix required)
Equal groups, a non-example of unequal groups, arrays and commutativity form the correct Singapore P2 progression. The Indonesian reading "4 kali 3 = 3 + 3 + 3 + 3" matches the "4 groups of 3" convention.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a4, a5, a6 | These copy the concrete step (4 plates × 3 kue), guided[2] (7 becak), the pictorial step (3 × 6 crate) and guided[3] (4 × 5). | E.g. a1 5 plates × 4 kue = `20` (9, 54); a4 6 bajaj × 3 passengers = `18`; a5 4 rows × 6 = `24`; a6 `3 × 5 = 5 × ?` = `3`. |
| 2 | minor | ID | "susunan berjajar" for array is acceptable, but textbooks also use "larik". | Optional: add "(larik)" on first use. |

### unit-g3-math-multiplication-division-bar-models (fix required)
The bar models are described correctly: a bracket over the total, a unit box for the unknown, and a comparison bar for "times as many". Sharing and grouping are distinguished well.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1–a3, a5 | These are guided[3], [0], [1] and [2] verbatim: 6 × 7, 32 rambutan into 4 bags, 45 kerupuk in 5s, batik 4 × 6 m. | E.g. a1 `7 × 8` = `56`; a2 36 salak into 4 bags = `9`; a3 48 kue in 6s = `8`; a5 a ribbon 3 times as long as 7 m: how much longer = `14`. |
| 2 | minor | a4 distractor `54` | It is mapped to FACT_NEIGHBOUR_SLIP, but 54 is not a neighbouring fact of 8 × 7 (those are 48, 49, 63 and 64). | Replace it with `48`. |
| 3 | minor | guidedExamples[2] | A 24 m batik cloth is unrealistic. | Use "a rope" or "a garden path". |

## Grade 3

### unit-g3-math-fractions-of-a-whole (fix required)
The CPA progression is good: food or paper in equal parts, then a fraction wall, then notation, plus a fraction of a set.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a2, a6 | These are guided[0] (martabak 3/8), guided[1] (1/3 vs 1/5) and guided[3] (1/4 of 12 eggs). a3 is the pictorial example (quarters). | E.g. a1 roti in 6 pieces, 5 eaten → `5/6`; a2 `1/4` vs `1/6`; a6 `1/3 of 15` = `5`. |
| 2 | minor | a1/a2 `check` | `3/8` and `1/3` restate the answer. | Accept; there is no calculation to check. |
| 3 | minor | cpa.pictorial | The fraction wall has rows 2/3/4/6/8, but the child then compares 1/5. | Add a fifths row, or compare 1/3 and 1/6. |
| 4 | minor | grade fit | A fraction of a set (1/4 of 12) is Singapore P4. It is acceptable here as an extension idea. | Mark guided[3] and a6 as stretch, or keep them as a bridge to division. |
| 5 | minor | ID | "perdua" is uncommon. | Use "setengah/seperdua" in prose; "perdua" is fine as a wall label. |

### unit-g3-math-perimeter (fix required)
All the side sums are correct: 26, 28, 24, 42 − 2 = 40, and a missing side of 6. Perimeter is treated as a distance (string, walking), which is good.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a2, a4, a5 | These are guided[0]–[3] verbatim: 8 × 5, the 7 m square, the 12 × 9 bed with a gate, and the 30 cm rectangle with a 9 cm length. | E.g. a1 9 cm × 4 cm = `26`; a2 a 6 m square = `24`; a4 a 10 m × 7 m bed with a 3 m gate = `31`; a5 perimeter 36 cm, length 11 cm → `7`. |
| 2 | minor | guidedExamples[1] | "A floor tile with side 7 m" is absurd. | Use "a square courtyard (halaman) with side 7 m". |
| 3 | minor | guidedExamples[0] | "A placemat 8 cm by 5 cm" is too small. | Use "a card 8 cm by 5 cm", or a placemat 40 cm by 30 cm. |
| 4 | minor | prerequisites, extension | The unit multiplies (2 × (8 + 5), 4 × 7), but its only prerequisite is addition. The extension ("biggest bed") needs area, which is not yet taught. | Add the prerequisite `unit-g3-math-multiplication-division-bar-models`. Change the extension to "how many different whole-number rectangles use 24 m?". |

## Grade 4

### unit-g4-math-area-of-rectangles (fix required)
Area is shown as rows of squares linked to arrays, and contrasted with perimeter. The a3 distractor of 32 m² (the perimeter of the L-shape) is an excellent detail.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1–a5 | Every item is a guided or CPA example: 7 × 4, the 5 × 3 floor, 36 ÷ 9, the 10 × 6 yard minus 4 × 3, and 6 × 6 vs 9 × 4. | E.g. a1 8 cm × 6 cm = `48`; a3 area 42 cm², length 7 cm → `6`; a4 12 m × 8 m minus 5 m × 4 m = `76`; a5 a 4 × 9 vs 3 × 12 comparison (both 36). |
| 2 | minor | cpa.concrete | It counts real floor tiles, then switches to imagined 1 m tiles. | Say "the area is 15 tiles", then reveal in m² using a measured tile size. |

### unit-g4-math-equivalent-fractions (fix required)
Folding to show multiplicative scaling is correct. The 24 cm strip divides evenly into 2, 3, 4, 6, 8 and 12. Linking to the highest common factor (FPB) is right.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a2, a4, a5 | These are the CPA/success examples (2/3 = 8/12, 12/18) and guided[2] and [3] (kue lapis 1/4 = 2/8, 3/4 vs 5/8). | E.g. a1 `3/4 = ?/12` = `9`; a2 `16/24` → `2/3` (8/12, 4/6); a4 1/3 of a kue cut into sixths → `2`; a5 `2/3 vs 5/9`. |
| 2 | minor | a4 distractor `4` | It is mapped to ADDITIVE_SCALING, but the additive error for 1/4 → ?/8 gives 5 (1 + 4). | Change the choice to `5`. |

### unit-g4-math-factors-and-multiples (fix required)
Building rectangles from tiles is a real concrete model for factor pairs and primes. The FPB/KPK contexts are correct (6 boxes of 3 and 4; angkot at 7.18).

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a2, a4–a6 | These copy the concrete step (12 has 6 factors), guided[2] (angkot 6 and 9), the abstract step (FPB of 18 and 24) and guided[3] (17 is prime, 21 is not). | E.g. a2 factors of 18 = `6`; a4 buses every 8 and 12 minutes = `24` (96, 4); a5 FPB of 16 and 24 = `8` (4, 48); a6 `23` vs 27 and 33. |
| 2 | minor | a5 distractor `3` | It is mapped to STOPS_AT_FIRST_COMMON, but the first common factor after 1 is 2. | Rename the code to `NOT_HIGHEST_COMMON_FACTOR`, or change the choice to `2`. |
| 3 | minor | a2/a6 `check` | `3 * 2` (pairs × 2) does not work for square numbers. `"17"` restates the answer. | Accept a6. For a2, keep the item but note the pairs method in the explanation. |
| 4 | minor | grade fit | Primes and FPB/KPK by name come later than P4 in Singapore (P4 has common factors and multiples only), but fit Indonesia's grade 4–5. | Keep. Note "Indonesian SD sequence" in the rationale. |

## Grade 5

### unit-g5-math-adding-unlike-fractions (fix required)
All results are verified: 5/6, 1 5/12, 7/12, 13/20, 4 1/6 and a lowest common denominator (LCD) of 24. The area-model pictorial (rows and columns giving sixths) is excellent, and the remediations are strong.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1–a3, a5 | These are guided[0]–[3] verbatim. | E.g. a1 `1/2 + 1/5` = `7/10` (2/7, 1/10); a2 `5/6 + 3/4` = `1 7/12` (8/10, 19/24); a3 `3/4 - 1/6` = `7/12`; a5 `2 3/4 + 1 2/3` = `4 5/12` (3 5/7, 3 5/12). |
| 2 | minor | a5 distractor `3 1/6` | It is mapped to FORGETS_TO_REGROUP_WHOLE ("leaves an improper fraction"), but the choice drops the whole. | Change the choice to `3 7/6`, or reword the description to "drops the extra whole". |
| 3 | minor | materials | Fifths are said to come "from the equivalent fractions unit", but that unit made 2/3/4/6/8/12 strips only. a4 needs twentieths. | Use "make a fifths strip (24 cm ÷ 5 is awkward: use a 20 cm strip)". |
| 4 | minor | ID | "pecahan biasa yang lebih dari satu" | Use "pecahan tidak sejati (pecahan biasa yang lebih dari satu)". |

### unit-g5-math-decimals-to-thousandths (fix required)
The values are verified. Shading 0.405 as 40½ squares on a hundred grid is correct and clever. The Indonesian decimal comma is used consistently, including `0,7; 0,07` with semicolons.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a2, a4, a5 | These are guided[0]–[3] verbatim (3.472, 0.45 vs 0.405, 1,375 g, 4.638). | E.g. a1 the value of 5 in 6.159 = `0.05`; a2 `0.3` vs `0.299`; a4 2,060 g = `2.06` kg (20.6, 2.6); a5 round 7.315 to the nearest hundredth = `7.32` (7.31, 7.3). |
| 2 | minor | a5 `check` | `"4.64"` restates the answer. | Accept; rounding is not expressible. |
| 3 | minor | number format | English "1,375 g → 1.375 kg" and Indonesian "1.375 g → 1,375 kg" are correct, but the separators are the exact confusion this unit teaches. The parent note covers decimals only. | Extend parentInstructions[0]: "Indonesian also uses a point for thousands: 1.375 g is one thousand three hundred seventy-five grams." Or write `1375 g` without a separator in both languages. |
| 4 | minor | grade fit, ID | Three decimal places is Singapore P4, so this is acceptable as G5 revision. The Indonesian objective writes `1000`. | Write `1.000` in the Indonesian objective. |

### unit-g5-math-volume-of-cuboids (fix required)
All results are verified: 30, 30 L, 3, 64, 3.600 and 240 L. The 62 cm² surface-area distractor is a well-chosen misconception.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | misconceptions CONVERSION_SHIFT remediation | "Measure a 1-litre carton: about 10 cm by 10 cm by 10 cm" is false. Real 1 L cartons are about 6 × 9.5 × 19 cm. A child who measures will be confused. | Use: "Measure a 1-litre carton (about 6 cm × 9.5 cm × 17.5 cm ≈ 1.000 cm³), or build a 10 cm × 10 cm × 10 cm card cube and pour 1 litre into it". |
| 2 | major | assessment a1–a4 | These are guided[0]–[3] verbatim (5 × 3 × 2, the aquarium, 60 ÷ 20, a 4 cm cube). | E.g. a1 6 × 4 × 3 = `72`; a2 50 × 30 × 40 = `60` L (600, 6); a3 V 84 cm³, base 4 × 7 → `3`; a4 a cube with 5 cm edges = `125` (15, 25). |
| 3 | minor | safety | The note names a choking risk from small cubes and dice, but `chokingRisk` is false. | Set `hazards.chokingRisk: true`. |
| 4 | minor | successCriteria[0], concrete | Dice and wooden cubes are rarely 1 cm, so "12 cm³" is wrong for them. | Say "12 cubic units (12 cm³ if the cubes are 1 cm)". |

## Grade 6

### unit-g6-math-percentages (fix required)
All results and distractors are verified, including 20% as the wrong-base error (3.000/15.000) and 7.2 as the reverse-percentage error. Using 10% and 1% steps on a percentage bar is the right Singapore approach.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, a2, a5, a6 | These are guided[0]–[3] verbatim (25% of 80.000, 20% off 150.000, rice 12.000 → 15.000, 40% is 18). | E.g. a1 15% of Rp60.000 = `9000`; a2 25% off Rp120.000 = `90000`; a5 Rp8.000 → Rp10.000 = `25%` (20%, 2%); a6 30% is 27 → `90`. |
| 2 | minor | cpa.concrete, a4 `check` | "Concrete" here is colouring squared paper, which is pictorial. The a4 check `0.4` restates the answer. | Make the concrete step handle 100 real items (e.g. 100 grains of rice or 100 sticks: take 25) or share play notes into 10 equal piles for 10%. Accept the a4 check. |

### unit-g6-math-ratio (fix required)
The unit method and bar models are correct for total, part, difference and scaling. Tasting a 2 : 7 mix against a 4 : 14 mix is a genuine concrete experience. All results and distractors are verified.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1–a5 | Every item copies a CPA or guided example (rice 2 : 3, 12 : 18, Rp40.000 at 3 : 5, syrup 2 : 7, stickers 5 : 3 with 12 more). | E.g. a1 3 cups of flour : 2 cups of milk, 9 cups of flour → `6`; a2 `16 : 24 = 2 : ?` = `3`; a3 Rp56.000 at 3 : 4 → Bayu `32000`; a4 juice : water 3 : 5 → `3/8`; a5 stickers 7 : 4 with Aya 15 more → Bayu `20`. |
| 2 | minor | prerequisites | Percentages lists ratio as its prerequisite, which is fine, but ratio has no fractions-of-a-quantity prerequisite. | Optional: add `unit-g5-math-adding-unlike-fractions`. |

### unit-g6-math-algebraic-expressions (fix required)
Cups as mystery boxes is a real concrete model for a variable, and the 3p ≠ 34 misconception is well targeted. All results and distractors are verified, except as noted below.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1–a5 | These are guided[1], [0], the abstract step, guided[2] and [3] verbatim. | E.g. a1 `4q + 3` when q = 5 = `23` (48, 12); a2 Rp4.000 + Rp3.000k for 5 km = `19000`; a3 `6b - 2b + b` = `5b`; a4 `3y + 5 + 2y + 4` = `5y + 9`; a5 `3(n + 2)` when n = 4 = `18`. |
| 2 | minor | a2 distractor `Rp 13,500` | It matches no stated misconception: ADDS_COEFFICIENT would give 5.000 + 2.500 + 6 = 7.506. | Replace it with `Rp 7,500` mapped to a new `IGNORES_VARIABLE` (drops k). |
| 3 | minor | a4 `check` | `2 + 4 = 6` checks only the x-coefficient, not the constant. | Accept, and add to the explanation "check by substituting x = 1: 2 + 3 + 4 + 1 = 10 = 6 + 4". |
| 4 | minor | misconceptions IGNORES_ORDER_OF_OPERATIONS | The description includes "or ignores where brackets are not", which is unclear. | Use "Adds before multiplying, working strictly left to right." |
