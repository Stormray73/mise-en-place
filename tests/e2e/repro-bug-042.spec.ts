import { test, expect } from "@playwright/test";
import { resetDatabase } from "./db-helper";

test.describe("BUG-042: Prep-Ahead Aggregator Sync on Recipe Deletion", () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    await page.goto("/meal-planner");
  });

  test("deleting a recipe immediately updates the Prep Ahead dashboard", async ({
    page,
  }) => {
    // 1. Create a unique recipe with Tomatoes (requires prep work)
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

    // 3. Add Meal Slot (Breakfast)
    await todaySlot.getByRole("button", { name: /\+ Add Meal/i }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Breakfast" })
      .click();

    // 4. Search and Add our recipe
    const recipeModal = page.locator(
      'div[role="dialog"]:has-text("Add Recipe to Meal")',
    );
    await expect(recipeModal).toBeVisible({ timeout: 15000 });
    await recipeModal.getByPlaceholder(/search recipes/i).fill(uniqueTitle);
    const recipeBtn = recipeModal.getByRole("button", { name: uniqueTitle });
    await recipeBtn.click();

    // Verify modal closes and recipe is under Breakfast
    await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
      timeout: 15000,
    });

    // Verify Tomatoes prep item shows up in Prep Ahead on the page
    const tomatoesPrepItem = page
      .locator('[data-testid^="prep-item-"]')
      .filter({ hasText: /Tomato/i })
      .first();
    await expect(tomatoesPrepItem).toBeVisible({ timeout: 15000 });

    // 5. Delete the recipe from the meal slot
    const breakfastMeal = todaySlot.locator('div:has-text("Breakfast")');
    await breakfastMeal.getByRole("button", { name: "Breakfast" }).click(); // Open Edit Meal Modal
    const editModal = page.getByRole("dialog");
    await expect(editModal).toBeVisible();

    // Click Delete Recipe inside the edit modal
    await editModal.getByRole("button", { name: /Delete Recipe/i }).click();
    await editModal.getByRole("button", { name: "×" }).click();
    await expect(editModal).not.toBeVisible({ timeout: 15000 });

    // 6. Verify Tomatoes prep item is GONE from the Prep Ahead dashboard on the page
    await expect(tomatoesPrepItem).not.toBeVisible({ timeout: 15000 });
  });
});
