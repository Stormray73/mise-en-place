# Upcoming Stories: Additional Authentication

## Story 1: Microsoft OAuth Integration

As a user with a Microsoft account (Outlook, Hotmail, Xbox), I want to log in using my Microsoft credentials so that I don't have to remember a separate password.

- **AC 1:** The login page displays a "Sign in with Microsoft" button alongside existing providers.
- **AC 2:** Clicking the button redirects the user to the Microsoft Entra ID authorization flow.
- **AC 3:** Upon successful authorization, a user account is created (or linked) and a session is established.
- **AC 4:** Required environment variables (`MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`) are documented and validated during startup.
- **AC 5 (Secure Coding):** Forbid automatic email-based account linking during registration. If a user tries to sign in using Microsoft with an email that is already registered with another provider (e.g., Google), reject the sign-in with a clear message requesting the user to log in via their original provider. Account linking is strictly allowed only when performed by an already authenticated user in their settings page.

## Story 2: Facebook OAuth Integration

As a social media user, I want to log in using my Facebook account so that I can quickly access the application without filling out forms.

- **AC 1:** The login page displays a "Sign in with Facebook" button.
- **AC 2:** Clicking the button redirects the user to the Meta OAuth flow requesting `public_profile` and `email` scopes.
- **AC 3:** Upon successful authorization, the user is authenticated and redirected to the dashboard.
- **AC 4:** Missing email addresses (if user denies email permission) are handled gracefully with a fallback or error message.
- **AC 5 (Secure Coding):** Forbid automatic email-based account linking during registration, matching the same strict validation as Microsoft OAuth to prevent account hijack vulnerabilities.

## Story 3: Magic Link (Email) Authentication

As a user who prefers not to link social accounts, I want to log in using a secure email link so that my account remains private without needing a password.

- **AC 1:** The login page includes an email input field and a "Send Magic Link" button.
- **AC 2:** Submitting a valid email address sends a single-use verification token to the user's inbox via SMTP.
- **AC 3:** Clicking the link authenticates the user, consumes the token, and redirects to the dashboard.
- **AC 4:** Tokens expire automatically after 15 minutes.
- **AC 5 (Secure Coding):** Implement strict rate-limiting on the magic link email request endpoint, capping requests to a maximum of 3 per IP/email address per hour.
- **AC 6 (Secure Coding):** Integrate Cloudflare Turnstile (CAPTCHA) on the magic link form. Requests must submit a valid Turnstile token, which is verified server-side before any SMTP email is dispatched.

## Implementation Plan

1. **Phase 1: Environment & Config Updates**
   - Update `.env.example` with the new variables (Microsoft, Facebook, SMTP config).
   - Update `auth.ts` to include `MicrosoftProvider`, `FacebookProvider`, and `EmailProvider` from NextAuth.
2. **Phase 2: SMTP Integration**
   - Install `nodemailer` if required by NextAuth EmailProvider.
   - Configure the SMTP transport for the `EmailProvider` in `auth.ts`.
3. **Phase 3: UI Updates**
   - Update the UI in `app/login/page.tsx` and `app/login/actions.ts` to display the new OAuth buttons.
   - Add the Email input form to the login page.
4. **Phase 4: Testing**
   - Write E2E tests in `tests/e2e/auth.spec.ts` mocking the OAuth callbacks.
   - Write an integration test to verify the Magic Link token generation in the database.
