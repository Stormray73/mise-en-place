import { test, expect } from "@playwright/test";

test.describe("Custom Ingredients User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Create custom ingredient in recipe editor and verify in pantry", async ({
    page,
  }) => {
    // 1. Create in Recipe Editor
    await page.getByRole("link", { name: /Add Recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes\/new/);

    const testIngredientName = "My Secret Spice Mix " + Date.now();

    // Type the ingredient name
    await page
      .getByPlaceholder(/search ingredients.../i)
      .fill(testIngredientName);

    // Wait for the "+ Create" button to appear
    const createBtn = page.getByRole("button", {
      name: new RegExp(
        `\\+ Create "${testIngredientName}" as custom ingredient`,
        "i",
      ),
    });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.click();

    // Fill out the modal
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await modal.getByLabel(/base amount/i).fill("50");
    await modal.getByLabel(/calories/i).fill("100");
    await modal.getByRole("button", { name: /save ingredient/i }).click();

    // Verify it was added to the recipe
    await expect(page.getByText(testIngredientName).first()).toBeVisible({
      timeout: 10000,
    });

    // 2. Manage in Pantry
    await page.goto("/dashboard/pantry");
    await expect(page).toHaveURL(/\/dashboard\/pantry/, { timeout: 15000 });

    // Verify it appears in My Ingredients
    const customSection = page.getByText("My Custom Ingredients");
    await expect(customSection).toBeVisible();

    const ingredientCard = page
      .getByText(testIngredientName)
      .first()
      .locator("..");
    await expect(ingredientCard).toBeVisible();

    // Delete it
    page.on("dialog", (dialog) => dialog.accept()); // Automatically accept the confirm dialog
    await ingredientCard
      .locator("..")
      .getByRole("button", { name: /delete/i })
      .click();

    // Verify deletion
    await expect(page.getByText(testIngredientName).first()).not.toBeVisible({
      timeout: 10000,
    });
  });
});
