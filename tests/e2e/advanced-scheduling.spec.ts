import { test, expect } from "@playwright/test";

test.describe("Story 12: Advanced Scheduling User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Chronological Sorting and Prep Exclusions", async ({ page }) => {
    // 1. Setup: Ensure we have a recipe
    await page.goto("/recipes/new");
    const uniqueTitle = `SchedRecipe${Date.now()}`;
    await page.getByLabel(/Recipe Title/i).fill(uniqueTitle);

    // Add an ingredient so it has prep content
    await page.getByPlaceholder(/search ingredients/i).fill("Tomato");
    await page
      .locator("button")
      .filter({ hasText: /tomatoes, red, ripe/i })
      .first()
      .click();

    await page.getByRole("button", { name: /save recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes/);

    // 2. Add meals out of order
    await page.goto("/meal-planner");
    const todaySlot = page.getByTestId("day-today");

    // Robust cleanup: Delete all meals for today to start fresh
    page.on("dialog", (dialog) => dialog.accept());
    await expect(async () => {
      const deleteBtn = todaySlot.getByTitle(/delete meal/i).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(deleteBtn).not.toBeVisible({ timeout: 5000 });
      }
    }).toPass({ timeout: 15000 });

    // Add Dinner then Breakfast
    await todaySlot.getByRole("button", { name: /\+ Add Meal/i }).click();
    await page.getByRole("button", { name: "Dinner" }).click();

    await todaySlot.getByRole("button", { name: /\+ Add Meal/i }).click();
    await page.getByRole("button", { name: "Breakfast" }).click();

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

    // Find the specific row for our recipe to avoid strict mode issues
    const recipeRow = todaySlot
      .locator('div[data-testid^="planned-recipe-"]')
      .filter({ hasText: uniqueTitle });
    const excludeBtn = recipeRow.getByTitle(/include in prep/i);
    await expect(excludeBtn).toBeVisible();

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
    await recipeRow.getByTitle(/include in prep/i).click();
    await expect(recipeRow.getByTitle(/excluded from prep/i)).toBeVisible();

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
