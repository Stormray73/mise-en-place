# Upcoming Stories: UI/UX Polish (Completed)

This epic tracks minor styling tweaks, layout improvements, and ergonomic refinements to ensure a high-quality user experience for v1.0.

## 1. Meal Planner UI Refinements

- [x] **Widen UI (Initial):** Increase the overall max-width of the meal planner page to `max-w-[1600px]` to better utilize screen real estate on desktop monitors.
- [x] **Full-Width Layout:** Widen the UI to match the [meal-planner-mockup](../../screenshots/meal-planner-mockup.png) and the Pantry/Shopping List UI. It should take up the full screen on desktop and collapse to a single column on smaller screens.
- [x] **Navigation Ergonomics:** Add a "Back to Current Week" button. Reposition the navigation buttons so "Previous Week" is on the far left and "Next Week" is on the far right.
- [x] **Macro Legibility:** Ensure macro text (calories, protein, etc.) is sufficiently prominent within each day's slot.
- [x] **Calendar Alignment:** Change the meal-prep week start from Saturday to Sunday to align with traditional calendars and improve user predictability.

## 2. Cook Mode Ergonomics

- [x] **Streamline Navigation:** Remove redundant 'Exit' buttons if there is already a standard 'X' or if it is unnecessary for the workflow, reducing visual clutter.

## 3. General Layout

- [x] **Dashboard Densification:** Continue to monitor and improve content density on the main dashboard hub for larger screens.

## 4. Recipe Store UI Refinements

- [x] **Full-Width Layout:** Widen the Recipe Store UI to match the [recipe-store-mockup](../../screenshots/recipe-store-mockup.png) and the Pantry/Shopping List UI. It should take up the full screen on desktop and collapse to a single column on smaller screens.
- [x] **Card Ergonomics:** Adjust the spacing/layout of recipe items so that the edit and delete icons do not obscure the text when hovered over.

## 5. Recipe Editor, Pantry, & Transition Polish

- [x] **Disable Recipe Save Button during Saving:** When editing a recipe, upon selection of the save button, the button should be disabled and show saving (e.g. "Saving...") so that the user is provided with feedback and doesn't re-submit or re-click.
- [x] **Pantry Match Indicator:** When adding an ingredient to the pantry, replace the small text-based label `Selected: [Ingredient Name]` below the input. Instead, preserve the selection inside the dropdown field and display a green checkmark next to the name to clearly signify a successful API match.
- [x] **Dropdown Keyboard Accessibility:** Enable full keyboard navigation (Up/Down arrow keys for highlighting, Enter to select, Escape to dismiss) for all ingredient-adding dropdown inputs across the pantry and recipe editing views.
- [x] **Page Transition Loading Indicator:** Add a subtle visual transition loading indicator (e.g., an animated top progress bar or overlay spinner) during slow network route transitions to reassure the user that the application is actively processing their request.
