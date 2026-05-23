# Mise-en-place: The Chef's One-Stop-Shop

## Navigation & Context (Agent Guidance)

This project uses **Modular Documentation**. Technical details, invariants, and domain-specific logic are stored in local `GEMINI.md` files within their respective directories.

**Always check for a local `GEMINI.md` when entering a new directory.**

## ⚠️ Mandatory Rule: Keep Documentation Current

**After making any code changes, you MUST review the `GEMINI.md` file(s) for every directory you modified.** If your changes deviate from, add to, or invalidate anything described in those files, update them before considering the task complete. This includes:

- New files, modules, or routes added to a directory
- Renamed or deleted files referenced by a `GEMINI.md`
- New invariants, constraints, or architectural decisions introduced by your change
- Changes to which components call which actions or API routes

Failing to keep these files current degrades the quality of all future agent work in this codebase.

---

## Module Map & Documentation Index

### Domain Features

| Domain       | Logic (`lib/`)     | UI & Routes (`app/`)       | Documentation                                                                    |
| :----------- | :----------------- | :------------------------- | :------------------------------------------------------------------------------- |
| **Recipes**  | `recipes.ts`       | `recipes/`                 | [app/recipes/GEMINI.md](./app/recipes/GEMINI.md)                                 |
| **Pantry**   | `pantry.ts`        | `dashboard/pantry/`        | [app/dashboard/pantry/GEMINI.md](./app/dashboard/pantry/GEMINI.md)               |
| **Shopping** | `shopping-list.ts` | `dashboard/shopping-list/` | [app/dashboard/shopping-list/GEMINI.md](./app/dashboard/shopping-list/GEMINI.md) |
| **Planning** | `meal-plans.ts`    | `meal-planner/`            | [app/meal-planner/GEMINI.md](./app/meal-planner/GEMINI.md)                       |
| **Admin**    | `limits.ts`        | `admin/`                   | [app/admin/GEMINI.md](./app/admin/GEMINI.md)                                     |

### Infrastructure & Shared Code

| Area                     | Location                | Documentation                                  |
| :----------------------- | :---------------------- | :--------------------------------------------- |
| **All `lib/` modules**   | `lib/`                  | [lib/GEMINI.md](./lib/GEMINI.md)               |
| **Shared UI Components** | `components/`           | [components/GEMINI.md](./components/GEMINI.md) |
| **API Route Handlers**   | `app/api/`              | [app/api/GEMINI.md](./app/api/GEMINI.md)       |
| **Auth & Session**       | `auth.ts`, `app/login/` | See [Auth & Session](#auth--session) below     |
| **Shared Types**         | `types/index.ts`        | See [Shared Types](#shared-types) below        |

---

## Auth & Session

Authentication is handled by **NextAuth.js v5** (Google OAuth provider) configured in the root `auth.ts`.

- **Strategy:** JWT sessions. User `id`, `role`, and `tier` are embedded in the JWT and exposed via `session.user`.
- **Roles:** `USER` (default) and `ADMIN`. Admin status is bootstrapped via the `FIRST_ADMIN_EMAIL` env variable on first sign-in.
- **Route Protection:** The `authorized` callback in `auth.ts` guards `/dashboard/**` (requires login) and `/admin/**` (requires `ADMIN` role).
- **E2E Test Bypass:** When `ENABLE_MSW=true`, the exported `auth()` wrapper returns a mock `PRO`/`ADMIN` session without hitting Google. This keeps production code clean while allowing headless E2E tests. See `tests/msw/` for the MSW handler setup.
- **Extended Reading:** [docs/ADDITIONAL_AUTH_FOR_DUMMIES.md](./docs/ADDITIONAL_AUTH_FOR_DUMMIES.md) explains the full OAuth flow and common pitfalls.

---

## Shared Types

All shared TypeScript interfaces and discriminated union types live in `types/index.ts`. Key types:

- `ActionResult<T>` — standard return type for all Server Actions (`{ success: true; data: T } | { success: false; error: string }`)
- `RecipeComponent` — discriminated union: `{ type: "ingredient" } | { type: "sub-recipe" }`
- `RecipeSaveData` — the write shape used when creating or updating a recipe
- `USDAFood` / `USDANutrient` / `USDAFoodPortion` — shapes from the USDA FoodData Central API (also used for OFF and custom ingredients after normalization)
- `Macros` — `{ calories, protein, fat, carbs }`

---

## Global Standards

- **Testing:** TDD is mandatory. Use Vitest for unit tests and Playwright for E2E. See [docs/TESTING.md](./docs/TESTING.md) and [docs/E2E_TESTING.md](./docs/E2E_TESTING.md).
- **Ergonomics:** Follow [docs/AGENT_ERGONOMICS.md](./docs/AGENT_ERGONOMICS.md) for file headers, standardized `ActionResult` returns, and GEMINI.md maintenance rules.
- **Roadmap:** Future features and planning are tracked in [docs/upcoming-stories/](./docs/upcoming-stories/).

---

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript (strict mode).
- **ORM:** Prisma (Postgres — Neon Serverless in production, native PG locally).
- **Validation:** Zod for API/Action inputs.
- **Styling:** Tailwind CSS (global utilities) with CSS Modules for page-specific styles.
- **AI:** Vercel AI SDK (OpenAI) for structured recipe parsing and image extraction.
- **Storage:** Cloudflare R2 for recipe images.
