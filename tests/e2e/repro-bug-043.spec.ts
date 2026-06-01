import { test, expect } from "@playwright/test";
import { resetDatabase } from "./db-helper";

test("BUG-043: Duplicate planned recipes are prevented in a single meal slot", async ({
  page,
}) => {
  await resetDatabase();

  // Create a recipe first to ensure at least one recipe exists
  await page.goto("/recipes/new");
  const uniqueTitle = `UXRecipe${Date.now()}`;
  await page.getByLabel(/Recipe Title/i).fill(uniqueTitle);
  await page.locator("#yieldAmount").fill("4");
  await page.locator("#yieldUnit").selectOption("item");

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

  // Go to meal planner
  await page.goto("/meal-planner");

  // Wait for the calendar to load
  await expect(
    page.locator('button:has-text("+ Add Meal")').first(),
  ).toBeVisible({ timeout: 15000 });

  // Clean up any existing meals in the first day column to ensure test isolation
  const firstDayColumn = page.locator(".md\\:grid-cols-7 > div").first();
  const deleteButtons = firstDayColumn.locator('[data-testid^="delete-meal-"]');
  while ((await deleteButtons.count()) > 0) {
    const btn = deleteButtons.first();
    const testId = await btn.getAttribute("data-testid");
    const exactBtn = page.getByTestId(testId!);
    page.once("dialog", (dialog) => dialog.accept());
    await btn.click({ force: true });
    await expect(exactBtn).not.toBeVisible();
  }

  // 1. Add a meal slot
  const uniqueSlot = `Slot-${Date.now()}`;
  await page.locator('button:has-text("+ Add Meal")').first().click();
  await page.waitForSelector("text=Add Meal Slot");
  await page.getByPlaceholder(/custom slot/i).fill(uniqueSlot);
  await page.getByRole("button", { name: /^add$/i }).click();

  // 2. Select a recipe from the Add Recipe modal
  const recipeModal = page.locator(
    'div[role="dialog"]:has-text("Add Recipe to Meal")',
  );
  await expect(recipeModal).toBeVisible({ timeout: 10000 });

  const recipeButtons = recipeModal
    .getByRole("button")
    .filter({ hasNotText: /cancel/i })
    .filter({ hasNotText: /^\u00d7$/ });

  // Make sure at least one recipe exists
  expect(await recipeButtons.count()).toBeGreaterThan(0);
  const recipeTitle = await recipeButtons.first().textContent();
  const trimmedTitle = recipeTitle!.trim();

  // Add the recipe
  await recipeButtons.first().click();

  // Wait for modal to close
  await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
    timeout: 15000,
  });

  // Verify the recipe is added
  const mealSlot = page
    .locator('[data-testid^="meal-slot-"]')
    .filter({ hasText: uniqueSlot })
    .first();
  await expect(mealSlot.getByText(trimmedTitle)).toBeVisible();

  // 3. Try to add the same recipe again
  await mealSlot.getByRole("button", { name: /\+ Add Recipe/i }).click();
  await expect(recipeModal).toBeVisible({ timeout: 10000 });

  // Set up dialog/alert handler to intercept error message
  const dialogPromise = page.waitForEvent("dialog");

  const matchingBtn = recipeModal.getByRole("button", {
    name: trimmedTitle,
    exact: true,
  });
  await matchingBtn.click();

  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("already in this meal slot");
  await dialog.accept();

  // Close the recipe modal by clicking close button
  await recipeModal.getByRole("button", { name: "×" }).click();
  await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
    timeout: 15000,
  });

  // Verify that the recipe is NOT duplicated in the slot
  const recipeInstances = mealSlot.getByText(trimmedTitle);
  const count = await recipeInstances.count();
  expect(count).toBe(1);
});
