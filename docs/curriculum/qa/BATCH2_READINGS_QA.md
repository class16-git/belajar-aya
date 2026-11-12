# Batch 2 readings QA (batch `expansion-batch2-reading`)

Reviewer: independent content QA agent (not the author). Reviewed 2026-11-12. No content files were edited.

Scope: the 30 files under `content/readings/*/reading-*.json` with `provenance.batch: "expansion-batch2-reading"`
(3 per level, age2_3 to g6). `pnpm --filter @atlas/curriculum units:check -- content/readings` reports
"155 units and 71 readings parsed; 0 errors in total", so every file parses, every maths `check` evaluates, and
no near-duplicate was reported.

Checks per file: (1) one defensible answer at index 0, plausible distractors, correct `evidenceParagraph`
(0-based); (2) factual accuracy and honest `factChecks`; (3) maths and `check` expressions; (4) age and
reading-level fit; (5) natural Indonesian whose meaning matches the English; (6) activity safety (rules 6, 15);
(7) fit for an Indonesian Muslim family (rules 15–16) and tone (rule 9); (8) originality.

Severity: **blocker** = must not ship (hard-rule or safety violation); **major** = factual error, internal
contradiction, a question with two defensible answers, or unclear safety guidance; a reviewer must fix it before
approval; **minor** = polish, recommended.
Verdict: **pass** = no blocker or major (minors recommended); **fix required** = at least one blocker or major.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| age2_3-cicak-on-the-wall | **fix required** | 0 | 1 | 0 |
| age2_3-hello-sun-goodnight-sun | pass | 0 | 0 | 1 |
| age2_3-toys-go-home | pass | 0 | 0 | 0 |
| age3_4-brush-little-teeth | pass | 0 | 0 | 1 |
| age3_4-cloud-shapes | pass | 0 | 0 | 1 |
| age3_4-rooster-wakes-the-village | pass | 0 | 0 | 3 |
| age4_5-lala-sorts-the-rubbish | pass | 0 | 0 | 0 |
| age4_5-tono-crosses-the-road | pass | 0 | 0 | 1 |
| age4_5-where-do-the-stars-go | pass | 0 | 0 | 1 |
| k-five-senses-at-the-pasar | pass | 0 | 0 | 1 |
| k-the-tower-that-kept-falling | pass | 0 | 0 | 0 |
| k-who-lives-in-the-mango-tree | pass | 0 | 0 | 1 |
| g1-benis-wobbly-tooth | pass | 0 | 0 | 0 |
| g1-how-many-legs | pass | 0 | 0 | 0 |
| g1-the-night-the-lights-went-out | pass | 0 | 0 | 1 |
| g2-fold-a-paper-boat | **fix required** | 0 | 1 | 1 |
| g2-sintas-savings-jar | pass | 0 | 0 | 0 |
| g2-the-orangutan-builds-a-bed | pass | 0 | 0 | 1 |
| g3-night-market-poem | pass | 0 | 0 | 2 |
| g3-wash-your-hands-properly | pass | 0 | 0 | 1 |
| g3-why-day-and-night | pass | 0 | 0 | 0 |
| g4-kartini-letters-for-girls | pass | 0 | 0 | 1 |
| g4-komodo-dragon-report | pass | 0 | 0 | 1 |
| g4-why-heavy-ships-float | pass | 0 | 0 | 2 |
| g5-can-a-clay-pot-keep-water-cool | pass | 0 | 0 | 2 |
| g5-the-mangrove-speaks | pass | 0 | 0 | 2 |
| g5-when-the-ground-shakes | **fix required** | 0 | 1 | 2 |
| g6-draw-a-scale-plan | pass | 0 | 0 | 1 |
| g6-habibie-the-aircraft-builder | pass | 0 | 0 | 1 |
| g6-wet-and-dry-seasons | pass | 0 | 0 | 1 |

**Totals: 27 pass, 3 fix required. 0 blockers, 3 majors, 29 minors.**

Overall: a clear improvement on the pilot. All maths is correct (every `check` re-derived by hand), distractors
mostly map to real misconceptions, and the safety notes are consistent with rules 6 and 15: shallow water emptied
afterwards, adult-only slicing, no small parts for under-5s, nothing left standing overnight. The historical
biographies (Kartini, Habibie) are accurate on every date checked. No religious-calendar or ritual claims appear
in general content, and no animal carries objects in its mouth indoors.

---

## age2_3

### reading-age2_3-cicak-on-the-wall — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text[4]`, `q3`, `readAloudNotes[4]` | Science accuracy (rule 14). House geckos are **nocturnal**: they are active at night around lamps, catching insects, and rest by day. The page "Sleepy cicak hides behind the picture frame. Night, night, cicak." and q3's answer "because the cicak was going to rest" teach that the cicak goes to sleep at night. This also contradicts the file's own offline activity, which sends the child to watch cicak moving near a lamp at dusk. | EN `text[4]`: `"Cicak catches a little bug. Yum! Now it is our bedtime. Night, night, cicak!"`; ID: `"Cicak menangkap serangga kecil. Nyam! Sekarang waktunya kita tidur. Selamat malam, cicak!"`. Rewrite q3 as: EN `"Why did we say 'night, night' at the end?"` with choices `["because it was our bedtime", "because the cicak was cross", "because the lamp was noisy"]`; ID `["karena sudah waktunya kita tidur", "karena cicak sedang marah", "karena lampunya berisik"]`. Replace `q2` (behind the frame) with: EN `"What did the cicak catch at the end?"` / `["a little bug", "a ball", "a fish"]`; ID `"Apa yang ditangkap cicak di akhir cerita?"` / `["serangga kecil", "bola", "ikan"]`, evidence 4. Change `sequenceCards[3]` to "the cicak by the lamp with a small bug", and `readAloudNotes[4]` to "Make a quick 'snap' with your fingers for catching the bug, then whisper goodnight." Add factCheck `"House geckos are active at night and often hunt insects near lamps."` (`common_knowledge`). |

Otherwise good: finger-walking actions, "look, do not catch" and the hand-washing note are right for the age.

### reading-age2_3-hello-sun-goodnight-sun — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `sequenceCards[3]` | EN "a sleeping house" vs ID *rumah yang sepi* ("a quiet/lonely house"). | ID: `"Kartu 4: langit gelap di atas rumah yang sudah tidur"` or `"...rumah yang lampunya sudah padam"`. |

Never-look-at-the-sun warnings are in both the activity and the safety notes; no screens.

### reading-age2_3-toys-go-home — pass
No issues. Large toys only, a low and steady shelf; q3 is a real inference (finding things again is not stated).

## age3_4

### reading-age3_4-brush-little-teeth — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `vocabulary[1].word.id` | *membuang ludah* ("to discard spit") is stiff and does not match the story's *Buang busanya*. | Use `"meludah"` with meaning `"mengeluarkan busa atau air dari mulut"`. |

The pea-sized amount for ages 3–6, "spit, don't swallow" and an adult dispensing the toothpaste all match standard paediatric dental advice.

### reading-age3_4-cloud-shapes — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[0]`, `offlineActivity` | The story places a toddler lying under a mango tree. In fruiting season, falling mangoes and weaver ants (see the K mango-tree reading) are a real hazard. The activity text itself only says "in the shade". | Add to `safetyNotes`: EN `"Choose shade away from fruit trees in fruiting season and from ant trails."` / ID `"Pilih tempat teduh yang jauh dari pohon yang sedang berbuah dan dari jalur semut."` |

The thunder and sun warnings are good. q2 is close to literal but acceptable for the age.

### reading-age3_4-rooster-wakes-the-village — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[5]` | "a bowl of water for the duck" as its *breakfast* models poor animal care, since ducks need food. | EN `"...and rice bran for the duck"`; ID `"...dan dedak untuk bebek"`. Also update `readAloudNotes[5]` if needed. |
| 2 | minor | `text[0]` | EN "stretched his wings" vs ID *mengepakkan sayapnya* ("flapped"). | ID: `"merentangkan sayapnya"`, or EN: `"flapped his wings"`. |
| 3 | minor | `offlineActivity` | "four toy ... animals" for ages 3–4: small farm figurines can be choking-size (rule 6). | EN `"four large toy animals (bigger than your child's fist) or drawn animals"`; ID `"empat mainan hewan yang besar (lebih besar dari kepalan anak) atau gambar hewan"`. |

The cumulative structure is good and q3 is a genuine inference.

## age4_5

### reading-age4_5-lala-sorts-the-rubbish — pass
No issues. Clean, dry items only; the adult handles food waste; bank sampah is accurately described.

### reading-age4_5-tono-crosses-the-road — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[2]`, `readAloudNotes[2]` | "Look one way. Look the other way." Indonesia drives on the left, and children are taught *lihat kanan, kiri, kanan lagi*. The generic phrasing misses a free chance to teach the local rule. | EN `"Look right. Look left. Look right again. Listen!"`; ID `"Lihat kanan. Lihat kiri. Lihat kanan lagi. Dengarkan!"`; adjust readAloudNotes accordingly. |

The hand-holding, never-alone and quiet-path practice notes are good. In q1 "first at the road" could arguably be "held hands", but that is not among the choices, so the item has one defensible answer.

### reading-age4_5-where-do-the-stars-go — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `readAloudNotes[2]` | EN "a 'city' voice" vs ID *suara ceria* ("cheerful voice"); not parallel. | EN: `"Use a bright, excited voice for Nisa..."` to match ID. |

The science is correct: the sun is the nearest star, daylight hides the stars, light pollution is real. The torch analogy is apt.

## k

### reading-k-five-senses-at-the-pasar — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `q4` | The prompt has the child imagine walking a busy pasar **with eyes closed** next to motorbikes. Good transfer, but it models an unsafe idea for a 5-year-old. | EN `"If a motorbike came up behind you at the pasar, how could you tell it was coming without seeing it?"`; ID `"Jika ada motor datang dari belakangmu di pasar, bagaimana kamu tahu tanpa melihatnya?"` |

Allergy and hot-tea notes are good.

### reading-k-the-tower-that-kept-falling — pass
No issues. 4 + 3 + 2 + 1 = 10 is correct, and the distractors (4 = bottom row only, 1 = top) are real misconceptions. The growth-mindset tone is calm. It is distinct from the pilot `age2_3-teddy-three-blocks`: a different age and a different objective (a stable base).

### reading-k-who-lives-in-the-mango-tree — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `safetyNotes[0]` | "Weaver ants bite and sting". Weaver ants (*Oecophylla*) have no working sting: they bite and spray formic acid into the bite. The text's "their bite stings" is fine as a figure of speech. | EN `"Weaver ants bite hard and the bite smarts: look from a distance..."`; ID `"Gigitan semut rangrang perih: lihat dari jauh..."` |

The four kinds of animal (bird, caterpillar, weaver ant, fruit bat) are counted correctly; the "do not climb" note is good.

## g1

### reading-g1-benis-wobbly-tooth — pass
No issues. Accurate: baby teeth are replaced, adult teeth are not. The advice not to pull a tooth hard, the gauze note and adult slicing are all appropriate. The worry-to-reassurance arc suits the age.

### reading-g1-how-many-legs — pass
No issues. All leg counts are correct, the spider-is-not-an-insect contrast is clear, and 4 + 4 and 2 + 4 are right with sensible distractors. "Look, do not touch" is given for spiders and ants.

### reading-g1-the-night-the-lights-went-out — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[5].id` | *Sari hampir merasa sayang* is unidiomatic for "almost sorry (that it ended)"; q4 repeats it. | ID `text[5]`: `"...Lampu menyala lagi. Sari malah sedikit kecewa."`; q4 ID prompt: `"Mengapa Sari sedikit kecewa saat lampu menyala lagi?"` |

The text and q2 correctly say the eyes adjust but do not see in total darkness (pilot lesson 14 applied). Recommending a torch over a candle is good.

## g2

### reading-g2-fold-a-paper-boat — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `q1` | Two defensible answers in EN, and EN and ID do not match. The procedure produces **two** diamonds (Step 4 after the hat, Step 6 after the triangle). The EN prompt "just before the boat's diamond shape" fits either, so "a triangle" (choice 1) is also defensible. The ID prompt says *belah ketupat pertama* (first diamond), so only ID is unambiguous. | EN prompt: `"What have you made just before you get the first diamond shape?"`. Keep the choices; evidence stays 3. |
| 2 | minor | originality | `content/library/passages/passage-g2-paper-boat.json` is a g2 narrative about the same object, with the same "paper goes soft" idea and a crayon-waterproofing fix that echoes this file's discussion prompt 2. Different genre, so not a duplicate, but the two will feel repetitive at the same level. | Cross-link the two, or change discussion prompt 2 to a different idea, e.g. `"Which step would you draw as a picture to help a younger child?"` |

The folding sequence is correct (half, corners, hat, diamond, triangle, diamond, pull open). 7 − 4 = 3 is right. The water is a few centimetres deep and the basin is emptied afterwards.

### reading-g2-sintas-savings-jar — pass
No issues. Rp5,000 + 5 × Rp3,000 = Rp20,000 exactly; both checks are correct; distractor 4 Saturdays is a real off-by-one error. Prices are honestly labelled invented. Delayed gratification is shown without shaming.

### reading-g2-the-orangutan-builds-a-bed — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `crossCurricular[0].en` | "the Indonesian and Malaysian islands of Borneo and Sumatra" implies Sumatra is partly Malaysian. Borneo is shared (Indonesia, Malaysia, Brunei); Sumatra is wholly Indonesian. | `"Orangutans live wild only on Sumatra and Borneo (Kalimantan, Sabah and Sarawak)."` |

All facts are right: a great ape (*kera besar*, not a monkey), the "person of the forest" etymology, a new nest each evening, leaf umbrellas, years with the mother, threatened by forest loss.

## g3

### reading-g3-night-market-poem — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[1].id` | EN "chocolate inside" vs ID *cokelatnya bertebar* ("chocolate scattered"). q1 asks what is *inside*. | ID line 2: `"manis dan tebal, cokelat di dalamnya terhampar"`, or another rhyme meaning "inside". |
| 2 | minor | `q3.prompt.id` | Calls *desis gorengan* a *kata* (it is a phrase), and the vocabulary item is *berdesis*. | `"Frasa 'desis gorengan' membuatmu membayangkan apa?"` |

The rhyme question (glow/row) has one answer, the simile question is clean, and the Indonesian adaptation reads as poetry, not translation.

### reading-g3-wash-your-hands-properly — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[6]` | The 20-second timer uses "Selamat Ulang Tahun" twice. Accurate, but some families in the target audience avoid birthday customs. A neutral timer works for everyone (rule 16 spirit). | EN `"...for about 20 seconds: count slowly from 1 to 20."`; ID `"...kira-kira 20 detik: hitung pelan-pelan dari 1 sampai 20."` |

The steps match WHO/Kemenkes handwashing guidance, and soap is correctly described as loosening oil and dirt rather than killing every germ. 6 × 20 = 120 is correct.

### reading-g3-why-day-and-night — pass
No issues. Checked: noon in Jakarta (05:00 UTC) is about midnight in Colombia; Jakarta's antipode is in northern South America; the sun rises in Papua first; the turning direction in the activity is right; 18 − 6 = 12.

## g4

### reading-g4-kartini-letters-for-girls — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[5]` | The 1911 book was published in Dutch (*Door Duisternis tot Licht*, compiled by J. H. Abendanon); *Habis Gelap Terbitlah Terang* is the later Malay/Indonesian translation. As written, a reader may think the 1911 book itself had the Indonesian title. | EN: `"In 1911 her letters were collected and published in Dutch. The Indonesian translation is known as 'Habis Gelap Terbitlah Terang'..."`; ID: `"Pada tahun 1911 surat-suratnya dikumpulkan dan diterbitkan dalam bahasa Belanda. Terjemahannya dalam bahasa Indonesia dikenal sebagai..."` Update factCheck 6 to match. |

Verified: born 21 April 1879 in Jepara; Dutch-language primary school until about 12 (pingitan); letters to Dutch friends; a girls' school opened with her sisters (1903); married the Bupati of Rembang in November 1903; died September 1904, aged 25, days after her son's birth; Kartini schools (from 1912); National Hero; Hari Kartini. The q2 order (school before marriage, then 1911) is correct. 1911 − 1904 = 7, with distractors 32 (1911 − 1879) and 25 (her age). Good.

### reading-g4-komodo-dragon-report — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[2]` | "about 3 metres long, which is longer than a family car is wide" is a weak, confusing comparison: any long object is longer than a car is wide. | EN `"...about 3 metres long, about the length of two adults lying head to toe."`; ID `"...sekitar 3 meter, kira-kira sepanjang dua orang dewasa yang berbaring berurutan."` |

Facts are correct: the largest living lizard; Komodo, Rinca and Flores; tongue-flicking smell; hunting and carrion; hatchlings roughly 40 cm that live in trees to escape cannibalistic adults; rangers. The `needs_source` on the hatchling claim is honest (it is in fact well documented). 300 / 40 = 7.5.

### reading-g4-why-heavy-ships-float — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[6]` | "...the wooden pinisi ... all float because of their shape". Wooden boats float largely because wood is less dense than water; shape is what lets them carry a load. That sentence over-generalises the steel-ship argument (rule 14). | EN `"...Ferries, fishing boats and the wooden pinisi of South Sulawesi all rely on a hull shape that pushes aside enough water to carry their load."`; ID `"...semuanya mengandalkan bentuk lambung yang mendorong cukup banyak air untuk membawa muatannya."` |
| 2 | minor | `text[3]` | "So the ship sits low in the water" reads as if sitting low causes floating. | `"So even though the ship is heavy, it pushes aside a very large amount of water..."` (ID likewise). |

The physics is otherwise correct (Archimedes, load line), q4's 180 cm³ → 180 g is right, and the paper-clip warning for younger siblings is good.

## g5

### reading-g5-can-a-clay-pot-keep-water-cool — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[6]` | The conclusion says the pot keeps water "a few degrees cooler than **the air**", but the invented test never measured the air; it compared with a glass jar. An evidence-skills article should not over-claim its own evidence. | EN `"...can keep water a few degrees cooler than water in a sealed glass jar, especially in dry, breezy weather."`; ID `"...beberapa derajat lebih sejuk daripada air di stoples kaca, terutama..."` (or add an air reading of 29 °C in `text[3]`). |
| 2 | minor | `q5` | Tagged `inference`, but "dry, breezy" is stated word for word in `text[6]` (rule 8). | Either change `kind` to `literal` and `evidenceParagraph` to 6, or remove "especially in dry, breezy weather" from `text[6]` so q5 must be inferred from `text[1]` and `text[5]`. |

The invented example is clearly labelled in the text and in `factChecks`. The fair-test question, the limits question and the 29 − 24 = 5 check are good; the warnings against mercury thermometers and overnight water (dengue) are good.

### reading-g5-the-mangrove-speaks — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `q5.prompt.id` | Asks what *pasang* means, but the answer "the sea rising **and falling**" is *pasang surut*; *pasang* alone is high or rising tide. | `"Pada bait 1, apa yang dimaksud dengan 'pasang' dan 'surut'?"` |
| 2 | minor | `text[0]`, factCheck 2 | "Twice a day" is the common pattern worldwide, but many Indonesian coasts (e.g. parts of the Java Sea) have one tide a day or a mixed pattern. Poetic licence is acceptable; the factCheck "Most coasts..." is slightly over-stated for Indonesia. | factCheck: `"Many coasts have two high and two low tides a day; some Indonesian coasts have one or a mixed pattern."` |

Science content is correct: wave damping, nursery habitat, sediment trapping, carbon storage, and Indonesia among the largest mangrove areas.

### reading-g5-when-the-ground-shakes — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | `text[4]` | Safety-critical ordering. "If you are near the coast and the shaking is strong or lasts a long time ... go to high ground ... at once" can be read as "run during the shaking". Official advice (BNPB/BMKG, NOAA) is: protect yourself (Drop, Cover, Hold On) **while** it shakes, then evacuate **as soon as the shaking stops**, without waiting for a warning. The file carries `safety_critical_content`, so the sequence must be explicit. | EN: `"Near the sea: ... If you are near the coast and the shaking is strong or lasts a long time, first protect yourself until it stops. Then, as soon as the shaking stops, go to high ground or far inland at once, on foot if you can. If the sea suddenly pulls back from the beach, go at once. Do not wait for an announcement, and do not go to look at the sea."` ID: `"...pertama-tama lindungi dirimu sampai guncangan berhenti. Begitu guncangan berhenti, segera pergi ke tempat tinggi atau jauh ke daratan, sebaiknya berjalan kaki. Jika air laut tiba-tiba surut, segera pergi. Jangan menunggu pengumuman, dan jangan pergi melihat laut."` Update factCheck 4 to match. |
| 2 | minor | `text[2]` | Missing the after-shaking step that standard guidance includes: once the shaking stops, leave a damaged building calmly by the stairs (not a lift) and watch for aftershocks, broken glass and fallen wires. | Append EN `"When the shaking stops, leave carefully by the stairs, not a lift, and watch out for aftershocks and broken glass."`; ID `"Setelah guncangan berhenti, keluar dengan hati-hati lewat tangga, bukan lift, dan waspadai gempa susulan serta pecahan kaca."` |
| 3 | minor | `text[2].id`, `q1`, `crossCurricular[0].id` | Indonesian materials from BNPB commonly render Drop, Cover, Hold On as *Merunduk, Berlindung, Berpegangan*. *Berlutut* is understandable (it matches "hands and knees"), but children will meet the official wording at school. | Prefer `"Merunduk, Berlindung, Berpegangan"` throughout, or add `"(sering disebut Merunduk, Berlindung, Berpegangan)"` once in `text[2].id`. A human reviewer should confirm against current BNPB material. |

The rest is correct and well judged: the doorway myth appears as a distractor; the tsunami arrives as several waves with later ones larger; stay away until officials say it is safe; the emergency bag; "do not go to look at the sea". 2 × 4 × 3 = 24, with the 2 L figure honestly flagged as a supposition. The calm parent note is good.

## g6

### reading-g6-draw-a-scale-plan — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `q4` | Tagged `inference`, but the answer "the plan keeps exactly the same shape" is stated almost verbatim in `text[0]` (rule 8). | Make it a transfer item: EN `"Arif divides the room's length by 50 but its width by 100. What goes wrong?"` / `["the plan is squashed and no longer the same shape as the room", "the plan is exactly right", "the plan becomes bigger than the room"]`; ID `"Arif membagi panjang kamar dengan 50 tetapi lebarnya dengan 100. Apa yang salah?"` / `["denahnya gepeng dan bentuknya tidak sama lagi dengan kamar", "denahnya benar sekali", "denahnya lebih besar dari kamar"]`. |

All the scaling is correct (350 → 7, 300 → 6, 200 × 100 → 4 × 2; 2.4 × 50 = 120; 90 / 50 = 1.8), and the distractors (no conversion, adding 50, multiplying instead of dividing) are real errors. The safety notes are adequate.

### reading-g6-habibie-the-aircraft-builder — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[5]` | Omits the context that he was Vice President and became President when Suharto resigned in May 1998. Not wrong, but "became Indonesia's third president" with no mechanism may puzzle G6 readers. | EN `"In March 1998 Habibie became Vice President, and in May 1998, a time of great change, he became Indonesia's third president when President Soeharto resigned. He served until 1999."` (ID likewise; add to factChecks as `common_knowledge`). |

Verified: born 25 June 1936 in Parepare; ITB Bandung, then aeronautical engineering in Aachen with a doctorate; MBB in Germany; crack-propagation work (`needs_source` is honest); returned in the 1970s; led IPTN; Minister of Research and Technology; N250 first flight on 10 August 1995 = Hakteknas; President 1998–1999; died in Jakarta on 11 September 2019. q1: he was 59 on 10 August 1995 (birthday already passed in June), correct.

### reading-g6-wet-and-dry-seasons — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | `text[5]` | "winds blow from the north-west" holds south of the equator. North of it (e.g. northern Sumatra, northern Kalimantan) the same Asian monsoon arrives from the north-east and only turns as it crosses the equator. "In much of Indonesia" partly covers this. | Optional: EN append `"(north of the equator they arrive from the north-east, then turn)"`; ID `"(di utara khatulistiwa angin datang dari timur laut, lalu berbelok)"`. |

Verified: axial tilt about 23.5°; perihelion in early January; about 12-hour days at the equator; the monsoon timing; Maluku's (e.g. Ambon's) mid-year rainfall peak is correct (the "local" rainfall pattern), so that `needs_source` can be upgraded by a reviewer; El Niño lengthens the dry season. May–September inclusive = 9 − 5 + 1 = 5, with off-by-one and sum distractors. Good.

---

## Items for human review
- **g5-when-the-ground-shakes** (safety-critical): apply the ordering fix and have a reviewer check the final wording against current BNPB/BMKG public guidance, including the preferred Indonesian term for Drop, Cover, Hold On.
- **age2_3-cicak-on-the-wall**: the rewrite changes q2 and q3; re-run `units:check` afterwards.
- `needs_source` claims (Komodo hatchling size and tree-living, Habibie crack research, Maluku rainfall) are all believed correct; a reviewer can add sources or upgrade them.
