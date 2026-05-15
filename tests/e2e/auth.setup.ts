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
  // This will retry until the URL matches /dashboard or /
  await expect(page).toHaveURL(/\/dashboard|\//, { timeout: 60000 });

  // Explicitly go to dashboard to ensure session is active and UI is loaded
  await page.goto("/dashboard");

  // Also verify that the UI has actually rendered before saving state
  // Using a more flexible locator for the logout button
  await expect(page.getByRole("button", { name: /logout/i })).toBeVisible({
    timeout: 20000,
  });

  // Save the cookies and local storage
  await page.context().storageState({ path: authFile });
});
