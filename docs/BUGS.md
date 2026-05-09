# Project Bugs & Issue Tracking

This document serves as the central registry for bugs and regressions. It is designed to be machine-readable by agents to automate the bug-fixing pipeline.

## Bug Fix Standards & Mandates

- **Test-Driven Fixes:** Every bug fix MUST include a new test case (Unit, Integration, or E2E) that reproduces the failure before the fix is applied.
- **Regression Testing:** After applying a fix, the full project test suite MUST pass to ensure no side effects were introduced.
- **Surgical Precision:** Bug fixes must be self-contained and involve the **minimum amount of changes** required to resolve the issue. Avoid major refactors, "cleanup," or architectural changes unless absolutely necessary to the fix.
- **Validation:** Use `xvfb-run` for E2E validation in the remote environment.

---

## Active Bugs

_No active bugs at this time._

---

## Resolved Bugs

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
