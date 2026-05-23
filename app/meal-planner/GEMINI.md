# Meal Planning Domain

## Overview

Handles the scheduling of recipes into meals, leftovers management, and prep-ahead workflow orchestration.

## Implementation Details

- **Logic:** `lib/meal-plans.ts` and `app/meal-planner/actions.ts`.
- **Key Components:** `MealCalendarClient.tsx` (the full week/month calendar UI with drag-and-drop) and `PrepAheadDashboard.tsx` (aggregated upcoming prep tasks).
- **Scheduling:** Meals are organized by date and slot (e.g., Breakfast, Lunch, Dinner).
- **Ordering:** Custom meals can be reordered via a `sortOrder` field.
- **Prep-Ahead:** The `PrepAheadDashboard` aggregates upcoming requirements, filtering out items marked as `excludeFromPrep`.
- **Add Meal Workflow:** `AddMealModal` follows a two-stage flow. Stage 1 selects the slot; Stage 2 transitions (without closing) to a recipe search/selection UI. After selecting a recipe, the modal closes and the calendar updates.
- **Edit Meal Modal:** Opened by clicking the Meal Name (e.g., "Dinner") in the calendar. Shows full controls per planned recipe (Scale, Prep State, Leftover Toggles, "Delete Recipe"), plus "Delete Meal" and "+ Add another recipe".
- **Prep Dismissal:** Clicking the X on a prep item opens a custom modal (not a browser `confirm()`). Includes a "Do not show this warning again during this session" checkbox. The preference is stored in `sessionStorage` under `mise-en-place:skip-prep-dismiss-warning` and resets on logout/session expiry.

## Invariants & Constraints

- **Single Plan:** Users currently have one active `MealPlan` record which serves as the container for all `Meal` entities.
- **Leftovers:** `PlannedRecipe` can be marked as `isLeftoverSource` and linked to child recipes via `sourcePlannedRecipeId`.
- **Calendar Timezone and Week Start:** The calendar displays the week starting on Sunday. To avoid local timezone shifts (e.g. negative browser offsets showing Saturday first), both server normalization and client rendering must operate timezone-neutrally using UTC date operations (`setUTCDate`, `getUTCDay`, `setUTCHours`) and rendering formatters configured with `timeZone: "UTC"`.

## Testing Strategy

- **Unit Tests:** `__tests__/lib/meal-plans.test.ts` (Core logic for sorting and data aggregation), `__tests__/components/MealCalendarClient.test.tsx` (UI including two-stage Add Meal workflow and recipe search filtering).
- **E2E Tests:** `tests/e2e/meal-planner.spec.ts`, `tests/e2e/advanced-scheduling.spec.ts`, and `tests/e2e/prep-dismissal.spec.ts` (dismissal modal, sessionStorage skip preference, and two-stage Add Meal E2E workflow).
