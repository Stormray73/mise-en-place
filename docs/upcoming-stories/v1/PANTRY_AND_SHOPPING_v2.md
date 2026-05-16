# Upcoming Stories: Pantry & Shopping v2.0

## Story: Bulk Ingredient Tracking

As a chef, I want to track my pantry items in "Bulk" formats (e.g., packages, tins) so that the inventory reflects how I actually buy and use products.

### Acceptance Criteria

- [ ] Users can add items in a "Quantity x Package Size" format (e.g., 12 x 1lb ground beef, or 12 x 12oz tins of beans).
- [ ] The UI displays both the total amount (144oz) and the individual unit count (12 tins).
- [ ] Decrementing logic should ideally account for opening a new package vs using a partial package.

## Story: Location Management

As a chef, I want to select locations from a managed list so that I don't make spelling errors and my pantry remains organized.

### Acceptance Criteria

- [ ] A "Manage Locations" button opens a modal to view/add/edit/delete pantry locations (e.g., Freezer, Basement, Pantry Shelf).
- [ ] The "Add Pantry Item" modal uses a dropdown for Location instead of a free-text field.
- [ ] Locations are scoped to the user's account.

## Story: Manual Shopping List Items

As a chef, I want to add non-food or non-recipe items to my shopping list so that it can be my single source of truth for grocery trips.

### Acceptance Criteria

- [ ] Users can manually add items like "Paper Towels" or "Dish Soap" to the shopping list.
- [ ] These items do not need to be linked to a recipe or pantry item.
- [ ] Option to make these items "Recurring" (e.g., every 2 weeks).

### Technical Notes

- Update `ShoppingListItem` model to support non-ingredient entries.
- Implement Location management as a separate table `PantryLocation`.
