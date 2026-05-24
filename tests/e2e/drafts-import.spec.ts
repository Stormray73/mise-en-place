import { test, expect } from "@playwright/test";
import { resetDatabase } from "./db-helper";

test.describe("Bulk Ingestion & Draft Recipes Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await resetDatabase();
    // Authenticate and go to dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test("Importing bulk recipe text, verifying drafts grid, sub-recipe auto-linking, and publishing a draft", async ({
    page,
  }) => {
    // 1. Go to Recipes page
    await page.goto("/recipes");
    await expect(
      page.getByRole("heading", { name: /My Recipes/i }),
    ).toBeVisible({
      timeout: 15000,
    });

    // 2. Click "Import" button to open ImportRecipeModal
    const importBtn = page.getByRole("button", { name: /^import$/i });
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    const importModal = page.locator(
      'div[role="dialog"]:has-text("Import Recipe")',
    );
    await expect(importModal).toBeVisible();

    // 3. Switch to "Text" tab
    const textTabBtn = importModal.getByRole("button", { name: /^text$/i });
    await expect(textTabBtn).toBeVisible();
    await textTabBtn.click();

    // 4. Input bulk recipe content containing trigger keywords for the bulk MSW mock
    const textarea = importModal.locator(
      'textarea[placeholder="Paste your recipe here..."]',
    );
    await expect(textarea).toBeVisible();
    await textarea.fill("Pasta and Sauce bulk recipes import test");

    // 5. Submit import
    const submitBtn = importModal.getByRole("button", { name: /^import$/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 6. Verify redirection to /recipes?drafts=true
    await expect(page).toHaveURL(/\/recipes\?drafts=true/, { timeout: 20000 });

    // 7. Verify both draft recipes appear in the drafts dashboard
    const draftsHeading = page.getByRole("heading", { name: "Draft Recipes" });
    await expect(draftsHeading).toBeVisible();

    const pastaDraft = page
      .getByRole("heading", { name: "MSW Mock Bulk Pasta" })
      .first();
    const sauceDraft = page
      .getByRole("heading", { name: "MSW Mock Bulk Sauce" })
      .first();
    await expect(pastaDraft).toBeVisible();
    await expect(sauceDraft).toBeVisible();

    // 8. Open the "MSW Mock Bulk Sauce" draft to review it (which has MSW Mock Bulk Pasta as an ingredient)
    // The link text in the card for draft says "Review & Publish →"
    const reviewLink = page
      .locator("div.bg-zinc-900")
      .filter({ hasText: "MSW Mock Bulk Sauce" })
      .getByText("Review & Publish →");
    await expect(reviewLink).toBeVisible();
    await reviewLink.click();

    // Verify redirected to edit page
    await expect(page).toHaveURL(/\/recipes\/[a-zA-Z0-9_-]+\/edit/, {
      timeout: 15000,
    });

    // 9. Verify Sub-Recipe Auto-linking occurred:
    // The component list should display the sub-recipe "MSW Mock Bulk Pasta" as a "Linked Sub-Recipe"
    const linkedBadge = page.getByText("Linked Sub-Recipe").first();
    await expect(linkedBadge).toBeVisible({ timeout: 15000 });

    const linkedSubRecipeText = page.getByText("MSW Mock Bulk Pasta");
    await expect(linkedSubRecipeText).toBeVisible();

    // 10. Click Save Recipe to publish it
    const saveBtn = page.getByRole("button", { name: /save recipe/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 11. Verify redirected back to main Recipes (published) list
    await expect(page).toHaveURL(/\/recipes$/, { timeout: 15000 });

    // 12. Verify the newly published recipe is in the published list and drafts dashboard has decreased
    await expect(
      page.getByRole("heading", { name: "MSW Mock Bulk Sauce" }).first(),
    ).toBeVisible({
      timeout: 15000,
    });

    // Go back to drafts and ensure the published recipe is no longer there
    await page.goto("/recipes?drafts=true");
    await expect(
      page.getByRole("heading", { name: "MSW Mock Bulk Sauce" }),
    ).not.toBeVisible();
  });
});
