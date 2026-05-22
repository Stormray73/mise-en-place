# Shopping List Domain

## Overview

Generates aggregated purchase lists based on upcoming meal plans and low pantry stock.

## Implementation Details

- **Logic:** `lib/shopping-list.ts` (list generation) and `app/dashboard/shopping-list/actions.ts`.
- **Aggregation:** Combines required quantities for the same ingredient over a date range.
- **Deficit Calculation:** Subtracts current total pantry stock from meal plan requirements.
- **Manual Items:** Supports `ManualShoppingItem` for non-food or non-recipe needs (e.g., "Paper Towels").
- **Custom Items & Manual Deletion:** Supports "Add Custom Item" with inputs for Quantity (decimal support), Unit, and Store. Custom items can be manually deleted via a trash icon button.
- **Advanced Recurring Intervals:** Supports custom recurring interval settings (e.g. weekly, every 2 weeks, monthly) in addition to basic `isRecurring`. If configured, items are automatically populated onto the shopping list if the elapsed time since their `lastPurchasedAt` date exceeds the interval.

## Invariants & Constraints

- **Low Stock:** Items below `restockThreshold` are always included, regardless of meal plan needs.
- **Date Aggregation UX:** Supports calendar presets ("This Week", "Next Week", "Rolling 7 Days", "Custom Range") starting on Sunday week-by-week.
- **Purchasing (Active Shopping Mode):** Checking an item in Active Shopping Mode does not immediately update the database. Instead, checking an item applies a local visual strikethrough. Clicking "Complete Shop" displays a Checkout Confirmation Modal detailing the items and final adjusted quantities before executing a bulk server action (`completeShopAction`) to commit the purchased items to the Pantry (in a "Purchased" location). Unchecked items remain on the shopping list.
- **Persistence:** Manual items are tied to a `userId` and persist until manually deleted or completed (if not recurring).

## Testing Strategy

- **Unit Tests:** `__tests__/lib/shopping-list.test.ts` covers list generation, deficit calculation, and recurring item logic.
- **E2E Tests:** `tests/e2e/pantry-shopping-list.spec.ts` verifies the full loop from meal plan -> shopping list -> pantry stock.
