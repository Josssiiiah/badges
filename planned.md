Title: Verify via Badge Invite — Implementation Plan

Context
- Current: Admin assigns badge -> student gets magic-link email -> clicking “Create Account” opens `/create-account?assignmentId=...` -> student sets password -> frontend sends a verification email and redirects to public badge.
- Goal: Mark the user as verified as soon as they arrive via the secure invite link. Remove the redundant verification email. Preserve redirect to the public badge after password set.

Summary of Changes
- Verify on invite redemption: When `/create-account` loads and the session is present, immediately mark `emailVerified = true` for that user.
- Remove redundant email: Skip sending the verification email in the account-creation submit path.
- Keep the same UX: Students still set a password and are then routed to their public badge page.

Backend Changes
- None required for verification. Better Auth’s magic link verification endpoint already sets `emailVerified=true` for new or existing users and creates the session before redirecting to the provided `callbackURL`.
  - Verified by reviewing `node_modules/better-auth/dist/plugins/magic-link/index.mjs` where `magicLinkVerify`:
    - Creates user with `{ emailVerified: true }` if new.
    - Updates existing user to `{ emailVerified: true }` if not verified.
    - Creates session and redirects to `callbackURL`.
  - Our config forwards `/api/auth/magic-link/verify` correctly and `trustedOrigins` include the frontend origin.

Frontend Changes
1) Create Account page: `frontend/src/routes/create-account.tsx`
   - Remove redundant verification flow: delete calls to `api/users/mark-unverified` and `api/auth/send-verification-email` from the submit handler.
   - Copy: Update description to remove the “You’ll receive an email to verify your address.” text. Optionally add a note: “Your email is verified via this secure link.”
   - Keep: Set password, update name (if changed), then navigate to `/badges/:assignmentId`.

Email/Invite Flow
- Continue sending the magic link via `POST /api/auth/sign-in/magic-link` with `callbackURL` → `/create-account?assignmentId=...` from `badges.assign-by-email`.
- Password vs. verification for CTA/redirect:
  - If the user already has a password account (row in `account` with a non-null password), set `callbackURL` to `/badges/:id?existing=1` and show “View badge”.
  - Otherwise, set `callbackURL` to `/create-account?assignmentId=:id` and show “Create Account” — even if the magic link will verify their email — so they can set a password and be able to sign in later.
- Optional: Tweak email copy in `backend/src/services/email.ts` to reflect “Your email is verified when you use this link.” (not required for functionality).

Security Considerations
- Single-use, expiring tokens: Provided by Better Auth magic link plugin (24h). Keep as-is or adjust config if needed.
- Scope binding: Link includes `assignmentId` and is sent to the intended address; session is created only upon successful magic link verification.
- Rate limiting/logging: Already constrained by Better Auth; we’re adding a simple verification log entry.

Edge Cases & Behavior
- Existing account, already verified: `mark-verified` becomes a no-op.
- Existing account, unverified: Will be verified on landing.
- Expired/invalid link: No session; `/create-account` shows “expired link” message (already implemented).
- Public badge page: Unchanged; remains accessible via `/badges/:badgeId`.

Exact File Touch List
- Add: `backend/src/routes/users.ts` — append new handler `POST /users/mark-verified`.
- Edit: `frontend/src/routes/create-account.tsx` —
  - Add `mark-verified` call in `useEffect` when session is present and unverified.
  - Remove mark-unverified + send-verification-email in submit handler.
  - Adjust page copy.

Validation Plan
- Manual: Assign badge by email → open email → click Create Account.
  - Observe: On landing, magic link verification sets `emailVerified = true` and creates a session (no manual API call needed).
  - Set password → redirected to `/badges/:assignmentId`.
  - Re-test normal email/password signup still requires verification (unchanged by this feature).

Rollout Notes
- No DB migrations required.
- Backwards compatible: If old email copy mentions verification, it won’t break flow; just slightly inconsistent wording until updated.
