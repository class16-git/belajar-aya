# Pilot Montessori units QA (batch `expansion-pilot-montessori`)

Reviewer: Agent G3 (independent content QA, Montessori and early childhood). Reviewed 2026-11-10. No content files were edited.

Scope: the 20 files `content/units/*/montessori/unit-*.json`. All carry `provenance.batch: "expansion-pilot-montessori"`,
`reviewStatus: "agent_reviewed"` and one `original` source. `units:check` on `content/units` shows no errors for these files.
The single error it reports for the whole corpus is in another file.

Checks per file:
1. Physical safety for the age (choking, water depth, glass, sharp tools, supervision).
2. Accuracy of the science, geography and history statements.
3. Assessment: one defensible answer at index 0, correct machine checks, and distractors that map to described misconceptions.
4. Fidelity to Montessori principles in original wording.
5. Developmental fit and progression.
6. Natural Indonesian whose meaning matches the English.
7. Sensitivity for an Indonesian Muslim family.

None of the files copies NAMC or other album text that I could see. None makes an accreditation or certification claim.
Control of error, isolation of difficulty, the three-period lesson and freedom within limits are used appropriately and described in original wording.

**Severity levels**
- **Blocker**: must not ship (a hard-rule or safety violation).
- **Major**: a factual error, an internal contradiction or a wrong answer key or misconception map. A reviewer must fix it before approval.
- **Minor**: polish. Recommended, but not required.

**Verdicts**
- **Pass**: no blocker and no major. Minors are still recommended.
- **Fix required**: at least one blocker or major.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| age2_3-nesting-cups-big-to-small | pass | 0 | 0 | 3 |
| age2_3-pouring-water-two-jugs | pass | 0 | 0 | 4 |
| age3_4-colour-pairs-matching | pass | 0 | 0 | 2 |
| age3_4-jacket-flip-and-zip | pass | 0 | 0 | 3 |
| age4_5-number-rods-one-to-ten | **fix required** | 0 | 1 | 2 |
| age4_5-textured-letters-sounds | **fix required** | 0 | 1 | 3 |
| k-land-and-water-globe | pass | 0 | 0 | 3 |
| k-spindle-box-zero-to-nine | **fix required** | 0 | 1 | 1 |
| g1-fundamental-needs-of-people | pass | 0 | 0 | 2 |
| g1-land-and-water-forms-pairs | pass | 0 | 0 | 2 |
| g2-parts-of-a-leaf | pass | 0 | 0 | 4 |
| g2-timeline-of-my-life | pass | 0 | 0 | 2 |
| g3-five-classes-of-vertebrates | pass | 0 | 0 | 4 |
| g3-tile-game-addition-exchanging | **fix required** | 0 | 1 | 3 |
| g4-parts-of-a-flower | pass | 0 | 0 | 4 |
| g4-ribbon-timeline-of-life | pass (owner flag) | 0 | 0 | 3 |
| g5-bce-ce-timeline-reckoning | pass | 0 | 0 | 2 |
| g5-building-an-animal-key | pass | 0 | 0 | 3 |
| g6-journey-of-a-chocolate-bar | pass | 0 | 0 | 1 |
| g6-sun-angle-and-climate-zones | pass | 0 | 0 | 1 |
| **Total** | 16 pass, 4 fix required | **0** | **4** | **52** |

**Arithmetic.** I recomputed every `check` and every number in the text and found no errors:
- 45 spindles;
- the 20 cm per year strips: 140 cm and 160 cm;
- 2,456 + 1,378 = 3,834, 3,167 + 2,425 = 5,592 and 1,589 + 4,236 = 5,825, and 14 tens + 23 units = 163;
- the ribbon timeline: 4,600 ÷ 10 = 460, 66 ÷ 10 = 6.6, 230 ÷ 10 = 23, 0.3 ÷ 10 = 0.03 cm (a third of a millimetre), and 460 − 50 = 410;
- the BCE/CE gaps: 199, 349, 600 and 1,050, and 3 BCE to 3 CE is 5 steps;
- the sun-angle item: 30 − 20 = 10.

**Science dates.** The timeline-of-life figures are accepted rounded school values. Earth formed about 4.6 billion years ago (4.54 is the precise figure), the first life about 3.5 billion, the first fish about 500 million and the first dinosaurs about 230 million years ago. The dinosaur extinction was 66 million years ago, and modern humans appeared about 300,000 years ago.

## Items for the owner (sensitivity, not rewritten)

1. **g4-ribbon-timeline-of-life (origins).** `parentInstructions[3]` is neutral and respectful: "Families may hold beliefs about creation…". The unit dates the Earth and the first life forms, and says modern humans appeared about 0.3 million years ago. It does not say that humans descend from earlier species, and it does not use the Montessori "God with no hands" story.
   - The 300,000-year figure is the one most likely to raise questions about the creation of Adam (AS).
   - The owner (and, if wanted, the family's teacher) should decide whether to add family guidance, whether to keep the human card, or whether to word it as "the oldest known remains of people like us". I have not changed any theology.
   - The unit already carries `origins_family_sensitivity`, which is right.
2. **g5-bce-ce-timeline-reckoning.** "Masehi" is the standard Indonesian term and is fine.
   - `extension[1]` invites converting dates between the Hijri and Saka calendars. Hijri years are lunar, about 354 days long, so a conversion is not a simple subtraction. The unit should say so, or keep this as a "find out" task for a reference book (it already says "to be checked").
   - The owner may want any Hijri content to go through the Islamic review path.
3. **g1-fundamental-needs-of-people.** Grouping "beliefs" and "a place of worship" under "needs of the heart and mind" is respectful and suits the family. No change is needed.
4. **g2-timeline-of-my-life.** Bereavement, separation and adoption are handled well, because the child chooses what goes on the timeline. No change is needed.

---

## age2_3-nesting-cups-big-to-small — pass

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | practice[2] | "At bath or kitchen time" brings in bath water, but `hazards.water` is false and no note covers it. | EN "At kitchen time, nest the family's plastic bowls together." ID "Saat di dapur, susun mangkuk plastik keluarga bersama-sama." |
| 2 | minor | assessment a2 | "Give me the big one" with three cups out is ambiguous, because the middle cup is also big next to the smallest. | Prompt EN "Put out only the biggest and the smallest cup and ask 'Give me the big one.' Which response shows understanding?" Make the matching ID change. |
| 3 | minor | a3 distractor 2 → FORCES_FIT | "The smallest is at the outside" cannot happen when the cups are nested, and FORCES_FIT describes pushing, not this. | Replace it with EN "The cups are stacked but one is left out" / ID "Gelas tersusun tetapi satu tertinggal" and map it to STOPS_AFTER_ONE_PAIR. |

## age2_3-pouring-water-two-jugs — pass

Safety is good: a few centimetres of water, adult within reach, plastic jugs and the water flag set.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | ID guidedExamples[0], a1 (prompt, choice and explanation), POURS_FROM_HEIGHT | "corong" means funnel. A jug's spout is "mulut teko" or "cerat". | Replace every "corong" with "mulut teko". |
| 2 | minor | practice[2] | The tray water has had a squeezed sponge in it. Drinking from that jug is unhygienic. | Add EN "(use a clean jug of fresh drinking water, not the tray water)" / ID "(pakai teko bersih berisi air minum baru, bukan air dari nampan)". |
| 3 | minor | safety.notes | Toddlers bite foam sponges, and chunks of foam can break off. | Add EN "Use a firm sponge, not crumbly foam, and take it away if your child bites it." / ID "Pakai spons yang padat, bukan busa yang mudah hancur, dan ambil jika anak menggigitnya." |
| 4 | minor | a2 distractor 2 | Calling the adult for help is reasonable for a 2-year-old, so it is not a misconception. | Replace it with EN "Wipes with a hand or sleeve" / ID "Mengelap dengan tangan atau lengan baju" and keep WORK_CYCLE_INCOMPLETE. Optional: many Montessori presentations put the full jug on the left so the pour runs left to right. The current choice is acceptable. |

## age3_4-colour-pairs-matching — pass

Isolation of difficulty and the three-period lesson are done well.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a3 distractor 2 / ATTENDS_TO_SHAPE | All the cards are the same shape by design, so "Matches by the card's shape" cannot happen and tells the adult nothing. | Replace it with EN "Matches the card that is nearest" / ID "Mencocokkan kartu yang paling dekat" and map it to GUESSES_BY_POSITION. Delete ATTENDS_TO_SHAPE, or keep it only for the object-matching extension. |
| 2 | minor | accessibility[0] | "tell a reviewer if colour matching is hard" names the wrong person, and the ID names no one. | EN "…and mention it to your child's doctor or teacher if colour matching stays hard." ID "…dan sampaikan kepada dokter atau guru anak jika mencocokkan warna tetap sulit." |

## age3_4-jacket-flip-and-zip — pass

The flip method is described correctly: inside facing up, collar at the child's feet.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a2 distractor 1 | "Lie down on the jacket" is not a plausible mistake. | Replace it with EN "Stand up without lifting the jacket" / ID "Berdiri tanpa mengangkat jaket" (SEQUENCE_CONFUSED). |
| 2 | minor | a4 distractor 2 | Handing the jacket to the adult is a normal step at 3 years old, not a misconception. | Replace it with EN "On a chair or sofa" / ID "Di kursi atau sofa" (CYCLE_NOT_FINISHED). |
| 3 | minor | practice[1] | In Indonesia, jackets are worn mostly for motorbike rides and rain, not for walks. | EN "Before a motorbike ride or going out in the rain…" ID "Sebelum naik motor atau keluar saat hujan…" |

## age4_5-number-rods-one-to-ten — fix required

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | a3 explanation | The explanation contradicts the layout. guidedExamples[0] puts the longest rod at the top, so going *down* from rod 5 reaches rod 4, not 6. | EN "Going up the staircase from rod 5, towards the longer rods, the next rod has one more section: 6." ID "Naik di tangga dari batang 5 ke arah batang yang lebih panjang, batang berikutnya punya satu bagian lebih: 6." |
| 2 | minor | a2 distractor 1 ('6') | Undercounting to 6 is SKIPS_A_SECTION. COUNTS_TWICE would give 8. | Change `distractorMisconceptions` to `{"1":"SKIPS_A_SECTION","2":"JOINS_DIGITS"}`. |
| 3 | minor | safety.notes[1] | "by both ends, upright" is contradictory, and an upright 1 m rod can hit a face. | EN "carry long rods level, one hand at each end, walking slowly" / ID "bawa batang panjang mendatar, satu tangan di setiap ujung, berjalan pelan". |

## age4_5-textured-letters-sounds — fix required

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | parentInstructions[3] | Saying "sounds the same in both languages for these six letters" is wrong. The English short vowels in *mat* /æ/ and *tip* /ɪ/ differ from Indonesian /a/ and /i/, and "tipi" is not an everyday Indonesian word. | EN "In Indonesian, m, s, t and p sound almost the same, but a and i do not: English 'mat' and 'tip' use short vowels, Indonesian 'mata', 'sapi' and 'pita' use pure /a/ and /i/. Teach the vowels first in the language your child will read first." ID "Dalam bahasa Indonesia, bunyi m, s, t, dan p hampir sama, tetapi a dan i berbeda: 'mat' dan 'tip' dalam bahasa Inggris memakai vokal pendek, sedangkan 'mata', 'sapi', dan 'pita' memakai /a/ dan /i/ murni. Ajarkan vokal lebih dulu dalam bahasa yang akan dibaca anak pertama kali." |
| 2 | minor | ID extension[0] | The ID text builds English words (m-a-t, s-a-t, t-i-p), which mean nothing in Indonesian. | ID "…lalu susun kata dengan kartu: n-a-s-i, t-o-p-i, k-a-k-i." Keep the EN words. |
| 3 | minor | EN practice[1] | The EN text uses Indonesian object names (mangkuk, sendok, topi). This is acceptable for a bilingual family, but English learners need English words for the starting sounds. | EN "(mug, sock, top; or mangkuk, sendok, topi in Indonesian)". |
| 4 | minor | materials[2] / safety | A bowl of warm water is in the materials, but the water flag is false and no safety note covers it. | Add to safety.notes: EN "The adult pours a little lukewarm (not hot) water; empty it after use." / ID "Orang dewasa menuang sedikit air hangat suam-suam kuku (bukan panas); buang setelah dipakai." |

## k-land-and-water-globe — pass

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | GLOBE_IS_SKY remediation | "the air is too thin to see" is inaccurate, because photos from space do show the atmosphere as a thin blue haze at the edge. | EN "…point out the thin haze of air at the edge; the big blue areas are the sea." ID "…tunjukkan lapisan tipis udara di tepi; bagian biru yang luas adalah laut." |
| 2 | minor | ID childInstructions, outcomes | "perairan" is formal for a 5-year-old. | Child-facing ID: "darat" and "air" (for example "Kasar itu darat. Halus itu air."). Keep "perairan" in the parent text. |
| 3 | minor | extension[0] | The count of seven continents differs from many Indonesian school books, which use five or six. | Add EN "(Indonesian school books may count continents differently; follow your child's school.)" with a matching ID. |

## k-spindle-box-zero-to-nine — fix required

The control of error (45 spindles) and the meaning of zero are well done.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | a1 `distractorMisconceptions` | The map is reversed. By the unit's own descriptions, COUNTS_TWICE leaves one stick too few (7) and SKIPS_ONE puts one too many (9), so the wrong remediation would be shown. The item also tests reading the label rather than counting. | Set `{"1":"SKIPS_ONE","2":"COUNTS_TWICE"}`. Reword the prompt to EN "Your child counts out a bundle for the 8 compartment. Which bundle is right?" ID "Anak menghitung satu ikatan untuk kotak 8. Ikatan mana yang benar?" Choices: "8 sticks", "9 sticks", "7 sticks" (keep the check). |
| 2 | minor | ID throughout | "lidi" means coconut-leaf ribs (thin with sharp tips), but the materials are "stik es krim". "kotak" is used for both the box and the compartment. | Use "stik" for the sticks and "sekat" for a compartment ("Berapa stik masuk ke sekat 8?"). Or keep "lidi" as a stated alternative, with the tips trimmed by the adult. |

## g1-fundamental-needs-of-people — pass

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a1 distractor 2 | A phone can reasonably be argued to be a safety need, which weakens the "one defensible answer" rule. | Replace it with EN "A video game" / ID "Gim video". |
| 2 | minor | DIFFERENCE_AS_TASTE remediation | The ice-and-towel demonstration shows insulation keeping cold *in*, while the walls in the lesson keep heat in. The link is never stated. | Add EN "A thick covering slows heat moving in or out; thick walls keep a house's warmth inside the same way." Add the matching ID. |

## g1-land-and-water-forms-pairs — pass

The land and water pairs are correct: island and lake, cape and bay, isthmus and strait, with peninsula and gulf as the extension. Water is 2–3 cm deep and the flag is set.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | materials[1] | Play dough softens in water, and real clay turns the water muddy. | EN "Oil-based modelling clay (plasticine)" / ID "Plastisin (lilin mainan berbahan minyak)". |
| 2 | minor | guidedExamples[2] | Name the strait. | EN "…the Sunda Strait between Java and Sumatra." ID "…Selat Sunda di antara Jawa dan Sumatra." |

## g2-parts-of-a-leaf — pass

The leaf parts and margins are correct: mango, guava and jackfruit have smooth margins, and hibiscus is toothed. Tamarind and rain tree are correct examples of compound leaves.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | outcomes[1], a2 explanation | The text is incomplete: veins carry water *into* the leaf and carry food made in the leaf to the rest of the plant. | Append EN "…and carry the food the leaf makes to the rest of the plant." / ID "…dan mengangkut makanan buatan daun ke bagian tanaman lain." |
| 2 | minor | safety.notes[0] | Fresh mango sap, from a picked stalk, irritates skin, and mango is the main leaf used. | Add EN "Fresh mango sap can irritate skin; prefer fallen leaves." / ID "Getah mangga segar bisa membuat kulit iritasi; pilih daun yang sudah jatuh." |
| 3 | minor | VEINS_AS_STALK | The description ("only the stalk carries water") does not match the a2 distractor it is mapped from ("Hold the leaf onto the stem"). | Description EN "Gives the veins the stalk's job of holding the leaf on." / ID "Memberi tulang daun tugas tangkai, yaitu menempelkan daun." |
| 4 | minor | safety | A magnifying glass can focus sunlight. | Add EN "Do not leave the magnifier in direct sun." / ID "Jangan tinggalkan kaca pembesar di bawah sinar matahari langsung." |

## g2-timeline-of-my-life — pass

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a2 prompt | "started school when he was 6" could have been 0 to 2 years ago, depending on the month. | EN "…He started school on his 6th birthday. How many years ago was that?" Make the matching ID change. |
| 2 | minor | a2 distractor 2 ('13') | 7 + 6 is adding instead of subtracting, but it is mapped to ADDS_INSTEAD_OF_MULTIPLIES. | Add misconception ADDS_INSTEAD_OF_SUBTRACTS (EN "Adds the ages instead of finding the difference." remediation: "Walk from the age-6 line to the age-7 line and count the lines crossed.") and map index 2 to it. |

## g3-five-classes-of-vertebrates — pass

The feature cards are accurate and suit the age: fish have gills and fins; amphibians have moist skin and gilled young; reptiles have dry scales and leathery eggs; birds have feathers, beaks and hard-shelled eggs; mammals have hair and feed their young milk.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions | "Five classes" is the traditional school grouping, but scientists split fish into several classes (a shark is not a bony fish). | Add EN "Scientists today split 'fish' into several groups; 'five classes' is the traditional school grouping." Add the matching ID. |
| 2 | minor | ID preparation[0] | "bertelur bercangkang lunak" means soft-shelled, which is not the same as leathery. | "bertelur bercangkang liat seperti kulit". |
| 3 | minor | a5 distractor 2 ('Bat' → FLYING_DEFINES_BIRD) | Choosing the bat as a reptile has nothing to do with birds. | Map it to CLASSIFIES_BY_HABITAT or leave it unmapped. |
| 4 | minor | CLASSIFIES_BY_HABITAT remediation | The sea cards (shark, whale, sea turtle, penguin) split into four classes, not three. | EN "…split into fish, mammal, reptile and bird." ID "…ikan, mamalia, reptil, dan burung." |

## g3-tile-game-addition-exchanging — fix required

The colours follow the Montessori stamp game: green units, blue tens, red hundreds, green thousands. All the sums check.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | a1, a3, a4 choice 2 | "3,7214", "5,5812" and "5,7115" are badly formed numbers, with four digits after the separator. A child can rule them out by their shape alone, and they do not match the WRITES_TEEN_IN_COLUMN error. | Use the true result of writing each column total in place: a1 EN "371,214" / ID "371.214"; a3 "55,812" / "55.812"; a4 "571,115" / "571.115". |
| 2 | minor | rationale | The colour code comes from the stamp game, not the bead material (golden beads are not coloured by place). | EN "…echoes the Montessori stamp game…" ID "…mengikuti permainan perangko Montessori…" |
| 3 | minor | ID throughout | "ubin" means floor tile. | "keping nilai tempat" (or "kartu nilai"). |
| 4 | minor | prerequisites | Going from the K spindle box straight to four-digit exchanging skips place value. | Add `unit-g2-math-place-value-hundreds` as a prerequisite. |

## g4-parts-of-a-flower — pass

The parts and their jobs are correct (sepal and petal are *kelopak* and *mahkota*), and so is the description of the hibiscus column. The sharp and allergen flags are set, and only the adult uses the knife.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions[0], materials[0] | Lilies have six coloured tepals and no green sepals, so they clash with the "outside green sepals" in a4 and the dissection card. Lilies are also highly toxic to cats. | EN "A lily also works, but its three outer 'petals' are really sepals that look like petals; keep lilies away from cats." Add the matching ID. |
| 2 | minor | guidedExamples[0] | Hibiscus has an extra ring of thin green bracts (the epicalyx) below the sepals, which children will count as sepals. | Add EN "The thin green spikes just below are an extra ring called the epicalyx, not sepals." / ID "Duri hijau tipis di bawahnya adalah kelopak tambahan, bukan kelopak utama." |
| 3 | minor | PETALS_MAKE_SEEDS remediation | Garden hibiscus rarely sets seed, so the "ovary swells into a fruit" observation will usually fail. | EN "Watch a chilli, aubergine or long-bean flower…" / ID "Amati bunga cabai, terong, atau kacang panjang…" |
| 4 | minor | a3 explanation | Strictly, ovules become seeds after fertilisation. | EN "…become seeds after pollination and fertilisation." / ID "…setelah penyerbukan dan pembuahan." |

## g4-ribbon-timeline-of-life — pass (owner flag above)

The scale and dates are correct. `science_dates_check` is set.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a4 explanation, outcomes[2] | "before that, life was microscopic" is wrong: large soft animals (about 575 million years ago) and Cambrian animals (about 540 million) came before fish. The first 110 cm also had no known life at all. | EN "For the first 110 cm there was no life; then for most of the ribbon, until about 60 cm from today, life was tiny and lived in water." Make the matching ID change. Keep choice 0. |
| 2 | minor | practice[1] | The child cannot colour "life on land" without a date. | Add an event card: EN "first land plants (about 470 million years ago, 47 cm)" / ID "tumbuhan darat pertama (sekitar 470 juta tahun lalu, 47 cm)", and colour the first 110 cm grey for "no life yet". |
| 3 | minor | materials[2] | "dinosaurs die out" is not quite right, because birds descend from dinosaurs. | EN "most dinosaurs die out (birds are their living relatives)" / ID "sebagian besar dinosaurus punah (burung adalah kerabatnya yang masih hidup)". |

## g5-bce-ce-timeline-reckoning — pass

The no-year-0 rule is handled correctly everywhere, and all assessment keys and maps are right.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | accessibility[0] | A −10 to 10 number line *has* a zero, so it can reinforce the ASSUMES_YEAR_ZERO error. | Append EN "…and point out that the number line has a 0 but the calendar goes straight from 1 BCE to 1 CE." / ID "…dan tunjukkan bahwa garis bilangan punya 0, tetapi kalender langsung dari 1 SM ke 1 M." |
| 2 | minor | extension[1] | Hijri years are lunar. | Append EN "(Hijri years are shorter, so converting is not a simple subtraction.)" Add the matching ID. See owner item 2. |

## g5-building-an-animal-key — pass

The sample key works for all six cards.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | preparation[0] step 3 | "Has large wings?" uses "large", a judgement of size that the unit itself rules out. Winged ant queens (mentioned in a remediation) would also confuse it. | EN "3. Has wings covered in coloured scales? yes → butterfly, no → ant." ID "3. Sayapnya bersisik berwarna? ya → kupu-kupu, tidak → semut." |
| 2 | minor | practice[2], parentInstructions | Many common butterflies seem to have only four legs, because their front pair is tiny and tucked up. | Add EN "Some butterflies tuck their front legs up; look closely with the magnifier." Add the matching ID. |
| 3 | minor | safety.notes | Garden snails (*bekicot*) can carry rat lungworm, and some ants bite (*semut api*, *rangrang*). | Add EN "Do not pick up snails or ants with bare hands." / ID "Jangan memegang bekicot atau semut dengan tangan telanjang." |

## g6-journey-of-a-chocolate-bar — pass

The cocoa farming in Sulawesi is accurate. The unit rightly avoids guessing figures ("to find out") and frames the discussion as gratitude, not guilt. The allergen flag is set.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | childInstructions[0] | The label-reading step could add the halal mark, which is natural for the family. | EN "Read the label: ingredients, where it was made, and any halal logo." ID "Baca label: bahan, tempat pembuatan, dan logo halal." |

## g6-sun-angle-and-climate-zones — pass

The physics is correct: at 45° the area grows by about 1/sin 45° ≈ 1.4, so 20 squares becomes about 28 to 30. The unit correctly says that the angle, not the distance, is the main reason, and that Indonesia lies across the equator. The torch is battery-powered, no mains lamps are used, and the heat flag is set.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | prerequisites | The link to land and water forms is weak. | Use `unit-k-montessori-land-and-water-globe`, which introduces the globe and the round Earth. |

## Progression

The units form coherent chains:
- number rods → spindle box → tile game (add a place-value step, see above);
- globe → land and water forms → sun angle;
- leaf → flower;
- my-life timeline → ribbon of life → BCE/CE;
- vertebrates → animal key;
- needs → chocolate web.

The four units for under-4s (nesting cups, pouring, colour pairs, jacket) stand alone and suit their ages. No unit makes a near-duplicate of another.
