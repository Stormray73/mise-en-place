# Mise-en-place: The Chef's One-Stop-Shop

## Navigation & Context (Agent Guidance)

This project uses **Modular Documentation**. Technical details, invariants, and domain-specific logic are stored in local `GEMINI.md` files within their respective directories.

**Always check for a local `GEMINI.md` when entering a new directory.**

## Module Map & Documentation Index

| Domain       | Logic (`lib/`)     | UI & Routes (`app/`)       | Documentation                                                                    |
| :----------- | :----------------- | :------------------------- | :------------------------------------------------------------------------------- |
| **Recipes**  | `recipes.ts`       | `recipes/`                 | [app/recipes/GEMINI.md](./app/recipes/GEMINI.md)                                 |
| **Pantry**   | `pantry.ts`        | `dashboard/pantry/`        | [app/dashboard/pantry/GEMINI.md](./app/dashboard/pantry/GEMINI.md)               |
| **Shopping** | `shopping-list.ts` | `dashboard/shopping-list/` | [app/dashboard/shopping-list/GEMINI.md](./app/dashboard/shopping-list/GEMINI.md) |
| **Planning** | `meal-plans.ts`    | `meal-planner/`            | [app/meal-planner/GEMINI.md](./app/meal-planner/GEMINI.md)                       |
| **Units**    | `units.ts`         | —                          | `lib/GEMINI.md` (Planned)                                                        |

## Global Standards

- **Testing:** TDD is mandatory. Use Vitest for unit tests and Playwright for E2E.
- **Ergonomics:** Follow [AGENT_ERGONOMICS.md](./docs/AGENT_ERGONOMICS.md) for file headers and standardized action results.
- **Roadmap:** Future features and planning are tracked in [docs/upcoming-stories/](./docs/upcoming-stories/).

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript.
- **ORM:** Prisma (Postgres).
- **Validation:** Zod for API/Action inputs.
