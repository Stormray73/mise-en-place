import { test, expect } from "@playwright/test";

test.describe("Pantry & Shopping List", () => {
  test.beforeEach(async ({ page }) => {
    // Mock USDA API with unique IDs to prevent ingredient collisions in DB
    await page.route("**/api/usda/search*", async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("q") || "Test Food";

      // Simple hash-like ID generation from query
      let fdcId = 0;
      const lowerQuery = query.toLowerCase();
      for (let i = 0; i < lowerQuery.length; i++) {
        fdcId = (fdcId << 5) - fdcId + lowerQuery.charCodeAt(i);
        fdcId |= 0;
      }
      fdcId = Math.abs(fdcId) + 1000;

      const foods = [
        {
          fdcId: fdcId,
          description: query,
          foodCategory: "Test Category",
          foodPortions: [
            { gramWeight: 100, amount: 1, measureUnitName: "cup" },
          ],
          foodNutrients: [
            { nutrientName: "Energy", value: 100 },
            { nutrientName: "Protein", value: 10 },
            { nutrientName: "Total lipid (fat)", value: 5 },
            { nutrientName: "Carbohydrate, by difference", value: 20 },
          ],
          baseMacros: { calories: 100, protein: 10, fat: 5, carbs: 20 },
          baseAmount: 100,
        },
      ];

      await route.fulfill({ json: { foods } });
    });
  });

  test("Story 2: can add an item to the pantry with location and threshold", async ({
    page,
  }) => {
    await page.goto("/dashboard/pantry");

    await page.getByRole("button", { name: /Add Item/i }).click();

    // Search for Flour (USDA)
    const searchInput = page.getByPlaceholder(/Search USDA/i);
    await searchInput.fill("Flour");

    // Select the first result - wait for listbox
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 15000 });
    await listbox.getByRole("option").first().click();

    // Fill quantity, unit, location, threshold
    await page.getByLabel(/Quantity/i).fill("5");
    await page.getByLabel(/Unit/i).selectOption("lb");

    // Add location via Manage if it doesn't exist
    await page.getByRole("button", { name: /Manage/i }).click();
    await page.getByPlaceholder(/New location name/i).fill("Garage");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByRole("button", { name: /Done/i }).click();

    await page.getByLabel(/Location/i).selectOption({ label: "Garage" });
    await page.getByLabel(/Restock Threshold/i).fill("1");

    await page.getByRole("button", { name: /Add to Pantry/i }).click();

    // Verify it's in the list
    await expect(page.getByText(/Garage/i).first()).toBeVisible();
    await expect(
      page
        .locator(".text-2xl")
        .getByText(/5\s*lb/i)
        .first(),
    ).toBeVisible();
  });

  test("Story 3: can decrement and finish a pantry item", async ({ page }) => {
    await page.goto("/dashboard/pantry");

    // Add a unique item to avoid collisions
    const uniqueLocation = `Shelf-${Math.random().toString(36).substring(7)}`;
    await page.getByRole("button", { name: /Add Item/i }).click();
    await page.getByPlaceholder(/Search USDA/i).fill("Sugar");
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible({ timeout: 15000 });
    await listbox.getByRole("option").first().click();
    await page.getByLabel(/Quantity/i).fill("10");
    await page.getByLabel(/Unit/i).selectOption("lb");

    // Add unique location via Manage
    await page.getByRole("button", { name: /Manage/i }).click();
    await page.getByPlaceholder(/New location name/i).fill(uniqueLocation);
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByRole("button", { name: /Done/i }).click();

    await page.getByLabel(/Location/i).selectOption({ label: uniqueLocation });
    await page.getByRole("button", { name: /Add to Pantry/i }).click();

    // Now test decrement
    const itemCard = page
      .locator("div.bg-zinc-900")
      .filter({ hasText: uniqueLocation })
      .first();
    await expect(itemCard).toBeVisible();

    // Click -1
    await itemCard.getByRole("button", { name: "-1" }).click();
    await expect(itemCard.locator(".text-2xl")).toContainText(/9\s*lb/i);

    // Click Finish
    await itemCard.getByRole("button", { name: /Finish/i }).click();

    // It should be 0 and hidden by default
    await expect(itemCard).not.toBeVisible({ timeout: 10000 });

    // Toggle "Show zero-stock items"
    await page.getByLabel(/Show zero-stock items/i).check();
    await expect(itemCard.locator(".text-2xl")).toContainText(/0\s*lb/i);
  });

  test("Story 5 & 6: Shopping list generation and restocking", async ({
    page,
  }) => {
    await page.goto("/dashboard/shopping-list");
    await page.getByRole("button", { name: /Update List/i }).click();

    // Check if there are items to buy
    const buyButton = page.getByRole("button", { name: /^Buy$/i }).first();
    if (await buyButton.isVisible()) {
      const itemName = await page.locator("h3").first().textContent();
      await buyButton.click();
      await expect(
        page.getByRole("button", { name: /Purchased/i }).first(),
      ).toBeVisible();

      // 4. Verify in Pantry
      await page.goto("/dashboard/pantry");
      await expect(page.getByText(itemName!).first()).toBeVisible();
    }
  });

  test("Story 7: Pre-cook inventory validation warning", async ({ page }) => {
    // 1. Create a recipe with a unique ingredient that ISN'T in pantry
    const uniqueIngName = `RareSpice-${Math.random().toString(36).substring(7)}`;
    await page.goto("/recipes/new");
    await page.waitForSelector("#title", { state: "visible" });
    await page.locator("#title").fill(`Uncookable ${uniqueIngName}`);

    await page.getByPlaceholder(/Search ingredients/i).fill(uniqueIngName);
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();
    await listbox.getByRole("option").first().click();

    // Wait for ingredient to be added to UI
    await expect(
      page
        .locator("div.bg-zinc-800")
        .filter({ hasText: uniqueIngName })
        .locator('input[type="number"]'),
    ).toBeVisible({ timeout: 20000 });

    await page.getByRole("button", { name: /Save Recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes$/);
    await page.getByText(`Uncookable ${uniqueIngName}`).first().click();

    // 2. Verify "Low Stock" badge
    await expect(page.getByText(/Low Stock/i).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
