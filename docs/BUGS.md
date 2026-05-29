# Project Bugs & Issue Tracking

This document serves as the central registry for bugs and regressions. It is designed to be machine-readable by agents to automate the bug-fixing pipeline.

## Bug Fix Standards & Mandates

- **Test-Driven Fixes:** Every bug fix MUST include a new test case (Unit, Integration, or E2E) that reproduces the failure before the fix is applied.
- **Regression Testing:** After applying a fix, the full project test suite MUST pass to ensure no side effects were introduced.
- **Surgical Precision:** Bug fixes must be self-contained and involve the **minimum amount of changes** required to resolve the issue. Avoid major refactors, "cleanup," or architectural changes unless absolutely necessary to the fix.
- **Validation:** Use `xvfb-run` for E2E validation in the remote environment.

---

## Active Bugs

### BUG-042: Prep-Ahead Aggregator Fails to Update when Recipe is Deleted from Meal Plan

**Status:** Active
**Description:** Removing a recipe from a planned meal slot does not trigger an update or recalculation in the prep-ahead aggregator, leaving stale prep items visible on the Prep Ahead dashboard.
**Reproduction:**

1. Navigate to the Meal Planner and add a recipe requiring prep-ahead to any day/slot.
2. Verify the corresponding items appear on the Prep Ahead dashboard.
3. Return to the Meal Planner and delete the recipe from that meal.
4. Open the Prep Ahead dashboard; observe that the deleted recipe's prep items are still listed.

---

### BUG-043: Duplicate Planned Recipes Permitted in Single Meal Slot

**Status:** Active
**Description:** The Meal Planner allows the user to add the exact same recipe multiple times to the same meal slot on a single day, leading to duplicated database rows and corrupted macro totals.
**Reproduction:**

1. Open the Meal Planner calendar.
2. Select a slot (e.g., "Lunch") and add a recipe.
3. Click the slot again and add the same recipe.
4. Verify that the recipe is duplicated in the calendar display and its nutritional macros are counted twice.

---

### BUG-044: LLM Recipe Document Import Truncates to 4 Recipes

**Status:** Active
**Description:** When importing a large document (e.g., a Word document containing multiple recipes like College Recipes.txt), only the first 3-4 recipes get imported and added to the drafts workspace.
**Reproduction:**

1. Go to the Recipe Store and open the Import Document dialog.
2. Select a Word document containing 5 or more recipes (e.g., matching the contents of `./docs/scratch/College Recipes.txt`).
3. Run the import process.
4. Check the drafts workspace; observe that only the first 4 recipes have been successfully drafted (as shown in `./docs/scratch/draft-recipes-import.png`).

---

### BUG-045: Custom Range Date Picker in Shopping List Inoperative

**Status:** Active
**Description:** In the Shopping List view, clicking the "Custom Range" button does not successfully trigger the date picker or allow the user to modify the start and end dates.
**Reproduction:**

1. Navigate to the Shopping List dashboard page.
2. Click on the "Custom Range" filter/button.
3. Observe that no date range selection/picker opens and it is impossible to change the active date range.

---

### BUG-046: Open Food Facts Results Lack "OFF" Tag/Badge in Ingredient Autocomplete Dropdowns

**Status:** Active
**Description:** The autocomplete/search dropdown components when editing ingredients (e.g., in `AddPantryItemModal.tsx` and related recipe ingredient editors) do not display the expected "OFF" source badge for ingredients returned from the Open Food Facts API waterfall fallback, violating Story 3 AC 3 requirements.
**Reproduction:**

1. Open the "Add Pantry Item" modal from the Pantry dashboard.
2. Search for a branded product that falls back to the Open Food Facts API.
3. Observe the search dropdown items; they lack the "OFF" source badge next to the descriptions, making it unclear that the data came from Open Food Facts.

---

### BUG-047: Large Image Import Fails with 413 Payload Too Large on Vercel

**Status:** Active
**Description:** Importing recipes using larger images (e.g., 4.5 MB) fails on Vercel serverless environment with a `413 Payload Too Large` error due to Vercel's serverless function payload size limitations (max 4.5 MB). We must bypass this limit by implementing a pre-signed URL direct browser-to-R2 upload workflow.
**Reproduction:**

1. Go to the Recipe Store and open the recipe import interface.
2. Try importing a recipe by uploading an image larger than 4.5 MB.
3. The upload process crashes or fails with a `413 Payload Too Large` server error.

---

## Resolved Bugs

### BUG-039: Extraneous Cancel Button in Modals

**Status:** Resolved
**Fix:** Removed the redundant hardcoded "Cancel" button from `components/ui/Modal.tsx`. Modals now rely on the top-right `&times;` close button or custom cancel buttons provided in their local layout `children` (such as in `EditPantryItemModal.tsx`).
**Verification:** Manual verification across modal components.

---

### BUG-041: Saved Recipes from Review Section Not Visible

**Status:** Resolved
**Fix:** Modified `saveRecipeAction` in `app/recipes/actions.ts` to automatically force the recipe's status to `"PUBLISHED"` when saved, promoting imported recipe drafts to visible recipes in the gallery immediately upon user save.
**Verification:** Manual verification that editing a draft and clicking save successfully promotes it.

---

### BUG-040: Timezone Shift in Meal Planner Week Start

**Status:** Resolved
**Fix:** Surgically neutralized local timezone offsets on both client and server: used UTC operations (`setUTCHours`, `setUTCDate`, `getUTCDay`, `getUTCDate`) in `app/meal-planner/page.tsx` and `app/meal-planner/MealCalendarClient.tsx` to handle week bounds and generation, utilized timezone-naive ISO string comparisons for matching recipes, and configured `toLocaleDateString` formatters with `timeZone: "UTC"` in the calendar days and `CloneMealModal.tsx`.
**Verification:** Added a reproducing and passing test suite in `__tests__/components/repro-calendar-timezone.test.tsx` forcing negative timezone offsets.

---

### BUG-037: Meal Planner Preset Delay

**Status:** Resolved
**Fix:** Added `useTransition` to `AddMealModal.tsx` to provide optimistic loading UI when clicking meal presets.
**Verification:** Verified with test case in `tests/e2e/repro-bug-037.spec.ts`.

### BUG-038: Duplicate Meal Presets

**Status:** Resolved
**Fix:** Prevent duplicate presets for the same day in `lib/meal-plans.ts` (existing fix verified) and ensured UI displays the error.
**Verification:** Verified with test case in `tests/e2e/repro-bug-038.spec.ts`.

### BUG-027: Missing Prep State Decorator in Recipe Store

**Status:** Resolved
**Fix:** 1. Added `prepState` field to `RecipeComponent` model and migrated DB. 2. Added UI input to `RecipeEditor.tsx`. 3. Displayed value in `RecipeView.tsx`.
**Verification:** Verified with test case in `__tests__/components/RecipeEditor.test.tsx`.

---

### BUG-028: Scalar Not Applied to "Cook it!" (Play) Mode

**Status:** Resolved
**Fix:** 1. Passed `scale` query parameter from `RecipeDetailPage` to Play Mode. 2. Updated `RecipePlayMode.tsx` to accept and apply the scalar to quantities. 3. Synced `RecipeView` scale state with URL.
**Verification:** Manual verification of scaled quantities in cooking mode.

---

### BUG-029: Missing E2E Tests for Meal Planner

**Status:** Resolved
**Fix:** Created `tests/e2e/meal-planner.spec.ts` covering calendar navigation, meal/recipe management, and leftover linking.
**Verification:** Verified with Playwright E2E suite.

---

### BUG-030: Planned Recipes lack Navigation and Scaling Context

**Status:** Resolved
**Fix:** Wrapped recipe titles in `MealCalendarClient.tsx` with `<Link>` components that include the `scale` query parameter.
**Verification:** Verified navigation from calendar to detail view with preserved scaling.

---

### BUG-031: Missing PrepState Override UI in Calendar

**Status:** Resolved
**Fix:** Added a `prepState` text input to planned recipe rows in `MealCalendarClient.tsx`.
**Verification:** Manual verification of override persistence.

---

### BUG-032: Aggregator lacks recursive resolution and unit normalization

**Status:** Resolved
**Fix:** Refactored `getPrepAheadData` in `lib/meal-plans.ts` to recursively resolve sub-recipes and normalize quantities (e.g., to 'g' or 'ml') before summing.
**Verification:** Verified consolidated ingredient list reflects nested components.

---

### BUG-033: Aggregator lacks completion/checkmark functionality

**Status:** Resolved
**Fix:** 1. Updated `PrepCompletion` schema to support aggregated items. 2. Implemented `togglePrepCompletionAction` server action. 3. Added interactive checkboxes to `PrepAheadDashboard.tsx`.
**Verification:** Verified prep tracking state persists on dashboard refresh.

---

### BUG-034: Missing Meal Cloning/Duplication Feature

**Status:** Resolved
**Fix:** 1. Implemented `cloneMeal` library function and server action. 2. Added "Clone" button and target-date selection modal to `MealCalendarClient.tsx`.
**Verification:** Verified meal duplication to multiple dates.

---

### BUG-035: Missing Macro Aggregation in Calendar View

**Status:** Resolved
**Fix:** 1. Updated `getWeeklyMealPlan` to calculate scaled macros for every meal. 2. Added Daily and Meal-level caloric summaries to the calendar UI.
**Verification:** Verified nutritional totals update in real-time as meals are added/scaled.

---

### BUG-036: Missing Leftover Date Integrity Validation

**Status:** Resolved
**Fix:** Added validation logic to `linkLeftoverConsumptionAction` to ensure leftovers cannot be consumed before they are produced.
**Verification:** Verified that attempting to link a future source triggers a clear error message.

---

## Resolved Bugs

### BUG-018: Dismiss Elapsed Timers in Play Mode

**Status:** Resolved
**Fix:** Added a "Dismiss" button and a close icon to active/done timers in `RecipePlayMode.tsx`.
**Verification:** Manual verification of timer dismissal logic.

---

### BUG-019: Clear Timers on "Finish" Action

**Status:** Resolved
**Fix:** Updated the "Finish" button in `RecipePlayMode.tsx` to call `clearAllTimers()`, which removes timer data from `localStorage`.
**Verification:** Verified that timers are cleared after clicking "Finish".

---

### BUG-020: Persistent Timers on "Exit" Action

**Status:** Resolved
**Fix:** Added an "Exit Mode" button that navigates away without clearing timers. Verified that the standard "Exit" path does not trigger `clearAllTimers()`.
**Verification:** Verified timers persist when using "Exit Mode".

---

### BUG-021: "Clear All Timers" Sidebar Action

**Status:** Resolved
**Fix:** Added a "Clear All" button to the Active Timers header in `RecipePlayMode.tsx`.
**Verification:** Verified bulk clearing of timers.

---

### BUG-022: Dashboard Grid Layout & Card Proportions

**Status:** Resolved
**Fix:** Updated `app/dashboard/page.tsx` to use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` and enforced `aspect-square` on recipe cards.
**Verification:** Visual layout inspection on multiple screen sizes.

---

### BUG-023: Dashboard Content Density & Space Filling

**Status:** Resolved
**Fix:** Adjusted container constraints and implemented a more flexible responsive grid.
**Verification:** Verified content fills wider viewports appropriately.

---

### BUG-024: Recipe Deletion on Dashboard

**Status:** Resolved
**Fix:** 1. Created `DeleteButton.tsx` with confirmation logic. 2. Implemented `deleteRecipeAction` with ownership verification. 3. Integrated into dashboard cards.
**Verification:** Verified recipe deletion with confirmation on the dashboard.

---

### BUG-025: Recipe Title Validation

**Status:** Resolved
**Fix:** Added client-side validation in `RecipeEditor.tsx` to require a non-empty title before saving.
**Verification:** Verified with test case in `__tests__/components/RecipeEditor.test.tsx`.

---

### BUG-026: Filter Empty Recipe Steps

**Status:** Resolved
**Fix:** Updated `handleSave` in `RecipeEditor.tsx` to filter out steps with empty or whitespace-only instructions and re-order the remaining steps.
**Verification:** Verified with test case in `__tests__/components/RecipeEditor.test.tsx`.

---

### BUG-014: Search Dropdown Dismissal (USDA & Sub-recipes)

**Status:** Resolved
**Fix:** Implemented `onClickOutside` using `useRef` and `mousedown` listeners, and an `Escape` key listener via `useEffect` in `RecipeEditor.tsx`.
**Verification:** Manual verification of dropdown dismissal and query clearing on click-outside and `Esc`.

---

### BUG-015: User-Facing Circular Dependency Error Reporting

**Status:** Resolved
**Fix:** 1. Added a client-side check in `addSubRecipe` to prevent adding a recipe to itself. 2. Implemented an `error` state in `RecipeEditor.tsx` to display server-side (and client-side) error messages in a UI notification banner.
**Verification:** Verified that adding a recipe to itself triggers a UI error and server-side circularity errors are displayed to the user.

---

### BUG-016: Recipe View Section Reordering

**Status:** Resolved
**Fix:** Reordered JSX in `app/recipes/[id]/page.tsx` to place Nutrition Facts at the top of the left column, followed by Ingredients, with Instructions in the right column.
**Verification:** Verified visual order: Nutrition Facts > Ingredients > Instructions on the recipe detail page.

---

### BUG-017: Dashboard Header Layout Spacing & Alignment

**Status:** Resolved
**Fix:** Refactored the header in `app/dashboard/page.tsx` using a flexbox layout with `flex-1` containers to achieve Left (Title), Center (Search), and Right (Button) alignment.
**Verification:** Verified alignment on both desktop (horizontal) and mobile (stacked) viewports.

---

### BUG-001: Cramped Dashboard Layout

**Status:** Resolved
**Fix:** Expanded dashboard container from `max-w-4xl` to `max-w-7xl` in `app/dashboard/page.tsx`.
**Verification:** Verified with `tests/e2e/repro-BUG-001.spec.ts` and full E2E suite.

---

### BUG-002: Duplicated Header on New Recipe Page

**Status:** Resolved
**Fix:** Removed redundant `<Header />` component and import from `app/recipes/new/page.tsx`.
**Verification:** Verified with `tests/e2e/repro-BUG-002.spec.ts` (count reduced from 2 to 1) and full E2E suite.

---

### BUG-003: Standardized Unit Selection & Smart API Conversion

**Status:** Resolved
**Fix:** Added `fl oz` to `lib/units.ts` and replaced free-text unit input with a `select` dropdown in `RecipeEditor.tsx`. Existing macro logic handles conversion automatically.
**Verification:** Verified with `tests/e2e/repro-BUG-003.spec.ts` and unit tests in `lib/macros.test.ts`.

---

### BUG-004: Missing Recipe Detail View

**Status:** Resolved
**Fix:** Created `app/recipes/[id]/page.tsx` and updated Dashboard links.
**Verification:** Verified with `tests/e2e/repro-BUG-004.spec.ts` and full regression suite.

---

### BUG-005: Step-Specific Ingredient Filtering in Play Mode

**Status:** Resolved
**Fix:** Implemented fuzzy ingredient matching logic in `lib/ingredient-matcher.ts` and updated `RecipePlayMode` sidebar.
**Verification:** Verified with `tests/e2e/repro-BUG-005.spec.ts` and unit tests in `lib/ingredient-matcher.test.ts`.

---

### BUG-006: Play Mode "Finish" Button Redirection

**Status:** Resolved
**Fix:** Updated "Finish" button in `RecipePlayMode` to use `useRouter` for redirection to the detail view.
**Verification:** Verified with `tests/e2e/repro-BUG-006.spec.ts` and full regression suite.

---

### BUG-007: Rename "Play" Button to "Cook it!"

**Status:** Resolved
**Fix:** Renamed all instances of "Play" to "Cook it!" (or "Cooking Mode") in Dashboard, Detail View, and Play View.
**Verification:** Verified with `tests/e2e/repro-BUG-007.spec.ts` and updated E2E suite.

---

### BUG-008: Missing Sub-recipe Selection UI in Recipe Editor

**Status:** Resolved
**Fix:** Created `app/api/recipes/search/route.ts` and updated `RecipeEditor.tsx` with a two-column search layout (USDA + Sub-recipes).
**Verification:** Verified with `tests/e2e/repro-BUG-008.spec.ts` and full E2E suite.

---

### BUG-009: Incomplete Macro Calculation for Deeply Nested Recipes

**Status:** Resolved
**Fix:** Updated `calculateMacros` in `lib/recipes.ts` to recursively fetch components for sub-recipes if they are missing from the initial payload.
**Verification:** Verified with unit test in `lib/repro-BUG-009.test.ts`.

---

### BUG-010: Missing Nutrition Facts Panel in Recipe Detail View

**Status:** Resolved
**Fix:** Added a responsive Nutrition Facts panel to `app/recipes/[id]/page.tsx` that displays calculated macros.
**Verification:** Verified with `tests/e2e/repro-BUG-010.spec.ts`.

---

### BUG-011: Undetected Indirect Circular Dependencies

**Status:** Resolved
**Fix:** Implemented a recursive `checkCircularDependency` utility in `lib/recipes.ts` used by `saveRecipe` to prevent dependency loops (e.g., A -> B -> A).
**Verification:** Verified with unit test in `lib/repro-BUG-011.test.ts`.

---

### BUG-012: Timer State Loss on Page Refresh

**Status:** Resolved
**Fix:** Implemented persistent timer state using `localStorage` and absolute end timestamps. Timers now re-hydrate and resume correctly on page load.
**Verification:** Verified with `tests/e2e/repro-BUG-012.spec.ts`.

---

### BUG-013: USDA Macro Unit Normalization Logic

**Status:** Resolved
**Fix:** Updated `calculateMacros` to use a dynamic `baseAmount` from ingredient metadata (defaulting to 100), ensuring accurate ratio calculations for ingredients with non-standard bases.
**Verification:** Verified with unit test in `lib/repro-BUG-013.test.ts`.
