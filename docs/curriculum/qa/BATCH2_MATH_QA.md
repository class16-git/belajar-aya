# Batch 2 maths QA (batch `expansion-batch2-math`)

Reviewer: independent content QA (mathematics and child safety). Reviewed 2026-11-12. No content files were edited.

Scope: the 21 files under `content/units/*/math/unit-*.json` with `provenance.batch: "expansion-batch2-math"`.
`pnpm --filter @atlas/curriculum units:check -- content/units` result: 183 units and 71 readings parsed, 1 error. The error
is in `unit-g6-literacy-debate-preparation` ("coin" with no flag), which is outside this batch. The 21 batch-2 maths files
have 0 validator errors. All prerequisites resolve to existing unit ids.

Checks per file (same method as `PILOT_MATH_QA.md`):
1. I recomputed every worked example, practice item, extension, explanation, `check` and answer. I confirmed that index 0
   is the only correct choice, and I recomputed each distractor against the misconception it is mapped to.
2. The CPA progression is genuine.
3. Misconceptions are real, and remediations change the representation.
4. Grade fit (Singapore-style progression, with Indonesian SD noted where it differs) and prerequisite order.
5. The Indonesian is natural and the terminology is right. Prose uses `.` for thousands and `,` for decimals.
6. Safety, including a specific audit of the materials the author reworded to get past the hazard validator.

Severity and verdict follow the pilot: **blocker** must not ship; **major** must be fixed before approval; **minor** is
polish. **Pass** means no blocker or major.

## Headline findings

- **No arithmetic errors in any answer, check or explanation.** All 109 assessment items have the right answer at index 0, and it is the only correct choice. Every numeric `check` evaluates correctly. Nearly every distractor reproduces its mapped misconception exactly, e.g. 563 - 248 → 325 (smaller-from-larger), 34 × 6 → 1,824 (products side by side), 7/8 ÷ 1/4 → 2/7 (flips the dividend) and 3.5 h → 3 h 50 min.
- **The pilot's systemic major is fixed.** No assessment item reuses a worked example's numbers. Transfer contexts are new: rainfall, a ferry, kecap bottles, a hall of chairs, watermelons.
- **There are three content-logic defects, all major.** One question has two defensible readings (K ordinal a2). One extension asks for something that does not exist (G4 angles). One remediation would endorse the wrong answer for an item mapped to it (G6 fraction division).
- **Safety audit (rewording): no blocker.** Every reworded material is genuinely safe, but there are three gaps (major) and some flag inconsistencies. See the dedicated section below.
- **G6 circles is consistent on π.** Every item and worked example states which value is used (22/7 for multiples of 7, 3.14 otherwise), and every result is exact. Only the measured-object practice task needs a rounding instruction (minor).
- **Checks that only restate the answer** are few, and mostly unavoidable because the answer is a choice. They are listed per file as minors.

## Safety audit: reworded and near-miss materials

| Unit | Material as written | Real hazard? | Finding |
|---|---|---|---|
| g2 time-to-five-minutes | "rolled paper stopper" holding the clock hands (replaces a split pin / paper fastener / "plug") | No: it is paper. | The rewording is safe **for a newly made clock**. But materials and `parentInstructions[0]` say to reuse "the paper-plate clock from the half-hour unit". That unit (`unit-g1-math-time-half-hour`) lists a split pin (*paku keling kertas*) as an alternative and is itself flagged `chokingRisk`/`sharp: true`. This unit has both flags false, and its note says "no sharp fasteners are needed" without naming the split pin. **Major** (see file). |
| g4 angles | "glued paper hinge" joining the two card strips (replaces a paper fastener) | No. | Genuinely safe and it works as a hinge. Pass. |
| g1 subtraction-within-20 | "20 large bottle caps" | Yes: choking risk for younger siblings, and metal crown caps have crimped sharp edges. | The note names the caps, so the validator rule (flag **or** note) is met. But `chokingRisk` is false, while g5 multiplying-fractions flags the same object (`chokingRisk: true`). "Caps" are not in `HAZARD_KEYWORDS`. **Major** (see file). |
| g5 multiplying-fractions | "spoons or bottle tops" | Yes (choking). | `chokingRisk: true` with a note. Correct. Minor: prefer spoons. |
| g2 division-as-sharing | kue / onde-onde (sesame, glutinous rice) | Yes (allergen, sticky). | `allergens: true` and the note names sesame. Correct. Minor: onde-onde are sticky, so cut them small for younger siblings. |
| k subtraction-stories-within-10 | 10 kue on a plate; fruit eaten at snack time | Yes (allergen; the child eats). | `allergens: false`; the note only says "check for allergies". **Major** (see file). |
| g3 comparing-fractions | roti / martabak cut and eaten | Yes (egg, wheat). | `allergens: true`, the adult cuts, and the note names egg and wheat. Correct. |
| g6 circles | tin lid; compass point | Yes (sharp). | `sharp: true` and the note names both. Correct. Minor: specify the kind of lid. |
| g6 fraction-division, g3 mass-and-volume | uncooked rice | Choking for toddlers. | g6 has `chokingRisk: true` with a note. In g3 the rice stays bagged or in a glass (extension), which is acceptable. |
| g1 compare-to-100, g2 subtraction, g3 multiplication | rubber bands | Snap and choking for younger siblings. | A note names them. Acceptable. |
| k shapes-and-patterns | nail file used by the adult; large spoons and cups | No. | Pass. |
| g4 angles | "compass turns" | No: this means compass directions, not the drawing tool. | Pass. |

**Validator gap (for the lead, not a content fix):** `HAZARD_KEYWORDS` in `packages/curriculum/src/schema.ts` does not
catch `bottle caps/tops`, `caps`, `tin lid`, `compass point`, `uncooked rice`, `onde-onde` or `sesame`. Consider adding
them (caps/tops/rice → `chokingRisk`; tin lid/compass → `sharp`). Also consider an allergen keyword list (kue, onde-onde,
martabak, egg, peanut, sesame, shrimp/kerupuk) checked against `hazards.allergens`.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| k-math-ordinal-numbers | **fix required** | 0 | 1 | 3 |
| k-math-shapes-and-patterns | pass | 0 | 0 | 3 |
| k-math-subtraction-stories-within-10 | **fix required** | 0 | 1 | 2 |
| g1-math-compare-numbers-to-100 | pass | 0 | 0 | 4 |
| g1-math-length-non-standard-units | pass | 0 | 0 | 2 |
| g1-math-subtraction-within-20 | **fix required** | 0 | 1 | 2 |
| g2-math-division-as-sharing | pass | 0 | 0 | 2 |
| g2-math-subtraction-regrouping-1000 | pass | 0 | 0 | 3 |
| g2-math-time-to-five-minutes | **fix required** | 0 | 1 | 3 |
| g3-math-comparing-fractions | pass | 0 | 0 | 3 |
| g3-math-mass-and-volume | pass | 0 | 0 | 2 |
| g3-math-multiplication-with-regrouping | pass | 0 | 0 | 2 |
| g4-math-angles | **fix required** | 0 | 1 | 3 |
| g4-math-decimals-tenths-hundredths | pass | 0 | 0 | 3 |
| g4-math-long-multiplication | pass | 0 | 0 | 1 |
| g5-math-area-of-triangles | pass | 0 | 0 | 1 |
| g5-math-average | pass | 0 | 0 | 1 |
| g5-math-multiplying-fractions | pass | 0 | 0 | 1 |
| g6-math-circles | pass | 0 | 0 | 3 |
| g6-math-fraction-division | **fix required** | 0 | 1 | 2 |
| g6-math-speed-distance-time | pass | 0 | 0 | 2 |

**Totals: 15 pass, 6 fix required. 0 blockers, 6 majors, 48 minors.**

---

## Kindergarten

### unit-k-math-ordinal-numbers (fix required)
The toy queue, then angkot drawing, then word-card matching is a genuine CPA sequence. The unit separates position from quantity well (a6, ticket remediation).

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a2 | "Bayu is 2nd in a line. Then 3 more children join behind him" does not say Bayu was last. If anyone already stood behind him, 5 is wrong; "no one else comes" only rules out later arrivals. The explanation assumes Bayu was last. Breaks rule 8/17. | EN: "Bayu is 2nd **and last** in a line. Then 3 more children join the end of the line." ID: "Bayu berada di urutan kedua **dan paling belakang** dalam barisan. Lalu 3 anak lagi berbaris di belakangnya." Check unchanged (`2 + 3` = `5`). |
| 2 | minor | a5 distractors | Both 6th and 8th are mapped to BEFORE_AFTER_CONFUSION, but choosing 6th or 8th is "gives a named neighbour", not a before/after swap. | Add `GIVES_NAMED_NEIGHBOUR` ("answers with one of the positions named in the question") with remediation "stand toys 6th, ?, 8th on the floor and point to the gap", and map both choices to it. |
| 3 | minor | a5 ID | "Sari juara ke berapa?" *Juara* implies a winning place, so it is odd for 7th. | "Sari sampai di garis finis urutan ke berapa?" |
| 4 | minor | a6 / practice | Carrying the 3rd plate from a stack is fine as a question, but if acted out at K it should use unbreakable plates. | Add "use plastic plates if you act this out" to the safety notes. |

### unit-k-math-shapes-and-patterns (pass)
Counting sides and corners, turning triangles to show orientation does not matter, and AB/ABB/ABC patterns with a growing-pattern contrast are good K content.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | a5 | "4 straight sides: 2 long and 2 short" also describes a kite or a parallelogram. | Add "and 4 square corners" / "dan 4 sudut siku-siku" (or "4 pojok tegak"). |
| 2 | minor | cpa.concrete[0] | A sandwich is used for sorting with `allergens: false`; a child may eat it. | Replace it with "a paper napkin folded corner to corner", or add "check for allergies if the sandwich is eaten" to the notes. |
| 3 | minor | ID terminology | "sudut" is used for corner. At K, "pojok" is more natural, and "titik sudut" is the formal term. | Use "pojok (titik sudut)" on first use. |

### unit-k-math-subtraction-stories-within-10 (fix required)
This is a good spread of take-away, part-whole, comparison and zero. Pairing for "how many more" is the right representation.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | safety.hazards | The child eats kue (guided[0], cpa.concrete[0]) and fruit (practice[0]), but `allergens: false`. The note does not name an allergen. The sister unit g2 division sets `allergens: true` for the same kue. | Set `hazards.allergens: true`; note: "Kue can contain egg, milk, wheat, peanut or sesame: check before eating, and cut food into pieces suitable for the child's age." |
| 2 | minor | a4 distractor `5 fish` | It is mapped to GIVES_PART_TAKEN ("the number taken away instead of the number left"), but 5 is the number left (seen). | Add `GIVES_KNOWN_PART` ("answers with the part already given") with remediation "hide 3 cups under a cloth, show 5; lift the cloth to count the hidden part", and map it. |
| 3 | minor | a3 ID | "Berapa stiker lebih banyak yang dimiliki Rina?" with choices "3 lebih banyak" is stiff. | "Stiker Rina lebih banyak berapa dari stiker Doni?" with choices "3 stiker", "15 stiker", "6 stiker". |

## Grade 1

### unit-g1-math-compare-numbers-to-100 (pass)
Tens-first comparison with bundles, the 40 vs 39 trap, and hundred-chart moves are strong. The extension answer 46 is unique.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | a1, a2, a5 `check` | `8*10 + 3`, `5*10 + 6` and `3*10 + 0` restate the answer. | Unavoidable for "which number" items; accept, or reword a1 as "how many more is 83 than 38?" (`83 - 38` = `45`). |
| 2 | minor | materials[2] | "an open beak pointing to the smaller number" is ambiguous; it can be read as the opening facing the smaller number, which is backwards. | "'greater than' (>): the wide open side faces the greater number and the point faces the smaller number". |
| 3 | minor | assessment | The objective says "use the signs", but a6 tests only the words. | Change a6 to "52 __ 25" with choices `>`, `<`, `=` (keep the word item as a7 if wanted). |
| 4 | minor | a6 explanation; a3 ID | "so 52 is greater than 25: 52 is greater than 25" repeats itself. "10 lebih dari 46" is unnatural. | Use "…so 52 > 25." and "Bilangan berapa yang 10 lebih besar dari 46?" (also a4: "1 lebih kecil dari 70"). |

### unit-g1-math-length-non-standard-units (pass)
End to end with no gaps, unit-size reasoning (a3 halves the unit) and recording with units are all genuine.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | guidedExamples[1] | "A pencil is 5 crayons long and a spoon is 3 crayons long" is unrealistic: a pencil is about 2 crayons. | "A book is 3 crayons long and the pencil case is 2 crayons long… 3 - 2 = 1", or use spoons as the unit for a placemat. |
| 2 | minor | a1 ID | "Berapa lebih panjang handuknya?" | "Handuk itu lebih panjang berapa stik?" |

### unit-g1-math-subtraction-within-20 (fix required)
The three strategies (count back, through ten, think addition) are taught correctly with egg-carton frames, then number line jumps, then written steps. Every distractor is accurate (e.g. 15 - 7 → 12).

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | materials[0], safety | "20 large bottle caps" with `chokingRisk: false`. g5 flags the same object as a choking risk, and the hazard validator does not catch "caps". Metal crown caps also have sharp crimped edges. | Set `hazards.chokingRisk: true`; materials: "20 large **plastic screw caps** (not metal crown caps)"; note: "Bottle caps are a choking risk for younger siblings: count them back into a lidded box after the lesson. Do not use metal crown caps, which have sharp edges." |
| 2 | minor | guidedExamples[3] | 18 passengers in an angkot is overloaded (typically about 12 seats). | Use "Pak Joko's bus" / "bus Pak Joko". |
| 3 | minor | practice[1] | Raw eggs are handled. | Add "wash hands after handling raw eggs" to the notes. |

## Grade 2

### unit-g2-math-division-as-sharing (pass)
It covers sharing and grouping, the bar model, and a non-example of unequal sharing (a6), and checks with multiplication. The extension's divisor list for 24 is complete.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | a4 | 24 ÷ 6 uses the 6 times table, which is P3 in a Singapore order (P2 uses 2, 3, 4, 5, 10). | Use `24 ÷ 3` with choices "8, because 3 × 8 = 24", "21, because 24 - 3 = 21", "27, because 24 + 3 = 27" and check `24 / 3` = `8`. |
| 2 | minor | safety note | Onde-onde are sticky glutinous-rice balls, a choking risk for younger siblings. | Append: "onde-onde are sticky: cut them small for younger children." |

### unit-g2-math-subtraction-regrouping-1000 (pass)
Renaming is acted out with bags, bundles and sticks, including across zero. Every smaller-from-larger distractor is exact (325, 458, 542, 466, 345). The across-zero slip (352) is well chosen.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | a4 explanation | "(open a ten, and since there is only 1 ten, open a hundred too)" is muddled. | "Ones: 0 - 6 is not possible, so open the 1 ten: 10 - 6 = 4. Tens: now 0 - 7, so open a hundred: 10 - 7 = 3. Hundreds: 5 - 2 = 3." |
| 2 | minor | ID terminology | The title and practice say "meminjam", while guided says "tukar/buka". | Pick one, e.g. "menukar (meminjam)" on first use, then "menukar", to match the "rename" model. |
| 3 | minor | preparation[0] | "at least 7 hundreds bags", but practice[1] acts out 900 g. | "at least 9 hundreds bags". |

### unit-g2-math-time-to-five-minutes (fix required)
Counting in fives, short-hand reasoning before the hour (6.55), and an elapsed-time distractor set (HOUR_AS_100_MINUTES → 60) are excellent.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | materials[0], parentInstructions[0], safety | **Rewording audit.** The rolled-paper stopper is safe. But the unit tells families to reuse "the paper-plate clock from the half-hour unit", which offers a split pin (paper fastener, *paku keling kertas*) as an alternative and is flagged choking and sharp. This unit sets both flags false, and its note ("no sharp fasteners are needed") does not name the object a reused clock may contain. | Safety note EN: "If your clock from the half-hour unit has a split pin (paper fastener), the adult replaces it with the rolled paper stopper, or keeps the clock and spare split pins away from younger children." ID: "Jika jam dari unit setengah jam memakai paku keling kertas (split pin), orang dewasa menggantinya dengan gulungan kertas, atau menjauhkan jam dan cadangan paku keling dari adik yang lebih kecil." |
| 2 | minor | a5 | It mirrors guided[2] (long hand at 11, short hand just before the next hour) one hour earlier. | Long hand at 10, short hand just before 9: answer "50 minutes past 8 (8.50)", distractors 9.50 (READS_NEXT_HOUR), 8.10 (READS_NUMBER_AS_MINUTES); check `10 * 5` = `50`. |
| 3 | minor | a2–a5 EN choices | These use `4:10` while guided and success criteria use `8.20`. | Use `4.10`, `3.45`, `5.55` in the EN choices for consistency (Singapore and Indonesian style). |
| 4 | minor | materials[0] | "rolled paper stopper" is vague as a fixing. | "a short pencil stub or a tight roll of paper pushed through the centre hole (as in the half-hour unit)". |

## Grade 3

### unit-g3-math-comparing-fractions (pass)
Unit fractions, same denominator, same numerator, and benchmark ½ are all covered with folded strips, then a fraction wall, then a number line. The 24 cm strip length divides exactly for halves to eighths.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | materials vs a1, a2, a4, a5 and the BIGGER_DENOMINATOR remediation | Fifths and tenths are assessed and folded in remediation, but the strips are halves to eighths only. Fifths of 24 cm (4.8 cm) are hard to fold. | Add "a seventh and eighth strip of 24 cm marked by the adult into fifths (4.8 cm) and tenths (2.4 cm)", or change the remediation to fold sixths vs eighths. |
| 2 | minor | a1, a4 `check` | `1 / 5` restates; `1 - 1/3` is unrelated to the comparison. | Accept (a choice answer), or for a4 use `2/3 - 2/5` = `4/15` and reword as "how much more does Rudi drink?". |
| 3 | minor | ID guided[0] | "potongan pita" (ribbon pieces) for paper strips. | "potongan jalur kertas". |

### unit-g3-math-mass-and-volume (pass)
Reading intervals (20 g and 50 g marks), compound units with a placeholder zero (3,080 g) and capacity are good P3 content.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | IGNORES_UNITS remediation | "Measure 1 ml with the dropper from a medicine bottle": a child handling medicine packaging. | "Measure 1 ml with a clean, empty plastic syringe or dropper (never from medicine in use)". |
| 2 | minor | ID | It mixes "massa" and "berat" (a3 "beratnya… lebih berat"). | Acceptable in SD usage; add one parent line: "massa sering disebut berat sehari-hari". |

### unit-g3-math-multiplication-with-regrouping (pass)
The bundles, then area model, then column method are well linked, and all three error types are exact (184, 1,824, 217, 323, 56, 350, 3,530).

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | ID guided[3] | "6 krat berisi 24 botol air masing-masing" is awkward. | "6 krat, masing-masing berisi 24 botol air." |
| 2 | minor | extension[0] | No answer is given for the parent. | Add "(63 × 8 = 504 is the greatest)". |

## Grade 4

### unit-g4-math-angles (fix required)
Turn, then right-angle tester, then protractor with a dual-scale estimate check, and arm-length conservation (a6) are good. The glued paper hinge is a genuinely safe replacement for a paper fastener.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | extension[0] (EN and ID) | "At what other times does a clock show a right angle? Find two times on the hour." Apart from 3 o'clock (already shown), only 9 o'clock gives exactly 90° on the hour. The task as worded has no second answer. | EN: "3 o'clock shows a right angle. Find the other time on the hour that does, and explain why 6 o'clock does not." ID: "Pukul 3 menunjukkan sudut siku-siku. Cari satu waktu tepat lain yang juga begitu, dan jelaskan mengapa pukul 6 tidak." |
| 2 | minor | a6 distractor 2 | "Angle P is bigger" (shorter arms) is mapped to LONGER_ARMS_BIGGER_ANGLE. | Rename the code `ARM_LENGTH_CHANGES_ANGLE` ("thinks arm length changes the angle") and map both choices to it. |
| 3 | minor | grade fit | Angles on a straight line and at a point are P5 in the Singapore progression (P4 is measuring, drawing, turns and the 8-point compass). | Keep, but add a parent note "the straight-line and around-a-point facts are a stretch at P4", or move a1, a4 and guided[3] to a G5 unit. |

### unit-g4-math-decimals-tenths-hundredths (pass)
The hundred grid, then number line, then place-value table work is strong. 0.4 vs 0.38 and 2.95 + 0.1 are well-chosen traps.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | DIGIT_ORDER_SWAPPED (a3 `0.34`) | "Writes the digits in the order the words were heard" would give 0.43, the correct answer, not 0.34. | Description: "Swaps the tenths and hundredths digits." |
| 2 | minor | a2 `check` | `0.57 + 0.03` is contrived. | Accept, or use `0.6 - 0.57` = `0.03` with a "by how much" reword. |
| 3 | minor | ID | It mixes "7 persepuluh"/"70 perseratus" (guided) with "persepuluhan"/"perseratusan" (assessment). | Use "persepuluhan/perseratusan" for place names and "7 per sepuluh" only when reading fractions, consistently. |

### unit-g4-math-long-multiplication (pass)
The area model links to partial products, and the distractors are exact (222, 628, 522, 1,548, 1,152, 640, 63).

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | guidedExamples[3] EN | "a gedung pertunjukan" puts Indonesian in English prose. | "a community hall". |

## Grade 5

### unit-g5-math-area-of-triangles (pass)
Halving a rectangle, then rearranging pieces, then the obtuse height outside the triangle is excellent. a2 uses 5-12-13, so the slant-side distractor (78) is exact.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | practice[1] | "a kite" is given as a triangle shape, but *layang-layang* is a named quadrilateral in Indonesian SD geometry. | Replace with "a triangular bunting flag (bendera segitiga)". |

### unit-g5-math-average (pass)
Levelling, then bar line, then formula is used in both directions. The zero-value, weighted-average and range distractors are exact.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | MISSING_VALUE_EQUALS_AVERAGE remediation | Towers of 18 and 25 blocks need about 60 blocks, but about 20 are listed. | "Draw towers of 18 and 25 squares on squared paper with a line at 20…". |

### unit-g5-math-multiplying-fractions (pass)
Sets, then folding, then the area model build the rule genuinely. All distractors are exact (2/75, 37 1/2, 9/8, 35/16, 19/12, 12 1/3).

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | materials[1] | Bottle tops are flagged correctly, but spoons do the same job without risk. | "8 to 15 identical spoons or large plastic lids". |

## Grade 6

### unit-g6-math-circles (pass)
**π usage is consistent:** every item names 22/7 or 3.14, and the parent note explains the choice. All results are exact (110, 78.5, 72, 154, 20, 2,200), and the extension gives 398 m. The sector-rearrangement CPA is genuine, and *juring*, *jari-jari* and *keliling* are correct terms.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | practice[0] | Measured diameters × 3.14 give non-exact answers, but no rounding is stated. | Append "round each circumference to 1 decimal place and expect the string to differ by about 1 cm". |
| 2 | minor | materials[0], safety | "tin lid" is unspecified. A can lid cut with an opener is razor-sharp even when "checked". | "a biscuit-tin lid or a plastic jar lid (never the cut-off lid of a food can)"; keep `sharp: true` for the compass. |
| 3 | minor | guidedExamples[2] | A "round table top" of radius 20 cm (40 cm across) is a stool. | "a round stool top" / "permukaan kursi bundar". |

### unit-g6-math-fraction-division (fix required)
Measurement ("how many fit") with rice, then partitive sharing with folded strips, then common denominators, then the reciprocal is a good sequence. Every distractor is exact.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | MULTIPLIES_INSTEAD remediation vs a2 | The remediation says "if a small part fits into the amount many times, the answer must be bigger than the amount". a2 (6/7 ÷ 3) maps its wrong answer 2 4/7 (= 6/7 × 3) to this code. For a2 that advice endorses the bigger (wrong) answer. | Split the code. Add `MULTIPLIES_BY_WHOLE_DIVISOR` ("multiplies by the whole number when dividing a fraction by it") with remediation "Fold the 6/7 strip into 3 equal shares: each share is smaller than 6/7." Map a2's choice 1 to it. Keep MULTIPLIES_INSTEAD for a1, a3, a4, a5. |
| 2 | minor | FLIPS_DIVIDEND remediation | It is symbolic only (multiply back, common denominators), so it does not change the representation. | Add "Draw 7/8 as a bar of eighths and ring quarter-sized groups (2 eighths): 3½ groups fit." |
| 3 | minor | parentInstructions[0] | It offers "rice or water", but `water: false`. | Drop "or water", or add "pour water over a tray" to the notes. |

### unit-g6-math-speed-distance-time (pass)
The walked 60 m route, then bar model, then the three relationships work well. The average-speed trap (70) and the minutes-as-decimals trap (2.3 h → 27.6 km) are exact.

| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | practice[2] | "Convert ten durations", but four are listed. | "Convert these four durations…", or list ten. |
| 2 | minor | grade fit | Speed is no longer in the current Singapore primary syllabus, though it is in Indonesian SD (kecepatan, kelas 5–6). | Add a parent note: "matches the Indonesian SD curriculum; in Singapore this is now taught in lower secondary". |

## Verdict

The batch is mathematically sound and a clear step up from the pilot: assessments test transfer, and π handling is consistent. There are **no blockers**. Approval needs **6 majors** fixed:
- K ordinal a2 ambiguity;
- K subtraction allergen flag;
- G1 bottle caps flag and type;
- G2 time split-pin note for a reused clock;
- G4 angles impossible extension;
- G6 fraction-division remediation that contradicts a2.

The reworded materials (rolled paper stopper, glued paper hinge) are genuinely safe and are not evasion. The remaining risk is items the validator does not know (caps, lids, rice, kue allergens), so the keyword list should be extended.
