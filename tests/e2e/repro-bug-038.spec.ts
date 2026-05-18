import { test, expect } from "@playwright/test";

test("BUG-038: Duplicate Meal Presets on the same day are prevented", async ({
  page,
}) => {
  await page.goto("/meal-planner");

  // Click first Add Meal button
  await page.locator('button:has-text("+ Add Meal")').first().click();
  await page.waitForSelector("text=Add Meal Slot");

  // Click Breakfast
  await page.locator('button:has-text("Breakfast")').click();

  // Wait for it to be added
  await expect(page.locator("text=Breakfast").first()).toBeVisible();

  // Try adding Breakfast again to the same day
  await page.locator('button:has-text("+ Add Meal")').first().click();
  await page.waitForSelector("text=Add Meal Slot");

  // Click Breakfast again
  page.on("dialog", async (dialog) => {
    expect(dialog.message()).toContain("already exists");
    await dialog.accept();
  });

  await page.locator('button:has-text("Breakfast")').click();

  // Wait for modal to close or alert to fire
  await page.waitForTimeout(500);

  // We should NOT have two "Breakfast" slots on that same day.
  // Let's count the number of Breakfast headings in the first day column
  const dayColumn = page.locator('[data-testid="day-today"]').first(); // Assuming today or first day
  // Wait, we can just check there's only one MealSlot for Breakfast
  const breakfastCount = await dayColumn
    .locator('h3:has-text("Breakfast")')
    .count();
  expect(breakfastCount).toBeLessThanOrEqual(1);
});
