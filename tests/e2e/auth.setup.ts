import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login");

  if (process.env.MOCK_AUTH === "true") {
    // Click the Mock Auth button for automated testing
    await page.getByRole("button", { name: /sign in as guest/i }).click();
  } else {
    // Click the Google Sign-in button for manual/authentic setup
    await page.getByRole("button", { name: /sign in with google/i }).click();
  }

  // Best Practice: Use a web-first assertion with a custom timeout
  // This will retry until the URL matches or it hits 60s
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });

  // Also verify that the UI has actually rendered before saving state
  await expect(
    page.getByRole("navigation").getByRole("button", { name: /logout/i }),
  ).toBeVisible({ timeout: 15000 });

  // Save the cookies and local storage
  await page.context().storageState({ path: authFile });
});
