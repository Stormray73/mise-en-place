# Feature: Recipe Store

## Objective

Build a comprehensive, recursive recipe management system that allows recipes to be used as ingredients, calculates macros via the USDA API, provides robust unit conversion, and features an interactive "Play" mode for cooking with persistent timers.

## Background & Motivation

Chefs need a highly flexible system that reflects real-world kitchens where sub-recipes (like a sauce or dough) are used as ingredients in larger dishes. Additionally, accurate macro tracking and a streamlined, interactive cooking experience ("Play" mode) are essential for modern meal prep and professional environments.

## Scope & Impact

- **Database Schema:** Complex updates to support recursive relationships (recipes containing recipes) and USDA data mapping.
- **External Integration:** Connect to the USDA FoodData Central API.
- **Utility Layer:** A robust unit conversion engine (Imperial <-> Metric <-> SI).
- **UI/UX:** A new "Play" mode requiring complex state management for step navigation and active timers.

## Proposed Solution: Architecture & Schema

To support recursive recipes, we will use a polymorphic-like design or a unified "Item" model.
**Draft Schema Concept:**

- `Recipe`: Contains title, yield amount, yield unit, manual macros.
- `RecipeStep`: Belongs to Recipe. Contains instruction text and optional explicit `timerInSeconds`.
- `Ingredient`: A base ingredient (e.g., "Flour"), linked to a USDA FoodData ID and base macros.
- `RecipeComponent`: The join table. Links a parent `Recipe` to EITHER a base `Ingredient` OR a child `Recipe`. Contains quantity and unit.

## Implementation Steps (Stories)

### Story 1: Core Recipe & Recursive Schema Foundation

As a chef, I want to create recipes and use other recipes as ingredients so that I can build complex dishes from sub-components (like sauces).

- **AC 1:** A user can create a Recipe with a title, description, total yield amount, and yield unit.
- **AC 2:** A user can add a base Ingredient to a Recipe with a specific quantity and unit.
- **AC 3:** A user can add an existing Recipe as an ingredient to a new Recipe, provided the child recipe has a defined total yield.
- **AC 4:** Attempting to add a child Recipe that lacks a defined yield will display an error message.

### Story 2: Robust Unit Conversion Engine

As a chef, I want my ingredients to automatically convert between measurements so that they map correctly to USDA data and other recipes.

- **AC 1:** A utility function can successfully convert between standard volume units (tsp, tbsp, cup, ml, L).
- **AC 2:** A utility function can successfully convert between standard mass units (oz, lb, g, kg).
- **AC 3:** When a child Recipe is used as an ingredient, the system correctly calculates the ratio of the required quantity against the child Recipe's total yield (assuming compatible units).

### Story 3: USDA Integration & Macro Calculation

As a chef, I want to automatically calculate nutritional macros for my recipes based on USDA data, with the option to manually override them.

- **AC 1:** A backend service can fetch and map nutritional data from the USDA API using the provided API key.
- **AC 2:** The total macros for a Recipe are automatically calculated by summing the converted macros of all base Ingredients and child Recipes.
- **AC 3:** A user can input manual macro overrides on a Recipe, which take precedence over the calculated totals.

### Story 4: Active "Play" Mode & Timers

As a chef, I want to activate a "Play" mode for a recipe that guides me step-by-step and tracks my cooking timers.

- **AC 1:** A "Play" view displays one RecipeStep at a time, along with the ingredients required for that specific step.
- **AC 2:** Steps with an explicit timer field display a startable countdown timer.
- **AC 3:** When a user navigates to the next or previous step, any active timers from other steps continue to count down in the background (state persists across step navigation).
- **AC 4:** (UI Enhancement) The step instruction text visually highlights mentioned times (e.g., "5 minutes") as a tooltip hint for setting timers.

### Story 5: Recipe Editing

As a chef, I want to edit my existing recipes so that I can refine them over time or correct mistakes.

- **AC 1:** A user can navigate to an edit view for any recipe they own.
- **AC 2:** The user can add, remove, or modify ingredients, quantities, and steps.
- **AC 3:** Saving the edits updates the recipe and automatically triggers a recalculation of its total macros.

## Verification & Testing

- **TDD Requirement:** All stories must be developed test-first using Vitest and React Testing Library.
- **Mocking:** The USDA API must be mocked during tests to prevent rate-limiting and ensure deterministic test results.
- **Complex Edge Case:** Write specific tests verifying the macro math when a child recipe (Yield: 4 cups) is used as an ingredient (Quantity: 2 tbsp) in a parent recipe.
