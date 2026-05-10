# Feature: Meal Planner

## Objective

Build a flexible meal planning system with date-based scheduling (User Local Time), explicit leftover management, and an intelligent "Prep Ahead" aggregator that calculates combined ingredient needs (respecting preparation states) for a given time range.

## Background & Motivation

Chefs and home cooks need to plan their week efficiently. Grouping recipes into meals, handling leftovers appropriately to avoid waste, and generating a consolidated prep list (e.g., checking off items as they are prepped) are essential for a professional kitchen workflow.

## Scope & Impact

- **Database Schema:** Introduce models for `MealPlan`, `Meal`, and `PlannedRecipe`.
- **UI/UX:** A calendar/weekly view to assign meals to days/slots. A "Prep Ahead" dashboard for aggregation with interactive checkmarks.
- **Aggregation Logic:** Service logic to sum ingredients based on base ingredient, `prepState`, and unit conversions, while excluding leftover consumption.

## Proposed Solution: Architecture & Schema

**Draft Schema Concept:**

- `MealPlan`: Linked to `User` (`userId`). Represents the root container for plans.
- `Meal`: A specific slot on a specific date (e.g., "Dinner" on "2026-05-15").
- `PlannedRecipe`: The join table between `Meal` and `Recipe`.
  - `scale`: Float (default: 1.0). The factor by which the recipe ingredients are scaled for this specific meal.
  - `prepState`: String? (e.g., "diced"). Moved here from Recipe to allow different preparation for the same recipe in different meals.
  - `isLeftoverSource`: Boolean. If true, this recipe is cooked fresh and produces leftovers.
  - `sourcePlannedRecipeId`: ID? Self-relation for `PlannedRecipe`. Links a "Consumption" entry to its specific "Source" entry for quantity tracking.
- `PrepCompletion`: A join table or JSON field tracking which `PlannedRecipe` components have been marked as "prepped" by the user.

## Implementation Steps (Stories)

### Story 0: User Ownership & Tenancy

As a chef, I want my meal plans to be private to my account so that my schedule remains secure.

- **AC 1:** `MealPlan` and related models enforce `userId` checks at the API/Action level.
- **AC 2:** All date/time operations use the user's local timezone.

### Story 1: Calendar & Meal Scheduling

As a user, I want to assign recipes to specific dates and meal slots so that I can map out my eating schedule.

- **AC 1:** Users can navigate a weekly calendar view.
- **AC 2:** Users can add multiple Recipes to a single Meal slot.
- **AC 3:** Clicking a planned recipe navigates to its view page with the `scale` parameter pre-filled.

### Story 2: Meal-Specific Prep & Scaling

As a chef, I want to decide how ingredients are prepped and at what scale for a specific meal.

- **AC 1:** When adding a recipe to a meal, the user can set a `scale` factor (e.g., 2.0x).
- **AC 2:** Users can specify a `prepState` override (e.g., "finely minced") that applies only to that meal's instance of the recipe.

### Story 3: Linked Leftover Management

As a user, I want to track exactly which cooked meals are being used as leftovers.

- **AC 1:** A user can mark a meal as a "Leftover Source".
- **AC 2:** When adding a "Leftover Consumption" meal, the user must select a previously planned "Source" meal.
- **AC 3:** Consumption entries do not contribute ingredients to the "Prep Ahead" aggregator.

### Story 4: Prep Ahead Aggregator & Completion Tracking

As a user, I want a compiled prep list for a date range with interactive progress tracking.

- **AC 1:** Aggregates ingredients across the range, grouped by base ingredient and `prepState`.
- **AC 2:** Respects the `scale` factor from Story 2 in all calculations.
- **AC 3:** Users can click a "checkmark" next to any ingredient/prep-state group to mark it as complete.

### Story 5: Meal Cloning & Repeating

As a user, I want to quickly fill my calendar by repeating existing meals.

- **AC 1:** Users can "Duplicate" a meal to another date.
- **AC 2:** Users can "Repeat" a meal (e.g., "Every Monday for 4 weeks").

### Story 6: Macro Aggregation

As a user, I want to see the total nutritional impact of my plan.

- **AC 1:** Each Meal displays its total macros (scaled).
- **AC 2:** The Calendar view displays daily total macros compared to a (mocked or set) daily target.

## Validation & Constraints

1. **Circular Check:** A "Consumption" meal cannot be the "Source" for itself.
2. **Date Integrity:** "Consumption" must occur on or after the "Source" date.
3. **Unit Consistency:** Aggregator must flag (not crash) when unable to convert incompatible units (e.g., Mass vs Volume without a density map).

## Execution & Testing Plan

### Phase 1: Core Foundation (Stories 0, 1, 2) [SERIAL]

- **Goal:** Establish the data layer and basic scheduling UI.
- **Testing:**
  - E2E: Verify tenancy (User A vs User B).
  - E2E: Verify navigation with scale parameters.
  - Unit: Verify scaling math on `PlannedRecipe`.

### Phase 2: Logic & Automation (Stories 3, 6) [PARALLEL]

- **Goal:** Implement leftovers and macro math.
- **Testing:**
  - Unit: Test leftover exclusion from macro totals.
  - Integration: Verify that "Consumption" meals correctly link to "Source" meals in the DB.

### Phase 3: Batch Operations (Story 5) [PARALLEL]

- **Goal:** Implement cloning and repeating.
- **Testing:**
  - E2E: Bulk creation validation (ensuring 4 repeated meals actually create 4 DB entries).

### Phase 4: Aggregation & Final Hardening (Story 4) [SERIAL]

- **Goal:** The final prep list and system-wide validation.
- **Testing:**
  - E2E: "Stress Test" - Aggregate a week with 21 meals, 3 leftovers, and varied scaling factors.
  - Security: Verify no unauthorized access to `PlannedRecipe` IDs via API tampering.

## Verification Standards

- **TDD:** Mandatory.
- **E2E Hardening:** Every PR must pass E2E tests for the specific story PLUS the "Security Audit" test (ensuring `userId` enforcement).
