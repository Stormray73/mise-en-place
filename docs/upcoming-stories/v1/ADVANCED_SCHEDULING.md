# Upcoming Stories: Advanced Scheduling

## Story: Meal Ordering & Sorting

As a chef, I want my meals to be ordered by time of day so that my calendar is organized and predictable.

### Acceptance Criteria

- [ ] Meals are automatically sorted by time of day: Breakfast > Lunch > Dinner.
- [ ] If a user adds Breakfast _after_ adding Dinner, Breakfast should move to the top of the list for that day.
- [ ] Custom meals (snacks, desserts, etc.) appear at the bottom by default.
- [ ] Users can drag and drop custom meals to their appropriate position in the day's timeline.

## Story: Flexible Prep-Ahead

As a chef, I want to exclude certain items from my prep-ahead list so that it doesn't get cluttered with things that don't need early preparation.

### Acceptance Criteria

- [ ] Users can flag a recipe or a specific ingredient as "Exclude from Prep-Ahead".
- [ ] The Prep-Ahead dashboard filters out these items.
- [ ] Provide a way to quickly remove a prep-ahead suggestion directly from the Prep-Ahead view.

### Technical Notes

- Update the `PlannedRecipe` or `RecipeComponent` schema to include an `excludeFromPrep` flag.
- Update `getPrepAheadData` logic in `lib/meal-plans.ts` to respect this flag.
