# Pantry & Shopping List Features

## Overview

Mise-en-place will be expanded to include robust Pantry management and an automated Shopping List generator. These features integrate deeply with the existing Recipe and Meal Planning systems to automatically deduct inventory upon recipe completion and forecast grocery needs based on upcoming meal plans and user-defined restock thresholds.

## Key Changes & Architecture

- **Database Schema:** New models for `PantryItem` and updates to `Ingredient` to support restock thresholds and location tags.
- **USDA Integration:** Enhancement to fetch `foodPortions` for mass-to-volume unit conversions.
- **Core Logic:** New utilities for calculating aggregated ingredient needs over date ranges and comparing them against pantry stock.
- **E2E Testing:** Playwright tests will be required for all critical paths (adding to pantry, recipe deduction, and list generation).

## User Stories & Implementation Plan

### Phase 1: Foundation & Stock Management [PARALLEL]

#### Story 1: Expanded USDA Integration for Density [PARALLEL]

As a developer, I want to update the USDA proxy to retrieve portion data so that the system can automatically handle mass-to-volume unit conversions.

- **AC 1:** The `/api/usda/search` endpoint retrieves and maps `foodPortions` data into the `USDAFood` interface.
- **AC 2:** The `Ingredient` schema is updated to store base density/portion information.
- **AC 3:** Unit tests verify that the system can accurately convert a volume measurement (e.g., cups) to a mass measurement (e.g., grams) using the new portion data.

#### Story 2: Core Pantry Schema & UI [PARALLEL]

As a chef, I want to manage my current ingredients and set restock thresholds so I can easily track what I have and what I need.

- **AC 1:** Update the Prisma schema to include a `PantryItem` model (linking to `Ingredient`, storing `quantity`, `unit`, and `locationTags` as an array of strings).
- **AC 2:** Add a `restockThreshold` field to the `PantryItem` model.
- **AC 3:** Create a new `/dashboard/pantry` view where users can add, edit, and remove pantry items, including setting locations and thresholds.
- **AC 4 (E2E):** Write a Playwright test verifying a user can add 5lbs of "Flour" tagged in the "Garage" with a 1lb restock threshold.

#### Story 3: Quick Pantry Adjustments (The Snack Problem) [SERIAL - Depends on Story 2]

As a chef, I want to easily decrement or remove items directly from the pantry view so I can account for snacks or ad-hoc usage.

- **AC 1:** The pantry UI includes a quick "Decrement" or "Finish" button for each item.
- **AC 2:** Zero-quantity items remain in the database but are hidden from the default view via a UI toggle/filter.
- **AC 3 (E2E):** Write a Playwright test verifying that clicking "Finish" on an item reduces its stock to 0 and correctly filters it from the default view.

### Phase 2: Deep Integration [SERIAL - Depends on Phase 1]

#### Story 4: Automated Recipe Stock Deduction [SERIAL - Depends on Story 1 & 2]

As a chef, I want the system to automatically deduct the ingredients I used when I finish cooking a recipe so my pantry stays accurate.

- **AC 1:** After completing a recipe in "Play Mode" (or via a "Mark as Cooked" action), a modal prompts the user to confirm deducting the scaled ingredients from the pantry.
- **AC 2:** The deduction logic uses the USDA portion data (from Story 1) to correctly convert recipe volume measurements to pantry mass measurements if necessary.
- **AC 3:** Deductions are pulled from the _total_ aggregated stock of that ingredient, regardless of specific location tags.
- **AC 4 (E2E):** Write a Playwright test verifying that cooking a recipe for 2 cups of flour correctly reduces the total flour stock in the pantry.

#### Story 5: Smart Shopping List Generation [SERIAL - Depends on Story 2]

As a chef, I want to generate a shopping list based on my upcoming meal plans and low pantry stock so I only buy exactly what I need.

- **AC 1:** Create a new `/dashboard/shopping-list` view with a date-range selector (e.g., "Next 7 days").
- **AC 2:** The list automatically includes items where the current pantry stock has fallen below the `restockThreshold` (handling staples).
- **AC 3:** The list aggregates all required ingredients for the selected meal plan range, subtracts current available pantry stock, and outputs the exact deficit needed to purchase.
- **AC 4 (E2E):** Write a Playwright test verifying that an upcoming meal requiring 1lb of chicken, when the user only has 0.5lbs in the pantry, correctly generates a shopping list item for 0.5lbs of chicken.

#### Story 6: Restocking from the Shopping List [SERIAL - Depends on Story 5]

As a chef, I want to easily add purchased items from my shopping list directly into my pantry so my inventory is updated after a trip to the store.

- **AC 1:** The shopping list view includes a way to check off items as "purchased."
- **AC 2:** Checking an item off immediately adds that requested quantity back into the user's total pantry stock.
- **AC 3 (E2E):** Write a Playwright test verifying that purchasing an item on the shopping list increases the corresponding `PantryItem` quantity.

#### Story 7: Pre-Cook Inventory Validation [PARALLEL with Stories 4 & 5 - Depends on Story 2]

As a chef, I want to be warned if I am missing ingredients before I start cooking so I can make substitutions or shop first.

- **AC 1:** On the Recipe View page, a "Stock Status" indicator appears near the "Start Cooking" button.
- **AC 2:** The indicator compares scaled recipe components against current pantry inventory (using conversion logic from Story 1).
- **AC 3:** Insufficient items are listed in a warning popover with a "Quick Add to Shopping List" button.
- **AC 4 (E2E):** Write a Playwright test verifying that a recipe requiring 2 onions shows a warning when only 1 onion is in the pantry.

---

## Edge Case & Conflict Resolution

- **Negative Inventory Prevention:** If a deduction would result in negative stock, the quantity is floored at `0` and a warning is logged/displayed to the user indicating a potential inventory discrepancy.
- **Unit Mismatch Handling:** If an ingredient cannot be converted (e.g., "1 bunch of kale" to "grams"), the system skips the automatic deduction for that specific item and prompts the user to "Manual Deduct" after the cooking session.
- **Manual Shopping List Additions:** Users can manually add non-recipe items (e.g., "Dish Soap") directly to the shopping list. These items do not interact with the Pantry's threshold logic.
- **Duplicate Ingredients:** If the user has "Salt" in two locations (Kitchen and Basement), deductions are taken from the oldest entry first (FIFO) unless the user manually specifies otherwise.

## Validation Strategy

- **Unit Tests:** Every mass-to-volume conversion utility must have 100% coverage, including "uncommon" units like `pinch`, `dash`, and `handful`.
- **Regression Testing:** Ensure that adding a pantry item does not impact the macro-calculation logic in the existing Recipe View.
- **E2E Coverage:** All Playwright tests must run in both "Desktop Chrome" and "Mobile Safari" viewports to ensure the shopping list is usable on a phone at the grocery store.
