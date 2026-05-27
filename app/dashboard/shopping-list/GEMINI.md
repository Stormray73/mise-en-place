# Shopping List Domain

## Overview

Generates aggregated purchase lists based on upcoming meal plans and low pantry stock.

## Implementation Details

- **Logic:** `lib/shopping-list.ts` (list generation) and `app/dashboard/shopping-list/actions.ts`.
- **Aggregation:** Combines required quantities for the same ingredient over a date range.
- **Deficit Calculation:** Subtracts current total pantry stock from meal plan requirements.
- **Manual Items:** Supports `ManualShoppingItem` for non-food or non-recipe needs (e.g., "Paper Towels").
- **Custom Items & Manual Deletion:** Supports "Add Custom Item" with inputs for Quantity (decimal support), Unit, and Store. Custom items can be manually deleted via a trash icon button.
- **Recurring Items:** Manual items can be marked as `isRecurring` with a custom `recurringInterval` (e.g. weekly, every 2 weeks, every 3 weeks, monthly). The system automatically calculates whether they should reappear based on elapsed days since `lastPurchasedAt` compared to the viewing window's start date.
- **Date Presets:** UI supports quick presets ("This Week", "Next Week", "Rolling 7 Days", "Custom Range") with timezone-neutral UTC Sunday start dates by default.

## Invariants & Constraints

- **Low Stock:** Items below `restockThreshold` are always included, regardless of meal plan needs.
- **Date Aggregation UX:** Supports calendar presets ("This Week", "Next Week", "Rolling 7 Days", "Custom Range") starting on Sunday week-by-week.
- **Purchasing (Active Shopping Mode):** Checking an item in Active Shopping Mode does not immediately update the database. Instead, checking an item applies a local visual strikethrough. Clicking "Complete Shop" displays a Checkout Confirmation Modal detailing the items and final adjusted quantities before executing a bulk server action (`completeShopAction`) to commit the purchased items to the Pantry (in a "Purchased" location). Unchecked items remain on the shopping list.
- **Persistence:** Manual items are tied to a `userId` and persist until manually deleted or completed (if not recurring).

## Testing Strategy

- **Unit Tests:** `__tests__/lib/shopping-list.count.test.ts` covers count-based aggregation, and `__tests__/lib/shopping-list.recurring.test.ts` covers the custom recurring interval and date window logic.
- **E2E Tests:** `tests/e2e/pantry-shopping-list.spec.ts` verifies the full loop from meal plan -> shopping list -> pantry stock, date preset clicks, and recurring manual item visibility filtering.
