import { test, expect } from "@playwright/test";

test.describe("Recipe Store User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and go to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Story 1: Create a new recipe with USDA ingredients", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /\+ new recipe/i }).click();

    // Verify redirected to new recipe page
    await expect(page).toHaveURL(/\/recipes\/new/);

    // Fill in basic details
    await page.getByLabel(/recipe title/i).fill("Test Marinara");
    await page.getByLabel(/yield amount/i).fill("1");
    await page.getByLabel(/yield unit/i).selectOption("L");

    // Search and add ingredient
    await page.getByPlaceholder(/search ingredients/i).fill("Tomato");
    await page.getByRole("button", { name: /tomatoes, red, ripe/i }).click();

    // Verify ingredient added
    await expect(page.getByText(/Tomatoes, red, ripe/i)).toBeVisible();

    // Add a step
    await page.getByRole("button", { name: /add step/i }).click();
    await page
      .getByPlaceholder(/instruction for step 1/i)
      .fill("Simmer for 20 minutes.");
    await page.locator('input[type="number"]').nth(2).fill("20"); // Timer input

    // Save recipe
    await page.getByRole("button", { name: /save recipe/i }).click();

    // Verify redirect to recipes and recipe visibility
    await expect(page).toHaveURL(/\/recipes/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Test Marinara" }).first(),
    ).toBeVisible({ timeout: 15000 });
  });

  test("Story 4: Cooking mode and timers", async ({ page }) => {
    // Ensure there is a recipe to play
    await page.goto("/recipes");
    await expect(page.getByRole("heading", { name: /Recipes/i })).toBeVisible({
      timeout: 15000,
    });

    const playLink = page.getByRole("link", { name: /cook it!/i }).first();
    await expect(playLink).toBeVisible({ timeout: 15000 });
    await playLink.click();
    await expect(page).toHaveURL(/\/play/);

    // Verify some content is present (step or order)
    await expect(page.getByText(/1/)).toBeVisible();

    // Check for timer button (if present in UI)
    const startTimerBtn = page.getByRole("button", { name: /start timer/i });
    if (await startTimerBtn.isVisible()) {
      await startTimerBtn.click();
      await expect(page.getByText(/running/i)).toBeVisible();
    }
  });

  test("Story 5: Edit recipe", async ({ page }) => {
    // Navigate to Edit mode
    await page.goto("/recipes");
    await expect(page.getByRole("heading", { name: /Recipes/i })).toBeVisible({
      timeout: 15000,
    });

    const editLink = page.getByTitle("Edit Recipe").first();
    await expect(editLink).toBeVisible({ timeout: 15000 });
    await editLink.click();
    await expect(page).toHaveURL(/\/edit/);

    // Change title
    const titleInput = page.getByLabel(/recipe title/i);
    await expect(titleInput).toBeVisible({ timeout: 15000 });
    await titleInput.fill("Updated Marinara");
    await page.getByRole("button", { name: /save recipe/i }).click();

    // Verify recipes reflects change
    await expect(page).toHaveURL(/\/recipes/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Updated Marinara" }).first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
