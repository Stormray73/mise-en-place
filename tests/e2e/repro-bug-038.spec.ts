import { test, expect } from "@playwright/test";

test("BUG-038: Duplicate Meal Presets on the same day are prevented", async ({
  page,
}) => {
  await page.goto("/meal-planner");

  // Wait for the calendar to load first
  await expect(
    page.locator('button:has-text("+ Add Meal")').first(),
  ).toBeVisible({ timeout: 15000 });

  // Clean up any existing meals in the first day column to ensure E2E test isolation
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

  // Click first Add Meal button
  await page.locator('button:has-text("+ Add Meal")').first().click();
  await page.waitForSelector("text=Add Meal Slot");

  // Click Breakfast
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Breakfast" })
    .click();
  // Wait for the Add Recipe modal to be fully open before trying to close it
  const recipeModal = page.locator(
    'div[role="dialog"]:has-text("Add Recipe to Meal")',
  );
  await expect(recipeModal).toBeVisible({ timeout: 10000 });
  await recipeModal.getByRole("button", { name: "×" }).click(); // Close recipe modal

  // Wait for modal to be removed from DOM
  await expect(page.getByTestId("modal-backdrop")).not.toBeVisible({
    timeout: 15000,
  });

  // Wait for it to be added
  await expect(page.locator("text=Breakfast").first()).toBeVisible();

  // Try adding Breakfast again - set up dialog handler BEFORE clicking
  const dialogPromise = page.waitForEvent("dialog");
  await page.locator('button:has-text("+ Add Meal")').first().click();
  await page.waitForSelector("text=Add Meal Slot");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Breakfast" })
    .click();

  const dialog = await dialogPromise;
  expect(dialog.message()).toContain("already exists");
  await dialog.accept();

  // Wait for modal to close or alert to fire
  await page.waitForTimeout(500);

  // We should NOT have two "Breakfast" slots on that same day.
  const breakfastCount = await firstDayColumn
    .getByRole("button", { name: "Breakfast", exact: true })
    .count();
  expect(breakfastCount).toBeLessThanOrEqual(1);
});
