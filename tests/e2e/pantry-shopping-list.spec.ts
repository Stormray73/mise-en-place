import { test, expect } from "@playwright/test";

test.describe("Pantry & Shopping List", () => {
  test.beforeEach(async ({ page }) => {
    // Mock USDA API
    await page.route("**/api/usda/search*", async (route) => {
      const url = new URL(route.request().url());
      const query = url.searchParams.get("q");

      const foods = [
        {
          fdcId: 1001,
          description: query || "Test Food",
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
    await expect(page.locator('div[role="listbox"]')).toBeVisible({
      timeout: 15000,
    });
    await page.locator('div[role="listbox"] >> role=option').first().click();

    // Fill quantity, unit, location, threshold
    await page.getByLabel(/Quantity/i).fill("5");
    await page.getByLabel(/Unit/i).selectOption("lb");
    await page.getByLabel(/Location/i).fill("Garage");
    await page.getByLabel(/Restock Threshold/i).fill("1");

    await page.getByRole("button", { name: /Add to Pantry/i }).click();

    // Verify it's in the list
    await expect(page.getByText(/Garage/i).first()).toBeVisible();
    await expect(
      page
        .locator("div.text-2xl")
        .getByText(/5\s*lb/i)
        .first(),
    ).toBeVisible();
  });

  test("Story 3: can decrement and finish a pantry item", async ({ page }) => {
    await page.goto("/dashboard/pantry");

    // Add a unique item to avoid collisions
    const uniqueLocation = `Shelf-${Math.random().toString(36).substring(7)}`;
    await page.getByRole("button", { name: /Add Item/i }).click();
    await page.getByPlaceholder(/Search USDA/i).fill("Salt");
    await expect(page.locator('div[role="listbox"]')).toBeVisible({
      timeout: 15000,
    });
    await page.locator('div[role="listbox"] >> role=option').first().click();
    await page.getByLabel(/Quantity/i).fill("10");
    await page.getByLabel(/Unit/i).selectOption("lb");
    await page.getByLabel(/Location/i).fill(uniqueLocation);
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

  test("Story 4: cooking a recipe deducts ingredients from pantry", async ({
    page,
  }) => {
    // 1. Create a test recipe
    await page.goto("/recipes/new");
    const recipeTitle = `Test Deduction ${Math.random().toString(36).substring(7)}`;
    await page.waitForSelector("#title", { state: "visible", timeout: 20000 });
    await page.locator("#title").fill(recipeTitle);

    // Add Ingredient
    await page.getByPlaceholder(/Search ingredients/i).fill("Salt");
    await expect(page.locator('div[role="listbox"]')).toBeVisible();
    await page.locator('div[role="listbox"] >> role=option').first().click();

    // Fill component details
    const qtyInput = page.locator('input[name*="quantity"]').first();
    await expect(qtyInput).toBeVisible({ timeout: 10000 });
    await qtyInput.fill("20");
    await page.locator('select[name*="unit"]').first().selectOption("g");

    await page.getByRole("button", { name: /Save Recipe/i }).click();
    // It redirects to /recipes, let's go to the new recipe
    await expect(page).toHaveURL(/\/recipes$/);
    await page.getByText(recipeTitle).first().click();
    const recipeUrl = page.url();

    // 2. Add enough stock
    await page.goto("/dashboard/pantry");
    await page.getByRole("button", { name: /Add Item/i }).click();
    await page.getByPlaceholder(/Search USDA/i).fill("Salt");
    await expect(page.locator('div[role="listbox"]')).toBeVisible();
    await page.locator('div[role="listbox"] >> role=option').first().click();
    await page.getByLabel(/Quantity/i).fill("100");
    await page.getByLabel(/Unit/i).selectOption("g");
    await page.getByRole("button", { name: /Add to Pantry/i }).click();

    // 3. Scale and Cook
    await page.goto(`${recipeUrl}/play?scale=1`);

    // Navigate through steps
    await expect(
      page.getByRole("button", { name: /Finish|Next Step/i }).first(),
    ).toBeVisible({ timeout: 15000 });
    let isFinish = false;
    let iterations = 0;
    while (!isFinish && iterations < 10) {
      const btn = page
        .getByRole("button", { name: /Finish|Next Step/i })
        .first();
      const text = await btn.textContent();
      if (text?.includes("Finish")) isFinish = true;
      await btn.click();
      iterations++;
    }

    // 4. Confirm deduction
    await expect(page.getByText(/Would you like to deduct/i)).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: /Yes, deduct stock/i }).click();

    // 5. Verify pantry is reduced (100 - 20 = 80)
    await page.goto("/dashboard/pantry");
    const saltCard = page
      .locator("div.bg-zinc-900")
      .filter({ has: page.locator('h3:has-text("Salt")') })
      .filter({ hasText: "g" })
      .first();
    await expect(saltCard).toBeVisible();
    await expect(saltCard.locator(".text-2xl")).toContainText(/80\s*g/i);
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
    const uniqueIng = `Rare Spice ${Math.random().toString(36).substring(7)}`;
    await page.goto("/recipes/new");
    await page.waitForSelector("#title", { state: "visible" });
    await page.locator("#title").fill(`Uncookable ${uniqueIng}`);

    await page.getByPlaceholder(/Search ingredients/i).fill("Saffron");
    await expect(page.locator('div[role="listbox"]')).toBeVisible();
    await page.locator('div[role="listbox"] >> role=option').first().click();

    await page.getByRole("button", { name: /Save Recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes$/);
    await page.getByText(`Uncookable ${uniqueIng}`).first().click();

    // 2. Verify "Low Stock" badge
    await expect(page.getByText(/Low Stock/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
