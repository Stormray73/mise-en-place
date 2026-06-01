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
    await page.getByRole("link", { name: /Add Recipe/i }).click();

    // Verify redirected to new recipe page
    await expect(page).toHaveURL(/\/recipes\/new/);

    // Fill in basic details
    await page.getByLabel(/recipe title/i).fill("Test Marinara");
    await page.getByLabel(/yield amount/i).fill("1");
    await page.getByLabel(/yield unit/i).selectOption("L");

    // Search and add ingredient
    await page.getByPlaceholder(/search ingredients/i).fill("Tomatoes");
    const tomatoesBtn = page
      .locator("button")
      .filter({ hasText: /Tomatoes, red, ripe/i })
      .first();
    await expect(tomatoesBtn).toBeVisible({ timeout: 20000 });
    await tomatoesBtn.click();

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
    await expect(page.getByText(/Step 1 of/i).first()).toBeVisible({
      timeout: 10000,
    });

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

  test("Story 4: Qualitative ingredient states (optional and to taste)", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /Add Recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes\/new/);

    // Fill title
    await page.getByLabel(/recipe title/i).fill("Qualitative Test Recipe");
    await page.locator("#yieldAmount").fill("4");
    await page.locator("#yieldUnit").selectOption("item");

    // Add first ingredient (Tomatoes)
    await page.getByPlaceholder(/search ingredients/i).fill("Tomatoes");
    const tomatoesBtn = page
      .locator("button")
      .filter({ hasText: /Tomatoes, red, ripe/i })
      .first();
    await expect(tomatoesBtn).toBeVisible({ timeout: 20000 });
    await tomatoesBtn.click();
    await expect(page.getByText(/Tomatoes, red, ripe/i)).toBeVisible();

    // Add second ingredient (Salt)
    await page.getByPlaceholder(/search ingredients/i).fill("Salt");
    const saltBtn = page
      .locator("button")
      .filter({ hasText: /Salt, table/i })
      .first();
    await expect(saltBtn).toBeVisible({ timeout: 20000 });
    await saltBtn.click();
    await expect(page.getByText(/Salt, table/i)).toBeVisible();

    // Edit Tomatoes to be Optional
    await page.getByTitle("Edit inline").first().click();
    const optionalCheckbox = page.getByLabel("Optional").first();
    await expect(optionalCheckbox).toBeVisible();
    await optionalCheckbox.check();
    await page.getByTitle("Apply changes").click();

    // Edit Salt to be To Taste
    await page.getByTitle("Edit inline").nth(1).click();
    const toTasteCheckbox = page.getByLabel("To Taste").first();
    await expect(toTasteCheckbox).toBeVisible();
    await toTasteCheckbox.check();

    // Verify Quantity is disabled when To Taste is checked
    const quantityInput = page.getByPlaceholder("To Taste");
    await expect(quantityInput).toBeDisabled();
    await page.getByTitle("Apply changes").click();

    // Verify inline render
    await expect(
      page.getByText(/Tomatoes, red, ripe.*\(optional\)/i),
    ).toBeVisible();
    await expect(page.getByText("To Taste", { exact: true })).toBeVisible();

    // Add a step
    await page.getByRole("button", { name: /add step/i }).click();
    await page
      .getByPlaceholder(/instruction for step 1/i)
      .fill("Sprinkle salt to taste over optional tomatoes.");

    // Save recipe
    await page.getByRole("button", { name: /save recipe/i }).click();
    await expect(page).toHaveURL(/\/recipes/, { timeout: 15000 });

    // Open recipe details
    await page
      .getByRole("heading", { name: "Qualitative Test Recipe" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/recipes\/[a-zA-Z0-9_-]+/);

    // Verify details render "To Taste" and "optional"
    await expect(
      page.getByText(/Tomatoes, red, ripe.*\(optional\)/i),
    ).toBeVisible();
    await expect(page.getByText("To Taste", { exact: true })).toBeVisible();

    // Start play mode
    await page.getByRole("link", { name: /Cook it!/i }).click();
    await expect(page).toHaveURL(/\/play/);

    // Verify play mode renders "To Taste" and "optional"
    await expect(
      page.getByText(/Tomatoes, red, ripe.*\(optional\)/i),
    ).toBeVisible();
    await expect(page.getByText("To Taste", { exact: true })).toBeVisible();
  });
});
