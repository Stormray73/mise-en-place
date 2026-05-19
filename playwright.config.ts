import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry to handle transient DB connection issues or timeouts */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Maximum time one test can run for. */
  timeout: 60000,
  /* Set environment variables for the test runner */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",
    /* Maximum time each action such as `click()` can take. */
    actionTimeout: 15000,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    video: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npx next dev",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ENABLE_MSW: "true",
      AUTH_SECRET: process.env.AUTH_SECRET || "any-secret-for-tests",
      AUTH_TRUST_HOST: "true",
      AUTH_URL: "http://localhost:3000/api/auth",
      AUTH_GOOGLE_ID: "mock-google-id",
      AUTH_GOOGLE_SECRET: "mock-google-secret",
      USDA_API_KEY: "mock-usda-key",
      OPENAI_API_KEY: "mock-openai-key",
    },
  },
});
