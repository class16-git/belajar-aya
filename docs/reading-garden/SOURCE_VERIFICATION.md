# Reading Garden — source and title verification log (2026-11-10)

Method: the agent requested network access to the provider hosts (a personal environment allowing exactly those
hosts, approved by the owner), fetched public pages with plain HTTP into an isolated folder, and recorded exact
quotes. Nothing was downloaded for redistribution; no book content, text or images were copied into Atlas.
Anything not readable this way stays `verification_required` — rights were never assumed.

| Source | Result | What was verified | Titles listed |
|---|---|---|---|
| Book Dash (bookdash.org) | **Source policy verified** | Open-content-partners page: "We publish all of our books under a Creative Commons CC BY 4.0 license … as long as they acknowledge Book Dash and the original creators." Also stated on /what-we-do/how-we-do-it/. Title pages read for 12 books: title, blurb, credits, ISBN, languages listed. **Title pages show no licence line**; the ebook imprint download needs a browser, so the title-level licence is *not confirmed* | 12, link-only |
| StoryWeaver (storyweaver.org.in) | verification required | Reachable. Terms page is rendered by the browser app; the public story API has no licence field; the reader needs a login | 0 |
| Let's Read (letsreadasia.org) | verification required | Browser-only app; its data host was not reachable | 0 |
| Literacy Cloud (literacycloud.org) | verification required | Browser-only app (Room to Read); terms not readable | 0 |
| SIBI / Buku Kemendikdasmen | unreachable | Host could not be reached from the agent environment | 0 |
| Unite for Literacy, Oxford Owl, ICDL, "Booktime" | verification required | Not checked (not in the allowed host list; Booktime's exact site is unknown) | 0 |

## What a human needs to do (in a normal browser)
1. **Book Dash:** open each title's ebook and read the imprint page. If it shows CC BY 4.0, add that page as
   evidence, set `titleLicenseConfirmed: true` and `rights.status: OPEN_LICENSE_VERIFIED`. Keep `external_link`
   unless Atlas should host the book (that is a separate Phase 3 decision).
2. **Let's Read and StoryWeaver** (best sources for Bahasa Indonesia): read the terms, then pick titles and record
   per-title licence evidence; add their hosts to the source's `allowedHosts` only after that.
3. **SIBI:** confirm the current URL and licence (many SIBI books state a CC licence in the book itself).
4. For each book, open the link, check it is the intended child-appropriate page, then
   `pnpm library:approve -- --reviewer "<initials>" --role parent --link-checked <book ids>`.
