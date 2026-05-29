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
- **AC 2:** Add a "Current Week" button to the calendar and swap the previous/next week button positions for standard ergonomics.
- **AC 3:** Fix hover icon overlap issues on recipe grid square cards.

### Story 2: Ingredient Editor Layout Polish

As a user editing a recipe, I want a clean, non-repetitive layout for the ingredient fields so that I can easily configure and organize my components.

- **AC 1:** Remove the duplicate ingredient layout checkboxes outlined in `./docs/scratch/additional-ingredient-checkboxes.png`.
- **AC 2:** Move the action buttons below directly into the vacant slot left by the removed checkboxes, ensuring proper alignment.
- **AC 3:** Keep the other standard ingredient property checkboxes intact and properly spaced.
