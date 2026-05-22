# Epic: UI/UX Polish & Refinement

## Objective

To refine the user interface and user experience across the application, adding micro-interactions, resolving layout inconsistencies, and improving interactive elements to provide clear visual feedback.

## Scope & Impact

- **Recipe Editor:** Improve the saving experience to prevent double-submits.
- **Other Polish Items:** Track minor styling and accessibility tweaks throughout the application.

## UI/UX Polish Checklist

### Recipe Editor

- [x] **Disable Recipe Save Button during Saving:** When editing a recipe, upon selection of the save button, the button should be disabled and show saving (e.g. "Saving...") so that the user is provided with feedback and doesn't re-submit or re-click.

### Pantry & Ingredients

- [ ] **Pantry Match Indicator:** When adding an ingredient to the pantry, replace the small text-based label `Selected: [Ingredient Name]` below the input. Instead, preserve the selection inside the dropdown field and display a green checkmark next to the name to clearly signify a successful API match.
- [ ] **Dropdown Keyboard Accessibility:** Enable full keyboard navigation (Up/Down arrow keys for highlighting, Enter to select, Escape to dismiss) for all ingredient-adding dropdown inputs across the pantry and recipe editing views.

### Global Navigation

- [ ] **Page Transition Loading Indicator:** Add a subtle visual transition loading indicator (e.g., an animated top progress bar or overlay spinner) during slow network route transitions to reassure the user that the application is actively processing their request.
