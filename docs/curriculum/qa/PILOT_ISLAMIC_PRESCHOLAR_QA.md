# Pilot Islamic drafts: pre-scholar consistency check (not scholarly approval)

**This is a pre-scholar consistency check. It is not scholarly approval.** It was written by an AI QA agent (G6), not a
scholar. Nothing here confirms that any teaching, Arabic text, translation or ruling is correct. Its only purpose is to
tidy the drafts in batch `expansion-pilot-islamic` before a qualified scholar sees them, so the scholar's time goes to
the questions that need a scholar. No content file was edited.

- **Scope:** 20 units (`content/units/*/islamic/unit-*.json`) and 10 readings
  (`content/readings/*/reading-*-islamic-*.json`).
- **Checked against:** `docs/curriculum/AGENT_BRIEF.md`, `docs/islamic/SOURCE_REGISTRY.md`,
  `docs/adr/0010-islamic-content-governance.md` and `packages/curriculum/src/units.ts`.
- **Date:** 2026-11-11.

## Severity scale
- **Blocker:** must be fixed before the scholar reviews the file (a fabricated citation, depiction, or self-approval).
- **Major:** a scholar of the stated framework would likely reject the wording, a contested point is presented as
  settled, or the file contradicts its own rules or misstates its review status.
- **Minor:** wording, consistency, safety detail or Indonesian polish.

## Summary
- **Blockers:** none found.
- **Majors:** 6, in 6 files:
  1. K wudu: the order of the steps is presented as settled, although schools differ on whether it is required.
  2. G3 Hijrah: children role-play the Ansar, who are themselves companions, against the unit's own no-role-play rule.
  3. G6 archipelago unit and reading: the Wali Songo miracle story (karamah) is framed in a way the framework may reject.
  4. Age 4–5 waking dua: *nushur* is translated as "return" rather than resurrection.
  5. G4 aqidah unit: it claims "scholar-approved" wording that has not yet been approved.
- **Minors:** listed for each file below.

### Global mechanical checks (all 30 files pass)
- **(1) No fabricated citations:**
  - No hadith text or number, no ayah number and no Qur'anic Arabic.
  - Surahs are named only. No pattern such as `n:n`, "Bukhari", "QS" or "narrated" appears.
  - No scholar is quoted. The only quoted figures are fictional (Ustaz Hasan, Ustazah Fatimah, Bu Guru) or family
    members.
  - *Al-Qawl al-Jaliyy* appears only as a `religious_text` source with `verification: "unverified"` (age3_4, g1 and g4
    aqidah units), with no page, edition or passage.
- **(2) No depiction:**
  - No sequence card, activity or image depicts Allah or any prophet, and no activity gives a prophet a voice.
  - Several units say explicitly not to draw Allah or the Prophet.
  - One role-play exception is noted under G3 Hijrah (it concerns companions, not prophets).
- **(4) Review state:**
  - Every file has `reviewStatus: "draft"`.
  - Every `religiousReview` has `approvalStatus: "unverified"`. All named fields are `null`: `doctrinalSchool`,
    `fiqhSchool`, `arabicSource`, `edition`, `pageOrSection`, `translationReviewer`, `scholarReviewer` and
    `reviewedAt`. Only `notes` holds text, and it contains questions for the reviewer, not answers.
  - `reviewFlags` is present and non-empty everywhere. Every file with Arabic carries `arabic_text`.
  - Every `arabicPhrases[].verified` is `false`.
  - Every source is `unverified` or `not_applicable`.
- **(5) Gentleness:** no fear-based language. There are no words for punishment, hell, sin or fear about Allah; the only
  "scared" or "marah" are wrong answer choices about story characters.
- **(7) History marked:** the G6 reading marks every historical claim `needs_source`. The G3 mosque reading uses
  `common_knowledge` for basic mosque facts, which is reasonable.

### Cross-cutting notes for the scholar
- **Places, direction and likeness:** the aqidah drafts (age3_4, g1, g4 unit and reading) are internally consistent with
  tanzih as described by the family:
  - Allah is not like creation.
  - Allah is not in a place and needs no place.
  - There is no "above the sky" or "far away" imagery, and no light or person comparison.
  - Nothing from creation is used as a proof or an analogy for Allah.

  No wording was found that attributes place, direction, body or likeness to Allah.
- **Uncertain words:** the drafts say "approved sentence" or "approved words" for sentences that are not approved yet
  (g1, g4). They should read "the sentence your teacher approves" until a scholar approves them.
- **Hamzat al-wasl:** the drafted Arabic for *Alhamdulillah* and the salam begins with hamzat al-wasl (ٱ), the Uthmani
  mushaf style. For stand-alone greeting cards, the reviewer may prefer a plain alif with fatha or hamza. This is a
  reviewer choice, not an error claim.

---

## Per-file findings

### content/units/age2_3/islamic/unit-age2_3-islamic-gentle-hands-kind-words.json
- **Minor:** `practice[0]` suggests stroking a cat with a toddler. The safety note covers pets in general, but it should
  name scratches and bites and hand-washing after touching an animal.
- **Minor:** the Islamic content is a single optional line ("Muslims try to be gentle and kind"). That is fine for the
  age; the scholar may want to add an approved line.
- **Question:** is the framing of gentleness as part of how the family practises its faith acceptable for ages 2–3?

### content/units/age2_3/islamic/unit-age2_3-islamic-thankful-for-water-and-plants.json
- **Minor (safety):** `practice[2]` ("pause at bath time to feel the water") needs the bath-specific rule: an adult
  within reach the whole time and shallow water. The current notes speak only of a cup of water.
- **Minor:** `extension[0]` mentions puddles. Add "only shallow puddles, adult holding hand", as the reading already does.
- **Question:** is "Alhamdulillah, thank you ya Allah for the water" acceptable toddler gratitude language?

### content/readings/age2_3/reading-age2_3-islamic-rain-on-the-leaves.json
- **Minor:** q3 (inference) has the answer "happy and curious". "Curious" is not supported by the text ("Adi smiles").
  Suggested fix: "happy".
- No other issues. The gratitude is gentle and the outdoor safety note is good.

### content/units/age3_4/islamic/unit-age3_4-islamic-allah-the-creator.json
- **Minor (safety):**
  - `practice[2]` ("bake together") has `hazards.heat: false` and no note.
  - The materials and practice mention wheat and eggs with `hazards.allergens: false`.
  - Suggested fix: add "an adult handles the oven; check allergies", or change the activity to a no-cook sandwich only.
- **Minor (safety):** the feather should be a clean craft feather, not one found outdoors (hygiene).
- **Minor (ID):** `parentInstructions[2]` in Indonesian reads "Jangan menggambar, menunjukkan, atau menggambarkan
  Allah". The English is "do not draw, show or describe any picture of Allah". Suggested fix: "Jangan menggambar atau
  menunjukkan gambar apa pun yang dimaksudkan sebagai Allah", matching the age2_3 wording.
- **Consistency:** the create/make distinction (menciptakan/membuat) is applied consistently, which is good. "Allah ...
  makes it grow" (menumbuhkannya) fits the framework's teaching that Allah alone creates.
- **Question:** in the Ash'ari teaching that Allah creates human acts too, is "people make things" acceptable at age 3?
  Should it become "people make things, with what Allah created and the ability Allah gave"?
- **Question:** is "Allah is not like anything" approved as the reply to "What does Allah look like?"

### content/units/age3_4/islamic/unit-age3_4-islamic-greeting-of-peace.json
- **Minor:** the meaning is worded "semoga keselamatan untukmu" in `parentInstructions[2]` but "Semoga keselamatan
  atasmu" in `arabicPhrases`. Unify the two.
- **Minor:** the English transliteration is "Assalamu alaikum / Wa alaikum assalam", while the Indonesian text uses
  "Assalamu'alaikum / Wa'alaikumussalam". This is acceptable, but the reviewer should fix one convention for each
  language.
- **Question:** confirm the wording of the longer greeting in `extension[0]`, and the Arabic orthography (see the
  hamzat al-wasl note above).

### content/readings/age3_4/reading-age3_4-islamic-salam-at-the-door.json
- No issues beyond the shared Arabic and transliteration verification. Salim is correctly framed as a family custom.

### content/units/age4_5/islamic/unit-age4_5-islamic-caring-for-the-mushaf.json
- **Minor (consistency and safety):**
  - `successCriteria[1]` says "my child returns the book to the high shelf".
  - `safety.notes[1]` says "an adult lifts the book down and the child carries it at floor level".
  - Suggested fix: "the child carries it to the adult, who places it on the high shelf".
- **Minor (fiqh consistency):** the `BOOK_LIKE_ANY_BOOK` remediation has the child set "the mushaf" on the stand. That
  goes beyond the unit's own rule that the teacher decides whether a child handles the mushaf. Suggested fix: "the
  mushaf or practice book, as your teacher advises".
- **Minor:** "Recite or play" a surah: playing audio on a device is fine, but say that the adult controls the device.
- **Question:** may a child of 4–5 touch the mushaf, with or without wudu, in the family's madhhab?

### content/units/age4_5/islamic/unit-age4_5-islamic-sleeping-and-waking-words.json
- **Major (translation):** the waking dua's *wa ilayhin-nushur* is translated "and to Him is the return" and "dan
  kepada-Nya kami kembali". *Nushur* is usually rendered as resurrection or being raised ("dan kepada-Nya kami akan
  dibangkitkan"), and "kembali" blurs it with a different phrase. Suggested fix: leave the meaning for the reviewer,
  or use the commonly taught Indonesian rendering once it is verified.
- **Minor (question of form):** the bedtime dua is drafted as "Bismika Allahumma amutu wa ahya". Many Indonesian
  families learn the form "Bismika Allahumma ahya wa bismika amut" (the order is reversed). The reviewer should choose
  the form; the AI must not decide it.
- **Minor (ID):** "Yuk bantu dia mengucapkan Bismillah?" mixes an invitation with a question mark. Suggested fix:
  "Yuk, kita bantu dia mengucapkan Bismillah."
- **Gentleness:** this is good overall. The child's part stays one word, and the "I die and I live" meaning is not
  pushed onto the child.
- **Question:** what explanation of "I die and I live" (sleep as a small death) suits four-year-olds, if any?

### content/readings/age4_5/reading-age4_5-islamic-the-special-shelf.json
- **Minor (continuity):** Raka's Iqra' book appears only in `text[4]`, after Ayah has taken down the mushaf. Mention it
  earlier, for example in `text[1]`: "Raka brings the rehal and his Iqra' book."
- **Minor (safety consistency):** Raka "puts it back on the special shelf" (a high shelf), while the offline activity
  says an adult lifts things from high places. Align with the unit fix above.
- **Question:** does the story's split (the father handles the mushaf, the child handles Iqra') match the family
  ruling?

### content/units/k/islamic/unit-k-islamic-steps-of-wudu.json
- **Major (madhhab presented as settled):**
  - The misconception code `ORDER_DOES_NOT_MATTER` and its description ("does the steps in any order") treat the order
    of the steps (*tartib*) as obligatory.
  - It is required in the Shafi'i and Hanbali schools but sunnah (recommended) in the Hanafi and Maliki schools.
  - The rest of the unit carefully defers to the madhhab, so this contradicts it.
  - Suggested fix: rename the code to something like `SKIPS_FAMILY_ORDER` and describe it as "does not yet follow our
    family's card order".
- **Minor:** the `MORE_WATER_CLEANER` remediation says "a whole dry-run wash ... with" a cup of water. "Dry run" and
  water contradict each other. Suggested fix: "a practice wash of hands and face using only this cup".
- **Minor (safety):** the `ORDER_DOES_NOT_MATTER` remediation has the child step on paper cards laid on the floor. Keep
  this away from the wet sink area to avoid slipping.
- **Minor:** intention (*niyyah*) and Bismillah are absent from the cards. The reviewer note already flags this, so it
  stays as the scholar's question.
- **Safety:** good overall. The water is never hot, a non-slip mat and sturdy stool are used, and an adult stays beside
  the child.
- **Question:** what is the family madhhab? Confirm which steps are required and their order, whether rinsing the mouth
  and nose and wiping the ears appear as their own cards, and whether to show steps done three times.

### content/readings/g1/reading-g1-islamic-wudu-with-kakek.json
- **Minor:** the vocabulary entry for wudu says "washing parts of the body". The head and ears are wiped, not washed.
  Suggested fix: "washing and wiping parts of the body in order before prayer" / "membasuh dan mengusap ...".
- **Minor (safety):** Fajar is pleased with "a little puddle" on the ground. That is fine outdoors in the yard; the
  safety note on wiping floors covers indoor use.
- **Question:** is listing ears as a separate step right for the family's practice?

### content/units/k/islamic/unit-k-islamic-al-amin-the-trustworthy.json
- **Minor:**
  - `parentInstructions[0]` says "before he became a prophet, Muhammad was..." without the honorific, although
    `parentInstructions[2]` asks parents to say it.
  - Suggested fix: add "(shallallahu 'alaihi wa sallam)" or "Nabi Muhammad" in the retelling itself.
- **Minor (safety):** the hair clip as a trust object: the safety note already covers choking when siblings are near.
- **Consistency:** no depiction. The rule against images of any prophet is stated, which is good.
- **Question:** confirm the retelling, including that people entrusted their belongings to him, and a seerah source.

### content/readings/k/reading-k-islamic-the-borrowed-crayon.json
- **Minor:** `text[3]` says "the Prophet was called al-Amin" with no honorific in either language. The reviewer note
  asks about this. Suggested fix: "Nabi Muhammad shallallahu 'alaihi wa sallam".
- **Minor (item 7):** the reading makes a seerah claim (the Prophet was called al-Amin) but has no `factChecks` entry.
  The claim is widely known, but add it as `needs_source` (or `common_knowledge` if the reviewer agrees) so it shows in
  the review queue.

### content/units/g1/islamic/unit-g1-islamic-creator-not-like-creation.json
- **Minor (status wording):**
  - `objective` reads "in approved simple words", and `mastery` reads "states the approved sentence".
  - Nothing is approved yet. Suggested fix: "in the simple words your teacher approves".
- **Minor (internal tension):**
  - `parentInstructions[2]` says not to use the objects as proof.
  - The `ALLAH_LIKE_CREATION` remediation reasons "everything we can picture has a size and a place, so it is
    created", which is an inference from the tray.
  - That inference is a common tanzih teaching aid. The scholar should confirm it is acceptable, or the instruction
    should be softened to "not as a comparison".
- **Question:** the misconception lists "a light" among wrong pictures of Allah, and the g4 unit does the same. How
  should a child who hears the divine name an-Nur be answered, in approved words?
- **Question:** is the toy-voiced prompt "Let's draw Allah!" in the role-play acceptable, or should the adult voice it?

### content/units/g1/islamic/unit-g1-islamic-letter-families-with-dots.json
- **Check:** the letter forms and dot rules are correct as drafted: ب has one dot below, ت two above, ث three above,
  ج a dot below or inside the curve, ح no dot, and خ one dot above.
- **Minor:** ح is glossed "a breathy h" / "h yang berdesah". This is imprecise (ح is pharyngeal) and the Indonesian
  sounds unnatural. Suggested fix: leave pronunciation to the teacher, or use "ha (dari tengah tenggorokan)" once it is
  verified.
- **Question:** which transliteration convention (tha/tsa, kha/kho) and which pronunciation model?

### content/units/g2/islamic/unit-g2-islamic-leaving-home-and-sneezing.json
- **Minor (consistency):** the reply is transliterated "Yahdikumullah wa yuslihu balakum" in English and in
  `arabicPhrases`, but "... wa yuslih balakum" in Indonesian `guidedExamples[1]`. Unify after review.
- **Minor:** `assessment[1]` says "Your brother" in English and "Kakakmu" (older sibling) in Indonesian. This is
  acceptable adaptation.
- **Question:** confirm each dua and the reply form the family wants.

### content/units/g2/islamic/unit-g2-islamic-salah-as-a-family-practice.json
- **Check:** the prayer times by the sun are described in general terms (Zuhur "after midday" is correctly placed after
  the sun's highest point).
- **Minor:** the child is told to "stand next to your grown-up". Where the child stands (beside or behind, and by
  gender) is a fiqh detail. The reviewer note flags it, and the child instruction should say "where your grown-up shows
  you".
- **Question:** what is the madhhab? Also confirm the ruling for a child who prays seated, and the Indonesian prayer
  names.

### content/readings/g2/reading-g2-islamic-a-plate-for-the-new-neighbours.json
- No issues. The allergy and accompaniment safety is good, and the Indonesian is natural.

### content/units/g3/islamic/unit-g3-islamic-good-neighbours.json
- No issues. The four-part framing is presented as a teaching aid, and the privacy rules (no addresses on the map) are
  good.

### content/units/g3/islamic/unit-g3-islamic-hijrah-and-the-welcome-in-madinah.json
- **Major (contradicts its own rule):**
  - `parentInstructions[2]` says "Do not draw or act the Prophet or his companions".
  - It then says "children act as 'people of Madinah' welcoming guests".
  - The Ansar, the people of Madinah who welcomed the Prophet, were themselves companions. The practice also has the
    child "walk the journey", which is close to role-playing the Muhajirun.
  - Suggested fix: children practise welcoming a new classmate (present day) and retell the Hijrah with a map and
    objects only. Or the scholar decides whether role-playing unnamed townspeople is acceptable.
- **Minor (likely confusion):** `extension[0]` links the Islamic New Year (1 Muharram) with the Hijrah. Children often
  assume the Hijrah happened on 1 Muharram. Add one clarifying line once the scholar or historian confirms the wording.
- **Minor:** the honorific appears once in English. Make sure the Indonesian has it consistently.
- **Question:** confirm the outline ("many in small groups", "many Ansar shared their homes") and give a seerah source.

### content/readings/g3/reading-g3-islamic-a-day-at-the-mosque.json
- **Minor:** "the adhan ... five times a day" is fine as common knowledge. Some communities also call a second adhan
  (for Fajr or Friday), and the scholar may want "at each of the five prayer times".
- **Minor:** q4 (critical) asks why rows are kept straight, with the answer "pray together in good order". This is a
  plain inference, which is fine. The scholar may prefer to replace it with an approved reason.
- **Question:** is leaving out who attends Friday prayer, and its rulings, acceptable for Grade 3?

### content/units/g4/islamic/unit-g4-islamic-a-daily-recitation-habit.json
- **Minor (sensitivity):**
  - `guidedExamples[1]` has the adult pronounce "a word" two ways, one deliberately rushed.
  - If the word is Qur'anic, deliberately mispronouncing it may be objectionable.
  - Suggested fix: "use an everyday Arabic word or a word from your Iqra' book, not a Qur'anic word, for the rushed
    example", or let the scholar choose.
- **Minor (ID):** "hitungan beruntun" for "streaks" is awkward. Suggested fix: "tanpa target atau hitungan hari".
- **Question:** what opening (isti'adhah, basmalah), reciter and tajwid convention should be used?

### content/units/g4/islamic/unit-g4-islamic-allah-exists-without-a-place.json
- **Major (status wording):**
  - `objective` says "Explains, in scholar-approved simple words".
  - `outcomes[2]` and `mastery` say "the approved words / approved belief sentences".
  - The sentences are not approved, and this is the most doctrinally sensitive unit in the batch.
  - Suggested fix: "the simple words your teacher approves", and keep `parentInstructions[0]` as it is (it correctly
    says the sentences are drafts).
- **Minor (wording on time):**
  - "Before Allah created anything ... Allah existed" and "Allah sudah ada" use time words about Allah.
  - In the framework, Allah is also not bound by time.
  - The scholar may prefer "Allah ada tanpa permulaan" or another approved phrasing for Grade 4.
- **Minor (ID):** the objective spells it "maujud" while the transliteration spells it "mawjud". Pick one after review.
- **Framework consistency:**
  - Good overall: there is no place, direction, body or likeness wording.
  - "Something above the sky" is explicitly listed as a picture to avoid.
  - Respect for other Muslims is stated.
  - The approach is consistent with the g1 prerequisite.
- **Contested point handled honestly:**
  - "Allah exists without a place" is taught as the family's tradition, with an instruction not to criticise others.
  - It is not presented as agreed by all Muslims. This is correct.
  - The scholar should still approve the answer for a child who has heard the "Where is Allah?" narration, or other
    explanations, elsewhere (registry Q4).
- **Question:** what textual basis should be recorded for D1 and D4, and which Arabic for "Allah mawjud bila makan"?

### content/readings/g4/reading-g4-islamic-the-question-at-the-window.json
- **Minor:** q3 distractors include "Allah lives far away in the sky". It is presented as a wrong answer from the
  story's frame. The reviewer note already asks whether this is respectful enough toward other Muslims; keep that
  question.
- **Minor:** `arabicPhrases` lists "Allah mawjud bila makan", but the phrase never appears in the text. Either add it to
  `text[5]` after review, or remove it from the reading.
- **Minor:** the astronomy link (stars are easier to see without street lights) is fine and needs no factCheck in
  fiction.
- **Framework consistency:** good. Mama does not use the stars as a proof or analogy, and she defers to the Ustazah.

### content/units/g5/islamic/unit-g5-islamic-ashari-and-maturidi-scholars.json
- **Historical claims:** the outline (al-Ash'ari with Basra and Baghdad, al-Maturidi with Samarqand, roughly the 3rd to
  4th Islamic centuries) is consistent with the registry (H1) and carefully hedged ("linked with", "roughly"). There is
  no quotation, and the source card exercise is good practice.
- **Minor:** "why many Sunni Muslims follow their explanations": some Sunni Muslims (for example the Athari) do not
  identify as Ash'ari or Maturidi. `parentInstructions[2]` covers this respectfully. Keep "many", not "all".
- **Question:** confirm the description "explained Sunni belief using the Qur'an, the Sunnah and careful reasoning". Is
  there a verified children's text?

### content/units/g5/islamic/unit-g5-islamic-truthful-words-online.json
- No issues beyond the reviewer's existing notes. The ghibah definition ("hurtful about a person when they are not
  there, even if true") is consistent between this unit and the g5 reading. The online safety rules are good.
- **Question:** which exceptions to the prohibition on ghibah (for example warning a teacher, or asking for help)
  should older children hear, so that "tell a grown-up" is not felt as backbiting?

### content/readings/g5/reading-g5-islamic-the-message-that-waited.json
- **Minor:** the forwarded photo of a child is also a privacy and safety issue, beyond ghibah. One line in
  `discussionPrompts` or `safetyNotes` should say that photos of others must not be shared without permission.
- The teaching is attributed to a fictional Ustaz, which is not a fabricated quotation from a real scholar.

### content/units/g6/islamic/unit-g6-islamic-gratitude-into-service.json
- **Minor:** "Our teachers describe gratitude with the heart, the tongue and actions": attributing it to "our teachers"
  is acceptable, but it must stay unquoted. Confirm this framing (registry T1).
- **Safety:** good. Projects are done with a grown-up, and cleaning uses mild products.

### content/units/g6/islamic/unit-g6-islamic-islam-in-the-archipelago.json
- **Major (framework sensitivity):**
  - The legend card "A wali flew across the sea" is used as the model of legend and labelled "not evidence of how
    Islam spread".
  - Ahl al-Sunnah, Ash'ari and Maturidi, affirm the karamat (miracles) of the awliya' in principle.
  - A scholar of this framework would likely object if the lesson implies that such stories are false by nature,
    rather than "not documented by historical sources".
  - Suggested fix: change the example to a non-miraculous legend detail, or reword to: "This is a story of a karamah
    told about a respected figure. Muslims of our tradition accept that Allah can grant karamah; whether this
    particular event happened is not shown by historical records, so historians list it as a story." The scholar
    approves the final wording.
- **Minor:** `assessment[0].explanation` calls the spread "gradual, peaceful" outright, while the reading hedges
  ("mostly peacefully"). Align on "mostly peaceful". The historical claims are unverified; the unit has no `factChecks`
  field, so the reviewer should treat its claim cards as `needs_source`, as the reading does.
- **Minor:** the claim cards about a Sumatran gravestone and a traveller's account are unsourced and correctly marked
  "to be checked". Keep them generic until a historian supplies sources.
- **Question:** what respectful framing of the Wali Songo should be used, including karamah stories?

### content/readings/g6/reading-g6-islamic-many-roads-to-the-archipelago.json
- **Major (same issue as the unit, milder):** `text[5]` and `text[6]` say "some of these stories ... have grown into
  legend" and "what really happened". Combined with the unit, this frames Wali Songo stories as history or legend only,
  with no room for karamah as the tradition understands it. The scholar should approve the wording.
- **Check:** all 7 claims are marked `needs_source`, which is correct. The Indonesian ("hikayat atau babad", "Nusantara")
  is natural.
- **Minor:** q4 says "In paragraph 5", meaning `text[4]` counted from 1. That is fine if the app numbers from 1;
  confirm against how readings display paragraph numbers.

---

## Indonesian terms (item 6), batch-wide
The common terms are used correctly and consistently:
- Islamic terms: akidah, wudu/berwudu, salat, sajadah, kiblat, azan, mengaji, mushaf, rehal, Iqra', Ustaz/Ustazah.
- Prayer names: Subuh, Zuhur, Asar, Maghrib, Isya.
- Seerah and theology: Hijriah, Muhajirin, Ansar, Asy'ari, Samarkand, amanah, tawakal, ghibah, niat.

Minor points:
- KBBI spells *gibah*; *ghibah* is common and acceptable.
- *Ansar* and *Anshar* are both used in Indonesian.
- The honorific is written in Latin letters ("shallallahu 'alaihi wa sallam"). The reviewer may prefer an abbreviation
  convention, but it should be used consistently in every seerah file.

## Open questions for the scholar (consolidated, beyond SOURCE_REGISTRY §7)
1. Wudu (K): may the cards treat the order of the steps as required, or should they stay neutral between madhhabs?
2. Seerah role-play (G3): may children role-play unnamed people of Madinah, given that the Ansar were companions?
3. Karamah (G6): what approved wording handles Wali Songo karamah stories within a historical-evidence lesson?
4. Waking dua (age 4–5): what is the verified translation of *nushur* in English and Indonesian? And which form of the
   bedtime dua should be taught?
5. Aqidah (G1, G4): may "everything we can picture has a size and a place, so it is created" be used as a teaching
   aid? How should the name an-Nur be handled? And should the "before/existed" (sudah ada) time wording be replaced?
6. Recitation (G4): may a deliberately rushed pronunciation example be used, and with which kind of word?
7. Arabic orthography: should stand-alone greeting and Alhamdulillah cards use hamzat al-wasl (ٱ) or a plain alif?
