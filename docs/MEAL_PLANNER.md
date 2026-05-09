# Feature: Meal Planner

## Objective

Build a flexible meal planning system with date-based scheduling, explicit leftover management, and an intelligent "Prep Ahead" aggregator that calculates combined ingredient needs (respecting preparation states) for a given time range.

## Background & Motivation

Chefs and home cooks need to plan their week efficiently. Grouping recipes into meals, handling leftovers appropriately to avoid over-purchasing or over-prepping, and generating a consolidated prep list (e.g., chopping all onions at once on Sunday) are essential features that save time and reduce waste.

## Scope & Impact

- **Database Schema:** Introduce models for `MealPlan`, `Meal`, and `PlannedRecipe`. Update `RecipeComponent` to support `prepState`.
- **UI/UX:** A calendar/weekly view to assign meals to days/slots. A "Prep Ahead" dashboard for aggregation.
- **Aggregation Logic:** Complex service logic to sum ingredients based on the base ingredient, prepState, and unit conversions, while excluding leftover consumption.

## Proposed Solution: Architecture & Schema

**Draft Schema Concept:**

- `MealPlan`: Represents a user's collection of plans. Linked to `User` (`userId`).
- `Meal`: A specific slot on a specific date (e.g., "Dinner" on "2026-05-15"). Belongs to `MealPlan`.
- `PlannedRecipe`: The join table between `Meal` and `Recipe`.
  - `isLeftoverSource`: Boolean. If true, this recipe is cooked fresh and produces leftovers.
  - `isLeftoverConsumption`: Boolean. If true, this meal uses leftovers from a previous `PlannedRecipe` (no ingredients added to prep list).
- `RecipeComponent` (Update): Add `prepState` (String?) to track how an ingredient should be prepared (e.g., "diced").

## Implementation Steps (Stories)

### Story 0: User Ownership & Tenancy

As a chef, I want my meal plans to be private to my account so that my schedule remains secure.

- **AC 1:** The `MealPlan` model includes a `userId` field with a relation to the `User` model.
- **AC 2:** All meal planning actions (creating, viewing, editing) are restricted to the authenticated user.
- **E2E Verification:**
  1. Login as User A and create a meal plan for next Tuesday.
  2. Logout and login as User B.
  3. Verify that User B's calendar is empty and they cannot see User A's plan.

### Story 1: Calendar & Meal Scheduling

As a user, I want to assign recipes to specific dates and meal slots (Breakfast, Lunch, Dinner) so that I can map out my eating schedule.

- **AC 1:** Users can navigate a weekly/monthly calendar view.
- **AC 2:** Users can add a "Meal" to any date, selecting from default slots or providing a custom name.
- **AC 3:** Users can add one or multiple Recipes to a single Meal (e.g., Main Dish + Side Dish).
- **E2E Verification:**
  1. Navigate to the Calendar.
  2. Click on "Friday" and add a "Dinner" slot.
  3. Search and add "Marinara" and "Spaghetti" recipes to that slot.
  4. Verify the recipes appear on the Friday calendar card.

### Story 2: Prep States for Ingredients

As a chef, I want to specify how ingredients should be prepared (e.g., diced, minced) so that my prep list is actionable.

- **AC 1:** `RecipeComponent` schema includes an optional `prepState` string.
- **AC 2:** Recipe edit UI allows users to input/select a prep state for each ingredient.
- **E2E Verification:**
  1. Create a "Salsa" recipe.
  2. Add "Onion" and set the Prep State to "finely diced".
  3. Save and re-open; verify "finely diced" is persisted.

### Story 3: Explicit Leftover Management

As a user, I want to distinguish between cooking a fresh meal and eating leftovers so that my prep list and shopping list stay accurate.

- **AC 1:** A user can toggle "Yields Leftovers" on a planned recipe.
- **AC 2:** A user can add a "Leftover" recipe to a meal, which prevents its ingredients from being counted in the prep list.
- **E2E Verification:**
  1. Schedule "Large Pot of Chili" for Monday with "Yields Leftovers" enabled.
  2. Schedule "Chili (Leftovers)" for Wednesday.
  3. Verify that the Wednesday entry is visually distinct (e.g., an icon or label) and does not contribute ingredients to the "Prep Ahead" list.

### Story 4: Prep Ahead Aggregator

As a user, I want to see a summarized "Prep Ahead" list for a selected date range so that I can perform batch preparation.

- **AC 1:** A dashboard displays a compiled list of all ingredients required for the selected range.
- **AC 2:** Ingredients are grouped by both their base Ingredient and their `prepState` (e.g., "Onions, diced" vs "Onions, sliced").
- **AC 3:** Quantities are summed accurately across multiple recipes using unit conversions.
- **E2E Verification:**
  1. Schedule two different recipes that both use "Diced Onions" (1 cup each).
  2. Navigate to the Prep Ahead dashboard for that week.
  3. Verify a single entry for "Onions, diced" shows a total of "2 cups".

## Verification & Testing Standards

- **TDD Mandatory:** Write Vitest/RTL tests for all aggregation logic and calendar components before implementation.
- **E2E Coverage:** Every story must be verified by a Playwright test as defined above.
- **Data Integrity:** Tests must verify that `userId` is strictly enforced at the API/Server Action level.
- **Edge Cases:** Explicitly test the "Leftover" logic to ensure it correctly excludes ingredients from the aggregator.
