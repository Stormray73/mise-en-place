# Upcoming Stories: User Tiers & Admin Portal

## Story: Tier & Role Data Model

As a developer, I want to track user subscription tiers and administrative roles so that we can enforce limits and protect sensitive routes.

### Acceptance Criteria

- [ ] AC 1: `User` model includes a `tier` enum (`FREE`, `PRO`) and a `role` enum (`USER`, `ADMIN`).
- [ ] AC 2: `User` model includes an `aiUsageCount` (default 0).
- [ ] AC 3: Migration script initializes existing users as `FREE` tier and `USER` role.

## Story: First Admin Bootstrapping

As an application owner, I want a secure way to promote my initial account to Administrator so that I can access the Admin Portal without manual database edits.

### Acceptance Criteria

- [ ] AC 1: System checks for a `FIRST_ADMIN_EMAIL` environment variable during the login flow.
- [ ] AC 2: If a logging-in user's email matches the environment variable, their database `role` is automatically updated to `ADMIN`.
- [ ] AC 3: This bootstrapping logic only runs if the user's role is not already `ADMIN`.

## Story: Limit Enforcement

As a business owner, I want to restrict free users so that we can manage costs while allowing Pro users unlimited access.

### Acceptance Criteria

- [ ] AC 1: FREE users are limited to 50 total recipes and 1 image per recipe.
- [ ] AC 2: FREE users are limited to 50 lifetime AI uses.
- [ ] AC 3: PRO users have unlimited recipes, unlimited AI uses, and up to 5 images per recipe.
- [ ] AC 4: UI components (Upload, Import) show clear "Upgrade to Pro" prompts when limits are reached.

## Story: Admin Override Portal

As an administrator, I want to manually override user tiers and roles so that I can manage the community and grant special status.

### Acceptance Criteria

- [ ] AC 1: Admin-only UI route (`/admin`) is strictly protected by a `role === 'ADMIN'` session check.
- [ ] AC 2: Admin can look up a user by email and toggle their `tier` (FREE/PRO) and `role` (USER/ADMIN).
- [ ] AC 3: Dashboard displays current status and total system-wide AI usage for the admin.
- [ ] AC 4: The site header conditionally displays an "Admin" link for users with the `ADMIN` role.

## Implementation Plan

1. **Phase 1: Prisma Updates**
   - Define Enums for `Tier` and `Role`.
   - Update `User` model and run migration.
2. **Phase 2: Auth & Bootstrapping**
   - Update `auth.ts` to include `tier` and `role` in the session object.
   - Implement the `FIRST_ADMIN_EMAIL` promotion logic in the `signIn` callback or an auth action.
3. **Phase 3: Limit Logic**
   - Create a middleware or utility to check recipe and AI usage counts against tier limits.
4. **Phase 4: Admin UI**
   - Build the `/admin` dashboard and user management actions.
