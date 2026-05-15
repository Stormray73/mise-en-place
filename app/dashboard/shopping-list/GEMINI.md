# Shopping List Domain

## Overview

Generates aggregated purchase lists based on upcoming meal plans and low pantry stock.

## Implementation Details

- **Logic:** `lib/shopping-list.ts` (list generation) and `app/dashboard/shopping-list/actions.ts`.
- **Aggregation:** Combines required quantities for the same ingredient over a date range.
- **Deficit Calculation:** Subtracts current total pantry stock from meal plan requirements.

## Invariants & Constraints

- **Low Stock:** Items below `restockThreshold` are always included, regardless of meal plan needs.
- **Purchasing:** Checking an item as "purchased" automatically adds it to the Pantry in a "Purchased" location.

## Testing Strategy

- **Unit Tests:** `lib/shopping-list.test.ts` (Note: Ensure this is created/updated).
- **E2E Tests:** `tests/e2e/pantry-shopping-list.spec.ts` verifies the full loop from meal plan -> shopping list -> pantry stock.
