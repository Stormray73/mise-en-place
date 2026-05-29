# Epic: Pantry Leftovers Integration

## Objective

Rework leftovers logic so that when a recipe is planned and cooked, any marked leftovers are automatically recorded in the pantry. Subsequent recipe plans containing this recipe as a sub-recipe will check the pantry first, adjusting the prep list and shopping list to leverage the existing cooked leftovers.

## Scope & Impact

1. **Meal Cooking Event:** Capture completion and prompt to save leftover portions to the pantry.
2. **Pantry Model Extension:** Allow `PantryItem` records to point to a `Recipe` (in addition to standard raw `Ingredients`).
3. **Smart Prep-Ahead and Shopping Lists:** Read recipe-pantry stock and automatically deduct/exclude matching sub-recipe portions from raw ingredient calculations.

---

## Decomposed Stories

### Story 1: Register Cooked Leftovers to Pantry

As a chef finishing a recipe, I want a prompt to save my leftovers to the pantry so that I can automatically track my prepared food without manual logging.

- **AC 1:** Finishing a recipe in Play Mode opens a modal asking if the user has leftovers.
- **AC 2:** The modal includes mandatory input fields for `portionsCount` and a custom portion-to-weight conversion factor (e.g., `1 portion = 250 g`), along with custom shelf life in days, to ensure all leftovers can be accurately converted to standard sub-recipe ingredients.
- **AC 3:** Saving creates a new `PantryItem` record linked to the `Recipe` with a calculated `expiresAt` field.

### Story 2: Spoilage & Visual Expiration Alerts

As a user checking my inventory, I want my cooked leftovers to show a clear expiration status so that I do not consume spoiled food.

- **AC 1:** Cooked recipe pantry items default to a 4-day shelf life.
- **AC 2:** Leftovers that are past their `expiresAt` date are visually highlighted in the pantry dashboard.
- **AC 3:** Expired items are excluded from automatic sub-recipe stock matching unless the user checks an "Override Spoilage" flag.

### Story 3: Deficit Scoping and User Choice Alerts

As a user planning a recipe with sub-recipe leftovers, I want to be alerted if there is a stock deficit so that I can decide how to prepare it.

- **AC 1:** When a parent recipe requires more sub-recipe portions than are available in the pantry, render a warning badge on the calendar meal slot.
- **AC 2:** Clicking the warning displays a dialog showing the exact deficit (e.g., _"Need 3 portions of Marinara Sauce, but only have 1 portion in the Pantry"_).
- **AC 3:** The user can select to **"Split-Prep"** (deducting the leftover and adding raw ingredients for the deficit to the shopping list) or **"Cook Fresh"** (purchasing all ingredients fresh).

### Story 4: Depletion upon Eating

As a user marking a consuming meal as finished, I want the leftover inventory to be automatically depleted so that my pantry remains accurate.

- **AC 1:** Marking a meal that consumes leftovers as "Cooked" automatically decrements the corresponding recipe `PantryItem` stock.
- **AC 2:** If the pantry stock reaches 0, the record is removed or marked as consumed.
