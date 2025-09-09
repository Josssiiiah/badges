# Admin Sign‑Up: Email Verification Flow Plan

## Goal
- Ensure first‑time administrator sign‑ups are NOT routed to the sign‑in view.
- Instead, show a confirmation pop‑up instructing them to verify their email.
- After clicking the verification link in email, automatically create a session and land the user in the app (logged in), ideally on the admin dashboard.

## Current Behavior (observed)
- Frontend `login.tsx` creates accounts via `authClient.signUp.email` and then nudges users to the sign‑in form with a success message.
- Backend uses Better Auth with email verification enabled and magic link support.
- Verification route redirects to the frontend via `callbackURL` and should set a fresh session.

Key files:
- Backend
  - `backend/src/auth/index.ts` (Better Auth config)
  - `backend/src/routes/auth.ts` (routes forwarding to Better Auth handler)
- Frontend
  - `frontend/src/routes/login.tsx` (sign in/sign up form for both roles)
  - `frontend/src/components/ui/alert-dialog.tsx` or `dialog.tsx` (for the pop‑up)
  - `frontend/src/lib/auth-client.ts` (Better Auth client)

## Desired UX Flow
1. Admin fills the Create Account form on `/login` with role = administrator (and org option).
2. On submit, account is created; do NOT navigate to sign‑in.
3. Show a modal/pop‑up: “Check your email to confirm your address.” Include resend verification and optional magic‑link fallback.
4. User clicks the email verification link.
5. Backend verifies, auto‑signs in, and redirects to frontend `callbackURL`.
6. Frontend detects active session and routes the admin to `/admin` (if role = administrator and verified), or general landing if not.

## Backend Changes
- File: `backend/src/auth/index.ts`
  - Email/password
    - Set `emailAndPassword.autoSignIn` to `false` to prevent immediate login after sign‑up.
    - Keep `emailAndPassword.requireEmailVerification = true`.
  - Email verification
    - Keep `emailVerification.sendOnSignUp = true`.
    - Keep `emailVerification.autoSignInAfterVerification = true` (so the user is logged in after clicking the link).
    - Ensure `sendVerificationEmail` appends `callbackURL` to the verification link. Current logic sets it to `FRONTEND_URL + '/'` — this is good.
  - Session/cookies
    - No change needed; current cookie settings are sufficient for auto sign‑in after verification.

Notes: The backend already logs and sends verification emails via `sendVerificationEmail` and exposes `/api/auth/verify-email` via `routes/auth.ts`.

## Frontend Changes
- File: `frontend/src/routes/login.tsx`
  - Sign‑Up branch:
    - After `authClient.signUp.email`, do NOT toggle to sign‑in. Remove the current success message that says “Please sign in”.
    - Gate this new behavior to role === 'administrator'. Student flow remains unchanged unless requested.
    - Set a `verificationSent` UI state and open a modal using `AlertDialog` or `Dialog`.
      - Title: “Check your email”
      - Body: “We sent a confirmation email to <email>. Please click the link to verify your address, then you’ll be redirected and signed in.”
      - Actions:
        - “Resend verification” → POST to `POST /api/auth/send-verification-email` (already implemented in the file as `handleResendVerification`).
        - “Close” → dismisses the modal but keeps the user on the page.
      - Optional: “Send magic link” fallback (already implemented) with helper text explaining that they can sign in and re‑trigger verification from profile if needed.
  - Post‑verification landing:
    - No dedicated page required. The verification link already includes a `callbackURL` to the frontend root; the app’s root layout loads session.
    - On load, if `session.user.role === 'administrator' && session.user.emailVerified`, you can auto‑navigate to `/admin`. Otherwise, stay on `/`.
- Optional: Add a small toast in the root layout when `?verified=1` is present to confirm “Email verified — you’re all set!”. This is cosmetic.

## Email Content / Redirect
- Continue using `sendVerificationEmail` on the backend. It already logs the URL and sends through Resend.
- Confirm the link path is `/api/auth/verify-email` and includes a `callbackURL` param pointing at `VITE_FRONTEND_URL`.
- After verification, Better Auth sets the cookie and redirects the browser to the callback URL (frontend), where `authClient.useSession()` picks up the new session.

## Edge Cases & Validation
- Duplicate email: show existing account error; do not show verification modal. Keep current error handling.
- Unverified sign‑in attempts: keep current banner on sign‑in and “Resend verification”/“Send magic link” helpers.
- Organization join/create validation: already handled in backend via `databaseHooks`; keep same client‑side checks (org name for create, code for join).
- Environment variables: ensure `VITE_FRONTEND_URL`, `VITE_BETTER_AUTH_URL`, and backend `FRONTEND_URL`, `BETTER_AUTH_URL` are set consistently.

## Testing Plan
- Unit/manual checks in dev:
  - Admin sign‑up → modal appears → do not route to sign‑in.
  - Click “Resend verification” → 200 OK and user sees feedback.
  - Click verification link from email/log → browser redirects to frontend, session exists, user lands on `/admin`.
  - Attempt admin sign‑in before verify → sign‑in shows “email not verified” helper and actions.
  - Student sign‑up flow unchanged (unless requested to also gate with modal).
- QA across browsers: cookie set on redirect, SSR/SPA session detection, modal accessibility.

## Rollout
- Ship backend change first (autoSignIn=false) — safe.
- Ship frontend change next. Confirm environment variables in both apps.
- Monitor logs for verification send and auto‑sign‑in after verify.

## Acceptance Criteria
- After admin sign‑up, the UI displays a pop‑up instructing to verify email (no redirect to sign‑in).
- Verification link signs in the admin and returns them to the app.
- Verified admins land on `/admin` without needing to re‑enter credentials.
