# Upcoming Stories: User Tiers & Admin Portal

## Story: Tier Data Model & Tracking

As a developer, I want to track user subscription tiers and AI usage counts so that we can enforce limits.

### Acceptance Criteria

- [ ] AC 1: `User` model includes a `tier` enum (`FREE`, `PRO`) and an `aiUsageCount` (default 0).
- [ ] AC 2: AI usage increments upon successful LLM parser execution.
- [ ] AC 3: Migration script to initialize existing users as `FREE`.

## Story: Limit Enforcement

As a business owner, I want to restrict free users so that we can manage costs while allowing Pro users unlimited access.

### Acceptance Criteria

- [ ] AC 1: FREE users are limited to 50 total recipes and 1 image per recipe.
- [ ] AC 2: FREE users are limited to 50 lifetime AI uses.
- [ ] AC 3: PRO users have unlimited recipes, unlimited AI uses, and up to 5 images per recipe.
- [ ] AC 4: UI components (Upload, Import) show clear "Upgrade to Pro" prompts when limits are reached.

## Story: Admin Override Portal

As an administrator, I want to manually override user tiers so that I can grant Pro status to myself and early adopters.

### Acceptance Criteria

- [ ] AC 1: Admin-only UI route (protected by admin authorization).
- [ ] AC 2: Admin can look up a user by email and toggle their tier between FREE and PRO.
- [ ] AC 3: Dashboard displays current tier status and remaining AI usage for the admin.
