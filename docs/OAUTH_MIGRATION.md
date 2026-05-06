# Feature: OAuth Migration (Google)

## Objective

Migrate the existing credentials-based authentication (username/password) to OAuth (Google) to enhance security, simplify the registration process, and provide a better user experience.

## Background & Motivation

Managing passwords securely adds complexity and risk. Users often prefer the convenience of single sign-on (SSO) through providers like Google. Migrating to OAuth will reduce friction during onboarding and align the application with modern authentication standards.

## Scope & Impact

- **Database Schema:** Significant updates to Prisma schema to support Auth.js standard models (`Account`, `Session`, `VerificationToken`) and expanding the `User` model.
- **Authentication Logic:** Updating `auth.ts` to replace the `Credentials` provider with the `Google` provider.
- **UI/UX:** Updating the `/login` and `/register` pages to use Google sign-in buttons instead of credential forms.
- **Existing Users:** Handling any existing users (if applicable) or making a clean break since this is early in development.

## Proposed Solution: Architecture & Schema

**Draft Schema Concept (Auth.js standard):**

- `User`: Add `name`, `email` (unique), `emailVerified`, `image`. Remove `username`, `password`.
- `Account`: Links a User to an OAuth provider (e.g., Google). Contains `provider`, `providerAccountId`, access tokens.
- `Session`: Manages active sessions (if using database sessions, though JWT is currently used).
- `VerificationToken`: For magic links (optional, but good standard practice).

## Implementation Steps (Stories)

### Story 1: Database Schema Migration for Auth.js

As a system administrator, I want the database schema to support standard OAuth models so that I can integrate third-party providers.

- **AC 1:** The `prisma/schema.prisma` file is updated to include standard Auth.js models (`Account`, `Session`, `User`, `VerificationToken`).
- **AC 2:** The `User` model is updated to use `email` as the primary identifier instead of `username`, and the `password` field is removed.
- **AC 3:** A database migration is successfully generated and applied (`prisma migrate dev`).

### Story 2: Google OAuth Configuration

As a developer, I want to configure Auth.js to use Google as an authentication provider so that users can log in with their Google accounts.

- **AC 1:** The `auth.ts` configuration is updated to include the `Google` provider instead of `Credentials`.
- **AC 2:** Environment variables `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are added to the `.env` template and checked in the application startup.
- **AC 3:** The Auth.js session callback correctly maps the OAuth user data (id, email, name, image) to the active session.

### Story 3: UI Updates for Authentication Pages

As a user, I want to see a "Sign in with Google" button on the login and registration pages so that I can easily authenticate.

- **AC 1:** The `/login` page UI is refactored to remove the username/password form and display a prominent "Sign in with Google" button.
- **AC 2:** The `/register` page UI is refactored (or removed if redundant) to point users to the same Google authentication flow.
- **AC 3:** Clicking the Google sign-in button successfully redirects the user to the Google OAuth consent screen and back to the application.

### Story 4: Cleanup and Testing

As a developer, I want to ensure all legacy authentication code is removed and the new flow is fully tested.

- **AC 1:** Existing tests for login and registration (`login.test.tsx`, `register-page.test.tsx`, `register-actions.test.ts`) are updated or removed to reflect the new OAuth flow.
- **AC 2:** Legacy credential-based actions (e.g., `app/register/actions.ts`) are deleted.
- **AC 3:** End-to-end tests (or mocked unit tests) verify that an unauthenticated user is redirected to login, and a successfully mocked Google authentication grants access to the `/dashboard`.

## Verification & Testing

- **TDD Requirement:** Update existing tests and write new ones using Vitest and React Testing Library before removing legacy code.
- **Mocking:** Mock the `next-auth/react` and `auth.ts` functions during component testing to simulate successful and failed OAuth responses.
