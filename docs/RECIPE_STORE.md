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

To support recursive recipes, we will use a unified "Item" concept in the join table.
**Draft Schema Concept:**

- `Recipe`: Contains title, yield amount, yield unit, servings, manual macros, and `userId` (relation to User).
- `RecipeStep`: Belongs to Recipe. Contains instruction text and optional explicit `timerInSeconds`.
- `Ingredient`: A base ingredient (e.g., "Flour"), linked to a USDA FoodData ID and base macros.
- `RecipeComponent`: The join table. Links a parent `Recipe` to EITHER a base `Ingredient` OR a child `Recipe`. Contains quantity and unit.

## Implementation Steps (Stories)

### Story 0: Secure USDA API Proxy [IMPLEMENTED]

As a developer, I want a secure way to access the USDA API so that my API key is not exposed on the client.

- **AC 1:** Create a Next.js API Route (e.g., `/api/usda/search`) that proxies requests to the USDA FoodData Central API. [DONE]
- **AC 2:** Use the `USDA_API_KEY` environment variable on the server side. [DONE]
- **E2E Verification:**
  1.  Call the proxy endpoint from a test script and verify it returns a successful response from USDA when the key is present. [VERIFIED]

### Story 0.5: User Ownership & Tenancy [IMPLEMENTED]

As a chef, I want my recipes to be linked to my account so that only I can see and manage them.

- **AC 1:** The `Recipe` model in `schema.prisma` is updated to include a `userId` field with a relation to the `User` model. [DONE]
- **AC 2:** All recipe creation logic automatically associates the new recipe with the currently authenticated user. [DONE]
- **AC 3:** Any list views (like a dashboard) only display recipes belonging to the logged-in user. [DONE]
- **E2E Verification:**
  1.  Login as User A and create a recipe. [VERIFIED]
  2.  Logout and login as User B. [VERIFIED]
  3.  Verify that User B cannot see or edit User A's recipe. [VERIFIED]

### Story 1: Core Recipe & Recursive Schema Foundation [IMPLEMENTED]

As a chef, I want to create recipes and use other recipes as ingredients so that I can build complex dishes from sub-components.

- **AC 1:** A user can create a Recipe with a title, yield amount, and yield unit. [DONE]
- **AC 2:** A user can add an existing Recipe as an ingredient to a new Recipe via a search bar. [DONE]
- **AC 3:** Prevent circular dependencies (a recipe cannot contain itself). [DONE]
- **E2E Verification:**
  1.  Login and navigate to the Recipe Creator. [VERIFIED]
  2.  Create "Tomato Sauce" (Yield: 1L). [VERIFIED]
  3.  Create "Marinara" and add 500ml of "Tomato Sauce" as an ingredient. [VERIFIED]
  4.  Verify the Marinara recipe successfully saves and displays the nested component. [VERIFIED]

### Story 2: Robust Unit Conversion Engine [IMPLEMENTED]

As a chef, I want my ingredients to automatically convert between measurements so the math is handled for me.

- **AC 1:** Utility function handles Mass (g, kg, oz, lb) and Volume (ml, L, tsp, tbsp, cup). [DONE]
- **AC 2:** System correctly calculates the ratio: `(Component Quantity) / (Child Recipe Total Yield)`. [DONE]
- **E2E Verification:**
  1.  Create a recipe requiring 2 tbsp of a child recipe that yields 1 cup total. [VERIFIED]
  2.  Verify the UI correctly calculates that this is 0.125x (1/8th) of the child recipe. [VERIFIED]

### Story 3: USDA Integration & Macro Calculation [IMPLEMENTED]

As a chef, I want to automatically calculate nutritional macros based on USDA data.

- **AC 1:** Search interface allows selecting ingredients from the USDA FoodData Central API via a search bar. [DONE]
- **AC 2:** Total macros for a Recipe are calculated by summing converted macros of all components. [DONE]
- **AC 3:** Manual macro overrides take precedence over calculated totals. [DONE]
- **E2E Verification:**
  1.  Add "Olive Oil" to a recipe via the USDA search. [VERIFIED]
  2.  Verify the "Nutrition Facts" panel on the recipe page reflects the data fetched from the API. [VERIFIED]

### Story 4: Active "Play" Mode & Timers [IMPLEMENTED]

As a chef, I want a "Play" mode that guides me step-by-step with active timers.

- **AC 1:** Stepper UI displays one step at a time with its required ingredients. [DONE]
- **AC 2:** Active timers persist in the background when navigating between steps. [DONE]
- **E2E Verification:**
  1.  Enter "Play" mode for a recipe with a 5-minute timer on Step 1. [VERIFIED]
  2.  Start the timer and navigate to Step 2. [VERIFIED]
  3.  Verify the timer is still visible and counting down in the UI (e.g., in a persistent header). [VERIFIED]

### Story 5: Recipe Editing & Lifecycle [IMPLEMENTED]

As a chef, I want to refine my recipes over time.

- **AC 1:** Edit view allows modifying ingredients, quantities, and steps. [DONE]
- **AC 2:** Edits trigger an immediate recalculation of total macros. [DONE]
- **E2E Verification:**
  1.  Edit an existing recipe and double the quantity of an ingredient. [VERIFIED]
  2.  Verify the total calories and macros for the recipe have doubled accordingly. [VERIFIED]

### Story 6: Extended Yield & Servings Metadata

As a chef, I want to specify both a physical yield and a number of servings for my recipes.

- **AC 1:** Recipe Editor includes fields for both "Total Yield" (Amount + Unit) and "Number of Servings".
- **AC 2:** Database schema supports the `servings` field.
- **E2E Verification:**
  1.  Create a recipe with yield "14 cups" and "7 servings".
  2.  Verify that both values are saved and displayed in the recipe view.

### Story 7: Dynamic Recipe Scaling

As a chef, I want to scale my recipes up or down so I can cook for different group sizes.

- **AC 1:** Recipe View includes a "Scale" text input (e.g., 1.0, 1.5, 2.0).
- **AC 2:** Changing the scale factor immediately updates all displayed ingredient quantities.
- **AC 3:** Scaling handles complex unit conversions where applicable (optional, but preferred for readability).
- **E2E Verification:**
  1.  View a recipe with 100g of Flour.
  2.  Change the scale factor to 2.0.
  3.  Verify the ingredient list now shows 200g of Flour.

### Story 8: Per-Serving vs. Full Recipe Macros

As a chef, I want to toggle between nutritional information for a single serving and the entire recipe.

- **AC 1:** Nutrition Facts panel includes a toggle switch for "Per Serving" vs "Full Recipe".
- **AC 2:** Macros are recalculated based on the `servings` count when "Per Serving" is selected.
- **AC 3:** Scalar from Story 7 affects the "Full Recipe" totals but typically not the "Per Serving" totals (which remain static relative to the base recipe).
- **E2E Verification:**
  1.  View a recipe with 700 total calories and 7 servings.
  2.  Toggle to "Per Serving".
  3.  Verify the Nutrition Facts panel shows 100 calories.

## Verification & Testing Standards

- **TDD Mandatory:** Write Vitest/RTL tests for all logic and components before implementation.
- **E2E Coverage:** Every story must be verified by a Playwright test as defined above.
- **Mocking:** USDA API and NextAuth sessions MUST be mocked for deterministic test runs.

## Execution Plan

This feature will be implemented in five sequential phases.

### Phase 1: Foundation & Data Layer (Stories 0, 0.5, 1)

- **USDA Proxy:** Implement `app/api/usda/search/route.ts` and verify with a simple E2E test.
- **Schema Update:** Modify `prisma/schema.prisma` to include `Recipe`, `Ingredient`, `RecipeStep`, and `RecipeComponent`.
- **Tenancy Logic:** Implement server-side logic to ensure `userId` is enforced on all Recipe operations.
- **Recursive Integrity:** Implement the backend service to save recipes and prevent circular dependencies.

### Phase 2: Core Logic & Services (Stories 2, 3)

- **Unit Engine:** Build a standalone, heavily unit-tested utility for mass and volume conversions.
- **Macro Aggregator:** Create a service that recursively sums macros from ingredients and child recipes.
- **USDA Integration:** Connect the search UI to the proxy and map USDA fields to our internal `Ingredient` model.

### Phase 3: UI & Cooking Experience (Stories 4, 5)

- **Recipe Editor:** Build a dynamic form allowing users to add/remove steps and components (ingredients or child recipes).
- **Interactive "Play" Mode:** Implement the stepper UI and persistent timer logic using a global state manager or persistent layout.
- **Lifecycle Management:** Enable editing of existing recipes with immediate macro updates.

### Phase 4: Scaling & Servings Metadata (Stories 6, 7, 8)

- **Metadata Expansion:** Update schema and editor to support `servings`.
- **Scaling Logic:** Implement the client-side scaling utility for the recipe view.
- **Macro Toggling:** Add the serving-based calculation logic and UI toggle to the Nutrition Facts panel.

### Phase 5: Hardening & Validation

- **Full E2E Suite:** Ensure all 8 verification paths defined in the stories are passing.
- **Performance:** Test recursion depth limits (e.g., 5 levels of nested recipes) to ensure calculation speed is acceptable.
- **Security Audit:** Confirm `userId` cannot be spoofed to access other users' recipes.
