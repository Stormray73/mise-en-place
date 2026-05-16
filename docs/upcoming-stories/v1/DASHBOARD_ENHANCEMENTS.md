# Upcoming Stories: Dashboard Enhancements

## Story 1: Shopping List Widget on Dashboard

As a chef, I want to see a summary of my shopping list on my dashboard so that I can quickly check what I need without navigating away.

### Acceptance Criteria

- [ ] AC 1: A "Shopping List" widget is displayed on the main Dashboard Hub (`app/dashboard/page.tsx`).
- [ ] AC 2: The widget displays a truncated list of up to 5 items currently on the shopping list.
- [ ] AC 3: If the shopping list is empty, a placeholder text ("Your shopping list is empty") is displayed.
- [ ] AC 4: Clicking a "View All" link/button navigates to the full shopping list page.

## Story 2: Quick-Add Item from Dashboard

As a chef, I want to add items directly to my shopping list from the dashboard so that the process is streamlined and fast.

### Acceptance Criteria

- [ ] AC 1: The Shopping List widget includes a "Quick Add" text input and submit button.
- [ ] AC 2: Submitting an item adds it to the user's shopping list with a default/null unit and quantity 1.
- [ ] AC 3: Submitting an empty input should show an inline error or be disabled.
- [ ] AC 4: Upon successful addition, the widget immediately updates to reflect the new item (optimistic UI update).
- [ ] AC 5: Edge Case: Adding an item that already exists should increment its quantity or safely merge according to existing logic.

## Implementation Plan

1. **Phase 1: Backend / Actions**
   - Verify `addShoppingListItemAction` supports missing unit/quantity (defaults applied).
   - Ensure the server action revalidates the dashboard path.
2. **Phase 2: UI Components**
   - Create `ShoppingListWidget` component.
   - Use `getShoppingList` to fetch items server-side or via SWR.
   - Implement the Quick Add form with client-side validation.
3. **Phase 3: Integration & Testing**
   - Add the widget to `DashboardClient` or `app/dashboard/page.tsx`.
   - Write Unit tests for `ShoppingListWidget` (mocking the add action).
   - Write E2E test in `dashboard.spec.ts` verifying an item can be added from the dashboard.
