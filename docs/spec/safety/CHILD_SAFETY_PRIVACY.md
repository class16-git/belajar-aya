# Child safety, privacy and parental controls

## Non-negotiables
- No advertising, social feed, public child profiles, direct messaging, open web browsing or unmoderated AI chat.
- Parent creates accounts and consents to child profile data processing.
- Collect only necessary data: nickname, broad developmental band, progress and optional parent observations. Do not require full legal name, exact birthdate, location, school name or photo.
- No behavioral manipulation: infinite scrolling, scarcity nudges, shame-based rewards or compulsory streaks.
- Age 2.5 experience defaults to caregiver-led offline activities. Any on-screen use is brief, optional and supervised.
- Child must not see parent account settings, billing, exports, raw analytics or other profiles without authorization.

## Legal/compliance review before launch
Assess applicable Indonesian Personal Data Protection Law and any other jurisdictions where users live, as well as COPPA if the product is offered to children in the United States. Have counsel review consent, privacy notice, data processing agreements, retention, breach response and cross-border transfers. This document is not legal advice.

## Data lifecycle
- Consent captured with policy version and timestamp.
- Export all child progress in machine-readable format.
- Parent can delete child/family; delete primary data and define backup expiry SLA.
- Default short retention for operational logs; do not send child content to generic analytics or AI training.
- Publish simple parent-facing data inventory and AI-provider disclosure.

## Content and physical safety
- Toddler activity cards flag choking hazards, sharp tools, hot water, allergens and supervision requirements.
- Avoid small loose manipulatives for children under 3 unless age-appropriate and specifically supervised; prefer large safe objects.
- Never imply developmental diagnosis or guarantee academic outcomes.
- Accessible contrast, reduced motion, captions, audio alternatives, adjustable pacing and no speed pressure.

## Threat model checklist
- Unauthorized family data access (IDOR).
- Child bypasses parent gate.
- Malicious curriculum JSON / XSS.
- Prompt injection via authored content or notes.
- AI leaks personal data or invents unsafe activities.
- Excessive telemetry and unauthorized data sharing.
- Dependency compromise and exposed credentials.

## Launch gate
Parent consent, deletion/export, role separation, secure secrets, incident response owner, content review, age-specific safety review and penetration test must be complete before inviting external families.
