import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("Dashboard Hub (Kitchen Command Center)", () => {
  test.beforeEach(async ({ page }) => {
    // Auth is handled by auth.setup.ts
    await page.goto("/dashboard");
  });

  test("Scenario 1: Operational Navigation Flow", async ({ page }) => {
    // 1. Verify Hub sections
    await expect(
      page.getByRole("heading", { name: /Today's Meals/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Kitchen Status/i }),
    ).toBeVisible();

    // 2. Navigate to My Recipes
    await page
      .getByRole("link", { name: /My Recipes/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/recipes/);

    // 3. Verify search and add still work
    await expect(page.getByPlaceholder(/Search recipes.../i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /\+ New Recipe/i }),
    ).toBeVisible();
  });

  test("Scenario 2: The Scaled Cooking Journey", async ({ page }) => {
    // 1. Setup: Create a unique recipe
    const uniqueTitle = `Scaled Recipe ${Date.now()}`;
    await page.goto("/recipes/new");
    await page.getByLabel(/Recipe Title/i).fill(uniqueTitle);
    await page.getByLabel(/Yield Amount/i).fill("4");
    await page
      .getByRole("combobox", { name: /Yield Unit/i })
      .selectOption("cup");
    await page.getByRole("button", { name: /Add Step/i }).click();
    await page
      .getByPlaceholder(/Instruction for step/i)
      .fill("First step instruction");
    await page.getByRole("button", { name: /Save Recipe/i }).click();

    // After save, we are redirected to dashboard.
    // But the recipe is in /recipes (My Recipes).
    await page.goto("/recipes");

    // Use search to find the unique recipe
    await page.getByPlaceholder(/Search recipes.../i).fill(uniqueTitle);
    await page.waitForLoadState("networkidle");

    // Find the recipe link and extract ID
    const recipeLinkOnRecipes = page
      .getByRole("link", { name: uniqueTitle })
      .first();
    await expect(recipeLinkOnRecipes).toBeVisible();
    const href = await recipeLinkOnRecipes.getAttribute("href");
    const recipeId = href?.split("?")[0].split("/").pop();
    const recipeUrl = `/recipes/${recipeId}`;

    // 2. Add to Meal Planner
    await page.goto("/meal-planner");
    await page
      .getByRole("button", { name: /\+ Add Meal/i })
      .first()
      .click();
    await page.getByRole("button", { name: "Dinner" }).click();
    await page
      .getByRole("button", { name: /\+ Add Recipe/i })
      .first()
      .click();
    await page.getByRole("button", { name: uniqueTitle }).first().click();

    // Find the container for our unique recipe and extract plannedRecipeId
    const plannedRecipeContainer = page
      .locator('div[data-testid^="planned-recipe-"]')
      .filter({ hasText: uniqueTitle })
      .last();
    const plannedRecipeTestId =
      await plannedRecipeContainer.getAttribute("data-testid");
    const plannedRecipeId = plannedRecipeTestId?.replace("planned-recipe-", "");

    // Set scale to 2.0 for this specific entry
    const scaleInput = page.getByTestId(`scale-input-${plannedRecipeId}`);
    await scaleInput.fill("2.0");
    await scaleInput.blur();
    await expect(scaleInput).toHaveValue(/2(\.0)?/);
    await page.waitForTimeout(1000);

    // 3. Dashboard Check
    await page.goto("/dashboard");

    // Sometimes Next.js revalidation takes a moment to hit the browser
    // We'll retry with a reload if necessary
    const recipeLink = page.getByTestId(`recipe-link-${plannedRecipeId}`);
    const scaleText = page.getByTestId(`recipe-scale-${plannedRecipeId}`);

    await expect(async () => {
      await page.reload();
      await page.waitForLoadState("networkidle");
      await expect(recipeLink).toBeVisible();
      await expect(scaleText).toContainText(/2(\.0)?x/i);
    }).toPass({
      intervals: [1000, 2000, 2000],
      timeout: 10000,
    });

    // 4. Transition to Detail
    await recipeLink.click();
    await expect(page).toHaveURL(new RegExp(`scale=2`));

    // 5. Transition to Play
    await page
      .getByRole("link", { name: /Cook it!/i })
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`scale=2`));

    // 6. Modification in Detail View
    await page.goto(`${recipeUrl}?scale=2.0`);
    const detailScaleInput = page.locator("#scale");
    await detailScaleInput.fill("0.5");
    await page.waitForTimeout(1000);

    const cookItLink = page.getByRole("link", { name: /Cook it!/i }).first();
    await expect(cookItLink).toHaveAttribute("href", new RegExp(`scale=0.5`));
  });

  test("Scenario 3: Real-time Kitchen Status", async ({ page }) => {
    // 1. Start Timer in Play Mode
    await page.goto("/recipes");
    const recipeLinks = page.locator('a[href^="/recipes/cm"]');
    if ((await recipeLinks.count()) === 0) return;
    await recipeLinks.first().click();
    await page
      .getByRole("link", { name: /Cook it!/i })
      .first()
      .click();

    const startTimerBtn = page.getByRole("button", { name: /Start/i }).first();
    let timerStarted = false;
    if (await startTimerBtn.isVisible()) {
      await startTimerBtn.click();
      timerStarted = true;
    }

    // 2. Dashboard Visibility
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: /Kitchen Status/i }),
    ).toBeVisible();

    if (timerStarted) {
      await expect(page.getByText(/Active Timers/i)).toBeVisible();
    }

    // 3. Prep Visibility
    await expect(page.getByTestId("immediate-prep-section")).toBeVisible({
      timeout: 10000,
    });
  });
});
