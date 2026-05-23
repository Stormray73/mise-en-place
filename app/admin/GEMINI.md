# Admin Domain

## Overview

Provides a restricted dashboard for application administrators to manage users and view system statistics.

## Implementation Details

- **Logic:** `app/admin/actions.ts` handles server-side operations with strict `role === "ADMIN"` checks.
- **UI:** `app/admin/page.tsx` and `app/admin/AdminDashboard.tsx`.
- **Bootstrapping:** The first admin is promoted via the `FIRST_ADMIN_EMAIL` env variable during NextAuth sign-in (see `auth.ts`).

## Invariants & Constraints

- Only users with the `ADMIN` role can access `/admin` or execute its actions.
- Tiers (`FREE`, `PRO`) control user limits, enforced in `lib/limits.ts` via the `LIMITS` constant:
  - `FREE`: max 50 recipes, max 50 AI uses (tracked via `User.aiUsageCount`), max 1 image per recipe.
  - `PRO`: unlimited recipes, unlimited AI uses, max 5 images per recipe.
- `checkRecipeLimit` and `checkAiLimit` are called from Server Actions before any gated operation. `incrementAiUsage` is called after each successful AI operation.
- Tier and role values are embedded in the JWT (see `auth.ts`) so they are available on the client via `useSession()` without an extra DB call.
