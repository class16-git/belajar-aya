# Atlas Reading Garden — Digital Library Product Bible v3

## Mission and scope
Add a first-class **Reading Garden** to Atlas for toddler through Grade 6, integrated with the existing Montessori, Singapore Math, STEM/robotics, and Islamic curriculum. This is a product requirement, not evidence that any third-party catalog is licensed or integrated. Build from existing `main` and preserve current safety, review and publication controls.

## Personas and developmental progression
| Stage | Reading experience | Evidence of learning |
|---|---|---|
| 2–3 | Parent-operated picture-book discovery, naming objects, pointing, sounds, 3–5 minute shared reading; no independent screen-time target | Parent-observed engagement, words noticed, real-world object matching |
| 3–4 | Picture walk, oral storytelling, rhymes, phonological awareness, sequencing 2–3 pictures | Oral retell and parent observation |
| 4–5 | Letter-sound relationships, rhyming, vocabulary, story prediction, tactile letter extensions | Phonemic awareness and story comprehension |
| 5–6 / KG | Decodable texts where suitable, blending, high-frequency words, reading aloud with support | Decoding separated from listening comprehension |
| Grade 1 | Early independent readers, phonics, vocabulary, literal/inferential questions | Accuracy, independent retell, comprehension and review |
| Grade 2 | Reading stamina, narrative/informational distinction, main idea, simple research | Summaries, evidence from text |
| Grade 3 | Fluency, inference, compare texts, information literacy | Explain answers with passages |
| Grade 4 | Multi-paragraph analysis, science/history texts, author intent | Source-based responses |
| Grade 5 | Synthesis across sources, bias awareness, longer independent reading | Claims supported by text |
| Grade 6 | Critical reading, argument, media literacy, research and citation | Evidence quality, synthesis and reflection |

Reading level is distinct from chronological age, grade, and school placement. Recompute age using the existing timezone-aware engine; do not overwrite measured proficiency or force automatic grade promotion.

## User journeys
**Parent:** open Library → select learner → choose language/level/topic/source → inspect rights and age suitability → launch approved external link or in-app licensed reader → optional discussion prompts → record offline activity and observations. Parent can hide titles, disable external navigation, delete reading history, and approve reading goals.

**Child:** curated, reviewed shelves; accessible covers; no ads or third-party tracking inside Atlas; for external sites, show a parent gate and clear domain transition. A toddler should not navigate off-site independently. A Grade 1 learner can choose among parent-approved titles. Never silently open an external page within a privileged authenticated frame.

## Feature requirements
- Book discovery, curated shelves, filters for language, topic, age suitability, *reading ability*, source, availability, rights and approval state.
- Book detail page with author, illustrator, publisher, source, attribution, language, reading level, rights, and accessibility information.
- Three strictly separate access modes: `external_link` (default), `provider_embed` (verified permission and security review), `atlas_hosted` (verified per-title reuse rights and required attribution).
- No scraping, copying PDFs, bulk ingest, bypassing access restrictions or uploading provider content to AI without verified rights.
- Offline Montessori extensions: object-to-picture matching, movable alphabet, storytelling baskets, nature walks, book-inspired practical-life tasks.
- Singapore Math extensions: only when appropriate to the story, e.g. counting objects or comparing quantities; avoid turning every book into a worksheet.
- Robotics/STEM extensions: design prompts inspired by book concepts, using original Atlas wording, not copied text.
- Islamic reading shelf: original or rights-cleared books with separate scholarly review of aqidah, fiqh, Arabic quotations and attribution; preserve the specified Ash'ari–Maturidi orientation; no automatic doctrinal publication.
- Comprehension supports oral retell, parent notes, short age-appropriate questions and independent comprehension; AI-generated questions remain drafts pending editorial review.
- Reading history: book ID, reading event, approximate duration optional, comprehension evidence and parent observations; avoid raw audio/video recordings and free-text PII by default.
- Accessibility: keyboard, focus, screen reader labels, readable contrast, dyslexia-friendly options without claiming a cure, narration only when licensed, captions/transcripts where relevant.
- Bilingual UI (Indonesian and English); do not assume each book is available in both languages.

## UI/UX reference bar
Use Synthesis for interaction clarity, KooBits for scaffolded Singapore Math, Khan Academy Kids for intuitive reading progression, and BabyBus for age-appropriate delight. Do not copy copyrighted art, layouts, characters or animations. Visual review on tablet/mobile with toddler and Grade 1 flows; ensure reduced-motion support and no dark patterns or engagement-maximizing streaks.

## Release gating
Books have `discovered → rights_pending → metadata_reviewed → educational_reviewed → published` states. External links also need link safety and age review. `rights_pending` cannot be displayed as an Atlas-hosted book. A source-level open license never substitutes for checking title-level metadata. Revoked content must be removable promptly; store audit events without child PII. Parent approval and educator/scholarly approval are distinct.

## Product analytics
Measure discovery-to-reading-start, parent-assisted completion, comprehension evidence quality, repeat voluntary reading, book diversity by language/topic, broken-link rate, rights-verified coverage, accessible flows and safety violations. Do **not** optimize for screen minutes or compare siblings publicly. Aggregate only with privacy-preserving, minimum-necessary data.
