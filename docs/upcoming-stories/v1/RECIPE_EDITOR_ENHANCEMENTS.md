# Epic: Recipe Editor & Search Enhancements

## Objective

To improve the speed and ergonomics of the recipe creation process by enhancing the ingredient/sub-recipe search dialogs to support immediate parameter input (quantities, optional status, "to taste") inline, eliminating subsequent mouse clicks.

## Scope & Impact

- **UI/UX:** Modify the recipe editor ingredient autocomplete search lists to offer immediate input fields.
- **Component Editor:** Enable adding properties like "optional" or "to taste" directly from search results prior to committing the ingredient row.

## Implementation Steps (Stories)

### Story 1: Inline Ingredient Search Settings

As a chef adding ingredients to a recipe, I want to define their measurements, optional status, and "to taste" flag directly within the search autocomplete dropdown list so that I can draft the recipe rapidly without opening separate item modals later.

- **AC 1:** Update the `IngredientSearch` dropdown list so that when an ingredient is highlighted or selected, fields for `quantity`, `unit`, `isOptional`, and `isToTaste` appear inline within the dropdown card.
- **AC 2:** Pressing "Enter" or clicking the "+" button adds the ingredient with all those configured properties directly to the component list.
- **AC 3:** Ensure keyboard navigation is fully preserved, letting the user tab between these inline inputs seamlessly before saving.
