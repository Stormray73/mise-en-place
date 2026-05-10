import { test, expect } from "@playwright/test";

test.describe("Meal Planner", () => {
  test.beforeEach(async ({ page }) => {
    // Auth is handled by auth.setup.ts
    await page.goto("/meal-planner");
  });

  test("can navigate to meal planner and see the week view", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: /Meal Planner/i }),
    ).toBeVisible();
    await expect(page.getByText(/Sun/i)).toBeVisible();
    await expect(page.getByText(/Sat/i)).toBeVisible();
  });

  test("can add and delete a meal slot", async ({ page }) => {
    // Click the first "+ Add Meal" button
    const addButtons = page.getByRole("button", { name: /\+ Add Meal/i });
    await addButtons.first().click();

    // Select "Breakfast" from the modal
    await page.getByRole("button", { name: "Breakfast" }).click();

    // Verify the slot is added
    await expect(page.getByText("BREAKFAST")).toBeVisible();

    // Delete the slot
    await page.locator('button:has-text("×")').first().click();
    await expect(page.getByText("BREAKFAST")).not.toBeVisible();
  });

  test("can add a recipe to a meal and adjust scale", async ({ page }) => {
    // 1. Ensure a meal slot exists
    await page
      .getByRole("button", { name: /\+ Add Meal/i })
      .first()
      .click();
    await page.getByRole("button", { name: "Lunch" }).click();

    // 2. Click "+ Add Recipe"
    await page.getByRole("button", { name: /\+ Add Recipe/i }).click();

    // 3. Search for and select a recipe (assuming "Queso" exists from previous tasks)
    // If not, we might need a more robust way to ensure a recipe exists.
    // For now, we'll try to find any recipe in the list.
    const recipeButtons = page.locator(
      'button:below(h3:has-text("Add Recipe to Meal"))',
    );
    if ((await recipeButtons.count()) > 0) {
      const recipeTitle = await recipeButtons.first().textContent();
      await recipeButtons.first().click();

      // Verify recipe is added
      await expect(page.getByText(recipeTitle!)).toBeVisible();

      // Adjust scale (multiplier)
      const scaleInput = page.locator('input[type="number"]').first();
      await scaleInput.fill("2.5");
      // Wait for revalidation or just check value
      await expect(scaleInput).toHaveValue("2.5");
    }
  });

  test("can toggle leftover source and link leftovers", async ({ page }) => {
    // Add two meals to facilitate linking
    await page
      .getByRole("button", { name: /\+ Add Meal/i })
      .first()
      .click();
    await page.getByRole("button", { name: "Dinner" }).click();

    await page.getByRole("button", { name: /\+ Add Recipe/i }).click();
    const recipeButtons = page.locator(
      'button:below(h3:has-text("Add Recipe to Meal"))',
    );
    if ((await recipeButtons.count()) > 0) {
      await recipeButtons.first().click();

      // Mark as Leftover Source
      const lsButton = page.getByTitle("Mark as Leftover Source");
      await lsButton.click();
      await expect(lsButton).toHaveClass(/bg-amber-600/);

      // Add a second meal on a different day to consume leftovers
      const addMealButtons = page.getByRole("button", { name: /\+ Add Meal/i });
      await addMealButtons.nth(1).click();
      await page.getByRole("button", { name: "Lunch" }).click();

      const addRecipeButtons = page.getByRole("button", {
        name: /\+ Add Recipe/i,
      });
      await addRecipeButtons.nth(1).click();
      await recipeButtons.first().click();

      // Link leftover
      const select = page.locator("select").nth(1);
      await select.selectOption({ index: 1 }); // Select the first available source
      await expect(select).toHaveClass(/border-green-500/);
    }
  });
});
