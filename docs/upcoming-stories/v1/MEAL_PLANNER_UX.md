# Epic: Meal Planner UX Overhaul

## Objective

To simplify the Meal Planner calendar UI, improve accessibility by moving dense controls into a dedicated modal, streamline the meal creation workflow, and reduce noise in the Prep Ahead dashboard.

## Scope & Impact

- **Calendar UI:** Remove all tiny controls (scale, prep state, leftover toggles) from the daily calendar view.
- **Navigation:** Recipe names on the calendar become simple links directly to the Recipe View page. Meal names (e.g., "Lunch") become clickable triggers that open a new "Edit Meal" modal.
- **Workflow:** The "Add Meal" action will instantly transition into a "Select Recipe" flow, saving the user from having to click the meal again to add the first recipe.
- **Prep List:** Add the ability to dismiss/delete individual items from the Prep Ahead dashboard.

## Implementation Steps (Stories)

### Story 1: Streamlined "Add Meal" Workflow

**As a user planning a meal, I want to immediately pick a recipe after creating a meal slot so that I don't have to perform extra clicks.**

- **AC 1:** When a user submits the "Add Meal" form (selecting a Date and Slot like "Dinner"), the modal does not close.
- **AC 2:** Instead, the modal instantly transitions its content to a Recipe search/selection interface to allow the user to select the first recipe for that newly created meal.
- **AC 3:** Once a recipe is selected and saved, the modal closes and the calendar updates.

### Story 2: Simplified Calendar & "Edit Meal" Modal

**As a user viewing my week, I want a clean calendar and larger, accessible controls when I need to adjust my meal plans.**

- **AC 1:** The `MealSlot` component on the calendar is updated. The dense `PlannedRecipeRow` controls (scale, NP, LS, Prep textbox) are removed from the calendar view entirely.
- **AC 2:** Recipe names displayed on the calendar are standard Next.js `<Link>` tags that navigate directly to `/recipes/[id]` (the Recipe View page) so users can immediately see ingredients and "Cook it".
- **AC 3:** The Meal Name (e.g., "Dinner") in the calendar view becomes a clickable button. Clicking it opens an "Edit Meal" modal.
- **AC 4:** The "Edit Meal" modal is vertically scrollable and displays the expanded, full-sized controls (Scale, Prep Instructions textbox, Leftover Toggles, Delete Recipe button) for _every_ recipe currently assigned to that meal.
- **AC 5:** The "Edit Meal" modal includes a prominent button to "Add another recipe" to that specific meal.
- **AC 6:** The "Edit Meal" modal includes a "Delete Meal" button that allows the user to remove the entire meal (and all its planned recipes) at once.

### Story 3: Prep List Noise Reduction

**As a user prepping for the week, I want to remove ingredients that don't actually require preparation so my list is actionable.**

- **AC 1:** The `PrepAheadDashboard` is updated to include a "Dismiss" or "Remove" button (e.g., an 'X' or trash icon) next to each aggregated prep item.
- **AC 2:** Clicking this button hides/removes that specific ingredient from the prep list for the selected timeframe (this will likely require adding a `dismissed` flag to the underlying data model or an ignore list).
- **AC 3:** (Future AI Integration Note): The system is prepared to eventually use the AI parser to flag non-preppable items automatically to hide them by default.
