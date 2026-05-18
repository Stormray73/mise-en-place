# Peer Review: Count-Based Units

**Feature Path**: `docs/upcoming-stories/v1/COUNT_BASED_UNITS.md`
**Date**: 2026-05-18

## 1. Acceptance Criteria (AC) Status

### Story 1: Count-Based Unit Conversion

- **AC 1: The unit engine (`lib/units.ts`) includes a `count` category with the "item" unit.**
  - **Status**: PASS
  - **Evidence**: `UNITS` object in `lib/units.ts` now includes `item` with category `count`.
- **AC 2: The conversion engine uses a heuristic to identify the gram weight of "1 item" from USDA `foodPortions` (e.g., matching keywords like "medium", "whole", "each", "piece").**
  - **Status**: PASS
  - **Evidence**: `getWholeItemPortion` function in `lib/units.ts` implements this heuristic using `ITEM_KEYWORDS`.
- **AC 3: `canConvert` and `convert` successfully cross-convert between `mass` and `count` categories using the USDA item weight.**
  - **Status**: PASS
  - **Evidence**: Logic added to `canConvert` and `convert` in `lib/units.ts` specifically for `mass <-> count` using `getWholeItemPortion`.

### Story 2: Macro Calculation for Count Units

- **AC 1: The `calculateMacros` function correctly translates "item" quantities into grams before calculating the macro ratio.**
  - **Status**: PASS
  - **Evidence**: `lib/recipes.ts` now uses `canConvert(component.unit, "g", portions)` which correctly handles "item" to "g" conversion.
- **AC 2: If an ingredient is missing USDA portion data, the macro calculation for "item" safely ignores the calculation or defaults to 0 without crashing the application.**
  - **Status**: PASS
  - **Evidence**: `try-catch` block and `if (baseUnit)` check in `calculateMacros` (`lib/recipes.ts`) ensures safety.

### Story 3: Count-Based Pantry Deduction

- **AC 1: A recipe calling for "1 item" accurately deducts the equivalent gram weight from a pantry item stored in mass (pounds/grams).**
  - **Status**: PASS
  - **Evidence**: `deductFromPantry` in `lib/pantry.ts` uses the `convert` utility, which handles cross-category conversion if portions are available.
- **AC 2: The shopping list properly consolidates "item" based needs and mass-based needs into a single accurate stock requirement.**
  - **Status**: PASS
  - **Evidence**: `generateShoppingList` in `lib/shopping-list.ts` uses `canConvert` and `convert` for aggregation and stock comparison.

## 2. Test Validation

- **Coverage**: PASS. New unit tests were added:
  - `__tests__/lib/units.count.test.ts`
  - `__tests__/lib/recipes.count.test.ts`
  - `__tests__/lib/shopping-list.count.test.ts`
  - `__tests__/lib/pantry.count.test.ts`
- **Surgical Testing**: Logic is directly tested in unit tests.
- **Mocking**: USDA portion data is mocked in tests.

## 3. Code Structure & Readability

- **Idiomatic Patterns**: Follows existing patterns for unit conversion and pantry management.
- **Complexity**: The heuristic in `getWholeItemPortion` is simple but effective.
- **Modularity**: The logic is well-integrated into the existing `units.ts` engine.

## 4. Edge Cases & Robustness

- **Missing Portions**: `canConvert` correctly returns `false` if portions are missing, preventing crashes.
- **Heuristic Quality**: The heuristic relies on keyword matching. If the USDA data uses different terms, it might fail to find a "whole item" portion. However, the current keyword list is reasonably comprehensive for common produce.

## Conclusion

The implementation is solid, well-tested, and fulfills all ACs. The integration into the existing unit engine is clean and maintains the system's modularity.
