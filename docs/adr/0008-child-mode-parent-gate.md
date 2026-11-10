# ADR-0008: Child mode as a server-side session lock with a parent PIN
Status: accepted

Entering child mode stores `childModeChildId` on the server session. While set, every parent page redirects to
`/learn`, every parent API returns 403 `PARENT_GATE` (including sign-out and language change, to prevent bypass),
and learning APIs are scoped to that one child. Leaving requires the parent PIN (scrypt-hashed, 5 tries / 10 min
per session, failures audited). Setting a PIN requires the account password. Toddler/under-3 profiles cannot enter
child mode at all (offline only).
