# Islamic source registry (batch `expansion-pilot-islamic`)

This registry lists every source, reference framework and teaching that the pilot batch mentions. It follows
[ADR-0010](../adr/0010-islamic-content-governance.md) and
[SOURCE_AND_SCHOLAR_REVIEW.md](../spec/curriculum-bible/islam/SOURCE_AND_SCHOLAR_REVIEW.md).

**Status of everything below: `unverified`.** The AI drafting agent consulted no book and cites no verse, hadith,
quotation, edition or page. Teachings are described in plain words so that a qualified scholar can confirm, correct or
replace them. All 20 units and 10 readings are `reviewStatus: "draft"` with `religiousReview.approvalStatus:
"unverified"`, and every `religiousReview` field is `null` until a reviewer fills it in.

## Files covered
- Units: `content/units/<level>/islamic/unit-<level>-islamic-*.json`, 2 per level from age2_3 to g6.
- Readings: `content/readings/<level>/reading-<level>-islamic-*.json`, 1 per level.

## 1. Reference frameworks (named by the family)

| # | Source | Kind | Verification | Used in |
|---|---|---|---|---|
| F1 | Ahl al-Sunnah wa al-Jama'ah, Ash'ari and Maturidi theology (family-selected orientation) | pedagogical_reference | unverified | nearly all units |
| F2 | Reference framework associated with Shaykh Abdullah al-Harari | pedagogical_reference | unverified | aqidah units (age3_4, g1, g4) |
| F3 | *Al-Qawl al-Jaliyy* (title as supplied by the family) | religious_text | unverified | aqidah units (age3_4, g1, g4) |

**F3 note.** Its identity, exact Arabic title, author, edition and attribution are **unverified** and must be verified
by a qualified scholar before it is cited anywhere. No passage, page or section is attributed to it, and no content was
drawn from it. The title may be a transliteration variant (al-Qawl al-Jaliyy / al-Qawl al-Jaliy).

## 2. Doctrinal formulations

| # | Formulation | Where | Verification |
|---|---|---|---|
| D1 | "Allah mawjud bila makan": Allah exists without a place. Child wording: "Allah created places and is not in need of them." | unit-g4-islamic-allah-exists-without-a-place; reading-g4-islamic-the-question-at-the-window | unverified (Arabic is a placeholder) |
| D2 | "Allah is not like anything He created"; we do not draw or picture Allah | unit-age3_4-islamic-allah-the-creator, unit-g1-islamic-creator-not-like-creation, g4 unit and reading | unverified |
| D3 | Only Allah creates; people "make" from what Allah created (menciptakan / membuat) | unit-age3_4-islamic-allah-the-creator | unverified |
| D4 | Before Allah created anything there was no place, and Allah existed; Allah does not change | unit-g4-islamic-allah-exists-without-a-place | unverified (described, not quoted) |

## 3. Teachings described in plain words (no text quoted)

| # | Teaching | Where |
|---|---|---|
| T1 | Gratitude for creation; gratitude with heart, tongue and actions (shukr); sincere intention (niyyah) | age2_3 reflection unit and reading; g6 reflection unit |
| T2 | Gentleness and kindness as good character | age2_3 akhlaq unit |
| T3 | Adab with the mushaf: clean hands, a high clean place, two hands, quiet listening | age4_5 quran unit and reading |
| T4 | Learning recitation from a teacher; a calm daily habit | g4 quran unit |
| T5 | Steps of wudu as commonly taught; not wasting water | k worship unit; g1 reading |
| T6 | The five daily prayers and their times by the sun; preparing a prayer place facing the qiblah | g2 worship unit |
| T7 | Care for neighbours: greet, share, help, do not disturb | g3 family unit; g2 reading |
| T8 | Truthful speech, checking news before passing it on, avoiding backbiting (ghibah) | g5 akhlaq unit and reading |
| T9 | The Prophet known as al-Amin in Makkah before prophethood | k seerah unit and reading |
| T10 | The Hijrah from Makkah to Madinah; the Ansar and the Muhajirun; the Hijri calendar counted from the Hijrah | g3 seerah unit |
| T11 | Mosque features: adhan five times a day, shoes off, wudu area, mihrab and qiblah, rows behind the imam, Friday prayer and khutbah | g3 reading (factChecks: common_knowledge) |

## 4. Arabic phrases and duas (all `verified: false`)

| Phrase (transliteration) | Arabic in file | Where |
|---|---|---|
| Bismillah; Alhamdulillah | drafted Arabic, copied from the existing meal-adab lesson | age2_3 reflection, age4_5 duas, g2 duas |
| Assalamu alaikum; Wa alaikum assalam | drafted Arabic | age3_4 arabic unit and reading |
| Bismika Allahumma amutu wa ahya (before sleep) | placeholder | age4_5 duas |
| Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur (on waking; *nushur* drafted as rising or resurrection, "dibangkitkan") | placeholder | age4_5 duas |
| Bismillah, tawakkaltu 'alallah, wa la hawla wa la quwwata illa billah (leaving home) | placeholder | g2 duas |
| Yarhamukallah; Yahdikumullah wa yuslihu balakum (sneezing) | placeholder | g2 duas |
| Allah mawjud bila makan | placeholder | g4 aqidah unit and reading |
| Letters ba, ta, tha, jim, ha, kha | single letters | g1 arabic unit |

"Placeholder" means the `arabic` field reads "[Arabic text to be supplied and verified by a qualified reviewer]". The
duas were transliterated from general knowledge and have no cited source.

## 5. Qur'an
No Qur'anic text is reproduced anywhere in the batch. Surahs are named only: Al-Fatihah, Al-Ikhlas, Al-Falaq, An-Nas.

## 6. Historical outlines (factual_reference, unverified)

| # | Outline | Where |
|---|---|---|
| H1 | Abu al-Hasan al-Ash'ari (Basra, Baghdad) and Abu Mansur al-Maturidi (Samarqand), roughly 3rd to 4th Islamic centuries | g5 history unit |
| H2 | Spread of Islam in the archipelago: gradual, through trade, marriage, teaching and pesantren; origin theories (Gujarat, Arabia, Persia, southern China); evidence types; early kingdoms in northern Sumatra; Wali Songo accounts presented respectfully as historical records and passed-down traditions, including karamah | g6 history unit; g6 reading (every claim marked `needs_source`) |

## 7. Questions a qualified scholar must answer
1. **F3:** What is the exact Arabic title, author, publisher and edition of *Al-Qawl al-Jaliyy*, and is it the intended
   reference? May it be cited, and for which statements?
2. **F2:** Which verified works associated with Shaykh Abdullah al-Harari should anchor the aqidah units, and with
   which editions and pages?
3. **D1 to D4:** Do the child sentences match the tradition? What textual basis should be recorded for each, and what
   age-appropriate wording do you approve for ages 3-4, Grade 1 and Grade 4?
4. How should children who have heard other explanations (for example about the sky, or raising hands in dua) be
   answered, respectfully and without criticising other Muslims?
5. **Madhhab:** Which fiqh school is the family default? Confirm the wudu steps, their order and which are required;
   the five prayer times; how a seven-year-old learns positions and recitations; whether a child may touch the mushaf,
   with or without wudu; and the ruling for a child who prays seated.
6. **Duas:** Supply the verified Arabic and source for every placeholder, confirm each transliteration and translation,
   and advise how to explain "I die and I live" to four-year-olds.
7. **Recitation:** Which recitation and tajwid convention, letter-name transliteration (tha/tsa, kha/kho) and reciter
   should be used?
8. **Seerah and history:** Confirm T9, T10, H1 and H2, supply sources, and advise on presenting Wali Songo legends.
9. **Plain-words teachings T1 to T8:** Confirm or correct each summary, and add an approved text where one is wanted.
10. Confirm the rule used throughout: no depiction of Allah, the Prophet, or any prophet or companion, and no
    role-playing them.

### Added after the pre-scholar consistency check (2026-11-11)
These come from `docs/curriculum/qa/PILOT_ISLAMIC_PRESCHOLAR_QA.md`, which is an AI consistency check and not
scholarly approval. Each question is also recorded in the relevant file's `religiousReview.notes`.
11. **Wudu order (K):** may the cards treat the order of the steps (*tartib*) as required, or should they stay neutral
    between madhhabs? The draft now presents only the family's common card order, with no claim that it is required.
12. **Seerah role-play (G3):** may children ever role-play unnamed people of Madinah, given that the Ansar were
    companions? The draft now uses narration, a map and objects only.
13. **Karamah (G6 unit and reading):** what approved wording handles Wali Songo karamah accounts within a
    historical-evidence lesson? The draft calls them passed-down traditions and says that Muslims of this tradition
    accept that Allah can grant karamah. That sentence needs scholar wording.
14. **Waking and bedtime duas (age 4–5):** what is the verified translation of *nushur* in English and Indonesian? Which
    form of the bedtime dua should be taught, "Bismika Allahumma amutu wa ahya" or "Bismika Allahumma ahya wa bismika
    amut"?
15. **Aqidah teaching aid (G1, G4):** may "everything we can picture has a size and a place, so it is created" be used?
    How should the divine name an-Nur be handled, given that "a light" is listed as a picture to avoid? Should the time
    wording ("before ... Allah existed", "sudah ada") be replaced, for example with "Allah ada tanpa permulaan"?
16. **Recitation (G4):** may a deliberately rushed pronunciation example be used? The draft limits it to everyday or
    Iqra' words, never Qur'anic words.
17. **Arabic orthography:** should stand-alone greeting and Alhamdulillah cards use hamzat al-wasl (ٱ) or a plain alif?
    Which transliteration convention should each language use?
18. **Creation of acts (age 3–4):** is "people make things" acceptable at this age, or should it become "people make
    things with what Allah created and the ability Allah gave"?
19. **Other points:**
    - Where should a child stand in family prayer (G2)?
    - How should the Hijri year be explained, given that it is counted from the year of the Hijrah but begins in
      Muharram (G3)?
    - Which exceptions to the ghibah prohibition (for example telling a grown-up) should older children hear (G5)?

## Review procedure
Record each answer with `pnpm content:religious-approve` (reviewer, source, edition, page). Only a qualified human may
mark a source `verified` or a `religiousReview` `approved`. The agent must not run either command.
