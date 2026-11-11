# Pilot STEM QA (batch `expansion-pilot-stem`)

Reviewer: Agent G2 (independent content QA: STEM and physical safety). This reviewer did not author the content.
Date: 2026-11-10. Scope: the 20 files `content/units/*/stem/unit-*.json`. No content files were edited.

`units:check` passes for all ten STEM directories. The one corpus error it reports is outside the STEM files. Everything
below is a judgement the validator cannot make.

## Summary

| Severity | Count |
|---|---|
| Blocker | 1 |
| Major | 7 |
| Minor | 49 |

**Verdicts:** 7 files need fixes, 13 pass. A pass can still carry minor findings, which are recommended but do not block.

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| unit-age2_3-stem-first-then-routines | pass | 0 | 0 | 4 |
| unit-age2_3-stem-in-on-under | pass | 0 | 0 | 3 |
| unit-age3_4-stem-box-tower-test | pass | 0 | 0 | 5 |
| unit-age3_4-stem-ramp-rolling | pass | 0 | 0 | 2 |
| unit-age4_5-stem-robot-grownup-commands | pass | 0 | 0 | 2 |
| unit-age4_5-stem-room-treasure-map | pass | 0 | 0 | 1 |
| unit-k-stem-floor-grid-arrows | **fix required** | 0 | 1 | 1 |
| unit-k-stem-rolls-or-slides | pass | 0 | 0 | 3 |
| unit-g1-stem-debug-grid-programs | **fix required** | 0 | 1 | 2 |
| unit-g1-stem-sort-by-two-rules | **fix required** | 0 | 1 | 3 |
| unit-g2-stem-loops-floor-grid | pass | 0 | 0 | 2 |
| unit-g2-stem-paper-spinner-fair-test | pass | 0 | 0 | 3 |
| unit-g3-stem-events-when-this-happens | pass | 0 | 0 | 3 |
| unit-g3-stem-paper-bridge-design | **fix required** | 1 | 0 | 2 |
| unit-g4-stem-if-then-else | pass | 0 | 0 | 2 |
| unit-g4-stem-light-meter-sensor | **fix required** | 0 | 1 | 2 |
| unit-g5-stem-led-circuit-switch | **fix required** | 0 | 2 | 3 |
| unit-g5-stem-variables-trace-tables | pass | 0 | 0 | 2 |
| unit-g6-stem-bumper-robot-project | **fix required** | 0 | 1 | 2 |
| unit-g6-stem-functions-parameters | pass | 0 | 0 | 2 |

### Cross-cutting checks

- **Electrical arithmetic.** Two AA cells give 3.0 V nominal, or about 3.2 V when fresh. A red or yellow LED has a forward
  voltage (Vf) of about 1.8–2.2 V, which leaves about 0.8–1.4 V across the resistor:
  - 220 Ω gives about 4–6 mA;
  - 100 Ω gives about 8–14 mA.

  Both are below the usual 20 mA rating, so the 100–220 Ω range is correct for red or yellow LEDs. It is **not** correct
  for white, blue or true-green LEDs. Their Vf is about 2.8–3.3 V, so on 3 V they light dimly or not at all, and a child
  will wrongly diagnose a "reversed LED". See the major findings in G5 and G6.

  A reversed LED on 3 V is safe, because typical reverse breakdown is about 5 V.
- **Resistor always in the loop.** In every guided example and child instruction, the LED is wired with its resistor.
  Two open-ended tasks could still lead a child to remove it: the G5 practice task "make one bug" and the a2 distractor.
  See G5.
- **Short circuit.** Both electrical units warn about it. Neither says that **aluminium foil across AA terminals heats fast
  and can scorch or ignite paper**, and both units use foil switches next to bare crocodile clips. See G5 and G6.
- **Supervision.** `independent_ok` is used only on G5 variables and G6 functions. Both are paper-only activities, so this
  is appropriate. Every hands-on, electrical or scissors unit is `adult_present`. Both age 2–3 units are
  `adult_within_reach` and screen-free.
- **Choking.** No under-4 unit uses small parts. Balls are "at least orange-size" (well above the 44.5 mm test-cylinder
  threshold), and toys are "bigger than the child's fist". Units with coins or electronics (G3 and up) flag
  `chokingRisk` and add a younger-sibling note.
- **Commercial product UI.** No product is named. G3, G4 and G5 describe generic block shapes, for example hat-shaped
  event blocks and hexagon condition slots. These are hedged with "usually" and are optional, so they are acceptable.
- **Prerequisite progression.** The chains below are coherent, and the validator found no cycles:
  - first-then → robot → K grid → debug → loops → events → if/else → light meter → LED → bumper;
  - if/else → variables → functions → bumper;
  - ramp → rolls/slides → sort → spinner → bridge;
  - in-on-under → map.

  One link is weak, the G2 spinner, which is noted under that file.
- **Distractor maps.** A recurring minor problem is that a wrong choice is mapped to a misconception that does not
  produce it, or is left unmapped. Each case is listed per file.

---

## unit-age2_3-stem-first-then-routines — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Card 1 is described as "a big '1' and a box". The assessment (a1) calls it "the open box card". | In materials, change it to "one with a big '1' and an **open** box" / "satu dengan angka '1' besar dan kotak **terbuka**". |
| 2 | minor | a1 index 1 maps to `LAST_SEEN_IS_FIRST` ("picks whichever card was shown most recently"). Nothing in the prompt makes the teddy card the most recent one. | Map index 1 to `ORDER_DOES_NOT_MATTER`, or add "show the teddy card last" to the a1 prompt. |
| 3 | minor | a2 index 2 ("Walks away from the box") is unmapped. | Leave it unmapped and add `"reviewFlags"` noting it is an engagement cue. Alternatively, remove the choice. |
| 4 | minor | Practice 1: "At bath or dressing time … first hat on, then look in the mirror." A hat does not belong at bath time, and this pair works in either order, so it does not teach that order matters. | Change it to "At dressing time … first socks on, then shoes on" / "Saat berpakaian … pertama pakai kaus kaki, lalu sepatu". |

## unit-age2_3-stem-in-on-under — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | a3 index 1 ("Sits next to the box") maps to `ON_UNDER_SWAPPED`. "Next to" is not an on/under swap. | Add misconception `NEXT_TO_FOR_IN` ("Treats being beside an object as being in it"; remediation: "Climb in together and say 'the box is all around us'") and map index 1 to it. |
| 2 | minor | a1 index 2 ("Hands teddy to you") is unmapped. | Remove the choice, or map it to a new `NOT_YET_FOLLOWING_POSITION_WORD`. |
| 3 | minor | The child sits in a cardboard box, but there is no note against closing the flaps over the child. | Add to safety notes: "Never close or tape the flaps while your child is inside the box" / "Jangan pernah menutup atau merekatkan lipatan kardus saat anak di dalamnya." |

## unit-age3_4-stem-box-tower-test — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | The a1 explanation says "A wide, **heavy** base keeps a tower steady." The boxes are empty, so the biggest one is not necessarily heavier. | EN: "A wide base at the bottom keeps a tower steady." ID: "Alas yang lebar di bawah membuat menara stabil." |
| 2 | minor | Three slow magazine waves will rarely topple taped shoe boxes, so the "test" may never find a problem. | Change the parent instruction to "three quick, strong waves of a big magazine from one step away (the same spot each time)". |
| 3 | minor | ID: "saat diangin" is not natural Indonesian. "Ujian kita" means "our exam". | Change to "saat ditiup angin" and "Uji coba kita menemukan masalah!". |
| 4 | minor | ID: "Sekarang kita ngapain?" is slangy for a parent script. | Change to "Sekarang kita harus bagaimana?". |
| 5 | minor | a3 index 2 ("1 box") is unmapped. | Add `SAYS_ADDED_NUMBER` ("Answers with the number added, not the total"; remediation: count every box from the bottom) and map index 2 to it. |

## unit-age3_4-stem-ramp-rolling — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | a3 index 1 ("The ramp got lower by itself") maps to `HEIGHT_DOES_NOTHING`. The choice shows the child naming the wrong cause, not ignoring height. | Add `WRONG_CAUSE` ("Names something that did not change as the cause"; remediation: "List what we changed, which is only the towel, and test with and without it") and map index 1 to it. |
| 2 | minor | "A chunky toy car" may have detachable wheels, which are small parts for an under-4. | Change to "a chunky toy car with wheels that cannot be pulled off" / "mobil-mobilan besar yang rodanya tidak bisa dicabut". |

## unit-age4_5-stem-robot-grownup-commands — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Parity: EN materials say "A cup", while ID says "Gelas plastik" (plastic cup). | Change EN to "A plastic cup or a soft toy". |
| 2 | minor | ID title "Memprogram robot orang dewasa" reads as "programming an adult robot". | Change to "Memprogram robot: Ayah atau Ibu jadi robot". |

## unit-age4_5-stem-room-treasure-map — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | The ID title says "kamar kita", meaning bedroom, but the map is of the living room ("ruang tamu"). | Change to "Peta harta karun ruangan kita". |

## unit-k-stem-floor-grid-arrows — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | The tape quantity is wrong by about four times. A 4 × 4 grid needs 5 lines each way, each 4 squares long, which is 40 × side. With "one big step" squares of 0.5–0.6 m, that is **20–24 m**, not "about 5 metres". The parent runs out of tape. | EN: "Masking tape (one roll, about 20–25 metres) for a 4 by 4 floor grid, or about 5 metres if you mark only the corners of the squares with small crosses". ID: "Selotip kertas (satu gulung, sekitar 20–25 meter) untuk petak lantai 4 kali 4, atau sekitar 5 meter jika hanya menandai sudut kotak dengan tanda silang kecil". |
| 2 | minor | The a2 explanation says "Moving right is the only way towards teddy", which is not strictly true. Index 1 ("An up arrow") maps to `COUNTS_DIRECTIONS_NOT_SQUARES`, which is not the error the choice shows. | Change the explanation to "The shortest program starts with a right arrow, because teddy is to the right." Add `ARROW_DIRECTION_MIXUP` ("Picks an arrow that does not point towards the goal"; remediation: "Stand on the start, point at teddy, then pick the card that points the same way") and map index 1 to it. |

## unit-k-stem-rolls-or-slides — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | The results have three values (rolled, slid, stopped), but there are only two hoops and a "two-column" chart. | Pictorial: "a two-column chart: rolled / slid or stayed still". Label the second hoop "slid or stayed still" / "meluncur atau diam". |
| 2 | minor | a3: a plastic cup rolls only if it lies on its side, and then it rolls in a curve. The prompt does not say how it was placed. | Change to "Budi guessed the cup **lying on its side** would slide …" / "gelas **yang dibaringkan**". |
| 3 | minor | ID: "sebagai roda" (as wheels) for "rollers" is a meaning shift. "tabung tisu toilet" is awkward. | Change to "sebagai rol/penggelinding" and "gulungan karton tisu toilet bekas". |

## unit-g1-stem-debug-grid-programs — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | a1 has two defensible answers under the unit's own method. The routine is "stop at the first surprise, point to that card". With teddy at 3 right and 1 up, the program right, right, up first diverges at **card 3 (up)**, so "The up card is wrong" is a defensible diagnosis. The keyed answer "One right card is missing" is also defensible. | Reword the prompt: "… The program is right, right, up. Which **one change** fixes it?" Choices: ["Add one more right card", "Change the up card to a right card", "Throw it away and start again"]. Changing up to right gives right, right, right, which misses teddy. Map 1 → `BLAMES_LAST_CARD` and 2 → `START_OVER_FROM_SCRATCH`. Mirror the change in ID. |
| 2 | minor | a3 index 1 ("6 cards", meaning nothing was removed) maps to `BLAMES_LAST_CARD`. | Add `FORGETS_TO_APPLY_FIX` ("Reports the count before the change") and map index 1 to it. |
| 3 | minor | ID: "berbug" is awkward. | Change to "yang ada bug-nya" or "bermasalah". |

## unit-g1-stem-sort-by-two-rules — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | a2 is ambiguous. The prompt does not give materials. In an Indonesian kitchen the spoon, ladle (sendok sayur) and spatula (sutil) are often all metal, so "Group A is made of metal" fits group A. The pot lid in group B is usually metal too, which a child cannot know from the prompt. The explanation depends on "a wooden spatula", which the prompt never mentions. | Prompt EN: "Group A: metal spoon, metal ladle, **wooden** spatula. Group B: plastic plate, book, **metal** pot lid. What is the rule?" ID: "Kelompok A: sendok logam, sendok sayur logam, sutil **kayu**. Kelompok B: piring plastik, buku, tutup panci **logam**. Apa aturannya?" |
| 2 | minor | Guided example: "Metal spoon: bigger [than my hand]? No." A tablespoon (about 18 cm) is longer than a Grade 1 child's hand (about 12–13 cm), so the worked example is contestable. Materials also say every object is "larger than a fist". | Change question 1 to "Is it longer than my hand?" and the example object to "a metal teaspoon: longer than my hand? No". Or keep the example and add it as a "weak spot in our question" moment. |
| 3 | minor | Two mapping mismatches. In a3, index 2 ("3 boxes") is not one box per question. In a4, index 1 ("Guess and move on") maps to `ANSWERS_ONE_QUESTION_ONLY`. | a3: add `ADDS_ONE_FOR_BOTH` ("Counts the questions plus one") or remove the mapping. a4: add `UNCLEAR_QUESTION_IS_FINE` ("Accepts a question that gives different answers for the same object"; remediation: "Ask two people the question about the same object and compare answers") and map index 1 to it. |

## unit-g2-stem-loops-floor-grid — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | a1 (6 squares) and a3 (8 squares) describe programs that would leave the 5 × 5 grid. Guided example 2 itself says 6 is "too far", so the assessment is inconsistent with it. | Add "(on paper)" / "(di kertas)" to the a1 and a3 prompts. |
| 2 | minor | a4 index 2 ("Loops are needed for every program") is unmapped. | Add `LOOPS_ALWAYS_REQUIRED` ("Thinks every program must contain a loop"; remediation: run the 3-card program from Grade 1 with no loop) and map index 2 to it. |

## unit-g2-stem-paper-spinner-fair-test — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Dimensions contradict each other. The text says "a centre line from the top down to halfway (the wings)" (10 cm on a 20 cm strip), but also "Long-wing spinners have 9 cm wings". | Change to "a centre line from the top down 9 cm (the wings) …" / "garis tengah dari atas sepanjang 9 cm (sayap) …". |
| 2 | minor | a4 index 1 ("To get tired") is not a real misconception, and it is mapped to `ONE_TRIAL_ENOUGH`. | Replace it with "So the longer-wing spinner can win" ("Supaya baling-baling bersayap panjang menang"), mapped to a new `REPEAT_UNTIL_WANTED_RESULT` ("Repeats only until the hoped-for result appears"). |
| 3 | minor | The prerequisite `unit-g1-stem-sort-by-two-rules` is a weak link. The fair-test idea is introduced in K rolls-or-slides ("Keep the ramp the same … so the test is fair"). | Set prerequisites to `["unit-k-stem-rolls-or-slides"]`, or add it alongside the current one. |

## unit-g3-stem-events-when-this-happens — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | a4 index 2 ("5 actions", which is 3 + 2) maps to `ONE_ACTION_PER_EVENT`. That misconception gives 3, not 5. | Add `ADDS_INSTEAD_OF_MULTIPLYING` and map index 2 to it. |
| 2 | minor | a3 index 2 ("Neither runs because they clash") maps to `ONE_SCRIPT_PER_EVENT`. | Add `SHARED_EVENT_CLASH` ("Thinks two scripts on one event cancel out") and map index 2 to it. |
| 3 | minor | ID: in "ia berkata 'purr'", "purr" is not natural Indonesian. | Change to "ia mendengkur 'rrr'" or "ia berkata 'meong'", and mirror the EN to "says 'meow'" for parity. |

## unit-g3-stem-paper-bridge-design — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **blocker** | Design 3 (zigzag) uses **two** sheets: "lay a flat sheet on top as the road". This breaks the unit's own rule ("one sheet of A4 paper") and its fair test. It also makes a2 ambiguous: the distractor "It used more paper" is **true**, and the explanation "Same paper … only the shape changed" is false. | Make design 3 one sheet. EN: "Design 3, zigzag: fold the whole sheet back and forth into a fan, with the fold lines running from one book stack to the other, and stand the cup on the folds." ID: "Rancangan 3, zigzag: lipat seluruh kertas bolak-balik seperti kipas, dengan garis lipatan memanjang dari satu tumpukan buku ke tumpukan lainnya, lalu letakkan gelas di atas lipatan." Alternatively, allow a road cut from the same sheet. Keep a2 as is once the design uses one sheet. |
| 2 | minor | "Folds running across the gap" is ambiguous. The folds must run **along the span** (bank to bank) to stiffen the bridge. Folds perpendicular to the span collapse like an accordion. | This is covered by the wording in fix 1. In practice item 3, add "(keep fold lines running bank to bank)". |
| 3 | minor | ID a2: "lebih tebal" means "thicker" and does not match "deeper", which refers to section depth. | Change to "Lipatan membuat kertas lebih tinggi penampangnya dan lebih kaku, sehingga kurang melengkung." |

## unit-g4-stem-if-then-else — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | Guided example 2 fixes ">5" with ">4". That works for whole-number cards, but the more transferable fix, "greater than or equal to 5", is not mentioned. | Append: "(Another correct fix: 'Is the number 5 or more?'; '> 4' works only because the cards are whole numbers.)" Mirror in ID. |
| 2 | minor | ID: "syaratnya salah" for a false condition reads as "the condition is wrong". "selain itu" is acceptable, but "jika tidak" is more common in Indonesian CS teaching. | Use "syaratnya tidak terpenuhi (bernilai salah)". Consider "jika tidak" for else. |

## unit-g4-stem-light-meter-sensor — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | The measurement procedure is underspecified, and one causal claim is physically doubtful. (a) The geometry is never fixed: the distance from the layered tube end to the X sheet and the viewing position are not given. Readings will not repeat, and if the tube is pressed onto the paper it shades the X. (b) Guided example 3 says side light leakage "gave a reading that was **too high**". Stray light inside the tube lowers the contrast of the X, so it disappears with **fewer** layers, which makes the reading lower and erratic, not higher. (c) Preparation already wraps the tube in black paper, but the guided example says the sleeve "was added" later. | Add to preparation: "Lay the X sheet flat in the place being measured. Hold the layered end of the tube 10 cm above the X (check with the ruler) and look through the open end with one eye. An adult tries it first in a bright and a dim place to check that the bright place needs more layers." Replace the last two sentences of guided example 3 with: "Improve the meter: Rafi's readings jumped about because light leaked through a gap in the sleeve, so he taped the gap and repeated the test." Mirror in ID. |
| 2 | minor | Three mapping mismatches. In a1, index 2 ("The plastic cover") is not an output. In a2, index 2 ("3 layers") does not follow from `BIGGER_NUMBER_DARKER`. In a3, index 1 ("Turns off") is a branch error, not a scale error. | Add `NAMES_CASING_AS_SENSOR`, `REPORTS_SMALLER_READING` and `SWAPS_BRANCHES` (described as in the G4 if/else unit), and map to them. |
| 3 | minor | The safety note "Do not touch light fittings or switches with wet hands" covers an action the activity never asks for. | Keep it, and also add "Do not move or unplug lamps to take readings." |

## unit-g5-stem-led-circuit-switch — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | The LED colour is not specified. On 2 × AA (about 3 V), a white, blue or true-green LED (Vf about 2.8–3.3 V) lights dimly or not at all, even when wired correctly. The child will then "fix" a correct circuit, and a2's keyed answer ("Turn the LED round") becomes misleading. With a red or yellow LED (Vf about 2 V), 100–220 Ω gives about 4–14 mA, which is correct. | Materials EN: "2 or 3 standard 5 mm **red or yellow** LEDs (not white or blue, which need more than 3 volts) …". ID: "2 atau 3 LED standar 5 mm **merah atau kuning** (bukan putih atau biru, yang butuh lebih dari 3 volt) …". In the a2 prompt add "the holder switch is on and the LED is red", and in ID "saklar tempat baterai menyala dan LED-nya merah". |
| 2 | **major** | Two paths could lead a child to break the safety rules. Practice 1 ("deliberately make one bug for a family member to find") does not rule out removing the resistor or joining the battery wires. The safety notes never mention that **foil** joined across the battery wires is a short circuit that gets hot fast and can scorch paper. Yet loose foil and card sit beside bare crocodile clips. | Practice 1: append "Allowed bugs: unclip one wire, or turn the LED round. Never remove the resistor or join the battery wires." ID: "Bug yang boleh: lepas satu jepitan, atau balik LED. Jangan pernah melepas resistor atau menyambung kabel baterai." Add a safety note: "The foil switch always goes in the loop with the resistor and LED, never straight across the red and black wires. Foil touching both battery wires short-circuits the batteries and can get hot enough to burn paper. Keep loose foil off the table while the batteries are in." ID: "Saklar foil selalu dipasang di jalur bersama resistor dan LED, tidak pernah langsung di antara kabel merah dan hitam. Foil yang menyentuh kedua kabel baterai membuat korsleting dan bisa cukup panas untuk membakar kertas. Singkirkan sisa foil dari meja selama baterai terpasang." Add to the a2 explanation: "Removing the resistor can damage the LED." |
| 3 | minor | ID parity error in the `DECIMAL_SLIP` remediation. "satu potong kertas utuh dan satu setengah potong" means "one whole strip and **one and a half** strips". | Change to "satu potong kertas utuh dan setengah potong". |
| 4 | minor | Two mapping mismatches. In a4, index 2 ("Batteries get used up faster") maps to `ONE_WIRE_ENOUGH`. In a5, index 2 ("10 more") maps to `ADDS_TO_COMPARE`, but 10 is not a sum. | a4: add `OPEN_SWITCH_STILL_DRAINS` and map to it. a5: add `REPORTS_FINAL_SCORE` ("Gives the new score instead of the difference") and map to it. |
| 5 | minor | The `MAINS_IS_SAME` remediation asks the child to handle a charger, but the safety notes say "no … chargers". | Change to "Read the warning label on an **unplugged** charger together, without plugging it in …" / "pengisi daya **yang tidak tercolok**". |

## unit-g5-stem-variables-trace-tables — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | ID: "jalan pertama/kedua" for "run 1/2" is confusing in a **step counter** example, because "jalan" also means "walk". | Change to "saat dijalankan pertama kali / kedua kali", or "putaran pertama/kedua", in guided example 3, a4, `FORGETS_RESET`, and the a4 prompt "pada jalan keduanya" → "saat dijalankan kedua kali". |
| 2 | minor | Parity: EN says "counters or folded paper squares", while ID has paper only. a4 index 1 ("change by 2") maps to `FORGETS_RESET`. | Add "keping penghitung atau" to the ID. Add `PATCHES_SYMPTOM` ("Changes a number to hide the bug instead of fixing its cause") and map a4 index 1 to it. |

## unit-g6-stem-bumper-robot-project — **fix required**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | **major** | The wiring is ambiguous, and nothing protects the circuit on a moving, bumped rover. "Clip one pad into the LED loop on each side" does not say that the bumper sits **in series** with the resistor and LED. A child could clip the two foil pads straight to the red and black wires, and then every bump short-circuits two AA cells through foil, which heats fast. Bare crocodile clips riding on a rover that is pushed into walls can also touch each other. The colour issue from G5 also applies here. | Guided example 1, EN: "Wire it in this order: red wire → resistor → LED long leg; LED short leg → front foil pad; box foil pad → black wire. The resistor and LED must always be in the loop." ID: "Sambung dengan urutan: kabel merah → resistor → kaki panjang LED; kaki pendek LED → bantalan foil depan; bantalan foil di kotak → kabel hitam. Resistor dan LED harus selalu ada di jalur." Add a safety note: "Tape the battery holder and all clips firmly inside the box so no two clips can touch; never connect the foil pads straight to the red and black wires." ID: "Rekatkan tempat baterai dan semua jepitan dengan kuat di dalam kotak agar tidak ada dua jepitan yang bersentuhan; jangan pernah menyambung bantalan foil langsung ke kabel merah dan hitam." In materials, write "a **red or yellow** LED". |
| 2 | minor | Guided example 3 makes "Adik" the motor who pushes the rover full of small parts, but the safety notes say to keep the parts away from younger siblings. | Change to "a family member aged 6 or over is the motor" / "anggota keluarga berusia 6 tahun ke atas menjadi motor", or add "(the circuit is taped inside the box)". |
| 3 | minor | The extension adds "a second bumper on the left", which implies the first is on the right, but the first bumper is described as front-mounted. Separately, four loose toilet-roll tubes under a box roll out sideways, and in ID "roda gelinding" reads oddly. | Extension: "Replace the front bumper with a left and a right bumper, each with its own LED and resistor …". Materials: "4 toilet-roll tubes as rollers (or slide the box on the floor)". In ID use "rol". |

## unit-g6-stem-functions-parameters — **pass**

| # | Severity | Finding | Exact fix |
|---|---|---|---|
| 1 | minor | a1 index 1 ("7 units") maps to `ADDS_PARAMETERS`, but square(3) has only one parameter. 7 is 4 + 3, sides plus size. | Add `ADDS_SIDES_AND_SIZE` ("Adds the number of sides to the side length") and map index 1 to it. |
| 2 | minor | Guided example 3 says the program "repeats the same four lines three times with sizes 2, 4 and 6". With different sizes the lines are not the same. | Change to "repeats the same four-line pattern three times, changing only the size (2, 4, 6)" / "mengulang pola empat baris yang sama tiga kali, hanya ukurannya yang berubah (2, 4, 6)". |
