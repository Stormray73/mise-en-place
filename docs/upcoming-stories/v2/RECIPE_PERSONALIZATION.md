# Upcoming Stories: Recipe Personalization

## Story 1: Recipe Images

As a chef, I want to upload a picture of my cooked meal so that I can easily recognize it in my recipe book.

### Acceptance Criteria

- [ ] Users can upload an image (PNG, JPG) from the Recipe Editor or View pages.
- [ ] Images are stored in an external object store (e.g., Vercel Blob).
- [ ] The Recipe grid view displays the uploaded image as a "profile picture" for the recipe.
- [ ] If no image is uploaded, a generic food-themed placeholder is shown.
- [ ] Users can replace or delete the existing image.

### Technical Notes

- Add `imageUrl String?` to the `Recipe` model in `schema.prisma`.
- Implement a Vercel Blob client for handling uploads.
- Secure the upload action to ensure users can only upload for their own recipes.

---

## Story 2: Favorites & Custom Tags

As a chef, I want to tag and favorite my recipes so that I can quickly filter and find what I'm looking for.

### Acceptance Criteria

- [ ] Users can toggle a "Favorite" star on any recipe.
- [ ] Users can create and assign custom text tags (e.g., "Quick", "Vegan", "Spicy") to recipes.
- [ ] The Recipe Store includes filters for "Favorites" and specific "Tags".
- [ ] Tag suggestions appear as the user types when adding tags to a recipe.

### Technical Notes

- Add `isFavorite Boolean @default(false)` to the `Recipe` model.
- Create a `Tag` model and a many-to-many relationship with `Recipe`.
- Update the recipe search API to support tag and favorite filtering.
