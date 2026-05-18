# Upcoming Stories: Advanced Scheduling

## Story 1: Automatic Meal Time-of-Day Ordering

As a chef, I want my planned meals to be ordered chronologically (Breakfast > Lunch > Dinner) so that my daily schedule is predictable.

### Acceptance Criteria

- [ ] AC 1: Meals added to a specific date are visually sorted in the order: Breakfast, Lunch, Dinner.
- [ ] AC 2: If a meal is added out of order (e.g., Breakfast added after Dinner is already planned), the UI and underlying data reflect the correct chronological order.
- [ ] AC 3: Edge Case: If multiple "Snacks" or custom meals are added, they append to the bottom in the order they were created.

## Story 2: Drag-and-Drop Custom Meal Ordering

As a chef, I want to reorder my custom meals (snacks, desserts) so that I can place them in my timeline where they belong.

### Acceptance Criteria

- [ ] AC 1: Custom meals in the calendar view display a drag handle.
- [ ] AC 2: Users can drag a custom meal above or below other meals on the same day.
- [ ] AC 3: The new order persists across page reloads (requires `sortOrder` field in DB).
- [ ] AC 4: Standard presets (Breakfast, Lunch, Dinner) should remain anchored to their chronological order or provide visual feedback if drag-and-drop is restricted for them.

## Story 3: Prep-Ahead Exclusions

As a chef, I want to exclude certain items from my prep-ahead list so that the list focuses only on items requiring advanced preparation.

### Acceptance Criteria

- [ ] AC 1: Users can mark a `PlannedRecipe` as "Exclude from Prep" via a toggle or button in the meal planner or recipe view.
- [ ] AC 2: Items marked as excluded do not appear on the Prep-Ahead Dashboard aggregator.
- [ ] AC 3: Users can quickly dismiss/exclude an item directly from the Prep-Ahead Dashboard UI.
- [ ] AC 4: Edge Case: If an excluded item is duplicated/cloned to another day, its exclusion status should be inherited.

## Implementation Plan

1. **Phase 1: Data Model Updates**
   - Add `sortOrder` (Int, default 0) to `PlannedMeal` model.
   - Add `excludeFromPrep` (Boolean, default false) to `PlannedRecipe` model.
   - Run Prisma migration.
2. **Phase 2: Logic Updates**
   - Update `getWeeklyMealPlan` to sort meals by: fixed preset order (Breakfast=1, Lunch=2, Dinner=3, Custom=4), then by `sortOrder`.
   - Update `getPrepAheadData` to filter out recipes where `excludeFromPrep === true`.
3. **Phase 3: UI Implementation**
   - Add drag-and-drop context (e.g., `dnd-kit`) to `MealCalendarClient`.
   - Implement an action to update `sortOrder` in the DB on drop.
   - Add "Exclude from Prep" toggle in `MealSlot` or `PlannedRecipeRow` and the Prep Dashboard.
4. **Phase 4: Testing**
   - Unit test the sorting logic in `meal-plans.test.ts`.
   - E2E test dragging a custom meal.
   - E2E test excluding an item and verifying it disappears from the Prep-Ahead dashboard.
