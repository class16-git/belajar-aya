# Batch 2 literacy QA (batch `expansion-batch2-literacy`)

Reviewer: independent content QA (literacy, bilingual EN/ID). Reviewed 2026-11-12. No content files were edited.

Scope: the 20 files `content/units/*/literacy/unit-*.json` with `provenance.batch: "expansion-batch2-literacy"`.
`units:check` over all ten literacy directories: 183 units and 71 readings parse, **0 errors**. Every prerequisite id exists.

Checks per file: (1) linguistic correctness (English phonics; Indonesian syllables, PUEBI/EYD spacing of kata majemuk and
bound forms, affixes, pleonasme, word register); (2) exactly one defensible answer at index 0, with each distractor wrong for the
mapped reason **in both languages** (rule 12); (3) assessment uses new words and passages (rule 11); (4) factual statements in
example texts (units have no `factChecks` field); (5) originality; (6) developmental fit and progression; (7) safety and tone.

Severity and verdicts follow the pilot: **blocker** = must not ship (hard-rule or safety violation); **major** = a linguistic or
factual error, a second defensible answer, a wrongly mapped distractor, or a rule-11 breach in which the assessment re-tests the
taught example; **minor** = polish, recommended. **pass** = no blocker or major; **fix required** = at least one major.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| age2_3-listening-walk | pass | 0 | 0 | 4 |
| age2_3-naming-actions | pass | 0 | 0 | 1 |
| age3_4-robot-talk-syllables | pass | 0 | 0 | 2 |
| age3_4-storytelling-with-props | pass | 0 | 0 | 3 |
| age4_5-making-rhymes | **fix required** | 0 | 1 | 5 |
| age4_5-name-writing-and-grip | pass | 0 | 0 | 4 |
| k-segmenting-words-for-spelling | **fix required** | 0 | 1 | 1 |
| k-sentence-building-with-cards | pass | 0 | 0 | 3 |
| g1-capitals-and-full-stops | pass | 0 | 0 | 2 |
| g1-reading-with-expression | pass | 0 | 0 | 2 |
| g2-compound-words | pass | 0 | 0 | 4 |
| g2-retelling-non-fiction | **fix required** | 0 | 1 | 3 |
| g3-synonyms-and-antonyms | **fix required** | 0 | 1 | 2 |
| g3-writing-a-recount | pass | 0 | 0 | 1 |
| g4-inferring-from-character-actions | pass | 0 | 0 | 2 |
| g4-paragraph-structure | pass | 0 | 0 | 2 |
| g5-figurative-language-in-poetry | pass | 0 | 0 | 1 |
| g5-note-taking-from-informational-text | **fix required** | 0 | 2 | 2 |
| g6-debate-preparation | pass | 0 | 0 | 2 |
| g6-editing-for-clarity | **fix required** | 0 | 1 | 1 |

**Totals: 14 pass, 6 fix required. 0 blockers, 7 majors, 47 minors.**

### Cross-cutting findings

1. **Rule 11 is still the main weak point.** Six of the seven majors are assessment items that re-test the guided example: the
   same words (`tas`, `agar supaya`, `kind/unkind`, `ramah/tidak ramah`, `jalan/bulan/pelan/talan`) or the same passage (the
   earthworm and mangrove texts). The maths validator enforces this rule; literacy has no such check, so the authors must
   check it themselves. A useful self-test: search the guided examples, practice and rationale for each answer word.
2. **Rule 12 (parallel distractors) is much improved on the pilot.** In every item I checked the ID choice at index *n* against
   its mapped code on its own. Only one mapping is wrong (retelling-non-fiction a2, index 1), and that is a mislabel in both
   languages, not an EN/ID split.
3. **Verified correct** (no action): syllable splits ba-tu, ke-la-pa, me-ja, pe-ta-ni, ma-ta, ka-ki, na-si; PUEBI spacing
   *rumah sakit, meja makan, kereta api, kamar mandi, kamar tidur, sapu lidi, rumah makan, kapal laut, mata kaki* (separate)
   and *matahari, kacamata, saputangan* (serangkai); *antarbagian, antarlarik, antarfakta, kosakata*; the pleonasm examples
   *naik ke atas, mundur ke belakang, agar supaya, sangat … sekali, seluruh siswa-siswa*, and the subject hidden after
   *kepada*; *klaim tandingan* = counterclaim and *sanggahan* = rebuttal (rule 13), with *mosi, tim afirmasi, tim oposisi*;
   teks rekon *orientasi – urutan peristiwa – reorientasi*; *kalimat utama / penjelas / penutup*; majas and citraan terms;
   capitalisation of kinship sapaan (*Nenek*, *Kapan Ibu pulang?*) and non-capital *aku*; English CVC segmenting and
   past-tense notes; the yes/no-question intonation contrast.
4. **Facts.** Earthworms: no legs or eyes, light-sensitive skin, ringed body with bristles, breathing through moist skin,
   eating dead leaves and soil, castings that feed plants, tunnels that let in air and water. All of this is school science
   (common knowledge). Bamboo (stems for fences and simple houses, strips woven into baskets and mats, cooked shoots, cracking
   when dry) is common knowledge. Bats, sea turtles and mangrove roots are correct. **The mangrove ranking claim is not
   acceptable without a source:** see note-taking M1.
5. **Coin hazard, debate-preparation.** The reported coin error **is resolved**. `preparation[0]` now says "draw lots together"
   / "undi bersama", and the file does not mention coins. The only "coin" in the batch is a metaphor in a G5 poem ("The moon
   is a silver coin"), which is not a material, so there is no hazard.
6. **Originality.** All rhymes, stories and poems are original. I found no echo of a known copyrighted text or trademarked
   title. The images "puddle as mirror" and "moon as coin" are common stock images, which is acceptable.
7. **Safety and tone** are good: large props for ages 2–4, the adult sharpens pencils and prepares tokens, no screens at 2–3,
   no timers (debate says "A timer is not needed"), road, stool and mangrove-mud cautions, and gentle editing. Small points:
   the water flag in the listening walk, and the salt tray and short crayon pieces in name writing.
8. **Progression** is coherent: listening → action words → syllable split/join → retelling with props → making rhyme → grip
   and name → segmenting to spell → card sentences → punctuation → expression → compounds → non-fiction retell →
   synonyms and recount → inference and paragraphs → poetry devices and notes → debate and editing. One weak link: compound
   words lists capitals-and-full-stops as its prerequisite. That is harmless, but a vocabulary prerequisite would fit better.
9. **Recurring ID spelling:** *memeragakan* appears in k-sentence-building and g4-inferring. The KBBI standard form is
   *memperagakan*, which other units in the batch already use.

---

## age2_3

### unit-age2_3-literacy-listening-walk — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1 | Re-tests the modelled example: a bird in a tree, "tweet"/"cuit" (parentInstructions[1], successCriteria[1]). | Prompt EN "On the walk you stop. A rooster crows behind a fence. You ask: 'What's that?' …"; choices.en[0] "Looks or points towards the fence, or says 'rooster' or 'cock-a-doodle-doo'". ID "Seekor ayam jantan berkokok di balik pagar…"; choices.id[0] "Melihat atau menunjuk ke arah pagar, atau berkata 'ayam' atau 'kukuruyuk'". Explanation: change "tree/bird" to "fence/rooster". |
| 2 | minor | assessment a3, index 2 | "Always picks the one heard last" cannot be observed in one trial. Here the last knock is the soft one, so the behaviour is the same as index 1. | choices.en[2] "Knocks both times the same, with no loud or soft"; choices.id[2] "Mengetuk dua kali sama saja, tanpa keras atau pelan"; dm {"2": "LOUD_QUIET_MIX"}. Keep PICKS_LAST_HEARD only if it is still used elsewhere; otherwise delete it. |
| 3 | minor | safety | A water bowl at age 2–3, but `hazards.water` is false. Rule 6 asks for a few centimetres of water with an adult right there. | Set `hazards.water: true`. notes[2] EN add: "Pour only a few centimetres of water and stay right by the bowl." ID add: "Tuang air hanya beberapa sentimeter dan tetap berada di dekat mangkuk." |
| 4 | minor | a2 EN; guidedExamples[1].id | "drip" does not match a pouring sound. "Sret, sret" is less usual than "srek, srek" for a broom. | a2 choices.en[0]: "'water' or 'splash'". guidedExamples[1].id: "'Srek, srek. Sapu!'" |

### unit-age2_3-literacy-naming-actions — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1 | Same toy and same action (Teddy hopping, "jump"/"lompat") as the parentInstructions[0] demonstration. At this age the target verbs are unavoidable, but the context can change. | Prompt: "Make a different toy (a doll or a cloth kitten) hop up and down. Ask: 'What is Kitty doing?'" / "Buat boneka lain (boneka kucing) melompat-lompat. Tanyakan: 'Kucing sedang apa?'"; choices.en[1] "Says 'Kitty' and nothing more" / choices.id[1] "Berkata 'Kucing' saja". |

## age3_4

### unit-age3_4-literacy-robot-talk-syllables — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | successCriteria[0–1].en | The EN fields use the Indonesian words "pi - sang" and "ku - cing". | EN: "Your child turns 'car - rot' into 'carrot' when the robot says it." / "Your child says 'ap - ple' in robot talk and puts down one block for each part." |
| 2 | minor | rationale (EN and ID) | "English syllables are less tidy (win-dow, ba-na-na)": both examples are tidy. | Replace with "(lemon can be split lem-on or le-mon; butter as but-ter or bu-tter)" / "(lemon bisa dipisah lem-on atau le-mon; butter menjadi but-ter atau bu-tter)". |

Verified: ba-tu, ke-la-pa, me-ja and pe-ta-ni are split correctly. Each foil fits its code in both languages (baju/bedtime =
start only; ratu/mushroom = end only; peta/butter = drops the last part).

### unit-age3_4-literacy-storytelling-with-props — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1, a2 | Both items quiz recall of the taught Kitten story (rule 11). Only a3 tests transfer. | Tell the a3 teddy story first, then: a1 "Hold up the bowl. 'When did the bowl come in the story?'" `["At the end, when Teddy found water and drank", "At the start, before Teddy was thirsty", "When Teddy found the cup was empty"]` / ID `["Di akhir, saat Beruang menemukan air dan minum", "Di awal, sebelum Beruang haus", "Saat Beruang melihat gelasnya kosong"]` (ORDER_MIXUP ×2). a2 "What was Teddy's problem?" `["He was thirsty and the cup was empty", "He was sleepy", "He drank the water"]` / ID `["Ia haus dan gelasnya kosong", "Ia mengantuk", "Ia minum air"]` (INVENTS_DETAIL, ENDING_FOR_PROBLEM). |
| 2 | minor | materials | The a3 props (teddy, empty cup, bowl) are not listed. | Add: "A teddy, an empty plastic cup and an empty bowl for a new story (the water is pretend)" / "Boneka beruang, gelas plastik kosong, dan mangkuk kosong untuk cerita baru (airnya pura-pura)". |
| 3 | minor | ID throughout | The character is called "Anak Kucing" in the story but "Kucing" in guidedExamples[1].id and the assessment. | Use "Anak Kucing" throughout, or introduce "Si Kucing" once and keep it. |

## age4_5

### unit-age4_5-literacy-making-rhymes — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| M1 | major | assessment a1 | Rule 11. The ID target "jalan" and the answer words "bulan", "pelan" and "talan" all come from guidedExamples[0].id ("ja-lan, ta-lan, ma-lan… pe-lan") and successCriteria[0]. In EN, "hen" with "ten, pen" is the rationale example and is in the preparation list. | EN prompt "…rhymes with sun", choices `["'fun', 'run', or a made-up word like 'zun'", "'sock' (it starts like sun)", "'hot' (the sun is hot)"]`. ID prompt "Sebutkan kata yang berima dengan dapur.", choices `["'kasur', 'telur', atau kata karangan seperti 'tapur'", "'dasi' (awalnya sama dengan dapur)", "'kompor' (kompor ada di dapur)"]`. dm unchanged. |
| 2 | minor | guidedExamples[1].id | "ikan / papan" shares only -an. That contradicts the unit's own rule (rationale: Indonesian rhyme keeps the final syllable). | "'Kucing kecil duduk di papan, melihat burung terbang ke… depan!'" (pa-pan / de-pan). |
| 3 | minor | objective.id; a1, a3, a4 prompts.id; a3 explanation.id | "berakhiran sama" uses *akhiran*, the grammar word for suffix, which the G3 affix unit teaches. "-ri" is not an akhiran. | Use "berima" or "bunyi akhirnya sama": e.g. a3 "Kelompok kata mana yang semuanya berima?"; explanation "Lari, jari, dan tari sama-sama berbunyi akhir -ri." |
| 4 | minor | parentInstructions[1] | ID calls "zat" a nonsense word, but *zat* is a real word (substance). The EN field uses the ID word "mulan". | EN: "'Zat' and 'jen' are not real words…". ID: "'Talan' dan 'mulan' bukan kata sungguhan, tetapi berima…". |
| 5 | minor | successCriteria[0].en; practice[2].en | The EN fields carry Indonesian examples ("jalan"/"bulan"; "Kakak, Bakak, Takak"). | successCriteria[0].en: "Your child says 'ten' or 'jen' when you say 'hen'." practice[2].en: "'Sam, Pam, Tam!'". |
| 6 | minor | a2 ID; a4 EN | The a2 ID answer pair "kolam/malam" is the rationale example. The a4 EN word "log" is the guided example. | a2 ID: "'Kucing kecil tidur di kursi, bangun pagi minta…'", choices `["nasi", "susu", "kursi"]` (MEANING_NOT_SOUND, REPEATS_SAME_WORD); update remediation "kurSI… naSI". a4 EN: "Your child says 'zake' as a rhyme for 'lake'" (update choices and explanation to match). |

### unit-age4_5-literacy-name-writing-and-grip — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | objective, outcomes[1] | The unit says "six pre-writing strokes" but lists five. | EN "(down, across, circle, cross, and the two slants / and \)"; ID "(turun, mendatar, lingkaran, silang, dan dua garis miring / dan \)". |
| 2 | minor | objective.id, outcomes[1].id | "pra-menulis": under PUEBI, the bound form *pra-* is written joined to the word. | "pramenulis". |
| 3 | minor | guidedExamples[0].id | "berputar ke kiri" is vague for anticlockwise. | "berputar berlawanan arah jarum jam". |
| 4 | minor | practice[1], safety | The salt option stings eyes, but notes[2] names only sand. 3 cm crayon pieces are choking-size for younger siblings. | Delete "(or salt)" / "(atau garam)". Add to notes: "Keep short crayon pieces away from children under 3." / "Jauhkan potongan krayon pendek dari adik di bawah 3 tahun." |

## k

### unit-k-literacy-segmenting-words-for-spelling — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| M1 | major | assessment a4 ID | Rule 11. "tas" is the guidedExamples[1].id word ("Satu suku kata, tiga bunyi: /t/, /a/, /s/"). | Prompt "Bunyi apa yang ada di tengah kata 'bus'?", choices `["/u/", "/b/", "/s/"]`, explanation "Dorong tiga kartu untuk b-u-s dan tunjuk yang di tengah: itulah vokalnya." |
| 2 | minor | preparation[0], extension[0] | "sate" (e, which is also ambiguous between é and ə) and "tahu" (h) break the unit's own letter set (parentInstructions[2]); rule 17. | "sate" → "satu"; "tahu" → "buku". |

Verified: mata = 4 sounds versus 2 syllables, kaki /k/ /a/ /k/ /i/, nasi/isan reversal, dig/mop/nap/sit CVC. Each foil fits
its code in both languages.

### unit-k-literacy-sentence-building-with-cards — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a3, a4 | a4 reuses "in the kitchen / di dapur" from guidedExamples[1]. a3 reuses the deck words "bird/sings". | a3: "'The frog jumps.'" `["jumps", "frog", "The"]` / "'Katak itu melompat.'" `["melompat", "Katak", "itu"]`. a4: "Add a where card to 'Grandpa reads.'" `["Grandpa reads in the garden.", "Grandpa reads the garden.", "In the garden."]` / "'Kakek membaca.'" `["Kakek membaca di kebun.", "Kakek membaca kebun.", "Di kebun."]`. |
| 2 | minor | guidedExamples[1].id | "memeragakannya" is not the KBBI standard form. | "memperagakannya". |
| 3 | minor | rationale | "Indonesian … has no words like a and the" overstates the case. | EN "…has no articles like a and the (words such as seekor, sebuah and itu do some of that work)"; ID likewise "(kata seperti seekor, sebuah, dan itu menjalankan sebagian tugasnya)". |

## g1

### unit-g1-literacy-capitals-and-full-stops — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | practice[0] | "three sentences with four mistakes" gives the parent no text. | Add an example: EN "'my cat sleeps on monday. we play in solo.'" (My, Monday, We, Solo); ID "'kucingku tidur pada hari senin. kami bermain di solo.'" (Kucingku, Senin, Kami, Solo). |
| 2 | minor | guidedExamples[1].id | "Kamu lihat harimau?" is spoken register inside a model of written text. | "Kamu melihat harimau?" |

### unit-g1-literacy-reading-with-expression — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1 | The test sentences are the rationale examples ("Is the bus here?" / "Busnya sudah datang?"). | EN "'Can I have a turn?'"; ID "'Adik sudah makan?'". |
| 2 | minor | childInstructions[1].en | "Shout softly" is contradictory; the ID says "Bersemangat". | "Sound excited at an exclamation mark." |

## g2

### unit-g2-literacy-compound-words — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a4 EN | "lunchbox" is written open ("lunch box") in some major dictionaries. That clashes with a unit that teaches spacing. | `["We found a seashell.", "We found a shell.", "We are finding shells."]`; explanation "Sea + shell makes one new word…". |
| 2 | minor | assessment a3 ID | "kereta api" is the rationale example and the remediation pair. | `["meja tulis", "mejatulis", "tulis meja"]`; explanation unchanged. (Avoid "sepak bola", because "bola sepak" is also used.) |
| 3 | minor | title.en | "Compound words / Kata majemuk" puts the ID title in the EN field. | "Compound words". |
| 4 | minor | practice[2].en | The hyphenated "shoe-car" contradicts "English compounds are usually one word". | "a 'shoecar'". |

PUEBI spacing checked: all the separate and joined forms used are correct (see cross-cutting 3).

### unit-g2-literacy-retelling-non-fiction — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| M1 | major | assessment a1, a2, a4 | Rule 11. Three of four items test the taught earthworm text, whose Food and Helping boxes the child already filled in practice[0]. | Add a new text to a1's prompt: EN "Garden snails. Body: A snail has a soft body, one flat foot and a coiled shell on its back. Home: Snails live in damp, shady places, such as under leaves. In dry weather they hide inside their shells. Food: They eat leaves and rotting plants, scraping them with a rough tongue. Helping: By eating dead plants, they help break them down into soil." ID "Siput kebun. Tubuh: Siput bertubuh lunak, punya satu kaki yang pipih, dan cangkang melingkar di punggungnya. Rumah: Siput hidup di tempat lembap dan teduh, misalnya di bawah daun. Saat cuaca kering, siput bersembunyi di dalam cangkangnya. Makanan: Siput memakan daun dan tumbuhan yang membusuk dengan lidahnya yang kasar. Manfaat: Dengan memakan tumbuhan mati, siput membantu menguraikannya menjadi tanah." a1 (Food) `["Snails scrape up leaves and rotting plants with a rough tongue.", "Snails hide in their shells when it is dry.", "Snails are slow and boring."]` / ID `["Siput memakan daun dan tumbuhan busuk dengan lidah kasarnya.", "Siput bersembunyi di cangkang saat kering.", "Siput itu lambat dan membosankan."]`. a2 `["How garden snails live, eat and help the soil", "Why snails hide when the weather is dry", "All the animals in a garden"]` / ID `["Cara hidup siput kebun, makanannya, dan manfaatnya bagi tanah", "Mengapa siput bersembunyi saat cuaca kering", "Semua hewan di kebun"]`. a4 (Helping) `["eat dead plants, break down, soil", "soft body, one foot, shell", "snail, the, it"]` / ID `["makan tumbuhan mati, menguraikan, tanah", "tubuh lunak, satu kaki, cangkang", "siput, itu, ia"]`. Codes unchanged. |
| 2 | minor | assessment a2, index 1 | "What gardens look like after rain" is not in the text, so it is not the OFF_TOPIC_DETAIL ("a side detail as the topic"). | Fixed by M1: the new index 1 is a real side detail from the text. |
| 3 | minor | guidedExamples[0].id | "terdiri atas banyak cincin": the school term is *ruas* (cacing tanah beruas-ruas). | "Tubuhnya yang panjang terdiri atas banyak ruas". |
| 4 | minor | parentInstructions[3].en | "an 'my opinion' box". | "a 'my opinion' box". |

Facts: every earthworm statement is standard school science (cross-cutting 4). The `fact_check` flag can be cleared by a
reviewer as common knowledge.

## g3

### unit-g3-literacy-synonyms-and-antonyms — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| M1 | major | assessment a5 | Rule 11. "kind → unkind" and "ramah → tidak ramah" are the guidedExamples[1] pairs (and the rationale examples). | EN "What is the opposite of 'lucky'?" `["unlucky", "luckily", "fortunate"]`; ID "Apa lawan kata 'sopan'?" `["tidak sopan", "kesopanan", "santun"]`; explanation "Un- makes the opposite here. Luckily only changes the word's job, and fortunate means nearly the same." / "Tidak sopan adalah lawannya. Kesopanan hanya mengubah jenis kata, dan santun artinya hampir sama." dm unchanged. |
| 2 | minor | parentInstructions[3]; a1 | The a1 foil pairs (tiny/tidy, pandai/pandan) are given beforehand as the look-alike examples. | parentInstructions[3]: EN "(quiet, quite)", ID "(pasar, pagar)". In the ANTONYM_FOR_SYNONYM remediation, use a neutral example: "'SAME as small'" / "'SAMA dengan cepat'". |
| 3 | minor | assessment a4 ID | "murka" is defensible as the strongest word (KBBI: *sangat marah; berang*), but it is literary and, in this family's faith context, strongly tied to divine wrath (*murka Allah*). It is an odd word for a child's own feelings. | choices.id `["geram", "kesal", "tenang"]` (KBBI geram: *marah sekali*); explanation "Pada garis kata: kesal, marah, geram. Geram paling kuat…". |

Shades of meaning checked: melirik < melihat < menatap and cross < angry < furious are correct.

### unit-g3-literacy-writing-a-recount — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a4, choices.id[2] | "Kami selalu berjalan … setiap hari" is pleonastic (*selalu* + *setiap hari*), in a batch that teaches pleonasme. | "Kami berjalan menyusuri pantai setiap hari." (parallels EN "every day"). |

## g4

### unit-g4-literacy-inferring-from-character-actions — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1, a4 prompts | The passages have speech with no inner quotation marks, which is a poor model at G4. | EN a1 "…\"Is that a car?\" she asked…"; ID "…\"Itu mobil, ya?\" tanyanya…"; EN a4 "\"It is only noise,\" she whispered…"; ID "\"Cuma suara, kok,\" bisiknya…". |
| 2 | minor | parentInstructions[0].id | "memeragakan" is not the KBBI standard form. | "memperagakan". |

Each item has one defensible answer. The inference answers are not stated word for word (rule 8).

### unit-g4-literacy-paragraph-structure — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | objective.id, rationale.id | The model has kalimat utama first **and** a closing that restates it. Indonesian textbooks call that *paragraf campuran*, not *deduktif*. | objective.id: replace "kalimat utama di awal (deduktif)" with "kalimat utama di awal". rationale.id add: "Jika kalimat penutup menegaskan kembali gagasan utama, buku pelajaran menyebutnya paragraf campuran." (EN rationale likewise.) |
| 2 | minor | guidedExamples[0] conclusion | "As a result" / "Oleh karena itu" is a cause word, but the sentence sums up. | EN "In short, one plant can give…"; ID "Jadi, satu jenis tanaman bisa memberi…". Add "In short / Jadi" to the materials[2] list. |

Facts: the bamboo uses (fences, simple houses, woven strips, cooked rebung) and cracking when dry are common knowledge.
`fact_check` can be cleared.

## g5

### unit-g5-literacy-figurative-language-in-poetry — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | objective.id, rationale.id | Many Indonesian textbooks also call simile *majas asosiasi*. | "simile (perumpamaan atau asosiasi)". |

The poems are original. Each device item has one answer, and its foils fit their codes in both languages. The "silver coin" is
a metaphor only, so there is no hazard.

### unit-g5-literacy-note-taking-from-informational-text — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| M1 | major | guidedExamples[0] para (1); guidedExamples[2] model notes | "Indonesia has one of the largest areas of mangrove forest in the world" / "salah satu hutan bakau terluas di dunia" is a world-ranking claim. Units have no `factChecks`, and there is no source (rule 3). Do not keep it as it stands. | Reword: EN "Indonesia, a country of thousands of islands, has mangrove forests along many of its coasts." ID "Indonesia, negara dengan ribuan pulau, memiliki hutan mangrove di banyak pantainya." Model notes: EN "Indonesia = mangroves on many coasts"; ID "Indonesia = mangrove di banyak pantai". (Or move the ranking to a reading with a sourced `factChecks` entry.) |
| M2 | major | assessment a2, a4 | Rule 11. a2 re-tests the "pencil roots → air (mud has little oxygen)" note given in guidedExamples[2]. a4 asks for headings for the taught text, and two of them ("Where they grow", "Roots") come from the model notes. | a2: "Sentence: 'Owls have soft, comb-like edges on their feathers, so they fly almost silently and can surprise their prey.' A note says only: 'feathers like combs'. What key information is missing?" `["Why: soft edges → almost silent flight → can surprise prey", "That combs are used for hair", "Nothing, the note is complete"]` / ID "'Bulu burung hantu bertepi lembut seperti sisir, sehingga ia terbang hampir tanpa suara dan bisa mengejutkan mangsanya.' Catatan: 'bulu seperti sisir'." `["Alasannya: tepi lembut → terbang hampir tanpa suara → bisa mengejutkan mangsa", "Bahwa sisir dipakai untuk rambut", "Tidak ada, catatannya sudah lengkap"]`. a4: "A bee text has four paragraphs: a bee's body; life in the hive; making honey; carrying pollen between flowers. Which headings…?" `["Body / Life in the hive / Making honey / Carrying pollen", "Paragraph 1 / Paragraph 2 / Paragraph 3 / Paragraph 4", "Wings / Queen / Jars / Yellow dust"]` / ID `["Tubuh / Hidup di sarang / Membuat madu / Membawa serbuk sari", "Paragraf 1 / Paragraf 2 / Paragraf 3 / Paragraf 4", "Sayap / Ratu / Toples / Debu kuning"]`. Codes unchanged. |
| 3 | minor | guidedExamples[0–2].id | Strictly, *bakau* is *Rhizophora* (akar tunjang). The *akar napas* described belong to api-api and pedada, so "Ada bakau yang … akar napas" is inaccurate. | Use *mangrove* as the general term: title "Mangrove, pohon di antara darat dan laut"; (1) "Mangrove (sering disebut bakau) adalah…"; (2) "Ada mangrove yang berdiri di atas akar tunjang… Ada pula yang menumbuhkan akar napas…". materials[0].id "Teks mangrove". |
| 4 | minor | assessment a3, choice 0 | "lay eggs → dug holes" uses → for "in", but the unit defines → as "leads to / so". | EN "sea turtles: lay eggs in dug holes, sandy beach, usu. at night"; ID "penyu: bertelur di lubang galian, pantai berpasir, biasanya malam". |

## g6

### unit-g6-literacy-debate-preparation — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a3 | Reuses the guided motion (school garden). Index 2 is the guided assertion word for word. The answer itself is new. | Use a new motion: "Motion: 'Every classroom should have a reading corner.' The opposition says: 'A reading corner takes up too much space.'" `["A reading corner can be one shelf and a mat by the wall, so it needs very little space.", "The opposition speaker never reads anyway.", "Reading corners help students enjoy books."]` / ID "Mosi: 'Setiap kelas sebaiknya memiliki pojok baca.' Tim oposisi: 'Pojok baca memakan terlalu banyak tempat.'" `["Pojok baca cukup satu rak dan satu tikar di dekat dinding, jadi hanya perlu sedikit tempat.", "Pembicara oposisi itu memang tidak pernah membaca.", "Pojok baca membuat siswa senang membaca."]`. |
| 2 | minor | accessibility[0].id | The ID drops "or record and replay them privately". | "…kepada satu anggota keluarga dulu, atau merekam lalu memutarnya sendiri; kartu bicara…". |

Terminology is correct (rule 13): *klaim tandingan* = counterclaim, *sanggahan* = rebuttal; *mosi, tim afirmasi, tim oposisi*.
**Coin hazard: resolved.** `preparation[0]` uses "draw lots" / "undi", and no coin appears anywhere in the file.

### unit-g6-literacy-editing-for-clarity — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| M1 | major | assessment a1 | Rule 11. The ID item contains "agar supaya" (guidedExamples[0].id) and "naik ke atas" (rationale and remediation). The EN "return back" is the rationale example. | EN "Which is the clearest edit of: 'The team met together to plan ahead for the next match.'" `["The team met to plan for the next match.", "The team met together to plan for the next match.", "The team cancelled the plan for the next match."]`. ID "…dari: 'Warga saling bantu-membantu membersihkan selokan demi untuk mencegah banjir.'" `["Warga saling membantu membersihkan selokan untuk mencegah banjir.", "Warga saling bantu-membantu membersihkan selokan untuk mencegah banjir.", "Warga saling membantu membersihkan selokan setelah banjir."]`. dm unchanged. |
| 2 | minor | assessment a2 explanation | The suggested EN rewrite ("Sari smiled when Dina gave her the book") still does not say whose book it was. The ID "buku milik Dina kepadanya" is clumsy. | EN "Dina gave her own book to Sari, and Sari smiled."; ID "Dina memberikan bukunya sendiri kepada Sari, dan Sari tersenyum." |

The pleonasm examples are all correct: *seluruh siswa-siswa*, the subject hidden after *kepada*, *agar supaya*, *sangat
bagus sekali*, *naik ke atas*, *mundur ke belakang*.

---

## Verdict

No blockers. Six files need fixes before human review: making-rhymes, segmenting-words-for-spelling,
retelling-non-fiction, synonyms-and-antonyms, note-taking-from-informational-text and editing-for-clarity. Six of their
seven majors are rule-11 reuse of taught examples. The seventh is the unsourced mangrove ranking claim. The other 14 files pass
and need only the minor fixes above. The debate unit's coin hazard is fixed.
