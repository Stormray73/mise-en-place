# Epic: Shopping List & Grocery Workflow Overhaul

## Objective

To transform the Shopping List from a static planning view into an interactive, real-world grocery shopping tool. This includes a dedicated "Active Shopping" mode, multi-store list management, and intelligent sorting by grocery department to prevent missed items.

## Background & Motivation

The current Shopping List UI treats planning and purchasing as the same immediate action. Clicking "Buy" instantly updates the pantry database, which is error-prone and doesn't match the reality of walking through a store, adjusting quantities on the fly, and dealing with out-of-stock items. Furthermore, users often shop at multiple stores (e.g., bulk vs. produce) and need their lists organized by physical store layout (departments) to avoid backtracking.

## Scope & Impact

- **Database:** Expand `ManualShoppingItem` to include `lastPurchasedAt` for recurring logic. Introduce a `Store` model (optional, or tag-based), track `lastPurchasedStoreId` on the `Ingredient` model, and add `department` categorization to `Ingredient`.
- **UI Workflow:** Create two distinct modes: "Planning Mode" (managing what goes on the list) and "Active Shopping Mode" (in-store checklist and final checkout).
- **Navigation:** Enhance manual date inputs with week-by-week quick controls.

## Implementation Steps (Stories)

### Story 1: "Active Shopping" Mode & Checkout Workflow

**As a user at the grocery store, I want a dedicated shopping interface so that I can check off items as I find them and adjust quantities before committing them to my pantry.**

- **AC 1:** Replace the instant "Buy" buttons with a "Go Shopping" mode toggle. Entering this mode changes the UI to a streamlined, mobile-friendly checklist.
- **AC 2:** Checking an item does not immediately update the database; instead, it greys out the text and applies a strikethrough to provide a sense of accomplishment.
- **AC 3:** In Active Shopping mode, users can quickly increment/decrement the quantity they actually picked up (e.g., buying 2 boxes instead of 1), and quickly add impulse purchases to the list.
- **AC 4:** A "Complete Shop" button at the bottom of the screen takes all _checked_ items, applies their final quantities, and adds them to the Pantry via a single bulk server action.
- **AC 5:** Unchecked items remain on the active shopping list for future trips.

### Story 2: Multi-Store Lists

**As a user who shops at different retailers, I want to assign items to specific stores so that I only see what I need to buy at my current location.**

- **AC 1:** Users can create and manage "Stores" (e.g., Costco, Trader Joe's).
- **AC 2:** In Planning Mode, users can assign specific ingredients or manual items to a preferred Store.
- **AC 3:** The Shopping List UI includes a filter/tab system to view "All Items" or filter by a specific Store.
- **AC 4:** When "Go Shopping" is clicked, it only initiates the workflow for the currently selected Store.
- **AC 5:** When an item is purchased during a "Complete Shop" action, the system records the `lastPurchasedStoreId` on the `Ingredient` record. Future shopping lists automatically default the ingredient to this store.

### Story 3: Smart Department Categorization

**As a shopper walking through a store, I want my list grouped by department (Produce, Dairy, Aisles) so that I don't have to backtrack for missed items.**

- **AC 1:** Introduce a `department` field to the `Ingredient` model (e.g., Produce, Meat, Dairy, Pantry/Dry, Frozen).
- **AC 2:** When pulling USDA data or using the AI parser, attempt to automatically categorize the ingredient into a department.
- **AC 3:** Update the Shopping List UI to group items by these departments, sorting them in a logical store flow (e.g., Produce first, Frozen last).

### Story 4: Week-by-Week Navigation, Date UX & Enhanced Custom Items

**As a user planning my week, I want quick week navigation, smart default presets, and advanced custom/recurring items so that my list is accurate and easy to manage.**

- **AC 1:** Widen and align the date picker to start on Sunday week-by-week (matching the Meal Planner calendar default behavior). Add quick preset buttons/toggles for "This Week" (default), "Next Week", "Rolling 7 Days", and "Custom Range".
- **AC 2:** Expand the "Add Custom Item" UI to include inputs for exact Quantity (allowing decimals), Unit (e.g., "lbs", "boxes"), and an optional preferred Store selection.
- **AC 3:** Support manual deletion of custom items. A trash icon is displayed next to each manually added item on the shopping list, allowing users to remove items they don't want to buy.
- **AC 4:** Support custom recurring interval settings (e.g. "Only buy every 2 weeks", "Every month"). If configured, the item automatically reappears on the shopping list based on the calculated elapsed time since its `lastPurchasedAt` date.
