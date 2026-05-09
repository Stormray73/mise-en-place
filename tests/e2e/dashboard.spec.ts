import { test, expect } from "@playwright/test";

test.describe("Dashboard Access", () => {
  test("should display the dashboard when authenticated", async ({ page }) => {
    // Navigate directly to the dashboard
    await page.goto("/dashboard");

    // Verify that we are on the dashboard and not redirected to login
    await expect(page).toHaveURL(/\/dashboard/);

    // Check for the welcome message
    // Note: We use a regex to match the 'Welcome, ' part since we don't know the exact user name
    await expect(
      page.getByRole("heading", { name: /dashboard/i }),
    ).toBeVisible();
    await expect(page.getByText(/welcome,/i)).toBeVisible();

    // Check for the logout button
    await expect(
      page.getByRole("navigation").getByRole("button", { name: /logout/i }),
    ).toBeVisible();
  });
});
