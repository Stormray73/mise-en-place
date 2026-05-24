# Recipes Domain

## Overview

This domain manages the core recipe lifecycle: creation, editing, nutrition calculation, and viewing. It supports nested sub-recipes and scales ingredients based on yield.

## Implementation Details

- **Logic:** `lib/recipes.ts` (data access) and `app/recipes/actions.ts` (mutations).
- **Ingredient-Specific Actions:** `app/recipes/ingredient-actions.ts` handles actions scoped to recipe components (e.g., swapping an ingredient), keeping `actions.ts` focused on recipe-level CRUD.
- **UI:** `components/RecipeEditor.tsx` and `components/RecipeView.tsx`.
- **Route Structure:**
  - `app/recipes/` — Recipe list/store page (supports `drafts=true` query parameter for the Draft Recipes workspace and `page=[num]` for pagination)
  - `app/recipes/new/` — New recipe creation page
  - `app/recipes/[id]/` — Recipe detail view
  - `app/recipes/[id]/edit/` — Recipe editing page (loads `RecipeEditor`)
  - `app/recipes/[id]/play/` — Step-by-step play mode (loads `RecipePlayMode`)
- **Drafts Workspace:** Ingestion via bulk-import saves recipes as `status: "DRAFT"`. Unapproved drafts are shown in `/recipes?drafts=true` using a dedicated purple glassmorphic paginated grid. Promoting a draft to `"PUBLISHED"` occurs automatically when saved in the editor.
- **Sub-Recipe Auto-Linking:** During bulk import, parsed ingredients matching the titles of existing user recipes or other recipes in the same import batch (case-insensitively, with common noise words like "chopped", "sliced", parentheticals, and "optional" indicators stripped) are auto-linked as `sub-recipe` components rather than raw ingredients.
- **Favorites & Tags:** Recipes support a `isFavorite` flag and multiple `Tag`s. Tags are user-specific and managed via `connectOrCreate` in the data layer.
- **Importing & Scraping:** Recipes can be imported from URLs using the `scrapeRecipeAction`. Additionally, the system supports importing via raw text, images (vision API), and documents (`.pdf`, `.docx`) which are processed by the Vercel AI SDK and specialized extractors (`pdf2json`, `mammoth`). Logic resides in `lib/scraper.ts`, `lib/ai-parser.ts`, and `lib/file-extractor.ts`.
- **Image Storage:** Recipe images are stored in Cloudflare R2 buckets using the `@aws-sdk/client-s3` compatible interface. Logic resides in `lib/r2.ts`.
- **Scaling:** Uses `yieldAmount` and `yieldUnit` to scale `RecipeComponent` quantities during playback or as a sub-recipe.

## Invariants & Constraints

- **Circular Dependencies:** A recipe cannot be added to itself as a sub-recipe.
- **Draft Promotion:** Saving a recipe via `saveRecipeAction` automatically promotes its status from `"DRAFT"` to `"PUBLISHED"`.
- **Sub-Recipe Auto-Linking:** Checks case-insensitively against active and draft recipe titles (noise words and parentheticals stripped) to automatically set `type: "sub-recipe"` and reference the matched recipe. Linked sub-recipes render with a visual badge and chain icon in the editor (`ComponentList.tsx`) and as clickable detail links in the read-only detail view (`RecipeView.tsx`).
- **Inline Ingredient Editor:** The recipe editor (`components/ComponentList.tsx`) supports in-place ingredient editing with a waterfall search autocomplete (`/api/usda/search`) and instant macro recalculations in the React state.
- **Tags:** Tag names are unique per user. They are automatically created when added to a recipe if they don't exist.
- **Nutrition:** Macros are always stored per `baseAmount` (usually 100g) on the `Ingredient` model and scaled based on component `quantity`.
- **Yield Units:** Must be supported by `lib/units.ts` for automated conversion.

## Testing Strategy

- **Unit Tests:** `__tests__/lib/recipes.test.ts` covers scaling, nutrition aggregation, and tag/favorite persistence.
- **E2E Tests:** `tests/e2e/recipe-store.spec.ts` covers the full CRUD flow. `tests/e2e/favorites-tags.spec.ts` covers filtering and toggling. `tests/e2e/web-scraping.spec.ts` covers the URL import flow. `tests/e2e/custom-ingredients.spec.ts` covers custom ingredient creation.
- **Regression:** Always verify that manual macro overrides are respected when calculating total recipe nutrition.
