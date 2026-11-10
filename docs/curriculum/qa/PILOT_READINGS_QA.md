# Pilot readings QA (batch `expansion-pilot-reading`)

Reviewer: Agent G (independent content QA). Reviewed 2026-11-10. No content files were edited.

Scope: the 30 files under `content/readings/*/reading-*.json` with `provenance.batch: "expansion-pilot-reading"`
(the reference `reading-age2_3-little-cat-bath.json` is a different batch and was not reviewed).
`units:check` on `content/readings` reports no reading errors (all 31 readings parse; the single corpus error is elsewhere).

Checks per file: (1) one defensible answer at index 0, plausible distractors, correct `evidenceParagraph`;
(2) factual accuracy and honest `factChecks`; (3) age and reading-level fit; (4) natural Indonesian whose meaning
matches the English; (5) activity safety; (6) cultural fit for an Indonesian Muslim family and tone.

Severity: **blocker** = must not ship (hard-rule or safety violation); **major** = factual error, internal contradiction
or cultural conflict a reviewer must fix before approval; **minor** = polish, recommended.
Verdict: **pass** = no blocker or major (minors recommended); **fix required** = at least one blocker or major.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| age2_3-bunny-sleepy-time | pass | 0 | 0 | 1 |
| age2_3-little-duck-rain | pass | 0 | 0 | 1 |
| age2_3-teddy-three-blocks | pass | 0 | 0 | 0 |
| age3_4-little-angkot-friends | pass | 0 | 0 | 1 |
| age3_4-moon-says-goodnight | **fix required** | 0 | 1 | 1 |
| age3_4-slow-snail-garden | pass | 0 | 0 | 1 |
| age4_5-dina-grows-a-sunflower | **fix required** | 1 | 0 | 1 |
| age4_5-rani-builds-a-bridge | pass | 0 | 0 | 2 |
| age4_5-robot-rafi-follows-steps | pass | 0 | 0 | 0 |
| k-shapes-on-my-street | pass | 0 | 0 | 3 |
| k-what-the-wind-can-do | pass | 0 | 0 | 2 |
| k-where-is-my-other-shoe | **fix required** | 0 | 1 | 2 |
| g1-ants-work-together | pass | 0 | 0 | 0 |
| g1-fruit-for-the-picnic | pass | 0 | 0 | 0 |
| g1-my-shadow-moves | pass | 0 | 0 | 3 |
| g2-egg-carton-seed-tray | pass | 0 | 0 | 2 |
| g2-from-caterpillar-to-butterfly | **fix required** | 0 | 1 | 0 |
| g2-maya-measures-the-garden | pass | 0 | 0 | 2 |
| g3-bolt-takes-a-wrong-turn | **fix required** | 0 | 1 | 1 |
| g3-living-with-volcanoes | pass | 0 | 0 | 3 |
| g3-the-raindrops-round-trip | pass | 0 | 0 | 3 |
| g4-how-a-lever-helps | pass | 0 | 0 | 1 |
| g4-make-a-rain-gauge | **fix required** | 0 | 1 | 0 |
| g4-marie-curie-two-sciences | pass | 0 | 0 | 4 |
| g5-ayu-and-the-coral-nursery | pass | 0 | 0 | 1 |
| g5-ki-hajar-dewantara-teacher | **fix required** | 0 | 2 | 2 |
| g5-why-the-moon-changes-shape | pass | 0 | 0 | 2 |
| g6-a-nation-of-islands | pass | 0 | 0 | 1 |
| g6-checking-a-claim-morning-walk | pass | 0 | 0 | 0 |
| g6-where-our-electricity-comes-from | pass | 0 | 0 | 2 |

**Totals: 23 pass, 7 fix required. 1 blocker (Dina sunflower), 8 majors.**

---

## age2_3

### reading-age2_3-bunny-sleepy-time — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `vocabulary[2]` (snuggle) | ID word *meringkuk* means "curl up", but the ID meaning says *berpelukan* (hugging); word and gloss disagree. | Change ID meaning to `"meringkuk dekat-dekat supaya hangat dan nyaman"`. |

Questions, safety, tone: fine. Calm bedtime routine suits the family.

### reading-age2_3-little-duck-rain — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text.id[2]`, `readAloudNotes[2].id` | *"Cipratan!"* is a noun and does not work as a shout. | Replace `Cipratan!` with `Byur!` in both places (and in `readAloudNotes[2].id`: `ucapkan 'Byur!' bersama`). |

Safety note for puddles is good.

### reading-age2_3-teddy-three-blocks — pass
No issues. Maths check right; the large-block safety note meets rule 6; the "laugh and rebuild" message is a good model of resilience.

## age3_4

### reading-age3_4-little-angkot-friends — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `questions[q1]` | "4 friends" is a plausible distractor (counting the driver), which is good, but the prompt says "friends" while the text calls the driver "the driver". Defensible as it stands. | Optional: change the prompt to "How many passengers were on the bus…" / "Ada berapa penumpang…", which also reinforces the vocabulary word. |

### reading-age3_4-moon-says-goodnight — FIX REQUIRED
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text` P0–P4, `sequenceCards`, `offlineActivity` | Wrong astronomy for a bedtime story. After full moon the Moon *wanes*, and the waning gibbous and crescent rise late at night or before dawn, so Sari cannot see them "at night" at bedtime, and the "look before bed for a week" activity will not show them. Also, "a few nights later… like a big smile" is wrong: a few nights after full the Moon is still almost round (gibbous), which `sequenceCards[1]` ("a little less than round") contradicts. | Reverse the story to the **waxing** half, which a child really sees in the evening: P0 dark sky, no Moon, stars twinkle; P1 "a thin silver curve, like a fingernail"; P2 "a few nights later, a bigger curve, like a smile"; P3 "half a Moon, like half a cookie"; P4 "night by night it grows rounder until a round bright Moon looks back: 'Hello, Moon!'". Reorder `sequenceCards`, `readAloudNotes` and q1/q2/q3 to match (q1 → "What could Sari see when there was no Moon?"; q3 → "Did the Moon really go away?" with evidence P1). Keep the activity but start it on the evening after a new moon. Good tie-in for this family: the thin first crescent is the *hilal* that begins a new Islamic month (add only as an adult note, as plain fact). |
| 2 | minor | `text.id[0]` | *"seperti balas menatapnya"* is stiff. | `Bulan yang bulat dan terang seolah ikut menatapnya.` (after reordering, this sentence moves to P4). |

### reading-age3_4-slow-snail-garden — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `vocabulary[1].word.id` | *teduh* is an adjective; the gloss is for a noun ("a cool place"). | Change the ID word to `tempat teduh`, and q4 ID prompt to `Apa arti 'tempat teduh'?`. |

Look-don't-touch plus handwashing is right (the giant African land snail common in Indonesia can carry parasites).

## age4_5

### reading-age4_5-dina-grows-a-sunflower — FIX REQUIRED
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | **blocker** | `offlineActivity`, `safetyNotes` | Hard rule 6: ages 2–4 never use dried beans or choking-size items. Level `age4_5` includes 4-year-olds, but the activity offers "a bean seed" and has the child plant the seed. Sunflower seeds are also choking-size. | `offlineActivity.en`: "With your child, fill a cup with soil. **The adult** pushes one large seed (such as a sunflower seed) a finger deep and keeps the packet out of reach; your child covers it with soil, waters it each morning and draws how it changes." Remove "or bean seed". ID: "Bersama anak, isi gelas dengan tanah. **Orang dewasa** menekan satu biji besar (misalnya biji bunga matahari) sedalam satu ruas jari dan menyimpan paket benih di luar jangkauan anak; anak menutup biji dengan tanah, menyiramnya setiap pagi, dan menggambar perubahannya." Add a safety note: "Seeds are a choking hazard: only the adult handles them." / "Biji bisa membuat tersedak: hanya orang dewasa yang memegangnya." Also change `readAloudNotes[0]` so it stays a finger-in-palm mime (it already is). |
| 2 | minor | `text` P3–P4 | A sunflower in a pot by a window growing "taller than Dina" is a stretch; tall varieties need open ground and full sun. | P3: "Dina and Mama plant the shoot outside in the sunny garden." / "Dina dan Mama memindahkan tunasnya ke kebun yang cerah." Adjust `sequenceCards[3]` and q3 (answer "so the plant could get plenty of sunlight", evidence P3). |

### reading-age4_5-rani-builds-a-bridge — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text.id[1]`, `readAloudNotes[1].id` | *"lempeng!"* means "straight/flat" and is not a sound word for "flop". | Replace with `plek!` in both places. |
| 2 | minor | `text.en[1]`/`id[1]` | The first bridge has no supports, but the folded one rests on two books, so the comparison is not a fair test, which goes against the engineering lesson. | P1: "Rani lays one thin sheet of paper across the river, resting on two books." / "…di atas sungai, bertumpu pada dua buku." P3: "She lays the folded paper across the same two books." |

### reading-age4_5-robot-rafi-follows-steps — pass
No issues. Logic of the programme is consistent; q2 needs real inference; the robot game is safe.

## k

### reading-k-shapes-on-my-street — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text` P4 | "It is long and thin" teaches that a rectangle is defined by thinness (a misconception). | EN: "A rectangle has 4 sides. Two sides are long and two are short." ID: "Persegi panjang punya 4 sisi. Dua sisi panjang dan dua sisi pendek." |
| 2 | minor | `questions[q3].evidenceParagraph` | Needs P2 and P3; 2 alone gives only the square. | Set to `3` (triangle) or leave as-is, but note in review that the evidence spans P2–P3. |
| 3 | minor | `safetyNotes` | A "shape walk" on a street has no traffic note. | Add: "On the street, hold hands and stay on the pavement or path, away from traffic." / "Di jalan, bergandengan tangan dan tetap di trotoar atau pinggir jalan, jauh dari kendaraan." |

### reading-k-what-the-wind-can-do — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text.id[4]` | *"Angin memutar kincir kertas berputar-putar"* is redundant. | `Angin membuat kitiran kertas berputar-putar.` (and vocabulary word `kitiran` or keep `kincir kertas`). |
| 2 | minor | `safetyNotes` | A stick in a 5-year-old's hand has no note. | Add: "Use a short, blunt stick and hold it low, away from faces." / "Pakai tongkat pendek yang tumpul dan pegang rendah, jauh dari wajah." |

### reading-k-where-is-my-other-shoe — FIX REQUIRED
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text` P4–P5, `questions[q3]` | Cultural fit. A pet puppy running indoors with the child's shoe in its mouth goes against the norm for many Indonesian Muslim families, who do not keep dogs indoors and treat dog saliva as *najis* in the majority Shafi'i school. A kitten does the same job and is a much-loved animal in Muslim homes. | P4: "Then Bima hears a sound. Meow! Kitten runs in, pushing something with her paws." / "Lalu Bima mendengar suara. Meong! Anak kucing berlari masuk sambil mendorong sesuatu dengan kakinya." P5: "'Silly Kitten!' laughs Bima." / "'Dasar Anak Kucing iseng!' Bima tertawa." q3: "the kitten, to play with it" / "anak kucing, untuk bermain", and change the distractor "the toy cat" to "the toy bear" (and in P1 "a toy cat" → "a toy bear" / "boneka beruang"). |
| 2 | minor | `text.id[5]` | *"nakal"* (naughty) is harsher than "silly" and models labelling. | Use `iseng` (playful), as above. |
| 3 | minor | `text` P3 | "Mum's big boots" are uncommon in Indonesian homes. | `Bima sees Dad's big sandals.` / `Bima melihat sandal Ayah yang besar.`, and replace the `boots` vocabulary item with `sandals` / `sandal` ("open shoes held on by straps" / "alas kaki terbuka dengan tali"). |

## g1

### reading-g1-ants-work-together — pass
No issues. Facts accurate and listed; q3 evidence correct; the observation activity is safe with the sting note.

### reading-g1-fruit-for-the-picnic — pass
No issues. The "3 bananas" distractor (forgetting yourself) is a good misconception; the guava cutting is Dad's.

### reading-g1-my-shadow-moves — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `questions[q4]` | The prompt lists the order, so it gives the answer away. | EN prompt: "Which shadow did Arif see second in the day?" ID: "Bayangan mana yang dilihat Arif kedua kalinya dalam sehari?" (choices unchanged). |
| 2 | minor | `text` P1 | "short and fat" / "pendek dan gemuk" is a body word; better avoided for children. | EN "short and small"; ID "pendek dan kecil". Update q1 choice EN/ID to match if needed. |
| 3 | minor | `safetyNotes` | The noon tracing in tropical sun has no heat note. | Add: "At midday, wear a hat, drink water and keep the tracing quick." / "Saat tengah hari, pakai topi, minum air, dan menggambarnya cepat saja." |

## g2

### reading-g2-egg-carton-seed-tray — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `questions[q4].prompt.id` | *"ke setiap 6 wadah"* is ungrammatical. | `Kamu memasukkan 2 biji ke masing-masing dari 6 wadah. Berapa biji yang kamu pakai?` |
| 2 | minor | `safetyNotes` | Chilli seeds can irritate eyes. | Append: "Do not rub your eyes after touching chilli seeds." / "Jangan mengucek mata setelah memegang biji cabai." |

### reading-g2-from-caterpillar-to-butterfly — FIX REQUIRED
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text` P3, `vocabulary[2]` | Science error: a caterpillar does not "make a hard case around itself" (that describes a moth spinning a silk cocoon). A butterfly chrysalis is the caterpillar's own last skin, which hardens after the final moult. This is a well-known misconception. | EN P3: "Third, the caterpillar hangs very still and sheds its skin one last time. Underneath is a hard case called a chrysalis. Inside, its body is changing." ID: "Ketiga, ulat menggantung diam dan berganti kulit untuk terakhir kalinya. Di bawah kulit itu ada pembungkus keras yang disebut kepompong. Di dalamnya, tubuhnya sedang berubah." Vocabulary meaning: "the hard case a caterpillar's body forms when it changes into a butterfly" / "pembungkus keras yang terbentuk dari tubuh ulat saat berubah menjadi kupu-kupu". Add factCheck: "A butterfly chrysalis forms from the caterpillar's final skin; moths spin silk cocoons" (common_knowledge). |

### reading-g2-maya-measures-the-garden — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text` P2, q3 | Realism: a 2 m bed in 7 foot-lengths means Doni's foot is about 29 cm long, which is an adult size. | Make Doni 8 feet (25 cm): P2 "only 8 of my feet" / "cuma 8 telapak kakiku"; q3 check `10 - 8` = `2`, choices `["2 more", "18 more", "8 more"]` / `["2 lebih banyak", "18 lebih banyak", "8 lebih banyak"]`; q1 distractor "7 feet" → "8 feet". |
| 2 | minor | `text` P0 | A fence *round* the bed needs every side, not only the length. | P0: "…a fence along one side of the vegetable bed" / "…pagar di satu sisi bedeng sayur". |

## g3

### reading-g3-bolt-takes-a-wrong-turn — FIX REQUIRED
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text` P5 | Internal logic error at the key debugging moment. The programme ends after the third side and third turn, so walking it would stop at the **start** of the fourth side, not "halfway round" it. A child tracing the route will be confused. | EN: "At the corner before the fourth side, Gilang had to stop walking, because the program had run out." ID: "Di sudut sebelum sisi keempat, Gilang harus berhenti berjalan karena programnya sudah habis." |
| 2 | minor | `questions[q2]` | The answer is nearly a word-for-word restatement of P4 ("It did exactly what we told it"), so it is not an inference (rule 8). | Change the kind to `literal`, or reword the prompt: "What did Putri think about robots that made her check the program instead?" |

### reading-g3-living-with-volcanoes — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text` P2, factCheck 3 | Merapi lies on the border of Central Java and the Special Region of Yogyakarta, not simply "in Central Java". | EN "Mount Merapi, on the border of Central Java and Yogyakarta,"; ID "Gunung Merapi di perbatasan Jawa Tengah dan DI Yogyakarta"; update the factCheck claim. |
| 2 | minor | `text.id[5]` | *"status siaga"* names one specific level (level III), but the English says "an alert level". | `…petugas mengumumkan status gunung api (Waspada, Siaga, atau Awas)…` |
| 3 | minor | `text.en[4]` vs `vocabulary[3]` | The vocabulary word "fertile" does not appear in the English text. | P4: "…breaks down into rich, fertile soil…". |

Tone is balanced: it shows danger without fear, and the warnings are framed as protective.

### reading-g3-the-raindrops-round-trip — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text.id[2]`, `vocabulary[2].word.id` | *talang* is a gutter, not the eaves. | Text: `dan menetes dari cucuran atap`; vocabulary word `cucuran atap`. (Rhyme in ID is loose anyway.) |
| 2 | minor | `text.id[4]` | Filler words *"lalu naik dulu"* and *"berkeliling lagi di jalan"* read as mechanical. | Line 2: `ingat perjalanannya: naik, turun, lalu berkeliling selalu.` Line 4: `dan suatu hari ia akan berkelana lagi tanpa bosan.` |
| 3 | minor | `text.en[0]` | Vapour is invisible because it is a gas, not because it is "too light". | Poetic licence acceptable; optionally "I rose up as vapour, a gas none could see". |

## g4

### reading-g4-how-a-lever-helps — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `questions[q3]` | Arithmetic is right, but 3 m from the middle implies a 6 m seesaw, which is unrealistic. | Use 1.5 m: prompt "…sits 1.5 m from the middle…"; check `20 * 1.5 / 30` = `1`; choices `["1 m", "1.5 m", "2.25 m"]` (ID `1 m`, `1,5 m`, `2,25 m`). |

### reading-g4-make-a-rain-gauge — FIX REQUIRED
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text` P3/P6, `safetyNotes` | Health risk in Indonesia. The method leaves a permanent pool of water over the stones, outdoors, for at least a week: an *Aedes* (dengue) mosquito breeding site, against the national 3M Plus guidance. | P6 EN: "…Write the height of water above the 0 line. Then empty the bottle completely, rinse it, and refill it with fresh water just to the 0 line." ID: "…Catat tinggi air di atas garis 0. Lalu kosongkan botol sepenuhnya, bilas, dan isi lagi dengan air bersih tepat sampai garis 0." Add a safety note: "Standing water lets mosquitoes breed. Keep the funnel in place, change the water every day, check for wrigglers, and empty and dry the gauge when you finish." / "Air yang menggenang bisa menjadi sarang nyamuk. Pasang corongnya, ganti air setiap hari, periksa jentik, dan kosongkan serta keringkan penakar setelah selesai." Update q5 choice 0 to "empty it and refill fresh water to the 0 line". |

Other checks: the funnel and straight-side reasoning is correct; the lightning note is good.

### reading-g4-marie-curie-two-sciences — pass
Fact check of every dated claim: born Maria Skłodowska, Warsaw, 1867 (correct); women barred from university in Warsaw (correct); studied physics and maths in Paris, the Sorbonne (correct); met Pierre Curie in Paris (correct, 1894); the Curies coined "radioactivity" (correct); polonium named after Poland, plus radium (correct, 1898); 1903 Physics Nobel shared with Pierre and Becquerel, first woman laureate (correct); 1911 Chemistry Nobel, first person with Nobels in two sciences (correct; still the only person in two *sciences*); died 1934 (correct). "Top of her class": she ranked first in the physics licence (1893) and second in mathematics (1894), so the claim is true for physics; `needs_source` is honest. q3 maths (8 years) is right.
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `offlineActivity` | Asks for "at least five events" with years, but the text dates only four (1867, 1903, 1911, 1934). | Add years to the text: P1 "In 1891 Maria…" / "Pada tahun 1891…"; P3 "In 1898 the Curies announced…" / "Pada tahun 1898…". Add both to `factChecks` (common_knowledge). |
| 2 | minor | `text` P0 | In 1867 Warsaw was under Russian rule; Poland was not an independent state. This also deepens the q2 inference. | EN: "…in Warsaw, Poland, which was then ruled by Russia, in 1867." ID: "…di Warsawa, Polandia, yang saat itu dikuasai Rusia, pada tahun 1867." |
| 3 | minor | `text.id[3]` | *"keluarga Curie"* suggests the whole family. | `pasangan Curie`. |
| 4 | minor | `text` P5 | "nobody understood how harmful" overstates it: burns were known, the long-term harm was not. | "nobody fully understood…" / "belum ada yang benar-benar memahami…". |

## g5

### reading-g5-ayu-and-the-coral-nursery — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text` P4 vs P5 and `safetyNotes` | Ayu handles coral pieces, while the text and safety note say never touch coral. Also, loose coral fragments sink; they do not "drift". | P4 EN: "Ayu spotted three loose pieces lying on the sand and pointed them out to Aunt Wati, who tied them back on." ID: "Ayu melihat tiga potongan lepas tergeletak di pasir dan menunjukkannya kepada Bibi Wati, yang lalu mengikatnya kembali." |

Facts on polyps, bleaching, algae and slow growth are correct and honestly listed. The snorkel safety note is good.

### reading-g5-ki-hajar-dewantara-teacher — FIX REQUIRED
Fact check: born 2 May 1889 in Yogyakarta as Raden Mas Soewardi Soerjaningrat (correct); Hardiknas on 2 May (correct); journalist, Dutch-language article *Als ik een Nederlander was* (1913), exiled to the Netherlands (correct; technically banished, and he chose the Netherlands); founded Taman Siswa, Yogyakarta, 1922 (correct; 3 July); dropped his noble title to be closer to the people (correct; the date of the name change is given variously as 1922 or 1928, and "later" is safe); first Minister of Education, *Menteri Pengajaran* 1945 (correct); *Tut Wuri Handayani* on the education ministry logo (correct as a long-standing fact; the ministry's name has changed, so "the education ministry" wording is right). "Studied education in exile": he earned a Dutch teaching certificate (*Europeesche Akte*), so this is true; `needs_source` is honest. q2 (33 years) is right.
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text` P2 | The famous article is misrepresented. *Als ik een Nederlander was* ("If I Were a Dutchman", 1913) said that, if he were Dutch, he would be ashamed to celebrate the Netherlands' own freedom inside a colony whose people had been robbed of theirs, and worse, to ask those people to help pay for the party. The text's "how Dutch people would feel if they were made to celebrate their own freedom on land taken from someone else" garbles this. | EN: "One famous article, written in Dutch in 1913, was called 'If I Were a Dutchman'. It said that if he were Dutch, he would be ashamed to celebrate his own country's freedom in a land whose people had lost theirs, and even to ask those people to help pay for the celebration." ID: "Salah satu artikelnya yang terkenal, ditulis dalam bahasa Belanda pada tahun 1913, berjudul 'Seandainya Aku Seorang Belanda'. Isinya: jika ia orang Belanda, ia akan malu merayakan kemerdekaan negerinya di tanah yang rakyatnya dijajah, apalagi meminta rakyat itu ikut membiayai perayaannya." |
| 2 | major | `text` P1 (EN and ID) | Meaning is inverted. "few Indonesian children could go to school, especially children from ordinary families" (ID *terutama anak dari keluarga biasa*) reads as though ordinary families' children were the ones who *could* go. | EN: "…few Indonesian children could go to school, and children from ordinary families had almost no chance." ID: "…hanya sedikit anak Indonesia yang bisa bersekolah, apalagi anak dari keluarga biasa." |
| 3 | minor | `text.id[3]`, q5 ID choice 0 | *"manusia merdeka dan berpikir"* is awkward. | `manusia yang merdeka dan mampu berpikir sendiri` (in both places). |
| 4 | minor | `factChecks` | Add the year of the article once it is in the text. | `{ claim: "Als ik een Nederlander was was published in 1913.", status: "common_knowledge" }`. |

### reading-g5-why-the-moon-changes-shape — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `questions[q3]` | "about how long" with an exact 14.75 is odd. | Keep check `29.5 / 2` = `14.75` but reword the prompt to "…exactly half of 29.5 days. How many days is that?", or keep as is. |
| 2 | minor | `text` P1 | A mirror-ball reflects in sharp spots; the Moon reflects diffusely. | "Like a ball lit by a torch in a dark room…" / "Seperti bola yang disorot senter di ruangan gelap…". |

The Hijri-calendar cultural link is apt for the family.

## g6

### reading-g6-a-nation-of-islands — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `offlineActivity` | Asks for a "five-line stanza in the same style", but the poem's stanzas have four lines. | "Write a four-line stanza…" / "Tulis bait empat baris…". |

"More than seventeen thousand" islands is acceptable, and the factCheck honestly notes that counts vary (recent official counts are about 17,000).

### reading-g6-checking-a-claim-morning-walk — pass
No issues. The invented example is clearly labelled in the text and in `factChecks` (`invented_example`); the 75% check validates; the questions model good critical reading; the tone is not cynical ("never trust anything online" is correctly a distractor).

### reading-g6-where-our-electricity-comes-from — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text` P2 | Many gas plants use gas turbines driven directly by hot combustion gas, not boiled water. | "In coal power stations, and in some gas power stations, fuel is burned to boil water." / "Di pembangkit listrik batu bara, dan sebagian pembangkit gas, …". |
| 2 | minor | `text` P1 | In large generators the magnets usually spin inside fixed coils. | "Inside it, magnets and coils of wire turn past each other…" / "Di dalamnya, magnet dan gulungan kawat berputar relatif satu sama lain…". |

---

## Cross-cutting notes
- No Islamic content or Arabic phrases in this batch, so no scholar review is needed. Nothing conflicts with the family's values apart from the puppy (k-where-is-my-other-shoe).
- Tone is warm throughout: no streaks, timers, shaming or comparisons. Mistakes are framed as part of learning (Teddy, Rani, Rafi, Bolt).
- Indonesian is generally natural and well adapted (angkot, kemangi, jambu biji, sawah, gembor). The weak spots are the sound words (`Cipratan`, `lempeng`) and the poetry fillers.
- All `factChecks` are honest; the two `needs_source` items (Curie class rank, Dewantara studying education) are actually true and could be upgraded by a human reviewer with a source.
