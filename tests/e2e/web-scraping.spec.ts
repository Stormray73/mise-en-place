import { test, expect } from "@playwright/test";

test.describe("Web Scraping User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and go to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Story 5: Import recipe from URL", async ({ page }) => {
    const mockUrl = "https://example-recipes.com/pasta";

    await page.goto("/recipes/new");
    const importInput = page.getByPlaceholder(/example\.com\/recipe/i);
    await expect(importInput).toBeVisible();

    await importInput.fill(mockUrl);

    const importBtn = page.getByRole("button", { name: /import/i });
    await importBtn.click();

    // Verify we are redirected to the editor with the mocked data from MSW
    // MSW handler returns "MSW Mock Pasta"
    await expect(page.getByLabel(/Recipe Title/i)).toHaveValue(
      "MSW Mock Pasta",
      { timeout: 15000 },
    );
    await expect(page.getByLabel(/Yield Amount/i)).toHaveValue("2");

    // Verify ingredients
    const pastaRow = page.locator('div:has-text("Pasta")').first();
    await expect(pastaRow).toBeVisible();
    await expect(pastaRow.locator('input[type="number"]')).toHaveValue("200");
  });
});
