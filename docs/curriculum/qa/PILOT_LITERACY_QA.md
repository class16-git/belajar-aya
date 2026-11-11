# Pilot literacy QA (batch `expansion-pilot-literacy`)

Reviewer: Agent G4 (independent content QA: literacy, bilingual EN/ID). Reviewed 2026-11-10. No content files were edited.

Scope: the 20 files `content/units/*/literacy/unit-*.json`, all `provenance.batch: "expansion-pilot-literacy"`,
`reviewStatus: "agent_reviewed"`. `units:check` on each literacy directory reports 0 errors (102 units and 41 readings parse).

Checks per file: (1) linguistic correctness (English phonics claims; Indonesian syllable division, affixes, idioms);
(2) exactly one defensible answer at index 0, with each distractor matching the misconception it is mapped to, **in both
languages**; (3) EN and ID teach the equivalent skill in a way that suits each language, in natural wording; (4) developmental
fit and progression; (5) originality of rhymes and texts; (6) safety and tone; (7) factual statements.

Severity: **blocker** = must not ship (hard-rule or safety violation); **major** = a linguistic or factual error, a second
defensible answer, or a distractor whose mapped misconception is wrong (so the child gets wrong diagnostic feedback);
**minor** = polish, recommended.
Verdict: **pass** = no blocker or major; **fix required** = at least one blocker or major.

## Summary

| File | Verdict | Blocker | Major | Minor |
|---|---|---|---|---|
| age2_3-action-rhymes-and-songs | **fix required** | 0 | 1 | 1 |
| age2_3-naming-everyday-things | pass | 0 | 0 | 3 |
| age3_4-clapping-syllables | pass | 0 | 0 | 4 |
| age3_4-hearing-rhyme | **fix required** | 0 | 1 | 2 |
| age4_5-hearing-first-sounds | **fix required** | 0 | 2 | 2 |
| age4_5-letter-sound-links | **fix required** | 0 | 2 | 1 |
| k-blending-to-read-words | **fix required** | 0 | 1 | 4 |
| k-high-frequency-words | **fix required** | 0 | 1 | 2 |
| g1-consonant-digraphs | pass | 0 | 0 | 2 |
| g1-writing-simple-sentences | pass | 0 | 0 | 3 |
| g2-retelling-with-sequence-words | pass | 0 | 0 | 0 |
| g2-vowel-teams | pass | 0 | 0 | 3 |
| g3-paragraph-main-idea | **fix required** | 0 | 1 | 2 |
| g3-prefixes-and-suffixes | **fix required** | 0 | 2 | 4 |
| g4-figurative-language | pass | 0 | 0 | 1 |
| g4-summarising-text | pass | 0 | 0 | 1 |
| g5-evaluating-sources | pass | 0 | 0 | 0 |
| g5-persuasive-writing-structure | pass | 0 | 0 | 2 |
| g6-analysing-authors-purpose | pass | 0 | 0 | 2 |
| g6-argumentative-essay-planning | **fix required** | 0 | 1 | 0 |

**Totals: 11 pass, 9 fix required. 0 blockers, 12 majors, 39 minors.**

### Cross-cutting findings

1. **The shared `distractorMisconceptions` map breaks the Indonesian side.** The map is keyed by index and shared by
   `choices.en` and `choices.id`. Authors wrote good English distractors, then wrote Indonesian distractors at the same index
   that do not show the mapped misconception (for example, a "same first sound" foil that does not share the first sound).
   Seven of the twelve majors come from this. In future batches, check each ID choice against its code separately.
2. **Things verified correct** (no action): Indonesian syllable divisions bu-nga, ba-ngun, nya-muk, pan-tai, ma-in, ka-in,
   la-ut, a-ir, su-ngai, pu-lau, ker-bau, ha-ri-mau, se-poi, ku-pu-ku-pu, u-lat bu-lu. The diphthongs ai/au/oi follow
   PUEBI/EYD. The idioms buah tangan = oleh-oleh, panjang tangan = suka mencuri, besar kepala = sombong are right. So are the
   ber-/ter-/-an meanings as taught, the deduktif/induktif terms, the teks persuasi and teks eksposisi parts, and the English
   facts on SATPIN-style ordering, continuant sounds, ck after a short vowel, igh, ai/ay and -ful/-less. Science facts are
   fine: whiskers sense air movement; seeds need water, air and warmth and send out the root before the shoot; bees carry
   pollen.
3. **Originality.** No rhyme or text reproduces a known copyrighted work. One echo of a trademarked title is flagged
   (Dr. Seuss, below). The EN action rhyme follows the pattern of traditional public-domain clapping rhymes, which is
   acceptable.
4. **Safety and tone** are good throughout: no choking-size items for ages 2–4, the adult does all cutting, kite safety
   mentions power lines, no screens at age 2–3, and no timers or scoring. One minor point about modelling river play is noted
   under g2-vowel-teams.
5. **Progression** is coherent: action rhyme → naming → syllables → rhyme → first sound → letter-sound → blending → HFW →
   digraphs/sentences → vowel teams/retelling → affixes/main idea → figurative/summary → sources/persuasion →
   purpose/argument. All prerequisites are units in this batch. The ID route (syllable → phoneme → CV syllable cards →
   syllable blending → digraphs inside syllables → diphthong vs vowel sequence) suits Indonesian and is not a translation.

---

## age2_3

### unit-age2_3-literacy-action-rhymes-and-songs — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, `choices.id[1]` | "kecil" makes sense in the line ("hentak, hentak, kaki kecil"), so the ID item has two defensible answers. The EN foil "hands" does not fit stamping. | Change `choices.id[1]` from `"kecil"` to `"tangan"`. This mirrors EN "hands" and still shows REPEATS_EARLIER_WORD. |
| 2 | minor | guidedExamples[0].id | "Duduk manis, Ibu memanggil" fixes the caller as Ibu even when Ayah or a grandparent leads. | Add to parentInstructions[0].id: "Ganti 'Ibu' dengan Ayah, Nenek, atau nama Anda sendiri." (EN: "Swap 'Ibu' for whoever is saying the rhyme.") |

### unit-age2_3-literacy-naming-everyday-things — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | rationale vs materials | The rationale names "peci atau kerudung", but materials list only cup, spoon, sandal, hat and brush. | In materials[1].id, change "topi" to "topi, peci, atau kerudung", or delete "peci atau kerudung" from the rationale. |
| 2 | minor | assessment a4 | No distractor is mapped. Options 1 and 2 are adult-strategy errors. | Add `distractorMisconceptions` {"1": "CORRECTS_INSTEAD_OF_EXPANDS", "2": "REPEATS_WITHOUT_ADDING"} and describe both codes, or note that this is a caregiver check. |
| 3 | minor | accessibility[0] | "One language per session rather than mixing within a sentence" overstates the case. Mixing languages is normal for bilingual toddlers and does no harm. | Replace with: "For children learning both languages, either language is fine; using one language for a whole game can make the new word easier to hear." |

## age3_4

### unit-age3_4-literacy-clapping-syllables — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | rationale (EN/ID) | "often contain blended consonants (but-ter-fly, el-e-phant)": elephant has no cluster. The real English difficulty is weak unstressed syllables and unclear boundaries. | Replace with "often have weak, unstressed beats and unclear boundaries (el-e-phant, straw-ber-ry)" / "sering punya ketukan lemah dan batas yang kurang jelas (el-e-phant, straw-ber-ry)". |
| 2 | minor | practice[1] | "towel = 2 steps": many accents say towel as one syllable. | Use "bath-tub = 2 steps". |
| 3 | minor | assessment a2 | BIG_THING_LONG_WORD is weakly elicited, because a ball is not clearly bigger than a teddy. | Use "bus" or "caterpillar" (EN) and "bus" or "kupu-kupu" (ID). Answer: caterpillar / kupu-kupu; foil bus → BIG_THING_LONG_WORD. |
| 4 | minor | assessment a3 | Choosing kitten or caterpillar as "one clap" is counting the whole word as one beat, not missing a syllable. | Map {"1","2"} to a new code WHOLE_WORD_ONE_BEAT ("claps once for the whole word"; remediation: chin check per beat). |

### unit-age3_4-literacy-hearing-rhyme — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, `choices.id` | Index 1 "meja" is mapped SAME_FIRST_SOUND but does not start like "topi". Index 2 "buku" is mapped MEANING_LINK but has no meaning link to topi. The EN foils "cup" (/k/ like cat) and "dog" (goes with cat) are correct. | `choices.id` → `["kopi", "tomat", "kepala"]`. Tomat shares to-; kepala is where a topi goes. |
| 2 | minor | preparation[1] EN rhyme | "A cat in a hat sat down on a mat" closely echoes Dr. Seuss's trademarked title *The Cat in the Hat*. The text is original, but the association is avoidable. | "A cat with a hat sat flat on a mat. / A frog on a log said, hop, hop, like that!" (keeps -at/-og). |
| 3 | minor | preparation[1] ID rhyme | "Pakai topi, minum kopi" in a child-facing rhyme reads as the child drinking coffee. | "Pakai topi, Kakek ngopi" is colloquial. A safer option: "Kakek bertopi minum kopi, / Lihat sapi makan pagi…" |

## age4_5

### unit-age4_5-literacy-hearing-first-sounds — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1, ID | The foil "/j/" is mapped LISTENS_TO_END, but the last sound of "meja" is /a/. | Change the ID target to "makan": prompt "Apa bunyi awal kata \"makan\"?", choices `["/m/ (mmm)", "/n/", "\"em\", nama hurufnya"]`, explanation "Ma-kan diawali suku ma, dengan bunyi pertama mmm. Nama huruf \"em\" bukan bunyinya." |
| 2 | major | assessment a2, ID | "bola" is mapped SIMILAR_SOUNDS, but /b/ is not similar to /s/. "meja" is mapped GUESSES_FROM_PICTURE (meaning link), but it has no link to sapu. | `choices.id` → `["sendok", "cangkir", "pengki"]`. /tʃ/ is the usual confusion with /s/ in young children; a pengki goes with a sapu. |
| 3 | minor | title.id | "Aku melihat bunyi awal" is unnatural, because one does not see a sound. | "Tebak bunyi awal". |
| 4 | minor | assessment a4 EN | The EN item uses the Indonesian route ("bo" for "bola"). | EN prompt: "The child says \"so\" for \"sock\". What is the next step?" Choice 0: "Ask for just the first sound: sss". |

### unit-age4_5-literacy-letter-sound-links — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | rationale (EN and ID) | Factual error: "e has two sounds (as in enam and enak)". Both words begin with pepet /ə/. | EN "(as in enam and ekor)"; ID "(seperti pada enam dan ekor)". This contrasts /ə/ with /e/. |
| 2 | major | assessment a3 EN | The EN foil "tap" is mapped ORDER_REVERSED, which means nothing for this item. EN tests word-initial sound while ID tests syllable reading. | EN prompt "Which card says \"at\"?", choices `["at", "an", "ta"]`, explanation "a + t reads at. An ends with n; ta has the letters the wrong way round." (The guided example already teaches "at".) |
| 3 | minor | assessment a2 ID | The explanation says "d" is the mirror image of b, but it is mapped GUESSES_LETTER. | EN choices `["t", "f", "i"]`, ID `["b", "d", "m"]`, dm {"1": "REVERSES_SIMILAR_SHAPES", "2": "GUESSES_LETTER"}. |

## k

### unit-k-literacy-blending-to-read-words — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a4 ID | "ubi" (GUESSES_FROM_FIRST) does not keep the first syllable i-, and "bibi" (IGNORES_FIRST) does not keep -bu. "Siapa itu?" is also odd once a foil is "itu". | prompt.id "Baca: i - bu. Apa katanya?", `choices.id` → `["ibu", "itu", "abu"]`. |
| 2 | minor | assessment a2 ID | "sopi" is a real regional word for palm liquor in Maluku and NTT. | Replace with "topi" (keeps -pi, changes the first part → IGNORES_FIRST). Explanation: "Topi mengubah suku pertama." |
| 3 | minor | assessment a2 EN | The pig picture is not a rule breach, but the audience is Indonesian Muslim families. | Use a picture of a bag: `["bag", "bat", "rag"]`. |
| 4 | minor | practice[1].id | "baju menjadi buku" changes both syllables, not one part. | "baju menjadi bahu" or "buku menjadi bulu". |
| 5 | minor | assessment a4 EN, extension | "mug" uses u, which is outside the taught set (s a t m i n p o d g). | a4 EN: "Read: p - o - t", choices `["pot", "pod", "dot"]`. Extension list: "map, pot, pin". |

### unit-k-literacy-high-frequency-words — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | a1 ID, a4 ID, misconception SOUNDS_OUT_TRICKY_PART | The code means "decodes an irregular part" in EN but was patched to mean "word order" in ID. ID a1 "apa" (index 1) has no tricky part, and "dua" (index 2, FIRST_LETTER_GUESS) does not share the first letter of "ada". | a1: `choices.id` → `["ada", "apa", "aku"]`, dm {"1": "FIRST_LETTER_GUESS", "2": "FIRST_LETTER_GUESS"}. a4: use one construct in both languages, "Which sentence is in the right order?": EN `["I see the cat.", "I the cat see.", "See cat the I."]`, ID unchanged, dm {"1": "WORD_ORDER", "2": "WORD_ORDER"}. Add WORD_ORDER to misconceptions and delete the Indonesian clause from SOUNDS_OUT_TRICKY_PART. |
| 2 | minor | preparation[1].en, guidedExamples[1].en | The Indonesian sentences in the EN field ("Ini bola aku.", "Ibu mau ke rumah.") differ from the ID field, and "Ini bola aku" is non-standard (bolaku). | Use the ID-field sentences in both: "Ibu ada di rumah." "Aku mau ke rumah." |
| 3 | minor | parentInstructions[0].en | "is" (s says /z/) and "my" (y says /igh/) also have tricky parts at K, and "th" in "the" is not yet taught. | Add hearts to the s in is, the y in my and the th in the. |

## g1

### unit-g1-literacy-consonant-digraphs — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1 ID | "bung-a" is mapped DROPS_A_SOUND, but nothing is dropped. It is a boundary error. | Replace with "bu-ga" (drops n → DROPS_A_SOUND). |
| 2 | minor | practice[2].en, extension[0].en | The EN field gives Indonesian items that differ from the ID field. "Nyamuk terbang di angin" is unnatural, and "sayang" is not a household thing. | Use the ID-field items: "Adik bernyanyi saat bangun."; "piring, kunyit, payung". |

### unit-g1-literacy-writing-simple-sentences — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a3 ID | "Nasi memasak Ibu." is mapped PHRASE_AS_SENTENCE, but it is a complete sentence with the roles reversed. | Replace with "Memasak nasi." (no who → PHRASE_AS_SENTENCE). |
| 2 | minor | a2 vs objective | The unit defines a sentence as "who + what they did", but a2 uses "My cat is black." / "Kucingku hitam." with no action. | Change a2 to action sentences: "My cat sleeps." / "Kucingku tidur." (keep the capital and full-stop foils). |
| 3 | minor | rationale | "Indonesian sentences have no articles" is too strong, because Indonesian has the articles si, sang and para. | "Indonesian has no articles like a and the". |

## g2

### unit-g2-literacy-retelling-with-sequence-words — pass
No issues. The kite story is original and natural in both languages. The ID sequence words (pertama-tama, kemudian, lalu, setelah
itu, akhirnya) are idiomatic, and the safety note on power lines is appropriate.

### unit-g2-literacy-vowel-teams — pass
All syllable divisions checked are correct.
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | title.id | "Tim vokal" is a calque, and the ID version teaches diphthong vs vowel sequence. | "Diftong dan deret vokal". |
| 2 | minor | guidedExamples[1].id | "Adik main air di sungai." models river play without an adult. | "Adik main air bersama Ayah di sungai." |
| 3 | minor | rationale.id | The EYD V diphthong list also includes ei (survei). | Optionally add "(ei, seperti pada survei, jarang ditemui anak)". |

## g3

### unit-g3-literacy-paragraph-main-idea — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a1 index 1 | "Cats can see in the dark / Kucing bisa melihat dalam gelap" is mapped DETAIL_AS_MAIN_IDEA, but it is not a detail of Paragraph A (which says whiskers sense what the cat *cannot* see). It also reinforces a myth: cats see well in dim light, not in total darkness. | EN "Whiskers can feel small movements in the air." / ID "Kumis dapat merasakan gerakan udara yang kecil." |
| 2 | minor | assessment a4 index 2 | "In the middle" is mapped ASSUMES_FIRST_SENTENCE. | Map to a new code GUESSES_POSITION, or replace the foil with "In every sentence". |
| 3 | minor | Paragraph A | "help a cat know if a gap is wide enough" is a popular claim that has been only partly studied. | Keep it as a hedged claim ("can help"), or note in sources.note that it is simplified. |

### unit-g3-literacy-prefixes-and-suffixes — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | assessment a2 ID | "termakan" is a real KBBI word (eaten by accident; termakan usia) but is mapped NOT_A_REAL_WORD. "bermakan" (not a word) is mapped AFFIX_MEANING_MIXUP. | `choices.id` → `["makanan", "termakan", "bermakan"]`. This matches EN: index 1 is a real word with the wrong meaning, index 2 is a non-word. |
| 2 | major | assessment a4 EN index 2 | "reuse" is a real word but is mapped NOT_A_REAL_WORD. | Replace with "reuseful" (taught affixes, not a word). |
| 3 | minor | practice[1] | "berbesar tidak": berbesar is attested (berbesar hati). | Use "berminum" (not standard). |
| 4 | minor | assessment a3 | Picking a truly affixed word (unlock, bertopi) as "no affix" is the opposite of LETTERS_AS_AFFIX. | Map {"1","2"} to a new code MISSES_REAL_AFFIX ("does not recognise a real affix"). |
| 5 | minor | assessment a4 ID / OPPOSITE_AFFIX | "sepedaan" is used in casual speech ("sepedaan, yuk"), and OPPOSITE_AFFIX has no ID meaning. | Replace with "persepeda" (not a word) and change the ID description to "Memilih bentuk imbuhan yang tidak lazim". |
| 6 | minor | parentInstructions | Children will overgeneralise ter- = paling. | Add: "ter- juga bisa berarti tidak sengaja atau sudah (tertidur, terbawa); di unit ini kita pakai ter- = paling dengan kata sifat." |

## g4

### unit-g4-literacy-figurative-language — pass
The idioms are correct (buah tangan, panjang tangan, besar kepala, a piece of cake, under the weather). So are the signal
words seperti, bagai, bak and laksana, and the device labels.
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | rationale.en | The gloss of panjang tangan, "likes to take things", is vague. | "tends to steal, taking other people's things". |

### unit-g4-literacy-summarising-text — pass
The germination text is accurate: embryo plus food store, water, air and warmth, the coat splits, the root comes before the
shoot, and the leaves then make food.
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a2 prompt.id | "kacang, jagung, dan bunga matahari": bunga matahari is a flower, not a seed. EN says "sunflower seeds". | "kacang, jagung, dan biji bunga matahari". |

## g5

### unit-g5-literacy-evaluating-sources — pass
No issues. The invented sources are clearly labelled, the bee-pollen claim is correct, "hoaks" is the right local term, and
the online-safety note is good.

### unit-g5-literacy-persuasive-writing-structure — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a3 index 1 | "Gardens need water" is mapped FACT_AS_OPINION in an item about calls to action. | Map to a new code STATEMENT_NOT_ACTION ("writes a statement instead of telling the reader what to do"). |
| 2 | minor | rationale | The four-part teks persuasi (pengenalan isu … penegasan kembali) is the SMP kelas VIII model. | Add "(model SMP, dipakai di sini sebagai tantangan)", or flag it for a human reviewer to decide. |

## g6

### unit-g6-literacy-analysing-authors-purpose — pass
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | minor | assessment a1 index 1 | "To give exact facts" is mapped TOPIC_FOR_PURPOSE, but it is a wrong purpose, not a topic. | Map to PURPOSE_MIX, or add WRONG_PURPOSE. |
| 2 | minor | ID purpose label | "merenung" is less usual as a school term for a text's purpose. | "mengungkapkan perasaan (refleksi)". |

### unit-g6-literacy-argumentative-essay-planning — fix required
| # | Severity | Where | Issue | Exact fix |
|---|---|---|---|---|
| 1 | major | objective, outcomes[2], childInstructions[1], practice[1–2], assessment a2/a4, misconceptions (ID) | Terminology is inverted. "sanggahan" (from sanggah = membantah) means a rebuttal, but the unit uses it for counterclaim and "tanggapan" for rebuttal. So a4 ID "Bagaimana sanggahan sebaiknya disajikan? Secara adil, dalam bentuk terkuat" reads to an Indonesian as "how should your rebuttal be presented". | Use counterclaim = "argumen tandingan" and rebuttal = "sanggahan" throughout. a2.id: "Apa fungsi sanggahan terhadap argumen tandingan?"; a4.id: "Bagaimana argumen tandingan sebaiknya disajikan?"; practice[1].id: "tulis argumen tandingan terkuat terhadap tesismu, lalu perbaiki sanggahanmu". |
