# Shared Components

## Overview

Contains all reusable React components consumed by pages across the app. These are **presentational and interactive UI components** — they receive data and callbacks from their parent pages/server components and are not responsible for data fetching.

## Component Map

### Recipe

| File                    | Purpose                                                                                                                                                               |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RecipeEditor.tsx`      | Full recipe creation/editing form. Manages components (ingredients + sub-recipes), steps, tags, images, and yield. Calls `actions.ts` in `app/recipes/`.              |
| `RecipeView.tsx`        | Read-only recipe display with scaling controls. Shows macros, components, and steps. Renders in the `/recipes/[id]` view.                                             |
| `RecipePlayMode.tsx`    | Step-by-step "cook along" mode. Handles active timers, ingredient highlighting (via `lib/ingredient-matcher.ts`), and triggers pantry deduction on completion.        |
| `ComponentList.tsx`     | Ingredient and sub-recipe list within `RecipeEditor`. Handles add/remove/reorder and inline unit/quantity editing. The most complex component in the codebase (17KB). |
| `ImportRecipeModal.tsx` | Multi-mode import modal: URL scraping, raw text paste, image upload (vision API), and document upload (PDF/DOCX). Calls the upload API and recipe actions.            |
| `StepManager.tsx`       | Step list editor within `RecipeEditor`. Handles add/remove/reorder and inline instruction editing.                                                                    |

### Ingredient & Search

| File                           | Purpose                                                                                                                                                                                         |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IngredientSearch.tsx`         | Unified ingredient search component. Queries `GET /api/usda/search` and returns results merging custom ingredients, USDA, and Open Food Facts. Used in `RecipeEditor` and `AddPantryItemModal`. |
| `DummyIngredientConverter.tsx` | Form component used inside `ComponentList` during recipe editing to define macronutrients for imported dummy ingredients and convert them into saved custom ingredients.                        |

### Meal Planner

| File                   | Purpose                                                                                                            |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `MealSlot.tsx`         | Renders a single meal slot (e.g., Breakfast) within the calendar. Manages drag-and-drop and inline recipe actions. |
| `PlannedRecipeRow.tsx` | A single planned recipe entry within a `MealSlot`. Shows scale controls, leftover links, and a remove button.      |
| `AddMealModal.tsx`     | Modal for adding a new meal slot to a calendar day.                                                                |
| `EditMealModal.tsx`    | Modal for editing an existing meal (slot, date, planned recipes).                                                  |
| `CloneMealModal.tsx`   | Modal for duplicating a meal to another date.                                                                      |
| `AddRecipeModal.tsx`   | Modal for searching and selecting a recipe to add to a meal.                                                       |

### Pantry & Shopping

| File                        | Purpose                                                                                                                         |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `AddPantryItemModal.tsx`    | Modal for adding a new pantry stock entry. Uses `IngredientSearch` for ingredient selection.                                    |
| `EditPantryItemModal.tsx`   | Modal for editing an existing pantry item's quantity, unit, location, or thresholds.                                            |
| `ManageLocationsModal.tsx`  | Modal for creating/renaming/deleting `PantryLocation` records.                                                                  |
| `CustomIngredientModal.tsx` | Modal for creating a custom ingredient with manually entered macros (when USDA data is unavailable).                            |
| `ShoppingListWidget.tsx`    | Compact shopping list summary shown on the dashboard hub. Not the full shopping list page — see `app/dashboard/shopping-list/`. |

### Navigation & Layout

| File                 | Purpose                                                                                 |
| :------------------- | :-------------------------------------------------------------------------------------- |
| `Header.tsx`         | App-wide navigation header. Conditionally renders nav links based on auth state.        |
| `SearchBar.tsx`      | Generic debounced search input.                                                         |
| `FavoriteToggle.tsx` | Heart icon toggle for marking a recipe as a favorite. Calls the recipe favorite action. |
| `DeleteButton.tsx`   | Confirmation-based delete button. Used for recipes, pantry items, etc.                  |
| `LogoutButton.tsx`   | Sign-out button using NextAuth's `signOut`.                                             |

## `ui/` Primitives

Custom-built, unstyled base components (not from an external library):

| File               | Purpose                                                                                                                                                                                   |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Autocomplete.tsx` | Dropdown input with async search support, including full keyboard accessibility (Arrow keys, Enter to select, Escape to dismiss) and API Match status checks. Used by `IngredientSearch`. |
| `Button.tsx`       | Styled button with variant and size props.                                                                                                                                                |
| `Card.tsx`         | Content card wrapper.                                                                                                                                                                     |
| `Input.tsx`        | Styled text input.                                                                                                                                                                        |
| `Modal.tsx`        | Accessible modal dialog wrapper (focus trap, backdrop).                                                                                                                                   |
| `Select.tsx`       | Styled native `<select>` wrapper.                                                                                                                                                         |

## Invariants & Constraints

- Components **must not** import directly from each other's parent page/route directories.
- All data mutation calls go through Server Actions in the relevant `actions.ts` file, not inline fetch calls.
- `Autocomplete.tsx` supports full keyboard navigation (arrow keys to highlight, Enter to select, Escape to dismiss). When selection matches an API returned item, it preserves the selection inside the dropdown field and displays a green checkmark next to the name to clearly signify a successful API match.
- `RecipePlayMode.tsx` is the **only** component that calls `deductFromPantry` — do not duplicate this logic elsewhere.
