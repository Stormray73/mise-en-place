# Recipes Domain

## Overview

This domain manages the core recipe lifecycle: creation, editing, nutrition calculation, and viewing. It supports nested sub-recipes and scales ingredients based on yield.

## Implementation Details

- **Logic:** `lib/recipes.ts` (data access) and `app/recipes/actions.ts` (mutations).
- **UI:** `components/RecipeEditor.tsx` and `components/RecipeView.tsx`.
- **Favorites & Tags:** Recipes support a `isFavorite` flag and multiple `Tag`s. Tags are user-specific and managed via `connectOrCreate` in the data layer.
- **Web Scraping:** Recipes can be imported from URLs using the `scrapeRecipeAction`. It extracts Schema.org (JSON-LD) metadata to pre-fill the editor. Logic resides in `lib/scraper.ts`.
- **Scaling:** Uses `yieldAmount` and `yieldUnit` to scale `RecipeComponent` quantities during playback or as a sub-recipe.

## Invariants & Constraints

- **Circular Dependencies:** A recipe cannot be added to itself as a sub-recipe.
- **Tags:** Tag names are unique per user. They are automatically created when added to a recipe if they don't exist.
- **Nutrition:** Macros are always stored per `baseAmount` (usually 100g) on the `Ingredient` model and scaled based on component `quantity`.
- **Yield Units:** Must be supported by `lib/units.ts` for automated conversion.

## Testing Strategy

- **Unit Tests:** `__tests__/lib/recipes.test.ts` covers scaling, nutrition aggregation, and tag/favorite persistence.
- **E2E Tests:** `tests/e2e/recipe-store.spec.ts` covers the full CRUD flow. `tests/e2e/favorites-tags.spec.ts` covers filtering and toggling.
- **Regression:** Always verify that manual macro overrides are respected when calculating total recipe nutrition.
