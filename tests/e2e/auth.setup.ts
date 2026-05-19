import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // In our MSW environment, the auth() function is wrapped to provide a mock session
  // whenever ENABLE_MSW=true is set. This allows us to bypass the external Google
  // redirect loop which is extremely brittle in CI/headless environments.

  // Navigate to the dashboard; the wrapped auth() will provide the session.
  await page.goto("/dashboard");

  // Verify that the UI has actually rendered
  await expect(page.getByRole("button", { name: /logout/i })).toBeVisible({
    timeout: 20000,
  });

  // Save the cookies and local storage (though session is server-side,
  // Playwright needs the auth state to satisfy its storageState requirement)
  await page.context().storageState({ path: authFile });
});
