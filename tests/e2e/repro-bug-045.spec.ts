import { test, expect } from "@playwright/test";
import { resetDatabase } from "./db-helper";

test("BUG-045: Custom Range Date Picker is operative in Shopping List", async ({
  page,
}) => {
  await resetDatabase();
  await page.goto("/dashboard/shopping-list");

  // Wait for page to load
  await expect(
    page.getByRole("heading", { name: /Shopping List/i }),
  ).toBeVisible({ timeout: 15000 });

  const startDateInput = page.getByLabel("Start Date");
  const endDateInput = page.getByLabel("End Date");

  // By default, a preset is active, so date inputs are disabled
  await expect(startDateInput).toBeDisabled();
  await expect(endDateInput).toBeDisabled();

  // Click Custom Range preset button
  const customRangeBtn = page.getByRole("button", { name: "Custom Range" });
  await expect(customRangeBtn).toBeVisible();
  await customRangeBtn.click();

  // Verify that the date inputs are now UNLOCKED (enabled)
  await expect(startDateInput).toBeEnabled();
  await expect(endDateInput).toBeEnabled();

  // Change date value
  await startDateInput.fill("2026-06-01");
  await expect(startDateInput).toHaveValue("2026-06-01");
});
