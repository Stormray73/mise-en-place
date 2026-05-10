# Feature: Dashboard Hub (The Kitchen Command Center)

## Objective

Refactor the application's entry point from a simple recipe grid into a comprehensive "Kitchen Command Center." This hub will provide at-a-glance visibility into the current day's cooking tasks, active timers, and immediate preparation needs, while moving recipe management to a dedicated view.

## Background & Motivation

As the application grows, the dashboard needs to transition from a library view to an operational view. Users should be able to see "What am I cooking today?" immediately upon login, while still having quick access to their full library, meal planner, and future features like pantry and shopping.

## Scope & Impact

- **Routing:** Move current `/dashboard` grid to `/recipes`. Update `/dashboard` to the new Hub view.
- **Global Navigation:** Update `Header.tsx` to include permanent links for Hub, Recipes, Meal Plan, Pantry, and Grocery List.
- **Data Integration:** Pull real-time data from the Meal Planner (for today's meals and prep) and Play Mode (for active timers).
- **UX:** Implement URL-based scaling persistence to ensure the user's intended scale factor is preserved across navigation.

---

## Implementation Stories

### Story 1: Global Navigation & Routing Refactor

As a chef, I want a persistent navigation bar so that I can quickly switch between the Hub, my recipes, and my planner.

- **AC 1:** The `Header` is updated to include links in the following order: `[Logo] | Dashboard | My Recipes | Meal Plan | My Pantry | Grocery List`.
- **AC 2:** The current recipe grid is moved from `app/dashboard/page.tsx` to `app/recipes/page.tsx`.
- **AC 3:** The `/recipes` view retains the search bar, "New Recipe" button, and standardizes the header alignment (Left: Title, Center: Search, Right: Button).

### Story 2: Dashboard Hub: "Today's Meals"

As a chef, I want to see exactly what I have planned for today so that I can start cooking immediately.

- **AC 1:** The `/dashboard` Hub displays a "Today's Meals" section as the top priority on mobile.
- **AC 2:** It displays recipes scheduled for the current date (user's local time) grouped by slot (Breakfast, Lunch, Dinner).
- **AC 3:** If no meals are planned, a prominent "Plan a Meal" action button is displayed.
- **AC 4:** Clicking "Cook it!" from this section passes the stored `scale` factor from the meal plan to the Play Mode URL (e.g., `/recipes/[id]/play?scale=2.0`).

### Story 3: Dashboard Hub: "Kitchen Status" (Timers & Prep)

As a chef, I want to see my active timers and upcoming prep tasks so that I can stay on top of my kitchen workflow.

- **AC 1:** An "Active Timers" card appears on the Hub if any timers are running in the background (persisted via `localStorage` or context).
- **AC 2:** An "Immediate Prep" card displays the next 3 tasks from the Meal Planner's aggregator (Story 4 of Meal Planner).
- **AC 3:** A "Shopping List" placeholder card is displayed to signal future functionality.

### Story 4: Persistent Scaling Journey

As a chef, I want my chosen recipe scale to be preserved when I navigate between different views of that recipe.

- **AC 1:** All recipe-related links (from Calendar, Dashboard, and Recipes list) support a `scale` query parameter.
- **AC 2:** The Recipe Detail View and Play Mode correctly parse and apply the `scale` parameter from the URL if present.
- **AC 3:** If a user modifies the scalar on the Detail View, the "Cook it!" button link is updated dynamically to pass that new scalar.

---

## Edge Cases & Logic

- **Mobile First:** On mobile viewports, the sections must stack vertically in order: Today's Meals > Shopping List > Kitchen Status.
- **Empty States:** Every section must have a "High-Action" empty state (e.g., "No recipes yet. [+ Create One]").
- **Scaling Persistence:** If a user navigates from the Meal Planner (scale 2.0) to a Recipe Detail View, then to the Dashboard, then back to the Recipe Detail View, the scale should default back to 1.0 unless explicitly passed in the link. Only _intra-journey_ scaling (Calendar -> Detail -> Play) is strictly required to persist.

---

## E2E Testing Plan

A new test suite `tests/e2e/dashboard-hub.spec.ts` must be created to verify the operational integrity of the Kitchen Command Center.

### Scenario 1: Operational Navigation Flow

1. **Login:** Authenticate and land on `/dashboard`.
2. **Verify Hub:** Confirm "Today's Meals" and "Kitchen Status" sections are visible.
3. **Navigate to Library:** Click "My Recipes" in the header and verify URL is `/recipes`.
4. **Search & Add:** Perform a search in the library view and click "+ New Recipe" to verify the creation flow still works from the new location.

### Scenario 2: The Scaled Cooking Journey

1. **Setup:** Create a recipe "Scaled Tacos" and add it to Today's meal plan with a **2.0x scale**.
2. **Dashboard Check:** Navigate to `/dashboard` and verify "Scaled Tacos" appears in "Today's Meals".
3. **Transition to Detail:** Click the recipe title on the Hub. Verify URL contains `scale=2.0` and ingredient quantities are doubled.
4. **Transition to Play:** Click "Cook it!". Verify Play Mode URL contains `scale=2.0` and step-by-step quantities are doubled.
5. **Modification:** Change scale to **0.5x** in the Detail View. Verify "Cook it!" button updates its link to `scale=0.5`.

### Scenario 3: Real-time Kitchen Status

1. **Start Timer:** Enter Play Mode for any recipe and start a 5-minute timer.
2. **Dashboard Visibility:** Navigate to the Hub (`/dashboard`). Verify the "Active Timers" card displays the counting-down timer.
3. **Prep Visibility:** Schedule a recipe with "Diced Onions". Verify the "Immediate Prep" card on the Hub shows "Onions (Diced)".

### Scenario 4: Multi-Tenancy Security Audit

1. **Cross-User Check:** User A plans a meal for Today.
2. **Verify Isolation:** User B logs in. Verify User B's Dashboard Hub is empty and they cannot navigate to User A's `plannedRecipe` ID even if guessed.

---

## Execution Plan

### Phase 1: Routing & Nav [SERIAL]

1.  Move current dashboard to `/recipes`.
2.  Update `Header.tsx` with the new global navigation links.
3.  Implement a basic shell for the new `/dashboard` with empty section containers.
4.  **Verification:** Run existing `dashboard.spec.ts` (updated for new routes) to ensure no regressions.

### Phase 2: Today's Meals Integration [SERIAL]

1.  Connect the Hub to the `getWeeklyMealPlan` logic, filtered for the current date.
2.  Implement the "Cook it!" redirection with scalar persistence.
3.  **Verification:** Implement Scenario 1 & 2 of the new E2E suite.

### Phase 3: Kitchen Status & Polish [PARALLEL]

1.  Add the "Immediate Prep" summary to the Hub.
2.  Implement the global "Active Timers" visibility.
3.  Apply mobile-first responsive styling to the Hub grid.
4.  **Verification:** Implement Scenario 3 of the new E2E suite.

### Phase 4: Final Hardening [SERIAL]

1.  **Full E2E Run:** Execute `npx playwright test tests/e2e/dashboard-hub.spec.ts`.
2.  **Security Audit:** Implement Scenario 4 of the E2E suite.
3.  **Cross-Browser:** Verify layout on mobile viewports using Playwright's mobile emulators.
