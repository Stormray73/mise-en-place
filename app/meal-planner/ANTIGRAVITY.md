# Meal Planning Domain

## Overview

Handles the scheduling of recipes into meals, leftovers management, and prep-ahead workflow orchestration.

## Implementation Details

- **Logic:** `lib/meal-plans.ts` and `app/meal-planner/actions.ts`.
- **Scheduling:** Meals are organized by date and slot (e.g., Breakfast, Lunch, Dinner).
- **Ordering:** Custom meals can be reordered via a `sortOrder` field.
- **Prep-Ahead:** The `PrepAheadDashboard` aggregates upcoming requirements, filtering out items marked as `excludeFromPrep`.

## Invariants & Constraints

- **Single Plan:** Users currently have one active `MealPlan` record which serves as the container for all `Meal` entities.
- **Leftovers:** `PlannedRecipe` can be marked as `isLeftoverSource` and linked to child recipes via `sourcePlannedRecipeId`.

## Testing Strategy

- **Unit Tests:** `__tests__/lib/meal-plans.test.ts` (Core logic for sorting and data aggregation).
- **E2E Tests:** `tests/e2e/meal-planner.spec.ts` and `tests/e2e/advanced-scheduling.spec.ts`.
