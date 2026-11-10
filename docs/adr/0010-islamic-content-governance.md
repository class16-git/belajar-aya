# ADR-0010: Islamic content governance — independent religious review gate
Status: accepted (2026-11-10)

**Context.** The family selected Ahl al-Sunnah wa al-Jama'ah (Ash'ari–Maturidi) with the Shaykh Abdullah al-Harari
reference framework. The bible forbids fabricated verses, hadith, quotations, citations or rulings, and requires qualified
scholar review of doctrine, Arabic wording, translation and fiqh.

**Decision.**
- Any lesson in `islamic_studies`, or containing `arabicPhrases`, or flagged `religious_content`, requires a
  `religiousReview` record (`doctrinalSchool, fiqhSchool, arabicSource, edition, pageOrSection, translationReviewer,
  scholarReviewer, reviewedAt, approvalStatus`). Unknown fields stay `null` — never invented.
- Such lessons are invisible to children in every environment (including preview) until `approvalStatus = approved` with
  a scholar reviewer and date, a translation reviewer when Arabic is shown, and every Arabic phrase verified — **and** the
  normal human content approval.
- Validation fails if religious content is anything but `draft` without that approval, so the agent cannot advance it.
- `pnpm content:religious-approve` records the human review (scholar/translator initials and source details from the
  reviewer). `pnpm content:approve` refuses religious content without it. The agent must never run either for the owner.
- Child-facing open theological Q&A is out of scope; the safe fallback is "Let's ask your parent or teacher together."

**Open owner decisions.** Default madhhab; verified edition of *al-Qawl al-Jaliyy* (title/author unverified); the
qualified reviewer; recitation/tajwid convention.
