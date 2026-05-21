import { test, expect } from "@playwright/test";

test.describe("Story 12: Advanced Scheduling User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    // Handle confirmation dialogs
    page.on("dialog", (dialog) => dialog.accept());
  });

  test("Chronological Sorting and Prep Exclusions", async ({ page }) => {
    // 1. Setup: Ensure we have a recipe
    await page.goto("/recipes/new");
    const uniqueTitle = `SchedRecipe${Date.now()}`;
    await page.getByLabel(/Recipe Title/i).fill(uniqueTitle);

    // Add an ingredient so it has prep content
    await page.getByPlaceholder(/search ingredients/i).fill("Tomatoes");
    const tomatoesBtn = page
      .locator("button")
      .filter({ hasText: /Tomatoes, red, ripe/i })
      .first();
    await expect(tomatoesBtn).toBeVisible({ timeout: 20000 });
    await tomatoesBtn.click();

    await page.getByRole("button", { name: /save recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes/);

    // 2. Add meals out of order
    await page.goto("/meal-planner");
    const todaySlot = page.getByTestId("day-today");

    // Robust cleanup: Delete all meals for today to start fresh
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

    // Add Dinner then Breakfast
    await todaySlot.getByRole("button", { name: /\+ Add Meal/i }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Dinner" })
      .click();

    // Wait for the recipe modal to open, then close it
    const recipeModal = page.locator(
      'div[role="dialog"]:has-text("Add Recipe to Meal")',
    );
    await expect(recipeModal).toBeVisible({ timeout: 15000 });
    await recipeModal.getByRole("button", { name: "×" }).click();
    await expect(recipeModal).not.toBeVisible({ timeout: 15000 });

    await todaySlot.getByRole("button", { name: /\+ Add Meal/i }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Breakfast" })
      .click();
    await expect(recipeModal).toBeVisible({ timeout: 15000 });
    await recipeModal.getByRole("button", { name: "×" }).click();
    await expect(recipeModal).not.toBeVisible({ timeout: 15000 });

    // Verify chronological order: Breakfast should be first
    const firstMeal = todaySlot.locator('div[class*="bg-zinc-800/50"]').first();
    await expect(firstMeal).toContainText(/Breakfast/i);

    // 3. Add Recipe and test Prep Exclusion
    const breakfastSlot = todaySlot.locator('div:has-text("Breakfast")');
    await breakfastSlot
      .getByRole("button", { name: /\+ Add Recipe/i })
      .first()
      .click();
    await page.getByRole("button", { name: uniqueTitle }).first().click();

    // Verify it shows up on Dashboard first (as an ingredient)
    await page.goto("/dashboard");

    // Resilience loop for revalidation
    await expect(async () => {
      await page.reload();
      await expect(page.getByTestId("immediate-prep-section")).toContainText(
        /Tomato/i,
      );
    }).toPass({ timeout: 15000 });

    // Go back and exclude it
    await page.goto("/meal-planner");
    // Open the Edit Meal modal
    await todaySlot.getByRole("button", { name: "Breakfast" }).click();
    const modal = page.getByRole("dialog");
    const excludeCheckbox = modal.getByLabel("Exclude from Prep List (NP)");
    await expect(excludeCheckbox).toBeVisible();
    await excludeCheckbox.click();
    await expect(excludeCheckbox).toBeChecked({ timeout: 15000 });
    await modal.getByRole("button", { name: "Close" }).click();

    // Verify it's gone from Dashboard
    await page.goto("/dashboard");

    // Resilience loop for removal
    await expect(async () => {
      await page.reload();
      await expect(
        page.getByTestId("immediate-prep-section"),
      ).not.toContainText(/Tomato/i);
    }).toPass({ timeout: 15000 });
  });
});
