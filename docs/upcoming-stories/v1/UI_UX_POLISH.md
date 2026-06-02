# Epic: v1.0 UI/UX Polish & Refinement

## Objective

To refine the user interface and overall user experience to ensure a premium, polished, and highly professional layout.

## Scope & Impact

- **General Layouts:** Widen the Meal Planner and Recipe Store pages to match the Pantry and Shopping List grid widths.
- **Navigation:** Improve date/week navigation controls.
- **Recipe Editor Refinement:** Fix layout glitches and duplicate inputs.

## Implementation Steps (Stories)

### Story 1: General Calendar and Grid Polish

As a user, I want the core planners and store to have consistent width and positioning so that the visual presentation is seamless across all features.

- **AC 1:** Widen the Meal Planner and Recipe Store page containers to match the layouts of the Pantry and Shopping List.
- **AC 2:** Add a "Current Week" button to the calendar, and ensure that the Previous Week button is on the left and the Next Week button is on the right for standard calendar ergonomics.
- **AC 3:** Fix hover icon overlap issues on recipe grid square cards.

### Story 2: Ingredient Editor Layout Polish

As a user editing a recipe, I want a clean, non-repetitive layout for the ingredient fields so that I can easily configure and organize my components.

- **AC 1:** Remove the duplicate ingredient layout checkboxes outlined in `./docs/scratch/additional-ingredient-checkboxes.png`.
- **AC 2:** Move the action buttons below directly into the vacant slot left by the removed checkboxes, ensuring proper alignment.
- **AC 3:** Keep the other standard ingredient property checkboxes intact and properly spaced.

### Story 3: Recipe Editor Yield & Servings UX Polish

As a user creating a new recipe, I want portions and yield fields to have no pre-selected/pre-filled default values, so that I am clearly prompted to enter accurate numbers and units required for precise nutrition and leftovers scaling.

- **AC 1:** In the recipe editor form, the `Servings` input should have no default number (i.e. empty or undefined, not defaulting to 1 or 4), and the `Yield Amount` input should default to empty/undefined when creating a new recipe.
- **AC 2:** The `Yield Unit` dropdown should have an empty/unselected first option (e.g. "Select Unit...") as the default selection, rather than defaulting to "servings", forcing the user to explicitly select the appropriate unit.
- **AC 3:** Ensure that client-side validation displays a clear error warning if the user attempts to save a recipe with an empty yield amount or unselected yield unit, helping maintain high data quality for downstream prep-ahead and leftover allocations.

### Story 4: Import Dialog Hover Layout Refinement

As a user, I want the import recipe dialog container to remain stable in size when hovering over action buttons, so that no unexpected horizontal or vertical scrollbars appear on the screen.

- **AC 1:** Investigate and resolve the layout glitch illustrated in `./docs/screenshots/import-scroll-bars.png` where hovering over the "Import" action button inside the import modal causes horizontal and vertical scrollbars to briefly or permanently appear.
- **AC 2:** Ensure the `Modal` body/container has robust overflow constraints (e.g. hidden or auto scrollbars without layout shifting) or that button hover transitions (e.g. scales, margins, shadows, or outline/borders) do not shift adjacent elements or expand the container beyond its limits.
