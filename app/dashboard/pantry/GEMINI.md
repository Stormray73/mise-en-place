# Pantry & Inventory Domain

## Overview

Manages current ingredient stock, restock thresholds, and automated inventory deduction when cooking.

## Implementation Details

- **Logic:** `lib/pantry.ts` (stock management) and `app/dashboard/pantry/actions.ts` (UI mutations).
- **Core Feature:** `deductFromPantry` handles FIFO deduction across multiple locations.
- **Conversions:** Relies on `lib/units.ts` for mass-to-volume density conversions using USDA portion data.

## Invariants & Constraints

- **Negative Stock:** Inventory quantities are floored at 0. Discrepancies are logged as warnings.
- **Ownership:** All `PantryItem` records must be tied to a `userId`.
- **Unit Matching:** Deductions fail gracefully with a user prompt if units are incompatible (e.g., "1 bunch" to "grams").

## Testing Strategy

- **Unit Tests:** `__tests__/lib/pantry.test.ts` verifies deduction math and unit conversion reliability.
- **E2E Tests:** `tests/e2e/pantry-shopping-list.spec.ts` covers adding stock and auto-deduction after recipe playback.
- **Regression:** Ensure that updating stock doesn't impact meal plan generation logic.
