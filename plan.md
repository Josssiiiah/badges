# Feature Plan: Badge Assignment → Magic-Link Account Creation → Public Badge Redirect

## Summary
- Goal: When a admin assigns a badge to an existing student, send an email that lands on a Create Account page (name, prefilled email, password, confirm). On submit, send email verification and redirect to the student’s public badge URL with a toast prompting verification.
- Approach: Reuse Better Auth’s magic link to authenticate the invite, add a dedicated Create Account route to set password while logged in, then redirect to the public badge page. No new DB tables required.

## Current System (what’s relevant)
- Backend: Bun + Elysia, Drizzle (SQLite), Better Auth (email/password + magic link, verification), Resend email service.
- Frontend: Vite + React + TanStack Router. Public badge page at `/badges/:badgeId` already exists.
- Students: created via `students.create`, often with a minimal Better Auth `user` provisioned (no password, `emailVerified=false`).
- Badge assignment: endpoints in `backend/src/routes/badges.ts` including `/assign` and `/assign-by-email`.

## Proposed Flow
1. Admin assigns a badge to a student (by email or student id).
2. Backend creates/ensures the badge assignment and emails a secure invite link to `/create-account?assignmentId=...`.
   - The invite link establishes identity under the hood (via Better Auth) but lands on a friendly Create Account page (not an auth UI).
3. Student clicks the link → redirected to `/create-account?assignmentId=...`.
4. Create Account page shows: name, prefilled email (read-only), password, confirm password, and a preview of the badge (fetched by `assignmentId`). On submit:
   - Set/update password for the logged-in user.
   - Optionally update name.
   - Trigger verification email.
   - Immediately redirect to the public badge URL: `/badges/:assignmentId?verifyNotice=1`.
5. Public badge page shows the badge and a toast: “We sent a confirmation email. Confirm to view or modify your badge.”

## Backend Changes
- `backend/src/auth/index.ts`
  - Invite link handler: preserve an incoming `callbackURL` query param if present; only default to `FRONTEND_URL + '/'` when not provided.
  - Rationale: `/assign-by-email` will request an invite that lands on `/create-account?assignmentId=...`.

- `backend/src/routes/badges.ts`
  - After creating the assignment, build `callbackURL = FRONTEND_URL + '/create-account?assignmentId=' + assignment.id`.
  - Call `POST /api/auth/sign-in/magic-link` with `{ email, callbackURL }` to send the invite. This is a secure invite link that lands on the Create Account form.
  - The public badge URL is deterministic from the assignment ID: `/badges/:assignmentId`. No need to encode the full badge URL or image in the email.

- `backend/src/services/email.ts`
  - Optional: adjust `sendMagicLinkEmail` copy to emphasize “Create your account to view your badge” and mention the next-step redirect.

Notes
- No new tables required; we leverage Better Auth’s magic-link flow for auth and our own page for password setup.
- Avoids writing our own password hashing or token flows.

## Frontend Changes
- New route: `frontend/src/routes/create-account.tsx` (friendly, requires no manual sign-in)
  - Reads `assignmentId` from the query string and constructs the public badge URL as `/badges/${assignmentId}`.
  - Uses `authClient.useSession()`; if the secure invite session is missing/expired, show an error with a CTA to request a new link.
  - Displays form: name, email (prefilled and read-only), password, confirm.
  - Badge preview: fetch `/api/badges/:assignmentId` on load to get `name`, `issuedBy`, and `imageData` (avoids putting large image URLs in the email).
  - On submit:
    - Call `/api/auth/set-password` with the new password.
    - Optionally call `/api/auth/update-user` to persist name if changed.
    - Call `/api/auth/send-verification-email`.
    - Immediately navigate to `/badges/${assignmentId}?verifyNotice=1`.

- Update `frontend/src/routes/badges.$badgeId.tsx`
  - If `verifyNotice=1` in the query string, show a toast that a verification email was sent and is required to manage or modify the badge.

- Navigation and route guards
  - `__root.tsx`: hide Dashboard/Profile/Admin links unless `emailVerified`.
  - `dashboard.tsx`, `profile.tsx`: if unverified, show a verification prompt with a "Resend verification email" action.
  - `admin.tsx`: require both admin role and verified; otherwise show verify prompt.

## Security & UX
- Magic links expire in 24h (already configured).
- Password never sent via email; only set over authenticated session initiated by magic link.
- Public badge page remains viewable without login; verification is only needed for managing the badge/profile.
 - Email verification gating: private routes and APIs require `emailVerified === true`.

## Edge Cases
- Invite link expired: `/create-account` detects no session → show “Link expired” and give a way to request a new link or contact support.
- Assignment missing/invalid ID: show friendly error and a CTA to dashboard/home.
- User already has a password: still allow landing on the page; show “You’re all set” and link directly to `/badges/:assignmentId`.

## Implementation Steps
1. Backend: auth callback respect
   - Modify `backend/src/auth/index.ts` magic link `sendMagicLink` to preserve an existing `callbackURL` param.
2. Backend: send invite on assignment
   - In `/badges/assign-by-email`, after creating the assignment, POST to `POST /api/auth/sign-in/magic-link` with `{ email, callbackURL: FRONTEND_URL + '/create-account?assignmentId=' + assignment.id }`.
3. Email content
   - Adjust copy in `sendMagicLinkEmail` to reference “Create your account to view your badge”.
4. Frontend: create account page
   - Add `frontend/src/routes/create-account.tsx` with the form + calls to `set-password`, `update-user`, `send-verification-email`, then redirect.
5. Frontend: badge page toast
   - Read `verifyNotice` query param and show the toast accordingly.
6. QA
   - Assign to student without an existing password; open email, follow link; set password; see verification toast on badge page.
   - Repeat for a student who already has a password (ensure graceful handling).
   - Test expired/invalid links.

## File-by-File Checklist
- backend/src/auth/index.ts: preserve `callbackURL` for invite redirects.
- backend/src/routes/badges.ts: after assignment, send invite link with `assignmentId` callback.
- backend/src/services/email.ts: adjust invite email copy (optional).
- frontend/src/routes/create-account.tsx: new page, fetch badge preview by `assignmentId`, submit + redirect.
- frontend/src/routes/badges.$badgeId.tsx: toast on `verifyNotice=1`.
 - frontend/src/routes/__root.tsx: nav hides private routes unless verified.
 - frontend/src/routes/dashboard.tsx, profile.tsx, admin.tsx: guard UI for unverified.

## Backend: Verified Access Controls
- `backend/src/routes/users.ts`: return 403 if `!emailVerified`.
- `backend/src/routes/badges.ts`: require `emailVerified` for non-public endpoints (`/usage/:id`, `/all`, `/user/:id`, `/assign*`, create/update/delete template).
- `backend/src/routes/students.ts`: require `emailVerified` for all authenticated endpoints.
- `backend/src/routes/organizations.ts`: require `emailVerified` for authenticated endpoints.

## Config
- ENV already used:
  - `BETTER_AUTH_URL` (backend), `VITE_BETTER_AUTH_URL` (frontend)
  - `FRONTEND_URL`, `VITE_FRONTEND_URL`
  - `RESEND_API_KEY`, `RESEND_FROM`
  - No new env vars needed.

## Out of Scope (for now)
- Bulk invitations and throttling policies.
- Multi-badge onboarding flows.
- Changing the student auto-provisioning behavior; the plan works with or without it.

---

## Implementation Plan: Create Account Page

- Route and access
  - Add `frontend/src/routes/create-account.tsx` as a public-friendly page reached via secure invite link.
  - Read `assignmentId` from `?assignmentId=...` in the URL.
  - Require a valid session (from the invite link). If missing/expired, show an error prompt to request a new link.

- Prefill and preview
  - Prefill email and name from `authClient.useSession()`.
  - Fetch badge preview via `GET /api/badges/:assignmentId` to display badge image/name/issuer.

- Submission
  - Validate password and confirmation client-side (min length, match).
  - Call `POST /api/auth/set-password` to set the user’s password.
  - If name changed, call `POST /api/auth/update-user` with `{ name }`.
  - Call `POST /api/auth/send-verification-email` to send verification.
  - Redirect to `/badges/:assignmentId?verifyNotice=1` to show the toast.

- Edge cases
  - Session missing → show “Link expired/invalid”.
  - Assignment missing/invalid → render a helpful message (badge preview will silently fail; still allow password setup).
  - Existing password → still allow flow, or copy could say you’re already set; redirect button to badge.

---

## Email Sending Strategy (Multiple Badges, Existing Accounts)

- Goals
  - Avoid prompting “create account” for users who already have one.
  - Support multiple badge assignments gracefully.
  - Provide the right email content based on the recipient’s account status.

- Decision matrix
  - Case A: User exists and has password (active account)
    - Send “You’ve been awarded a new badge” email.
    - Include a CTA to view badge at `/badges/:assignmentId` and a secondary link to log in.
    - Do NOT send the Create Account invite link.
  - Case B: User exists but has no password (provisioned/minimal)
    - Send the secure invite link to `/create-account?assignmentId=...` (magic-link authenticated).
    - Email copy: “Create your account to view your badge”.
  - Case C: No user yet
    - Create minimal user (current behavior) and proceed as Case B.

- Implementation details
  - Where: `POST /api/badges/assign-by-email`
    - After assignment, determine account status:
      - If `account.password` exists (or equivalent Better Auth check), choose Case A.
      - Else choose Case B.
    - For Case A:
      - Add a new email template `sendBadgeAssignedEmail({ to, studentName, badgeName, badgeUrl })`.
    - For Case B:
      - Keep current invite flow via `POST /api/auth/sign-in/magic-link` with `callbackURL=/create-account?...`.

- Email templates
  - `sendBadgeAssignedEmail` (existing, verified users): focused on the new badge announcement with a direct public badge link.
  - `sendMagicLinkEmail` (invite): retains secure invite behavior but copy emphasizes “Create Account to view your badge”.

- Future enhancements
  - Batch emails for multiple badges assigned at once (digest style).
  - Rate limiting and idempotency keys per recipient to avoid duplicates.
  - Admin-configurable email copy per organization.
