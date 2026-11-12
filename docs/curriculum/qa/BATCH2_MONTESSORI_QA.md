# Batch 2 Montessori units QA (batch `expansion-batch2-montessori`)

Reviewer: independent content QA (Montessori and early childhood, early-years safety, science and history editing). Reviewed 2026-11-12. I did not write these units and did not edit any content file.

Scope: the 20 files `content/units/*/montessori/unit-*.json` whose `provenance.batch` is `"expansion-batch2-montessori"`. All 20 have:
- `reviewStatus: "agent_reviewed"`;
- `review` with `agentChecks` only;
- one `original` source with `verification: "not_applicable"`;
- `createdAt: "2026-11-10"`;
- `answer: 0` on every assessment item.

`units:check` on `content/units` reports 183 units, 71 readings and 0 errors. No file copies NAMC or other album text that I could see, and none makes an accreditation or certification claim. A text search for "NAMC", "certif" and "accredit" finds nothing (the only hits are inside words such as "memahami"). Control of error, isolation of difficulty, the three-period lesson and the work cycle are described in original wording and used appropriately.

Checks per file:
1. Physical safety for the age.
2. Accuracy of the science, geography and history.
3. Assessment: one defensible answer at index 0, correct `check`s, and distractors mapped to described misconceptions.
4. Montessori fidelity.
5. Indonesian that reads naturally and matches the English.
6. Rules 11–18 of the brief.

Severity and verdicts are as in the pilot QA:
- **Blocker**: must not ship (a hard-rule or safety violation).
- **Major**: a factual error, a contradiction, a wrong key or map, or a hard-rule breach (here, rule 11) that must be fixed before approval.
- **Minor**: polish, recommended.
- **Pass** means no blocker and no major. **Fix required** means at least one blocker or major.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| age2_3-object-to-picture-matching | pass | 0 | 0 | 3 |
| age2_3-offering-and-thank-you | pass | 0 | 0 | 3 |
| age3_4-rough-and-smooth-boards | pass | 0 | 0 | 2 |
| age3_4-washing-a-small-table | pass | 0 | 0 | 2 |
| age4_5-i-spy-first-sounds | pass | 0 | 0 | 2 |
| age4_5-sound-cylinders-sealed | **fix required** | 0 | 1 | 3 |
| g1-puzzle-map-of-indonesia | pass | 0 | 0 | 4 |
| g1-what-animals-need | pass | 0 | 0 | 2 |
| g2-life-cycle-of-a-frog | pass | 0 | 0 | 3 |
| g2-roots-and-what-they-do | pass | 0 | 0 | 4 |
| g3-from-gathering-to-farming | **fix required** (owner flag) | 0 | 1 | 1 |
| g3-tile-game-subtraction-exchanging | pass | 0 | 0 | 2 |
| g4-food-chains-in-a-rice-field | pass | 0 | 0 | 4 |
| g4-paper-fraction-circles | **fix required** | 0 | 1 | 4 |
| g5-how-seeds-travel | pass | 0 | 0 | 4 |
| g5-story-of-writing-systems | **fix required** | 0 | 1 | 4 |
| g6-plates-and-the-ring-of-fire | pass (owner note) | 0 | 0 | 4 |
| g6-squares-of-numbers | pass | 0 | 0 | 2 |
| k-continents-puzzle-map | pass | 0 | 0 | 3 |
| k-parts-of-a-plant | **fix required** | 0 | 1 | 3 |
| **Total** | 15 pass, 5 fix required | **0** | **5** | **59** |

**Arithmetic.** I recomputed every `check` and every number in the text and found no errors:
- tile subtraction: 5,342 − 2,718 = 2,624; 4,005 − 1,238 = 2,767, with the exchange state 3 thousands, 9 hundreds, 9 tens and 15 units; 6,251 − 3,476 = 2,775; a1 7,423 − 2,658 = 4,765; a3 3,002 − 1,547 = 1,455; a4 2,140 − 865 = 1,275;
- tile-subtraction distractors: 5,235 and 2,725 (smaller digit from larger), 5,875 (exchanges without reducing), 3,005 (adds);
- farming timeline: 2,000 ÷ 100 = 20 cm and 10,000 ÷ 100 = 100 cm;
- fractions: (1/4) ÷ (1/8) = 2, 4/8 = 1/2, 1/4 + 1/4 = 1/2, and tenths every 36°;
- seed means: 6.0 ÷ 3 = 2.0 s and 9.3 ÷ 3 = 3.1 s;
- BCE/CE: 2,500 + 500 − 1 = 2,999; 2,026 − 400 = 1,626; 3,200 + 400 − 1 = 3,599;
- plates: 5 × 1,000 = 5,000 cm = 50 m; 4 × 2,500 ÷ 100 = 100 m; 6 cm × 10,000 = 600 m = 0.6 km;
- squares: 49, 81 − 64 = 17, the sum 1 + 3 + … + 11 = 36, √144 = 12, and 169 + 26 + 1 = 196. The distractors 14, 42, 9, 16, 25, 121, 72, 36, 170 and 183 each match their stated misconception.

**Safety overview.**
- No under-4 unit uses choking-size items.
- Sealed fillings appear only at 4–5 (sound cylinders, flagged `chokingRisk`).
- The adult does all cutting everywhere.
- Every water activity is a few centimetres deep, with an adult present, and the water is emptied straight away or within two days.
- Seeds and beans are handled by children only from Grade 2 up, with a note to keep them from younger siblings.
- Field visits name snakes and leeches, require firm ground and forbid taking animals home.

## Items for the owner (sensitivity, not rewritten)

1. **g3-from-gathering-to-farming (origins and worldview).**
   - What the unit does well: `parentInstructions[0]` is neutral ("This unit is about ways of life, not about where the first people came from…"). The unit carries `worldview_alignment`. It makes no claim about human origins or descent, and it rightly avoids calling early people "primitive".
   - Point 1: the storyline says people lived by gathering "for a very long time" before farming, dated to about 10,000 years ago. Some Muslim families hold traditions in which the first humans (Adam AS) already cultivated land. A gathering-to-farming sequence can read as a claim about the earliest humans, not about later societies.
   - Point 2: the Maros cave-painting reference is correctly left without exact ages.
   - Decision for the owner (with the family's teacher if wanted): whether to add a sentence such as "This story describes many communities in the distant past; it does not describe the very first people." I have not changed any theology.
2. **g6-plates-and-the-ring-of-fire.** The unit explains disasters by natural causes only, with no punishment or omen framing. It is calm and practical, and it carries `emotional_sensitivity`. Families often add a faith response (patience, du'a, helping others). That belongs to the family or the Islamic track, not to this unit. No change is needed. Owner awareness only.
3. **g5-story-of-writing-systems.** Jawi is presented respectfully as one script among many, with no religious claims. No change is needed (see minor 4 for an optional "Pegon" mention).
4. **k-continents-puzzle-map and g1-puzzle-map-of-indonesia.** The continent-count convention is stated correctly in k `parentInstructions[2]`. See k minor 1 on whether Indonesia counts as "in Asia".

---

## age2_3-object-to-picture-matching — pass

The safety is right: every object is bigger than a fist, there is a toilet-roll-tube test, no glass, paper photos and no screens. The three-period lesson is adapted well for a non-verbal child.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a2 prompt vs explanation | The explanation says choosing the sandal "when it is not the nearer one" shows learning, but the prompt never puts the sandal further away. As written, distractor 1 (GUESSES_BY_POSITION) cannot be told apart. | Prompt EN "Observe: put the board book near your child and the sandal a little further away, with no cards. Say 'Give me the sandal.' Which response shows the word is learned?" ID "Amati: taruh buku papan dekat anak dan sandal sedikit lebih jauh, tanpa kartu. Katakan 'Berikan sandalnya.' Respons mana yang menunjukkan kata itu sudah dikenal?" |
| 2 | minor | extension[1] | The sort "things we eat with / things we wear" leaves the hairbrush and the board book (both in the basket) with no group. | EN "Sort the photo cards into three groups: things we eat with, things we wear, and other things." ID "Pilah kartu foto menjadi tiga kelompok: alat untuk makan, barang yang dipakai, dan barang lainnya." |
| 3 | minor | materials[1], safety | Toddlers mouth cards. A wet paper print peels off into chewable pieces. | Add to safety.notes EN "Cover each photo card with clear packing tape so it can be wiped and does not peel if mouthed." ID "Lapisi setiap kartu foto dengan selotip bening lebar agar bisa dilap dan tidak mengelupas jika digigit." |

## age2_3-offering-and-thank-you — pass

The grace and courtesy lesson is taught at a calm moment, as it should be. The right-hand/two-hand note fits the family. The soft toy kitten follows rule 16.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | guidedExamples[0] | The adult holds the basket with both hands, then "holds [the napkin] out with both hands". Both cannot happen at once, and a toddler copying this will drop the basket. | Insert EN "Set the basket down at your feet." before "Take out one napkin…". ID "Letakkan keranjang di dekat kaki Anda." before "Ambil satu serbet…". |
| 2 | minor | practice[1] | EN "offers the cushion basket or a folded towel" does not match ID "bantal kecil atau handuk terlipat", and "cushion basket" is unclear. | EN "…offers a small cushion or a folded towel at the door…". |
| 3 | minor | a3 distractor 2 | Calling a sibling to come over is reasonable for a 2-year-old, so it is not a clear misconception. | Replace it with EN "Holds the napkin out from where she sits and waits" / ID "Menyodorkan serbet dari tempat duduknya dan menunggu" (STAYS_AT_A_DISTANCE). |

## age3_4-rough-and-smooth-boards — pass

Isolation of a single quality (same card size and colour), the coloured-dot control of error and preparation for the textured letters are all faithful.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions[0], materials[1] | "Coarse" and "fine" sandpaper are not specified. Neighbouring grits (for example 80 and 120) feel alike to a 3-year-old, so a2 would test the paper, not the child. | Add EN "(for example grit 40–60 for coarse and 180–240 for fine)" / ID "(misalnya amplas nomor 40–60 untuk kasar dan 180–240 untuk halus)". |
| 2 | minor | a3 | A well-worn pandan mat feels quite smooth, so "the mat" could be argued for "smooth" in some homes. | Use EN "a coconut-fibre doormat" / ID "keset sabut kelapa" in the prompt, choice 1 and the explanation. |

## age3_4-washing-a-small-table — pass

The water depth (a tape line), an adult within reach, emptying straight away (dengue), mild soap and the fixed left-to-right sequence are all correct.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions[0], materials[4] | A plastic sheet under a wet work becomes slippery. | Prefer EN "an old towel or a rubber-backed mat" / ID "handuk bekas atau keset beralas karet". Keep "plastic sheet" only with a towel on top. |
| 2 | minor | guidedExamples[2] | "Rinse the sponge" happens in the soapy basin, so the suds are wiped with soapy water. | EN "Rinse the sponge in clean water from the jug (keep a little back for this), squeeze it…" ID "Bilas spons dengan air bersih dari teko (sisakan sedikit untuk ini), peras…". |

## age4_5-i-spy-first-sounds — pass

The EN and ID distractors are well paralleled: end sound, rhyme and letter name in both languages (fish/nasi, top/topi, lamp/lari).

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a1, a2, a4 explanations | The parentheticals present different words as translations ("Sock (sapu)", "Leaf (ikan)", "Camp (pari)"). This confuses parents. | Remove the cross-language parentheticals. a1 EN "Sock begins with /s/; bus only ends with it." ID "Sapu diawali /s/; tas hanya berakhir dengan bunyi itu." Do the same for a2 and a4. |
| 2 | minor | materials[0], guidedExamples[2] | "mainan" is a category, not an object a child can pick out. | Use "mobil mainan" (still /m/) in both places. |

## age4_5-sound-cylinders-sealed — fix required

The Montessori pattern is faithful: red and blue sets, pairing, then grading, with dots underneath as the control of error. The `chokingRisk` flag, an adult present and storage away from siblings under 4 are correct.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | parentInstructions[0], [1], materials[0], preparation[0] | The containers are "small yoghurt-drink bottles" with "lids" glued on. Typical small yoghurt-drink bottles have a peel-off foil top, not a cap, so the "glue the lids on" seal cannot be made as described. The seal is the only barrier between a 4-year-old and rice, sand and pasta. a2 even expects children to try peeling the wrapper. The bottle size is also not stated. | materials[0] EN "Six identical opaque plastic bottles with screw-on caps, at least 4 cm across and 7 cm tall (for example small screw-cap drink or spice bottles; not foil-topped yoghurt-drink bottles), wrapped in plain paper…". ID "Enam botol plastik buram yang sama dengan tutup ulir, lebar sedikitnya 4 cm dan tinggi 7 cm (misalnya botol minuman kecil atau botol bumbu bertutup ulir; bukan botol minuman yoghurt bertutup foil), dibungkus kertas polos…". Make the same change in parentInstructions[0]. preparation[0] EN "Fill each bottle no more than a quarter full, screw the cap on over a ring of strong glue, let it dry for a day, then tape over the cap and wrap the bottle. Squeeze and shake hard yourself to be sure nothing moves." ID "Isi setiap botol paling banyak seperempat, pasang tutup ulir di atas lingkaran lem kuat, biarkan kering sehari, lalu lapisi tutup dengan selotip dan bungkus botolnya. Remas dan guncang keras sendiri untuk memastikan tidak ada yang bergeser." Add to safety.notes EN "If any filling is ever found outside a bottle, put the whole set away until the adult reseals it." ID "Jika ada isian yang keluar dari botol, simpan seluruh set sampai orang dewasa menyegelnya kembali." |
| 2 | minor | extension[0] | The fourth (salt) pair does not repeat that the adult fills and seals it. | Append EN "(the adult fills and seals it the same way)" / ID "(orang dewasa mengisi dan menyegelnya dengan cara yang sama)". |
| 3 | minor | LOOKS_INSTEAD_OF_LISTENING remediation | The clear "see-and-hear" bottles also hold small parts. | Append EN "Seal them exactly like the others." / ID "Segel persis seperti botol lainnya." |
| 4 | minor | practice[2] | It is called a "listening walk", but the child sits still for one minute. | EN "Quiet listening time: …" / ID "Waktu mendengarkan dengan tenang: …". |

## g1-puzzle-map-of-indonesia — pass

The facts are correct:
- the five largest islands;
- Borneo shared with Malaysia and Brunei;
- New Guinea shared with Papua New Guinea;
- Java the most populous island;
- Bali Strait to the west, Lombok to the east;
- Sulawesi's "K" shape and Papua's Bird's Head.

The progression from whole to parts (globe, continents, then country) is faithful.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions[2], guidedExamples[1], a4 explanation | "The equator crosses Sumatra, Kalimantan and Sulawesi" is true but incomplete. The line also passes through the North Maluku and Raja Ampat island groups, and the red wool will visibly cross the Maluku piece. | Append EN "…and some smaller islands in North Maluku and Raja Ampat." ID "…serta beberapa pulau kecil di Maluku Utara dan Raja Ampat." The a4 key still stands. |
| 2 | minor | ID guidedExamples[2], a1 explanation | In Indonesian the whole island is also "Kalimantan", so "bagian Indonesia disebut Kalimantan" is circular. | ID a1 "Garis batas putus-putus melintasi Pulau Kalimantan; bagian utaranya milik Malaysia (Sabah dan Sarawak) dan Brunei, sisanya milik Indonesia." Make a matching change in guidedExamples[2]: "Bagian utara pulau ini milik Malaysia dan Brunei. Bagian lainnya milik Indonesia." |
| 3 | minor | a4 (rule 11) | a4 repeats the guided-example sentence word for word ("It crosses Sumatra, Kalimantan and Sulawesi"), so it tests recall. | Make it transfer: EN "Pontianak in West Kalimantan is known as the 'equator city'. Which of these cities is closest to the red wool?" Choices "Pontianak" / "Surabaya" / "Kupang". ID "Pontianak di Kalimantan Barat dikenal sebagai 'kota khatulistiwa'. Kota mana yang paling dekat dengan benang wol merah?" Keep the map. |
| 4 | minor | parentInstructions[0] | One "Bali–Nusa Tenggara" piece is a chain of separate islands, and Timor is split by the border. | Add EN "Cut the chain as one piece joined by thin blue 'sea bridges', and cut only the Indonesian (western) half of Timor." Add the matching ID. |

## g1-what-animals-need — pass

The facts are accurate: fish gills take dissolved oxygen, many cats are lactose intolerant and hens seek a nest. The rabbit item tests transfer well.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a1 (rule 11) | a1 repeats guidedExamples[1] ("Does a fish need air?… gills take it from the water"). | EN "A shrimp lives in water all its life. Does it need oxygen?" Choices "Yes, it takes oxygen from the water with its gills" / "No, animals in water need no oxygen" / "Yes, it comes up to breathe through its nose like us". Make the matching ID change ("udang"). Keep the map. |
| 2 | minor | safety.notes[0] | Indonesia has rabies in many provinces, and kittens scratch. | Add EN "If an animal bites or scratches, wash the wound with soap and running water for 15 minutes and see a doctor the same day." ID "Jika digigit atau dicakar hewan, cuci luka dengan sabun dan air mengalir selama 15 menit dan segera periksa ke dokter hari itu juga." |

## g2-life-cycle-of-a-frog — pass

The science is correct: back legs before front legs, the tail resorbed rather than dropped, gills to lungs plus skin breathing, and jelly-covered eggs. Tadpoles and pond water are not brought home (dengue).

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions[1], a4 | "Frog eggs are laid in water" is a generalisation. The common Indonesian tree frog (*katak pohon bergaris*) makes foam nests on leaves above water, and toads (*kodok*) lay strings, not clumps. | Append to parentInstructions[1] EN "(Most frogs; some tree frogs make a foam nest on a leaf above water so the tadpoles drop in, and toads lay long strings of eggs.)" Add the matching ID. a4 prompt EN "Why do most frogs lay their eggs in water?" / ID "Mengapa kebanyakan katak meletakkan telurnya di air?" |
| 2 | minor | guidedExamples[2] | "The adult frog… lays eggs": only females lay. | EN "One day a female frog lays eggs…" / ID "Suatu hari katak betina bertelur…". |
| 3 | minor | a1 (rule 11) | a1 repeats "First the back legs grow". | Transfer: EN "A drawing shows a tadpole with two front legs and no back legs. What is wrong with it?" → "Back legs grow first" / "Nothing is wrong" / "Tadpoles never grow legs". Keep the map. |

## g2-roots-and-what-they-do — pass

The botany is correct:
- carrot and radish are taproots;
- cassava and sweet potato are storage roots;
- monocots (rice, maize, grass, coconut) have fibrous roots;
- potato is a stem tuber and onion is mostly leaves;
- root hairs take in most of the water;
- roots grow downwards regardless of seed orientation.

The raw-cassava warning, the mung-bean choking note and emptying the water daily are all present.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a3 (rule 11) | Potato and onion are the practice[2] items. | Distractors EN "Ginger (an underground stem)" / ID "Jahe" and EN "Taro (an underground stem)" / ID "Talas". Update the explanation. Keep UNDERGROUND_MEANS_ROOT. |
| 2 | minor | THICK_PART_DRINKS remediation | A fringed paper towel does not reliably soak up faster than a plain strip of the same paper. | EN "Dip a pencil and a paintbrush of the same thickness in water and dab each on paper: the many fine hairs hold far more water. Root hairs work the same way." Add the matching ID. |
| 3 | minor | UNDERGROUND_MEANS_ROOT remediation | Sprouted or green potatoes are toxic if eaten. | Append EN "Do not eat the sprouted potato afterwards." / ID "Jangan memakan kentang yang sudah bertunas itu." |
| 4 | minor | safety | A magnifier is used and can focus sunlight (as in the pilot). | Add EN "Do not leave the magnifier in direct sun." / ID "Jangan tinggalkan kaca pembesar di bawah sinar matahari langsung." |

## g3-from-gathering-to-farming — fix required (owner flag above)

The history is sound as rounded school figures:
- the earliest farming about 10,000 years ago;
- wheat in South-West Asia, rice in East Asia and maize in the Americas;
- the Maros paintings without exact ages;
- "meramu" and "bercocok tanam" match Indonesian school terms;
- respectful framing.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | a4 (rule 11) | a4 is exactly the practice computation. outcomes[2], childInstructions[2] and successCriteria[1] have the child place "farming, 10,000 years ago" at 1 cm = 100 years, so the item tests recall of the activity, not transfer. The validator does not catch it because the numbers come from childInstructions. | EN prompt "In one place, people began making clay pots about 3,500 years ago (an example date). On the same timeline, where 1 cm stands for 100 years, how far from 'today' does that card go?" Choices "35 cm" / "3.5 cm" / "350 cm". `check: {"expression": "3500 / 100", "result": "35"}`. Map `{"1":"SCALE_DIVIDES_TOO_MUCH","2":"SCALE_DIVIDES_TOO_LITTLE"}`. Explanation EN "3,500 ÷ 100 = 35 cm from today." ID "Di suatu tempat, orang mulai membuat tembikar sekitar 3.500 tahun lalu (tanggal contoh). Pada garis waktu yang sama, di mana 1 cm mewakili 100 tahun, seberapa jauh dari 'hari ini' kartu itu diletakkan?" "35 cm" / "3,5 cm" / "350 cm". |
| 2 | minor | guidedExamples[1], materials[2] | "made jars to store the harvest": the earliest farmers in several regions stored grain in baskets and pits before pottery. | EN "…and stored the harvest in baskets, pits and, later, clay jars." ID "…dan menyimpan hasil panen di keranjang, lubang, dan kemudian tempayan tanah liat." |

## g3-tile-game-subtraction-exchanging — pass

The colours follow the Montessori stamp game. Only the minuend is built, and the exchange across zeros is modelled correctly. All keys and most maps check, and the ID "keping nilai tempat" adopts the pilot fix.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | guidedExamples[2] | "Take away: 7 units, 6 tens, 7 hundreds, 2 thousands" lists what is *left*, not what is taken (8, 3, 2, 1). | EN "Take away 8 units, 3 tens, 2 hundreds and 1 thousand. What is left: 7 units, 6 tens, 7 hundreds, 2 thousands: 2,767." Make the matching ID change. |
| 2 | minor | ZERO_EXCHANGE_NOT_REDUCED description (a3 choice 1, 1,565) | 1,565 comes from treating each zero column as 10 instead of 9, with the thousand reduced. The description says the thousand is *not* exchanged, which would give 2,565. | Description EN "Across zeros, turns each zero into 10 instead of 9, forgetting that one tile was passed on down." ID "Saat melewati nol, menjadikan setiap nol 10, bukan 9, lupa bahwa satu keping sudah diteruskan ke kolom berikutnya." The remediation is fine. |

## g4-food-chains-in-a-rice-field — pass

The ecology is accurate:
- planthoppers eaten by wolf spiders and frogs;
- snakes and owls take rats, and the owl nest-box practice (*rubuha*) is real;
- egrets eat frogs and fish;
- the arrows mean "is eaten by", which the unit stresses well.

The cosmic-education framing is good.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | materials[0] vs parentInstructions[0] | The parent list has 12 living things plus the sun, but the materials say "about 13… plus a sun card". | EN "12 picture cards of rice-field living things, plus a sun card" / ID "12 kartu gambar makhluk hidup di sawah, ditambah kartu matahari". |
| 2 | minor | ID a2 | "bangau" is a stork. Heron is "cangak" (or "kuntul" for egrets). | ID "cangak" in the prompt, choice 1 and the explanation. |
| 3 | minor | parentInstructions[2] | Earthworms are strictly detritivores, which break dead matter into pieces, alongside the true decomposers (fungi, bacteria). | Append EN "(Earthworms break dead matter into small pieces; fungi and bacteria finish the job. Many school books group them all as decomposers.)" Add the matching ID. |
| 4 | minor | a4 (rule 11) | a4 restates guidedExamples[2]. | Transfer: EN "A fallen banana leaf lies on the pematang. After a few weeks it is gone. Who used it?" → "Fungi, bacteria and earthworms broke it down" / "The sun dried it into air" / "Nothing; it just disappears". Make the matching ID change. Keep the map. |

## g4-paper-fraction-circles — fix required

The construction is correct: thirds and sixths by protractor (120°, 60°), halves to eighths by folding, cutting by the adult, and the tenths extension at 36°. The checks are all right.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | objective vs guidedExamples, practice, cpa | The objective includes "add fractions with the same denominator", and a5 assesses it, but no guided example, practice task or CPA step teaches addition. The unit is not a complete learning experience for its stated objective (rules 4 and 17). | Add guidedExamples[3] EN "Adding: lay one sixth on the whole circle, then two more sixths beside it. 'One sixth and two sixths make three sixths: 1/6 + 2/6 = 3/6. The pieces are still sixths, so only the top number changes.' Lay the three sixths on a half: they cover it exactly, so 3/6 = 1/2." ID "Menjumlahkan: letakkan satu keping seperenam di atas lingkaran utuh, lalu dua keping seperenam lagi di sampingnya. 'Satu perenam dan dua perenam menjadi tiga perenam: 1/6 + 2/6 = 3/6. Kepingnya tetap perenam, jadi hanya angka atas yang berubah.' Letakkan tiga keping seperenam di atas setengah: pas menutupinya, jadi 3/6 = 1/2." Add practice[3] EN "Add with the pieces and write each sum: 1/8 + 3/8, 1/3 + 1/3, 2/6 + 3/6." ID "Jumlahkan dengan kepingan dan tulis hasilnya: 1/8 + 3/8, 1/3 + 1/3, 2/6 + 3/6." Append to cpa.abstract EN ", and 1/8 + 3/8 = 4/8". (These numbers do not repeat a5.) |
| 2 | minor | a3 choice 1 ("2/8") → DOUBLES_ONLY_ONE_PART | 2/8 changes *both* numbers (×2 and ×4), so it does not show "changes only one number". | Replace it with "1/4" (EN and ID), which doubles only the bottom. Keep the map. |
| 3 | minor | a5 choice 2 ("1/8") → LARGER_DENOMINATOR_LARGER | 1/8 is the result of multiplying the denominators and keeping one numerator, not of thinking bigger bottoms are bigger. | Replace it with "1/16" and add misconception MULTIPLIES_DENOMINATORS (EN "Multiplies the bottom numbers when adding." remediation: "Lay two quarter pieces on the whole circle: do they look like a sixteenth? Count 'one quarter, two quarters'."). Add the matching ID. Map index 2 to it. Do not use "2/4", which would be a second correct answer. |
| 4 | minor | safety.notes[0] | "handles the protractor point": a protractor has no point. A compass does, but it is not in the materials. | EN "The adult does the cutting with scissors; keep small pieces away from children under 4." Add the matching ID. |

## g5-how-seeds-travel — pass

The dispersal biology is correct:
- mahogany samara (spinning wing);
- kapok fluff;
- floating coconut husk;
- hooked *Bidens* (ajeran);
- animal-eaten guava and papaya;
- explosive *pacar air* pods.

The fair-test design and the guided mean (6.0 ÷ 3 = 2.0 s) are right. The castor-seed warning and the no-tasting rule are present.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | a4 | The mean 3.1 s is also the first reading, so a child who just copies one reading (PICKS_LARGEST_VALUE says "or a single reading") is marked correct. | Times EN "2.9 s, 3.4 s and 3.3 s". Choices "3.2 seconds" / "9.6 seconds" / "3.4 seconds". `check: {"expression": "(2.9 + 3.4 + 3.3) / 3", "result": "3.2"}`. Explanation "(2.9 + 3.4 + 3.3) ÷ 3 = 9.6 ÷ 3 = 3.2 s." Make the matching ID change with commas. |
| 2 | minor | safety.notes[2] | "the child from the floor reaching up to the [2 m] mark": a Grade 5 child cannot reach 2 m. | EN "The 2 m drop is done by an adult standing on the floor; the child times. Never stand on a chair." Make the matching ID change. Or lower the drop to 1.5 m throughout. |
| 3 | minor | a3 (rule 11) | Wing length is the exact variable of guidedExamples[2] and practice[1]. | EN "Sari now tests whether the number of paper clips changes the fall time. What must she keep the same?" → "The wing length, the paper and the drop height" / "Nothing; change everything" / "The number of paper clips". Make the matching ID change. Keep the map. |
| 4 | minor | parentInstructions[3], safety.notes[0] | "jarak" covers both castor (*jarak kepyar*) and physic nut (*jarak pagar*), and both are toxic. Bright red *saga* seeds (*Abrus*) are very toxic and appealing. | EN "…castor-oil plant or physic nut (jarak kepyar, jarak pagar), bright red saga seeds, or other unknown seeds…". Make the matching ID change. |

## g5-story-of-writing-systems — fix required

The history is sound as rounded figures: cuneiform about 3200 BCE, hieroglyphs about the same time, Chinese characters for over 3,000 years, and the Kutai Yupa in Pallava and Sanskrit around 400 CE. The BCE/CE rule is applied correctly. Telling the story of writing as a great human achievement is faithful, in original words.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | a2 (rule 11) | practice[2] and childInstructions[2] have the child put cuneiform (3200 BCE) and Yupa (400 CE) on the timeline and "work out the years between them". a2 asks exactly that gap. | EN "A clay tablet is dated 1200 BCE and a stone inscription 800 CE (example dates). How many years are there between them?" Choices "1,999 years" / "2,000 years" / "400 years". `check: {"expression": "1200 + 800 - 1", "result": "1999"}`. Keep the map. ID "Sebuah lempeng tanah liat bertarikh 1200 SM dan sebuah prasasti batu bertarikh 800 M (tanggal contoh). Berapa tahun jarak keduanya?" "1.999 tahun" / "2.000 tahun" / "400 tahun". |
| 2 | minor | a1 | (a) "1,627" does not match APPLIES_BOUNDARY_RULE_WRONGLY: wrongly applying "−1" gives 1,625. (b) 400 CE and "today" are also practice[2] cards. | EN "An inscription is dated 750 CE (an example). How many years before 2026 CE is that?" Choices "1,276 years" / "2,776 years" / "1,275 years". `check: {"expression": "2026 - 750", "result": "1276"}`. Make the matching ID change. |
| 3 | minor | parentInstructions[2] | Scholars call Aksara Jawa an *abugida* (alphasyllabary), and in Javanese the inherent vowel is often said like "o" (ha-na-ca-ra-ka read ho-no-co-ro-ko). Parents may be corrected by the school. | Append EN "Scholars call this kind of script an abugida. In Javanese the built-in vowel is often pronounced like 'o'." ID "Para ahli menyebut jenis aksara ini abugida. Dalam bahasa Jawa, vokal bawaannya sering dilafalkan seperti 'o'." |
| 4 | minor | EN childInstructions[0]; ID "abjad"; parentInstructions[3] | (a) EN says "a slab of clay", but the material is plasticine (the ID is right). (b) In linguistics "abjad" names a consonant-only script such as Jawi, so in the four-way sort "alfabet" avoids confusion. (c) Arabic-based Javanese writing is called Pegon. | (a) EN "…into a slab of plasticine…". (b) In child-facing ID sorting text, use "alfabet (abjad Latin)". (c) Append EN "(Javanese written this way is called Pegon.)" / ID "(bahasa Jawa yang ditulis dengan cara ini disebut Pegon.)" |

## g6-plates-and-the-ring-of-fire — pass (owner note above)

The geology is accurate:
- Indo-Australian, Eurasian, Pacific and Philippine Sea plates;
- subduction at the Sunda (Java) Trench feeding the Sunda-arc volcanoes (Krakatau, Merapi, Bromo, Rinjani, Tambora);
- plate speeds "a few cm a year, like fingernails";
- fertile volcanic soils.

The safety guidance is sound: drop, cover, hold on, and at the coast strong shaking is the warning, so evacuate without waiting. The framing is calm, non-frightening and practical, with an anxiety note and a wheelchair adaptation.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor (recommended before approval) | parentInstructions[1], a4 explanation, WAITS_FOR_OFFICIAL_WARNING remediation | The guidance omits that tsunamis come in several waves, and that people die returning after the first. | Append to parentInstructions[1] EN "Stay on high ground until the authorities say it is safe; more than one wave can come." ID "Tetap di tempat tinggi sampai pihak berwenang menyatakan aman; gelombang bisa datang lebih dari sekali." Optional: the BMKG "20-20-20" rule (shaking 20 seconds or more → within 20 minutes → at least 20 m high), if a reviewer confirms the current wording. |
| 2 | minor | guidedExamples[0] | "slide the thinner sheet under the thicker one" suggests that thinness causes subduction. The ocean plate sinks because it is denser (heavier for its size). | EN "…slide the ocean sheet under the other: 'Ocean plates are heavier for their size, so this one sinks beneath…'" ID "…susupkan lembar samudra ke bawah lembar lain: 'Lempeng samudra lebih berat untuk ukurannya, jadi lempeng ini tenggelam ke bawah…'" |
| 3 | minor | parentInstructions[1], outcomes[2] | The advice is attributed to BMKG and the agencies, and the ID phrase "berlutut, berlindung, berpegangan" is used. Agency materials word this differently (for example "merunduk, berlindung, berpegangan"). The `safety_guidance_check` flag is right. | A reviewer confirms the current BNPB/BMKG wording and uses it verbatim, or softens it to EN "as taught by Indonesian disaster agencies" / ID "sebagaimana diajarkan badan penanggulangan bencana di Indonesia". |
| 4 | minor | parentInstructions[0] | Many maps split the Indo-Australian plate into the Indian and Australian plates, and show Indonesia's western part on the Sunda plate (part of the Eurasian). An atlas may disagree with the card. | Append EN "(Some maps split the Indo-Australian plate in two, or call our part of the Eurasian plate the Sunda plate.)" Add the matching ID. |

## g6-squares-of-numbers — pass

The algebra is correct, the bead-square idea is drawn on squared paper, and the L-shaped "gnomon" growth is faithful. All checks and distractors are right, with new numbers in every item. The ID distinction between "kuadrat" and "persegi" is good adaptation.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | ADDS_ONE_STRIP description (a2 choice "9", a5 choice "183") | One strip of 8 is 8. The "9" (and 169 + 14) is one strip *including* the corner. | EN "Adds only one strip (with or without the corner) when growing a square." Add the matching ID. |
| 2 | minor | parentInstructions[0], preparation[1] | This is optional fidelity: the Montessori bead-bar colours give each square a fixed colour children may meet again later. | Add EN "If you like, use the bead colours: 1 red, 2 green, 3 pink, 4 yellow, 5 light blue, 6 lilac, 7 white (outline only), 8 brown, 9 dark blue, 10 gold." Add the matching ID. |

## k-continents-puzzle-map — pass

The continent count convention is stated (Indonesian books may count five or six). The Montessori colour scheme is correct. The control map serves as the control of error, and a loose bottle cap is noted as a choking risk for siblings.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | minor | parentInstructions[2], a3 explanation | "Indonesia lies between Asia and Australia" matches the Indonesian school phrase (*di antara dua benua*). Most atlases, however, count western Indonesia as part of Asia, and the g1 map says the equator crosses "our" islands. | Append EN "Most world atlases count Indonesia as part of Asia; Indonesian school books say it lies between the continents of Asia and Australia. Both are fine to hear." Add the matching ID. |
| 2 | minor | a2 choice 2 ("Africa") → NAMES_SOUND_ALIKE | Africa and Antarctica only share a first letter, so the map is weak. | Map index 2 to GUESSES_WITHOUT_MAP, or replace it with "Asia" (GUESSES_WITHOUT_MAP). |
| 3 | minor | a1, a3 (rule 11) | Both restate guidedExamples[1] ("a country with many islands, between Asia and Australia"). This is acceptable for oral K recall, but a1 can test transfer. | a1 EN "Ask: 'If you sailed south from Indonesia, which continent would you reach?'" → "Australia" / "Africa" / "Europe". Make the matching ID change. Keep the map. |

## k-parts-of-a-plant — fix required

Root, stem, leaf and flower with their jobs are right for Kindergarten. The coloured-water test is good. The water is thrown away within two days, sap safety is covered and the magnifier note is present.

| # | Severity | Location | Finding | Exact fix |
|---|---|---|---|---|
| 1 | **major** | WATER_ENTERS_FROM_TOP remediation | Sprinkling coloured water on the petals stains them straight away. The demonstration therefore "shows" petals taking in colour from the top and reinforces the misconception it is meant to correct (a2, a3 and a4 all route here). | EN "Stand two white flowers side by side: one with its stem in coloured water, one with its stem in plain water. Next day, the adult cuts both stems across: only the first shows coloured dots inside the stem and coloured petal edges. The colour went in at the bottom and up the stem." ID "Letakkan dua bunga putih berdampingan: satu dengan batang di air berwarna, satu dengan batang di air biasa. Besok, orang dewasa memotong melintang kedua batang: hanya yang pertama menunjukkan titik-titik berwarna di dalam batang dan tepi kelopak berwarna. Warnanya masuk dari bawah dan naik lewat batang." |
| 2 | minor | ID a2 | "Bagian pohon mana yang merupakan batangnya?" answered by "Batang pohon yang besar itu" is a word match in Indonesian, so the ID item does not test the idea. This breaks rule 12 parity. | ID prompt "Di bawah pohon mangga: 'Bagian pohon mana yang sama tugasnya dengan batang pada tumbuhan kecil?'" Choice 0 "Bagian besar berkayu yang tegak menopang pohon". Keep the other choices. |
| 3 | minor | STEM_DRINKS_FROM_SOIL remediation; a4 (rule 11) | (a) The water level also drops by evaporation, so the test needs a control. (b) a4 repeats practice[2] almost word for word. | (a) Append EN "Put a second cup of water with no plant beside it: the cup with the plant drops more." Add the matching ID. (b) a4 EN "Ask: 'The leaves of our chilli plant are drooping. Where should we pour the water?'" Keep the choices and the map. |

## Progression and duplicates

The units form coherent chains:
- K parts of a plant → G2 roots → G5 seed travel (via the G4 flower);
- K continents → G1 Indonesia map → G6 plates;
- G1 animal needs → G2 frog → G4 food chains;
- G3 tile addition → G3 tile subtraction;
- G3 fractions of a whole (maths) → G4 fraction circles;
- G4 area → G6 squares;
- the G5 BCE/CE unit → writing systems;
- age 3–4 rough and smooth → age 4–5 sound cylinders;
- pouring → table washing;
- textured letters → I spy.

All prerequisites exist and point to the same or earlier levels. `units:check` reports no near-duplicates. The under-4 units are developmentally appropriate in length (5–25 minutes) and observation-based, with no screens.

**Pattern for the authors (rule 11).** Recurring minors in the geography, science and K units are assessment items that restate a guided-example or practice sentence. The validator enforces rule 11 only for numbers in maths units. The two majors in history (farming a4, writing a2) come from numbers in `childInstructions` and `practice`, which the validator does not compare. The lead may want to extend the signature check to `practice` and `childInstructions` for every framework.
