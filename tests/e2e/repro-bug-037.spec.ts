import { test, expect } from "@playwright/test";

test("BUG-037: Meal Planner Preset Delay provides UI feedback", async ({
  page,
}) => {
  await page.goto("/meal-planner");

  // Wait for page to load
  await page.waitForSelector("text=+ Add Meal");

  // Click on the first "+ Add Meal" button
  await page.locator('button:has-text("+ Add Meal")').first().click();

  // Wait for modal to open
  await page.waitForSelector("text=Add Meal Slot");

  // Intercept the API call to delay it, so we can check for loading state
  await page.route("**/meal-planner", async (route) => {
    // Delay the response to simulate slow network
    await new Promise((f) => setTimeout(f, 1000));
    await route.continue();
  });

  // Click Breakfast
  const breakfastBtn = page.locator('button:has-text("Breakfast")');
  await breakfastBtn.click();

  // Check if it shows some loading state (text changing to "Adding...")
  const addingBtn = page.locator('button:has-text("Adding...")');
  await expect(addingBtn).toBeVisible();
  await expect(addingBtn).toBeDisabled();
});
