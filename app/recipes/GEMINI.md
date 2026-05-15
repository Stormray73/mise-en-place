# Recipes Domain

## Overview

This domain manages the core recipe lifecycle: creation, editing, nutrition calculation, and viewing. It supports nested sub-recipes and scales ingredients based on yield.

## Implementation Details

- **Logic:** `lib/recipes.ts` (data access) and `app/recipes/actions.ts` (mutations).
- **UI:** `components/RecipeEditor.tsx` and `components/RecipeView.tsx`.
- **Scaling:** Uses `yieldAmount` and `yieldUnit` to scale `RecipeComponent` quantities during playback or as a sub-recipe.

## Invariants & Constraints

- **Circular Dependencies:** A recipe cannot be added to itself as a sub-recipe.
- **Nutrition:** Macros are always stored per `baseAmount` (usually 100g) on the `Ingredient` model and scaled based on component `quantity`.
- **Yield Units:** Must be supported by `lib/units.ts` for automated conversion.

## Testing Strategy

- **Unit Tests:** `__tests__/lib/recipes.test.ts` covers scaling and nutrition aggregation.
- **E2E Tests:** `tests/e2e/recipe-store.spec.ts` covers the full CRUD flow.
- **Regression:** Always verify that manual macro overrides are respected when calculating total recipe nutrition.
