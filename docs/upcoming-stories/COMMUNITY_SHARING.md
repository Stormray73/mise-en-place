# Upcoming Stories: Community & Sharing

## Story 8: Public Sharing & Play Mode

As a chef, I want to share my recipes with friends so they can see how I cook, even if they don't have an account.

### Acceptance Criteria

- [ ] Users can toggle a recipe's visibility to "Public".
- [ ] A unique shareable URL is generated for public recipes.
- [ ] Non-signed-in users can view the recipe and use "Play Mode" (step-by-step instructions with timers).
- [ ] Signed-in users see an "Add to my recipes" button when viewing a shared recipe.

### Technical Notes

- Add `isPublic Boolean @default(false)` to the `Recipe` model.
- Update middleware/auth to allow read access to specific public routes.

---

## Story 9: Community Discovery & Privacy

As a chef, I want to browse recipes shared by the community while maintaining my privacy.

### Acceptance Criteria

- [ ] A "Community" tab in the Recipe Store shows public recipes from all users.
- [ ] Users can search the community database by title, tag, or ingredient.
- [ ] Privacy: Users can set a "Display Name" that is shown on public recipes instead of their real name or email.
- [ ] Metric: Recipes display a "Save Count" (how many times they've been added by others).

### Technical Notes

- Add `displayName String?` to the `User` model.
- Implement a "Save" action that clones a public recipe into the user's personal collection.
