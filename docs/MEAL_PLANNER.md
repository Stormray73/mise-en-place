# Feature: Meal Planner

## Objective

Build a weekly meal planning system with flexible scheduling, leftover management, and an intelligent "Prep Ahead" aggregator that calculates combined ingredient needs (respecting preparation states) for the week.

## Background & Motivation

Chefs and home cooks need to plan their week efficiently. Grouping recipes into meals, handling leftovers appropriately to avoid over-purchasing or over-prepping, and generating a consolidated prep list (e.g., chopping all onions at once on Sunday) are essential features that save time and reduce waste.

## Scope & Impact

- **Database Schema:** Introduce models like `MealPlan`, `Meal`, `PlannedRecipe`, and `LeftoverReference`. Add a `prepState` field to `RecipeComponent` (from the Recipe Store schema).
- **UI/UX:** A calendar/weekly view to assign meals to days/slots. A "Prep Ahead" dashboard.
- **Aggregation Logic:** Complex service logic to sum ingredients based on the base ingredient, prepState, and unit conversions, while excluding leftover consumption.

## Implementation Steps (Stories)

### Story 1: Meal Plan & Meal Models

As a user, I want to create meals and assign them to specific days and slots so that I can map out my weekly eating schedule.

- **AC 1:** Users can create a MealPlan for a specific week.
- **AC 2:** Users can add Meals to a day, selecting from default slots (Breakfast, Lunch, Dinner) or providing a custom slot name.
- **AC 3:** Users can add one or multiple Recipes to a single Meal (e.g., Main Dish + Side Dish).

### Story 2: Prep States

As a chef, I want to specify the preparation state (e.g., diced, minced) for ingredients in a recipe so that my prep list gives actionable instructions.

- **AC 1:** Expand the `RecipeComponent` schema to include an optional `prepState` string.
- **AC 2:** Recipe edit UI allows users to input/select a prep state for each ingredient.
- **AC 3:** Existing recipes can be updated to add prep states.

### Story 3: Explicit Leftovers

As a user, I want to schedule leftovers for a meal so that I can plan to eat previously cooked food without it adding to my prep list or shopping list.

- **AC 1:** A user can mark a planned Recipe in a Meal as "Yielding Leftovers".
- **AC 2:** A user can add a "Leftover" item to a future Meal, referencing the original cooked Recipe.
- **AC 3:** Leftover items display visually distinct from fresh recipes in the calendar view.

### Story 4: Prep Ahead Aggregator

As a user, I want to see a summarized "Prep Ahead" list for my week so that I can do all my batch preparation at once.

- **AC 1:** A dashboard displays a compiled list of all ingredients required for the week's planned meals.
- **AC 2:** Ingredients are grouped by both their base Ingredient and their `prepState` (e.g., "Onions, diced" is separate from "Onions, sliced").
- **AC 3:** Quantities are summed accurately using unit conversions (e.g., converting everything to cups or grams).
- **AC 4:** Recipes scheduled as "Leftover" consumption do not contribute their ingredients to the Prep Ahead list.

## Verification & Testing

- **TDD Requirement:** Develop test-first using Vitest and React Testing Library.
- **Aggregation Logic:** Write robust tests for the Prep Ahead logic to ensure quantities sum correctly across multiple recipes and respect the `prepState` boundaries.
- **Leftover Edge Case:** Write tests verifying that scheduling leftovers does not inflate the Prep Ahead quantities.
