# Book Catalog, Rights, and Security Architecture

## Data entities (suggested; adapt to actual Prisma schema)
`BookSource`: id, name, canonicalUrl, sourcePolicyUrl?, status, lastVerifiedAt, reviewerId.
`BookEdition`: id, sourceId, externalId?, title, creators[], language, synopsisOriginal, coverUrl?, ageMin?, ageMax?, readingLevel?, tags[], sourcePageUrl, accessMode, rightsStatus, licenseId?, licenseUrl?, attributionText?, redistributionAllowed?, adaptationAllowed?, commercialUseAllowed?, offlineAllowed?, expiryAt?, rightsEvidenceRef?, checkedAt, reviewerId, publicationStatus.
`ReadingEvent`: id, familyId, childId, bookEditionId, eventType, observedAt, parentAssisted?, comprehensionRubric?, createdAt. Avoid storing full text or recordings.
`ReadingCollection`: id, familyId?, title, visibility, reviewedBookEditionIds[].
`BookReview`: bookEditionId, reviewerRole, checklistVersion, verdict, timestamp, rationaleCode. Keep reviewer notes free of child personal information.

## Server boundaries
- Family and child authorization on *every* reading-event route; child-mode cannot view parent notes, change publication status or fetch other families' reading histories.
- Server validates reading-level and approval eligibility. Client-supplied scores never update mastery directly.
- External redirects only to reviewed HTTPS domains; no open redirects, URL query injection, or automatic forwarding to unknown domains. Use a parent gate for toddler navigation.
- Provider embeds off by default; if enabled, document provider permission, CSP/frame restrictions, sandbox flags, cookie behavior, tracking exposure and consent.
- Hosted assets only from approved per-title licenses; protect upload pipeline from malicious files and oversized media. No external image hotlink without provider permission and privacy assessment.
- Third-party website behavior is outside Atlas control: disclose this to parents; prefer links over iframe for uncertain providers.
- Never put learner identity, DOB, email, notes, or session tokens in external URLs, AI prompts, logs, analytics, or attribution records.
- All imports are idempotent, reviewable and auditable. Publication must fail closed in production, independent of preview configuration.

## Rights decisions
`UNKNOWN` → link to source only after URL/safety review; do not copy cover/content without permission.
`READ_ONLY` → link; no hosting, adaptation, narration, or embedding unless separately authorized.
`OPEN_LICENSE_VERIFIED` → obey exact per-title license and attribution; check derivatives, share-alike, noncommercial, and jurisdictional restrictions.
`DIRECT_PERMISSION` → store grant evidence, scope, expiry and revocation process.
`PUBLIC_DOMAIN_VERIFIED` → record jurisdiction and edition-specific rights (illustrations/translations may differ).

## Content ingestion workflow
Discover candidate → verify source legitimacy → verify title and access → collect minimal metadata → review rights and suitability → map learning objectives → human editorial approval → publish → scheduled link/rights recheck → unpublish if withdrawn.

## Migration and deployment
Do not run catalog seeding, rights migration or external fetches as side effects of production builds. Migrations must be explicitly gated and non-destructive. Seed only synthetic catalog fixtures in isolated preview/test databases.
