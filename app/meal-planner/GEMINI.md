# Meal Planning Domain

## Overview

Handles the scheduling of recipes into meals, leftovers management, and prep-ahead workflow orchestration.

## Implementation Details

- **Logic:** `lib/meal-plans.ts` and `app/meal-planner/actions.ts`.
- **Key Components:** `MealCalendarClient.tsx` (the full week/month calendar UI with drag-and-drop) and `PrepAheadDashboard.tsx` (aggregated upcoming prep tasks).
- **Scheduling:** Meals are organized by date and slot (e.g., Breakfast, Lunch, Dinner).
- **Ordering:** Custom meals can be reordered via a `sortOrder` field.
- **Prep-Ahead:** The `PrepAheadDashboard` aggregates upcoming requirements, filtering out items marked as `excludeFromPrep`.

## Invariants & Constraints

- **Single Plan:** Users currently have one active `MealPlan` record which serves as the container for all `Meal` entities.
- **Leftovers:** `PlannedRecipe` can be marked as `isLeftoverSource` and linked to child recipes via `sourcePlannedRecipeId`.
- **Calendar Timezone and Week Start:** The calendar displays the week starting on Sunday. To avoid local timezone shifts (e.g. negative browser offsets showing Saturday first), both server normalization and client rendering must operate timezone-neutrally using UTC date operations (`setUTCDate`, `getUTCDay`, `setUTCHours`) and rendering formatters configured with `timeZone: "UTC"`.
- **Prep List Dismissal UX:** Support "Dismiss" for prep items with a warning confirmation modal. Checking "Do not show this warning again during this session" suppresses the modal for subsequent dismissals using session-persisted client-side state.
- **Recipe Slot Duplication Block:** Server actions and database constraints prevent adding the exact same recipe multiple times to the same meal slot on a single day.
- **Prep-Ahead Synchronization:** Deleting a recipe from a planned meal slot immediately and dynamically recalculates the Prep Ahead dashboard items, preventing stale prep items from remaining visible.

## Testing Strategy

- **Unit Tests:** `__tests__/lib/meal-plans.test.ts` (Core logic for sorting and data aggregation).
- **E2E Tests:** `tests/e2e/meal-planner.spec.ts` and `tests/e2e/advanced-scheduling.spec.ts`.
