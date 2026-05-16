# Product Roadmap

This document outlines the priority implementation order for cherry-picked features.

---

## 1. Custom Ingredients (Story 3)

_Status: Completed_

### Story 3.1: Inline Custom Ingredient Creation

- [x] AC 1: `IngredientSearch` includes an "Add Custom Ingredient" action when searching.
- [x] AC 2: A modal allows entry of Name, Base Amount, Unit, and Macros (Calories, Protein, Fat, Carbs).
- [x] AC 3: New ingredients are saved to the database and linked to the user's ID.
- [x] AC 4: The new ingredient is automatically selected and added to the current recipe.

### Story 3.2: Custom Ingredient Search & Inline Edit

- [x] AC 1: Search results merge USDA data with the user's custom ingredients.
- [x] AC 2: Custom ingredients in the dropdown display an "Edit" icon.
- [x] AC 3: Clicking the Edit icon opens the `CustomIngredientModal` with pre-filled data.
- [x] AC 4: Updates to the ingredient reflect immediately in the search and any active recipe components.

### Story 3.3: Custom Ingredient Dashboard Management

- [x] AC 1: A "My Ingredients" section exists in the Pantry dashboard (`app/dashboard/pantry`).
- [x] AC 2: Displays a list of all user-created ingredients.
- [x] AC 3: Users can Edit or Delete ingredients from this view.
- [x] AC 4: Deletion requires confirmation and warns if the ingredient is currently used in recipes.

---

## 2. Favorites & Custom Tags (Story 2)

_Status: Completed_

- [x] Users can toggle a "Favorite" star on any recipe.
- [x] Users can create and assign custom text tags (e.g., "Quick", "Vegan", "Spicy") to recipes.
- [x] The Recipe Store includes filters for "Favorites" and specific "Tags".
- [x] Tag suggestions appear as the user types when adding tags to a recipe.

---

## 3. Web Scraping Import (Story 5)

_Status: Completed_

- [x] Users can paste a URL to import a recipe.
- [x] The system extracts title, ingredients, steps, and servings from the page.
- [x] If macros are present on the page, they are imported; otherwise, the USDA API is used to calculate them.

---

## 4. Dashboard & Landing Page (Story 11)

_Status: Completed_

- [x] Dashboard: Remove extraneous navigation buttons; focus on "Quick Actions" (Add Recipe, Plan Meal).
- [x] Landing Page: Showcase a demo workflow, key features (Recipe Store, Planner, Pantry), and screenshots.
- [x] Landing Page: Clear "Sign Up with Google" CTA.
