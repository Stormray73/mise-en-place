# Epic: In-Place Ingredient & Pantry Management

## Objective

To improve the ingredient lifecycle by allowing users to edit planned ingredients on the fly, correct AI import errors, define nutritional data for unlinked items, and manage their physical pantry inventory with intuitive, consistency-driven UI controls.

## Scope & Impact

- **Recipe Editor:** Add "Edit" capabilities to individual ingredient components within the recipe creation/editing flow.
- **Pantry Management:** Overhaul the Pantry Item UI to replace confusing controls with standard icons and add direct editing functionality.
- **Data Integrity:** Enable the conversion of "dummy" imported ingredients into personal custom ingredients with user-defined macros.

## Implementation Steps (Stories)

### Story 1: In-Place Ingredient Editing (Recipe Store)

As a user editing a recipe, I want to modify ingredient details directly so that I can correct import errors or adjust quantities without deleting and re-adding.

- **AC 1:** An "Edit" button (pencil icon) is visible for each ingredient in the `RecipeEditor` component.
- **AC 2:** Clicking the "Edit" button replaces the static ingredient row with an inline form or modal containing inputs for quantity, unit, name, and prep state.
- **AC 3:** Modifying and "Applying" the inline form updates the recipe's local state immediately.
- **AC 4:** The updated ingredient data is correctly persisted to the database upon clicking the main "Save Recipe" button.

### Story 2: Dummy Ingredient Conversion

As a user importing recipes, I want to define macros for unrecognized ingredients so that my nutritional tracking remains accurate.

- **AC 1:** In the ingredient edit interface, if the item is a "dummy" (no `usdaId` and no `userId`), a prominent "Define Macros & Save to My Ingredients" button is displayed.
- **AC 2:** Clicking this button opens a sub-form to input Calories, Protein, Fats, and Carbs for the ingredient.
- **AC 3:** Upon saving, the ingredient record in the database is updated with the user's `userId` and the provided macro data.
- **AC 4:** The converted ingredient appears in the user's "My Ingredients" pantry tab and is available in the autocomplete search for future recipes.

### Story 3: Pantry UI & Edit Overhaul

As a user managing my kitchen, I want an intuitive and consistent interface for my pantry inventory so that I can easily track my stock.

- **AC 1:** The "-1" and "Finish" buttons on the `PantryItem` card are replaced with standard increment/decrement (plus/minus) and a "Mark as Used" completion toggle.
- **AC 2:** The text-based "Delete" button is replaced with a standard trash icon button.
- **AC 3:** An "Edit" button (pencil icon) is added to each pantry item card.
- **AC 4:** Clicking the "Edit" button opens a modal that allows the user to modify the item's current quantity, unit, location, and restock threshold.
- **AC 5:** The overall styling, spacing, and interaction patterns match the `RecipeStore` cards for a unified system-wide experience.

### Story 4: Qualitative Ingredient States ("to taste" and "optional")

As a user browsing recipes, I want to see ingredients marked as "to taste" or "optional" qualitatively rather than as numeric 0 quantities, so that instructions are clear and accurate.

- **AC 1:** The `RecipeComponent` database model is updated to support qualitative flags (`isToTaste: Boolean` and `isOptional: Boolean`).
- **AC 2:** The `RecipeEditor` ingredient rows provide toggle checkboxes for "To Taste" and "Optional".
- **AC 3:** If "To Taste" is checked, the quantity input is disabled and the quantity field is rendered as "To Taste" in both the editor and the Recipe Detail View instead of `0`.
- **AC 4:** If "Optional" is checked, the ingredient name is suffixed with `(optional)` on the recipe card and detail pages.

## Implementation Plan

1. **Phase 1: Recipe Editor Enhancements & Qualitative States**
   - Update `RecipeComponent` database schema with `isToTaste` and `isOptional` Boolean fields.
   - Implement the inline edit form for `RecipeEditor`.
   - Implement the `userId` attachment and macro saving logic for dummy conversion.
   - Add "To Taste" and "Optional" toggle UI controls to the `RecipeEditor`.
2. **Phase 2: Pantry UI Refactor**
   - Update the `PantryItem` card component with new icons and standardized controls.
   - Implement the `EditPantryItemModal`.
3. **Phase 3: Validation & Testing**
   - Write E2E tests for the ingredient editing, qualitative states, and dummy conversion flows.
   - Verify consistency across different screen sizes.
