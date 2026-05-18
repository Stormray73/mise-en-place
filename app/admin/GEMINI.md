# Admin Domain

## Overview

Provides a restricted dashboard for application administrators to manage users and view system statistics.

## Implementation Details

- **Logic:** `app/admin/actions.ts` handles server-side operations with strict `role === "ADMIN"` checks.
- **UI:** `app/admin/page.tsx` and `app/admin/AdminDashboard.tsx`.
- **Bootstrapping:** The first admin is promoted via the `FIRST_ADMIN_EMAIL` env variable during NextAuth sign-in (see `auth.ts`).

## Invariants & Constraints

- Only users with the `ADMIN` role can access `/admin` or execute its actions.
- Tiers (`FREE`, `PRO`) control user limits (enforced in `lib/limits.ts`).
