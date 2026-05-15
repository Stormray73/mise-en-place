# Product Roadmap

This document outlines the priority implementation order for cherry-picked features.

---

## 1. Custom Ingredients (Story 3)

_Status: Foundational Functional Gap_

As a chef, I want to create my own ingredients when they aren't found in the USDA database so that I can accurately track macros for all my recipes.

### Acceptance Criteria

- [ ] If an ingredient search returns no results (or the user chooses), they can "Create Custom Ingredient".
- [ ] Users can manually enter name, base amount, unit, and macro data (Protein, Fat, Carbs, Calories).
- [ ] Custom ingredients appear in the search dropdown alongside USDA results.
- [ ] Users can edit the data for custom ingredients they have created.

### Technical Notes

- Add `userId String?` to the `Ingredient` model to track ownership.
- Update `IngredientSearch` component to allow manual entry fallback.

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

- Use a custom LLM-based scraper (Gemini) for high accuracy.

---

## 4. File & Image Import (OCR) (Story 6)

_Status: Advanced Automation_

As a chef, I want to upload pictures or PDFs of my recipe books so that I can digitize my physical collection.

### Acceptance Criteria

- [ ] Users can upload a PDF or image of a recipe.
- [ ] The system uses OCR to extract text and structure it into a Recipe object.
- [ ] Users are presented with a review screen to correct any extraction errors before saving.

### Technical Notes

- Integrate with an LLM with vision capabilities (Gemini Pro Vision).

---

## 5. Dashboard & Landing Page (Story 11)

_Status: Polish & Acquisition_

As a new user, I want to understand what Mise-en-place does so that I can decide to sign up.

### Acceptance Criteria

- [ ] Dashboard: Remove extraneous navigation buttons; focus on "Quick Actions" (Add Recipe, Plan Meal).
- [ ] Landing Page: Showcase a demo workflow, key features (Recipe Store, Planner, Pantry), and screenshots.
- [ ] Landing Page: Clear "Sign Up with Google" CTA.
