# Upcoming Stories: Ingredient Mastery

## Story 3: Custom Ingredients

As a chef, I want to create my own ingredients when they aren't found in the USDA database so that I can accurately track macros for all my recipes.

### Acceptance Criteria

- [ ] If an ingredient search returns no results (or the user chooses), they can "Create Custom Ingredient".
- [ ] Users can manually enter name, base amount, unit, and macro data (Protein, Fat, Carbs, Calories).
- [ ] Custom ingredients appear in the search dropdown alongside USDA results.
- [ ] Users can edit the data for custom ingredients they have created.

### Technical Notes

- Add `userId String?` to the `Ingredient` model to track ownership of custom ingredients.
- Update `IngredientSearch` component to allow manual entry fallback.
- Ensure validation for macro inputs (non-negative numbers).

---

## Story 4: Ingredient Data Crowdsourcing (Phase 2)

As a chef, I want to benefit from ingredients created by others so that I don't have to manually enter common items missing from the USDA.

### Acceptance Criteria

- [ ] Users can opt-in to making their custom ingredients "Global".
- [ ] A moderation or "Verification" flag for global ingredients.
- [ ] Global ingredients are searchable by all users, but only editable by the creator or admins.

### Technical Notes

- Add `isGlobal Boolean @default(false)` to the `Ingredient` model.
- Implement a reporting or voting system for ingredient accuracy.
