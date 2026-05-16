import { test, expect } from "@playwright/test";

test.describe("Story 13: Dashboard Enhancements User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("Shopping List Widget and Quick Add", async ({ page }) => {
    const itemName = `Quick Item ${Date.now()}`;

    // 1. Verify widget is present
    const widget = page.getByTestId("shopping-list-widget");
    await expect(widget).toBeVisible();

    // 2. Test Quick Add
    const input = widget.getByPlaceholder(/Quick add item/i);
    await input.fill(itemName);
    await widget.getByRole("button", { name: "+" }).click();

    // 3. Verify item appears in widget
    await expect(async () => {
      await page.reload(); // Revalidation check
      await expect(widget).toContainText(itemName);
    }).toPass({ timeout: 15000 });

    // 4. Test View full list link
    await widget.getByRole("link", { name: /view full list/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/shopping-list/);
    await expect(page.getByText(itemName)).toBeVisible();
  });
});
