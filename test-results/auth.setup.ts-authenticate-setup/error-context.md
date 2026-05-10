# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate
- Location: tests/e2e/auth.setup.ts:5:6

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/dashboard/
Received string:  "http://localhost:3000/api/auth/signin?callbackUrl=%2Fdashboard"

Call log:
  - Expect "toHaveURL" with timeout 60000ms
    4 × unexpected value "http://localhost:3000/login"
    29 × unexpected value "http://localhost:3000/api/auth/signin?callbackUrl=%2Fdashboard"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
    - banner [ref=e2]:
        - generic [ref=e3]:
            - link "M Mise-en-place" [ref=e5] [cursor=pointer]:
                - /url: /
                - generic [ref=e7]: M
                - generic [ref=e8]: Mise-en-place
            - navigation [ref=e9]:
                - link "Login" [ref=e10] [cursor=pointer]:
                    - /url: /login
    - main [ref=e11]:
        - generic [ref=e13]:
            - generic [ref=e14]:
                - heading "Welcome back" [level=1] [ref=e15]
                - paragraph [ref=e16]: Log in to your chef workstation
            - generic [ref=e17]:
                - button "Sign in with Google" [ref=e19] [cursor=pointer]:
                    - img [ref=e20]
                    - text: Sign in with Google
                - button "Sign in as Guest (Mock Auth)" [ref=e26] [cursor=pointer]
            - paragraph [ref=e27]: By signing in, you agree to our terms and conditions.
    - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
        - img [ref=e34]
    - alert [ref=e37]
```

# Test source

```ts
  1  | import { test as setup, expect } from "@playwright/test";
  2  |
  3  | const authFile = "playwright/.auth/user.json";
  4  |
  5  | setup("authenticate", async ({ page }) => {
  6  |   // Navigate to login page
  7  |   await page.goto("/login");
  8  |
  9  |   if (process.env.MOCK_AUTH === "true") {
  10 |     // Click the Mock Auth button for automated testing
  11 |     await page.getByRole("button", { name: /sign in as guest/i }).click();
  12 |   } else {
  13 |     // Click the Google Sign-in button for manual/authentic setup
  14 |     await page.getByRole("button", { name: /sign in with google/i }).click();
  15 |   }
  16 |
  17 |   // Best Practice: Use a web-first assertion with a custom timeout
  18 |   // This will retry until the URL matches or it hits 60s
> 19 |   await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  20 |
  21 |   // Also verify that the UI has actually rendered before saving state
  22 |   await expect(
  23 |     page.getByRole("navigation").getByRole("button", { name: /logout/i }),
  24 |   ).toBeVisible({ timeout: 15000 });
  25 |
  26 |   // Save the cookies and local storage
  27 |   await page.context().storageState({ path: authFile });
  28 | });
  29 |
```
