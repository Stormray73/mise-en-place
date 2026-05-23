import { test, expect } from "@playwright/test";

test.describe("Meal Planner UX & Prep Dismissal", () => {
  test.beforeEach(async ({ page }) => {
    // Auth is handled by auth.setup.ts
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    // Handle native confirm/alert dialogs
    page.on("dialog", (dialog) => dialog.accept());
  });

  test("two-stage Add Meal flow and premium prep dismissal custom warning with sessionStorage skip", async ({
    page,
  }) => {
    // 1. Setup: Create a unique recipe with Tomatoes (triggers prep work)
    await page.goto("/recipes/new");
    const uniqueTitle = `UXRecipe${Date.now()}`;
    await page.getByLabel(/Recipe Title/i).fill(uniqueTitle);

    // Add tomatoes as an ingredient
    await page.getByPlaceholder(/search ingredients/i).fill("Tomatoes");
    const tomatoesBtn = page
      .locator("button")
      .filter({ hasText: /Tomatoes, red, ripe/i })
      .first();
    await expect(tomatoesBtn).toBeVisible({ timeout: 20000 });
    await tomatoesBtn.click();

    // Save recipe
    await page.getByRole("button", { name: /save recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes/);

    // 2. Go to Meal Planner
    await page.goto("/meal-planner");
    const todaySlot = page.getByTestId("day-today");

    // Clean up existing meals for today to ensure a clean slate
    const deleteButtons = todaySlot.getByTitle(/delete meal/i);
    while ((await deleteButtons.count()) > 0) {
      const btn = deleteButtons.first();
      const testId = await btn.getAttribute("data-testid");
      await btn.click({ force: true });
      if (testId) {
        await expect(page.getByTestId(testId)).not.toBeVisible({
          timeout: 10000,
        });
      } else {
        await page.waitForTimeout(500);
      }
    }

    // 3. Add Meal Slot (Stage 1 of AddMealModal)
    await todaySlot.getByRole("button", { name: /\+ Add Meal/i }).click();

    // Choose Breakfast slot
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Breakfast" })
      .click();

    // 4. Instant transition to search/select (Stage 2 of AddMealModal)
    // The dialog should NOT close. Instead, it should transition to "Add Recipe to Meal" title.
    const recipeStageModal = page.locator(
      'div[role="dialog"]:has-text("Add Recipe to Meal")',
    );
    await expect(recipeStageModal).toBeVisible({ timeout: 15000 });

    // The modal should contain the search bar. Let's find our recipe.
    const searchInput = recipeStageModal.getByPlaceholder(/search recipes/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill(uniqueTitle);

    // Click the filtered recipe button
    const recipeBtn = recipeStageModal.getByRole("button", {
      name: uniqueTitle,
    });
    await expect(recipeBtn).toBeVisible({ timeout: 10000 });
    await recipeBtn.click();

    // Verify modal closes and the recipe shows up under Breakfast
    await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
      timeout: 15000,
    });
    const breakfastMeal = todaySlot.locator('div:has-text("Breakfast")');
    await expect(breakfastMeal.getByText(uniqueTitle)).toBeVisible();

    // 5. Verify Tomatoes shows up in the Prep Ahead Aggregator on the same page
    const tomatoesPrepItem = page
      .locator('[data-testid^="prep-item-"]')
      .filter({ hasText: /Tomato/i })
      .first();
    await expect(tomatoesPrepItem).toBeVisible({ timeout: 15000 });

    // 6. Test dismissal custom warning dialogue
    const dismissBtn = tomatoesPrepItem.locator(
      '[data-testid^="dismiss-prep-"]',
    );
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();

    // Dialogue opens
    const dismissDialog = page.getByTestId("dismissal-dialog");
    await expect(dismissDialog).toBeVisible();
    await expect(page.getByTestId("dismiss-modal-backdrop")).toBeVisible();

    // Click Cancel and verify item remains
    await page.getByTestId("cancel-dismiss-btn").click();
    await expect(dismissDialog).not.toBeVisible();
    await expect(tomatoesPrepItem).toBeVisible();

    // Click dismiss again
    await dismissBtn.click();
    await expect(dismissDialog).toBeVisible();

    // Check "Do not show again" checkbox
    const checkbox = page.getByTestId("dont-show-again-checkbox");
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Confirm dismiss
    await page.getByTestId("confirm-dismiss-btn").click();

    // Dialog closes and item is gone
    await expect(dismissDialog).not.toBeVisible();
    await expect(tomatoesPrepItem).not.toBeVisible({ timeout: 15000 });

    // Verify sessionStorage has the preference set
    const skipPref = await page.evaluate(() =>
      sessionStorage.getItem("mise-en-place:skip-prep-dismiss-warning"),
    );
    expect(skipPref).toBe("true");
  });
});
