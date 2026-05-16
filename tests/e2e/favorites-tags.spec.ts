import { test, expect } from "@playwright/test";

test.describe("Favorites and Tags User Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and go to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Story 2: Favorites and Tags", async ({ page }) => {
    const recipeTitle = `Favorite Spicy Pasta ${Date.now()}`;
    // 1. Create a new recipe with tags and favorite status
    await page.goto("/recipes/new");
    await page.getByLabel(/recipe title/i).fill(recipeTitle);
    await page.getByTitle(/favorite/i).click(); // Toggle favorite on

    // Add tags
    await page.getByPlaceholder(/add a tag/i).fill("Spicy");
    await page.getByRole("button", { name: /create tag "spicy"/i }).click();
    await page.getByPlaceholder(/add a tag/i).fill("Quick");
    await page.getByRole("button", { name: /create tag "quick"/i }).click();

    await page.getByRole("button", { name: /save recipe/i }).click();

    // 2. Verify recipe is in store and has favorite star and tags
    await expect(page).toHaveURL(/\/recipes/);
    await expect(
      page.getByRole("heading", { name: recipeTitle }),
    ).toBeVisible();
    await expect(page.getByTitle("Favorite").first()).toBeVisible();
    await expect(page.getByText(/#Spicy/).first()).toBeVisible();
    await expect(page.getByText(/#Quick/).first()).toBeVisible();

    // 3. Test filtering by favorites
    await page.getByRole("link", { name: /★ favorites/i }).click();
    await expect(
      page.getByRole("heading", { name: recipeTitle }),
    ).toBeVisible();

    // 4. Test filtering by tag
    await page.getByRole("link", { name: "#Spicy", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: recipeTitle }),
    ).toBeVisible();

    // 5. Toggle favorite from view page
    await page.getByRole("heading", { name: recipeTitle }).click();
    await expect(page).toHaveURL(/\/recipes\//);

    const favoriteBtn = page.getByTitle(/remove from favorites/i);
    await expect(favoriteBtn).toBeVisible();
    await favoriteBtn.click();
    await expect(page.getByTitle(/add to favorites/i)).toBeVisible();

    // 6. Verify favorite status updated in store
    await page.goto("/recipes");
    await page.getByRole("link", { name: /★ favorites/i }).click();
    await expect(
      page.getByRole("heading", { name: recipeTitle }),
    ).not.toBeVisible();
  });
});
