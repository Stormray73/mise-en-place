import { test, expect } from "@playwright/test";

test.describe("Meal Planner", () => {
  test.beforeEach(async ({ page }) => {
    // Auth is handled by auth.setup.ts
    await page.goto("/meal-planner");
    // Handle confirmation dialogs
    page.on("dialog", (dialog) => dialog.accept());
  });

  test("can navigate to meal planner and see the week view", async ({
    page,
  }) => {
    // Increased timeout for slow revalidations/fetches
    await expect(
      page.getByRole("heading", { name: /Meal Planner/i }),
    ).toBeVisible({ timeout: 20000 });

    // Check for days of the week - using first to avoid strict mode if multiple exist
    // and matching specific day labels typically found in calendars
    await expect(
      page.getByText(/Mon|Tue|Wed|Thu|Fri|Sat|Sun/i).first(),
    ).toBeVisible();
  });

  test("can add and delete a meal slot", async ({ page }) => {
    const uniqueSlot = `Slot-${Date.now()}`;
    const addButtons = page.getByRole("button", { name: /\+ Add Meal/i });
    await addButtons.first().click();

    // Select custom slot to be unique
    await page.getByPlaceholder(/custom slot/i).fill(uniqueSlot);
    await page.getByRole("button", { name: /^add$/i }).click();

    // Wait for modal to be removed from DOM
    await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
      timeout: 15000,
    });

    // Verify the slot is added and target it specifically
    const newSlot = page
      .locator('[data-testid^="meal-slot-"]')
      .filter({ hasText: uniqueSlot })
      .first();
    await expect(newSlot).toBeVisible();

    const testId = await newSlot.getAttribute("data-testid");
    const mealId = testId?.replace("meal-slot-", "");

    // Delete the slot
    await page.getByTestId(`delete-meal-${mealId}`).click();

    // Wait for it to disappear
    await expect(newSlot).not.toBeVisible({ timeout: 20000 });
  });

  test("can add a recipe to a meal and adjust scale", async ({ page }) => {
    const uniqueSlot = `RecipeSlot-${Date.now()}`;
    // 1. Ensure a meal slot exists
    await page
      .getByRole("button", { name: /\+ Add Meal/i })
      .first()
      .click();
    await page.getByPlaceholder(/custom slot/i).fill(uniqueSlot);
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
      timeout: 15000,
    });

    // 2. Click "+ Add Recipe" inside the newly created slot
    const mealSlot = page
      .locator('[data-testid^="meal-slot-"]')
      .filter({ hasText: uniqueSlot })
      .first();
    await mealSlot.getByRole("button", { name: /\+ Add Recipe/i }).click();

    // 3. Search for and select a recipe
    // Filter out the close button (×) and Cancel button
    const recipeButtons = page
      .getByRole("dialog")
      .getByRole("button")
      .filter({ hasNotText: /cancel/i })
      .filter({ hasNotText: /^\u00d7$/ });

    if ((await recipeButtons.count()) > 0) {
      const recipeTitle = await recipeButtons.first().textContent();
      await recipeButtons.first().click();
      await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
        timeout: 15000,
      });

      // Verify recipe is added - check inside the specific meal slot
      await expect(mealSlot.getByText(recipeTitle!.trim())).toBeVisible();

      // Adjust scale (multiplier)
      const scaleInput = mealSlot
        .locator('input[data-testid^="scale-input-"]')
        .first();
      await scaleInput.fill("2.5");
      await expect(scaleInput).toHaveValue("2.5");
    }
  });

  test("can toggle leftover source and link leftovers", async ({ page }) => {
    const uniqueSlot1 = `LS-Source-${Date.now()}`;
    const uniqueSlot2 = `LS-Consumer-${Date.now()}`;

    // Add source meal
    await page
      .getByRole("button", { name: /\+ Add Meal/i })
      .first()
      .click();
    await page.getByPlaceholder(/custom slot/i).fill(uniqueSlot1);
    await page.getByRole("button", { name: /^add$/i }).click();
    await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
      timeout: 15000,
    });

    const firstSlot = page
      .locator('[data-testid^="meal-slot-"]')
      .filter({ hasText: uniqueSlot1 })
      .first();
    await firstSlot.getByRole("button", { name: /\+ Add Recipe/i }).click();

    const recipeButtons = page
      .getByRole("dialog")
      .getByRole("button")
      .filter({ hasNotText: /cancel/i })
      .filter({ hasNotText: /^\u00d7$/ });

    if ((await recipeButtons.count()) > 0) {
      await recipeButtons.first().click();
      await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
        timeout: 15000,
      });

      // Mark as Leftover Source - use getByRole("button", { name: "LS" })
      const lsButton = firstSlot.getByRole("button", { name: "LS" });
      await lsButton.click({ force: true });
      // Wait for background color change indicating state change
      await expect(lsButton).toHaveClass(/bg-amber-600/);

      // Add a second meal on a different day to consume leftovers
      await page
        .getByRole("button", { name: /\+ Add Meal/i })
        .nth(1)
        .click();
      await page.getByPlaceholder(/custom slot/i).fill(uniqueSlot2);
      await page.getByRole("button", { name: /^add$/i }).click();
      await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
        timeout: 15000,
      });

      const secondSlot = page
        .locator('[data-testid^="meal-slot-"]')
        .filter({ hasText: uniqueSlot2 })
        .first();
      await secondSlot
        .getByRole("button", {
          name: /\+ Add Recipe/i,
        })
        .click();

      // Need to re-query recipeButtons for the new dialog
      const recipeButtons2 = page
        .getByRole("dialog")
        .getByRole("button")
        .filter({ hasNotText: /cancel/i })
        .filter({ hasNotText: /^\u00d7$/ });
      await recipeButtons2.first().click();
      await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
        timeout: 15000,
      });

      // Link leftover
      const select = secondSlot.locator("select");
      // Wait for options to load (might need a moment for revalidation)
      await expect(select.locator("option").nth(1)).toBeAttached({
        timeout: 10000,
      });
      await select.selectOption({ index: 1 }); // Select the first available source
      await expect(select).toHaveClass(/border-green-500/);
    }
  });
});
