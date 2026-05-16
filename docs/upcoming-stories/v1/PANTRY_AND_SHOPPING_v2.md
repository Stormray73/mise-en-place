# Upcoming Stories: Pantry & Shopping v2.0

## Story 1: Bulk Ingredient Format Support

As a chef, I want to track pantry items in "Quantity x Package Size" formats so that the inventory matches how items are purchased.

### Acceptance Criteria

- [ ] AC 1: The "Add Pantry Item" UI supports defining a `packageQuantity` (e.g., 12) and `packageSize` (e.g., 12 oz).
- [ ] AC 2: The Pantry UI displays the item as "12 x 12 oz" and optionally shows the total calculated amount (144 oz).
- [ ] AC 3: When decrementing from a recipe (e.g., using 15 oz), the logic intelligently handles partial packages or updates the total amount while visually representing the reduction.
- [ ] AC 4: Edge Case: Using less than a full package shouldn't erroneously delete the whole package.

## Story 2: Managed Pantry Locations

As a chef, I want to select locations from a managed list so that I avoid spelling errors and keep my pantry organized.

### Acceptance Criteria

- [ ] AC 1: Users can create, edit, and delete `PantryLocation` entities associated with their account.
- [ ] AC 2: The "Add/Edit Pantry Item" modal uses a dropdown populated with the user's `PantryLocation`s instead of a free-text input.
- [ ] AC 3: If a location is deleted, associated pantry items should either prompt for a new location or fall back to an "Uncategorized" default.
- [ ] AC 4: Edge Case: Attempting to create a duplicate location name (case-insensitive) should return an error.

## Story 3: Manual & Recurring Shopping List Items

As a chef, I want to add non-food or non-recipe items to my shopping list so that I can track all my household needs in one place.

### Acceptance Criteria

- [ ] AC 1: Users can add text-based items (e.g., "Paper Towels") to the shopping list that are not linked to the `Ingredient` table.
- [ ] AC 2: These items can optionally be marked as `isRecurring`.
- [ ] AC 3: When a recurring item is checked off, it is recreated or reset for the next cycle instead of permanently deleted.
- [ ] AC 4: Edge Case: Unchecking a recently checked recurring item should revert its state without duplicating the item.

## Implementation Plan

1. **Phase 1: Prisma Schema Updates**
   - Add `PantryLocation` model (`id`, `userId`, `name`).
   - Update `PantryItem` to reference `locationId` (foreign key) and add `packageQuantity`, `packageSize`.
   - Update `ShoppingListItem` to allow nullable `ingredientId` and add `isRecurring` (Boolean), `customName` (String).
   - Generate and apply migrations.
2. **Phase 2: Location Management**
   - Create `ManageLocationsModal` component.
   - Implement server actions for Location CRUD.
   - Update `AddPantryItemModal` to use a select input.
3. **Phase 3: Bulk Quantities**
   - Update Pantry views to display bulk format.
   - Refactor `autoDecrementPantry` in `lib/pantry.ts` to calculate total units, decrement, and recalculate package quantities (or simply decrement the total and represent as a fraction).
4. **Phase 4: Custom Shopping Items**
   - Update `ShoppingList` UI to support adding custom text items.
   - Update completion logic to handle `isRecurring` reset.
5. **Phase 5: Testing**
   - Unit tests for new decrement logic with bulk items.
   - Integration tests for custom shopping item CRUD.
   - E2E tests for Location creation and selection.
