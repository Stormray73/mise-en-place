# Upcoming Stories: Count-Based Units

## Story 1: Count-Based Unit Conversion

As a chef, I want to use "item" as a unit for my ingredients so that I can easily measure produce without weighing it.

- **AC 1:** The unit engine (`lib/units.ts`) includes a `count` category with the "item" unit.
- **AC 2:** The conversion engine uses a heuristic to identify the gram weight of "1 item" from USDA `foodPortions` (e.g., matching keywords like "medium", "whole", "each", "piece").
- **AC 3:** `canConvert` and `convert` successfully cross-convert between `mass` and `count` categories using the USDA item weight.

## Story 2: Macro Calculation for Count Units

As a health-conscious user, I want the system to calculate macros for count-based ingredients so that my nutritional data remains accurate.

- **AC 1:** The `calculateMacros` function correctly translates "item" quantities into grams before calculating the macro ratio.
- **AC 2:** If an ingredient is missing USDA portion data, the macro calculation for "item" safely ignores the calculation or defaults to 0 without crashing the application.

## Story 3: Count-Based Pantry Deduction

As a chef managing inventory, I want my mass-based pantry purchases to automatically deduct properly when I use individual items in a recipe so that my stock remains accurate.

- **AC 1:** A recipe calling for "1 item" accurately deducts the equivalent gram weight from a pantry item stored in mass (pounds/grams).
- **AC 2:** The shopping list properly consolidates "item" based needs and mass-based needs into a single accurate stock requirement.

## Implementation Plan

1. **Phase 1: Core Engine Upgrades (`lib/units.ts`)**
   - Add `count` category and `"item"` unit.
   - Implement `getWholeItemPortion` heuristic for scanning USDA `foodPortions`.
   - Update cross-category conversion logic to handle `count <-> mass`.
2. **Phase 2: Macro Calculations (`lib/recipes.ts`)**
   - Update `calculateMacros` to support parsing count units by converting them to mass via the new engine.
3. **Phase 3: Testing**
   - Write comprehensive unit tests in `units.test.ts` and `recipes.test.ts` verifying conversions, deductions, and missing-data edge cases.
