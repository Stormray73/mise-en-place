# Product Roadmap

This document outlines the priority implementation order for cherry-picked features.

---

## 1. Custom Ingredients (Story 3)

_Status: In Planning_

As a chef, I want to create and manage my own ingredients so that I can accurately track macros for all my recipes when the USDA database falls short.

### Story 3.1: Inline Custom Ingredient Creation

**As a chef, I want to create a custom ingredient directly from the recipe editor so that I don't have to lose my progress when an ingredient is missing.**

- [ ] AC 1: `IngredientSearch` includes an "Add Custom Ingredient" action when searching.
- [ ] AC 2: A modal allows entry of Name, Base Amount, Unit, and Macros (Calories, Protein, Fat, Carbs).
- [ ] AC 3: New ingredients are saved to the database and linked to the user's ID.
- [ ] AC 4: The new ingredient is automatically selected and added to the current recipe.

### Story 3.2: Custom Ingredient Search & Inline Edit

**As a chef, I want my custom ingredients to appear in searches and be editable on-the-fly so that I can reuse and correct them easily.**

- [ ] AC 1: Search results merge USDA data with the user's custom ingredients.
- [ ] AC 2: Custom ingredients in the dropdown display an "Edit" icon.
- [ ] AC 3: Clicking the Edit icon opens the `CustomIngredientModal` with pre-filled data.
- [ ] AC 4: Updates to the ingredient reflect immediately in the search and any active recipe components.

### Story 3.3: Custom Ingredient Dashboard Management

**As a chef, I want to view and manage all my custom ingredients in the pantry dashboard so that I have a central place for inventory and corrections.**

- [ ] AC 1: A "My Ingredients" section exists in the Pantry dashboard (`app/dashboard/pantry`).
- [ ] AC 2: Displays a list of all user-created ingredients.
- [ ] AC 3: Users can Edit or Delete ingredients from this view.
- [ ] AC 4: Deletion requires confirmation and warns if the ingredient is currently used in recipes.

### Technical Notes

- **Schema:** Add `userId String?` to `Ingredient` with a relation to `User`.
- **API:** Update `/api/usda/search` or create a unified search action to merge local and remote results.
- **UI:** Create `CustomIngredientModal.tsx` as a shared component for stories 3.1, 3.2, and 3.3.

---

## 2. Favorites & Custom Tags (Story 2)

_Status: Organization & Discovery_

As a chef, I want to tag and favorite my recipes so that I can quickly filter and find what I'm looking for.

### Acceptance Criteria

- [ ] Users can toggle a "Favorite" star on any recipe.
- [ ] Users can create and assign custom text tags (e.g., "Quick", "Vegan", "Spicy") to recipes.
- [ ] The Recipe Store includes filters for "Favorites" and specific "Tags".
- [ ] Tag suggestions appear as the user types when adding tags to a recipe.

### Technical Notes

- Add `isFavorite Boolean @default(false)` to the `Recipe` model.
- Create a `Tag` model and a many-to-many relationship with `Recipe`.

---

## 3. Web Scraping Import (Story 5)

_Status: Advanced Automation_

As a chef, I want to import recipes from websites by URL so that I can quickly add them to my collection without manual typing.

### Acceptance Criteria

- [ ] Users can paste a URL to import a recipe.
- [ ] The system extracts title, ingredients, steps, and servings from the page.
- [ ] If macros are present on the page, they are imported; otherwise, the USDA API is used to calculate them.

### Technical Notes

- Use a library or custom logic to extract Schema.org (JSON-LD) metadata for high accuracy without LLM requirements.

---

## 4. Dashboard & Landing Page (Story 11)

_Status: Polish & Acquisition_

As a new user, I want to understand what Mise-en-place does so that I can decide to sign up.

### Acceptance Criteria

- [ ] Dashboard: Remove extraneous navigation buttons; focus on "Quick Actions" (Add Recipe, Plan Meal).
- [ ] Landing Page: Showcase a demo workflow, key features (Recipe Store, Planner, Pantry), and screenshots.
- [ ] Landing Page: Clear "Sign Up with Google" CTA.
