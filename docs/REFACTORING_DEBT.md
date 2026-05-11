# Feature: Core Refactor & Technical Debt Reduction

## Objective

Decompose monolithic UI components and standardize reusable interface patterns to improve maintainability, testability, and scalability. **This is a pure refactor: no new features are to be added, and all existing functionality must remain identical.**

## Background & Motivation

As the feature set of _Mise-en-place_ has grown, several components (notably the Recipe Editor and Meal Calendar) have become "monolithic." These large files are difficult to modify without risk of side effects. This plan outlines a strategy to break these into smaller building blocks while utilizing our existing E2E suite to ensure zero regressions.

---

## Refactoring Stories

### Story 0: Implement Agentic Ergonomics (Cross-cutting)

**Goal:** Apply standards from `docs/AGENT_ERGONOMICS.md` to all new and refactored files.

- **AC 1:** Add File Header Metadata to all newly created components.
- **AC 2:** Refactor `RecipeComponent` and `ActionResult` types in `types/index.ts` to use discriminated unions and standardized shapes.
- **AC 3:** Update existing Server Actions in the Editor and Planner to use the new standardized result shape.

### Story 1: Decompose Recipe Editor

The `components/RecipeEditor.tsx` currently manages four distinct complex UI responsibilities.

- **Goal:** Break the 300+ line component into modular units.
- **Decomposition Target:**
  - `IngredientSearch`: Handles USDA and sub-recipe autocomplete.
  - `ComponentList`: Manages the display and quantity/unit/prep-state logic for added ingredients.
  - `StepManager`: Handles the dynamic list of instructions and timers.
- **Constraint:** All state must still bubble up to the parent `RecipeEditor` to ensure the `saveRecipeAction` receives the exact same data structure as before.

### Story 2: Decompose Meal Calendar

The `app/meal-planner/MealCalendarClient.tsx` contains deeply nested maps and inline modal logic.

- **Goal:** Extract repeated logic into focused UI components.
- **Decomposition Target:**
  - `MealSlot`: Handles a single slot (Breakfast/Lunch/Dinner) and its recipes.
  - `PlannedRecipeRow`: Manages the display of a single recipe, including its scale and leftover toggles.
  - `ModalRoot`: A reusable wrapper for the Add Meal, Add Recipe, and Clone modals.

### Story 3: Standardize "Kitchen UI" Components

UI elements like inputs, dropdowns, and buttons are currently defined with local Tailwind classes in every file.

- **Goal:** Create a `components/ui/` directory for shared atomic components.
- **Implementation:**
  - Extract standardized `Button`, `Input`, `Select`, and `Card` components.
  - Create a generic `Autocomplete` component that can be used for both USDA and Internal Recipe searches, reducing logic duplication.

---

## Execution & Verification Plan

### Phase 1: Editor Decomposition [SERIAL]

1. Extract `StepManager` and verify via `RecipeEditor.test.tsx`.
2. Extract `IngredientSearch` and `ComponentList`.
3. **Verification:** Run `npx playwright test tests/e2e/recipe-store.spec.ts` to ensure the recipe creation/edit flow is unchanged.

### Phase 2: Calendar Decomposition [SERIAL]

1. Implement the `Modal` base component and migrate the three calendar modals.
2. Extract `MealSlot` and `PlannedRecipeRow`.
3. **Verification:** Run `npx playwright test tests/e2e/meal-planner.spec.ts` to ensure scheduling and linking logic is intact.

### Phase 3: Atomic UI Migration [PARALLEL]

1. Migrate Dashboard and Recipe View to use the new `components/ui/` library.
2. **Verification:** Visual regression check and full suite run.

---

## Strict Constraints

1.  **Functional Parity:** The user should not perceive any change in behavior.
2.  **Zero API Changes:** Do not modify Server Actions (`actions.ts`) or Library Logic (`lib/`) during this refactor. Only the **UI presentation layer** is in scope.
3.  **Mandatory Regression Testing:** The full `npm test` and `playwright test` suites MUST be run after every component extraction. Any failure must be resolved before proceeding to the next component.
