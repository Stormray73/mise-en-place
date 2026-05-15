# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pantry-shopping-list.spec.ts >> Pantry & Shopping List >> Story 7: Pre-cook inventory validation warning
- Location: tests/e2e/pantry-shopping-list.spec.ts:171:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/Low Stock/i).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText(/Low Stock/i).first()

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
                - link "Dashboard" [ref=e10] [cursor=pointer]:
                    - /url: /dashboard
                - link "My Recipes" [ref=e11] [cursor=pointer]:
                    - /url: /recipes
                - link "Meal Plan" [ref=e12] [cursor=pointer]:
                    - /url: /meal-planner
                - link "Pantry" [ref=e13] [cursor=pointer]:
                    - /url: /dashboard/pantry
                - link "Shopping List" [ref=e14] [cursor=pointer]:
                    - /url: /dashboard/shopping-list
                - button "Logout" [ref=e15]
    - main [ref=e16]:
        - main [ref=e17]:
            - generic [ref=e18]:
                - generic [ref=e19]:
                    - heading "Uncookable Rare Spice dpm9ke" [level=1] [ref=e20]
                    - paragraph [ref=e21]: "Yield: 1 servings"
                - generic [ref=e22]:
                    - link "Cook it!" [ref=e23] [cursor=pointer]:
                        - /url: /recipes/cmp6152zy0008s0enf9a9r3zy/play?scale=1
                    - link "Edit" [ref=e24] [cursor=pointer]:
                        - /url: /recipes/cmp6152zy0008s0enf9a9r3zy/edit
                    - link "← Back" [ref=e25] [cursor=pointer]:
                        - /url: /dashboard
            - generic [ref=e26]:
                - generic [ref=e27]:
                    - generic [ref=e28]:
                        - generic [ref=e29]:
                            - heading "Nutrition Facts" [level=2] [ref=e30]:
                                - img [ref=e31]
                                - text: Nutrition Facts
                            - paragraph [ref=e33]: "Tip: Set a serving count in the editor to enable per-serving macros."
                        - generic [ref=e34]:
                            - generic [ref=e35]:
                                - paragraph [ref=e36]: Calories
                                - paragraph [ref=e37]: "100"
                            - generic [ref=e38]:
                                - paragraph [ref=e39]: Protein
                                - paragraph [ref=e40]: 10g
                            - generic [ref=e41]:
                                - paragraph [ref=e42]: Fat
                                - paragraph [ref=e43]: 5g
                            - generic [ref=e44]:
                                - paragraph [ref=e45]: Carbs
                                - paragraph [ref=e46]: 20g
                        - paragraph [ref=e47]: "* Nutrients are calculated based on ingredients and sub-recipes. Data provided by USDA. Currently showing values for 1x scale."
                    - generic [ref=e48]:
                        - generic [ref=e49]:
                            - heading "Ingredients" [level=2] [ref=e50]
                            - generic [ref=e51]:
                                - generic [ref=e52]: "Scale:"
                                - spinbutton "Scale:" [ref=e54]: "1"
                        - list [ref=e55]:
                            - listitem [ref=e56]:
                                - generic [ref=e57]:
                                    - generic [ref=e59]: Saffron
                                    - paragraph [ref=e60]: 100 g
                - heading "Instructions" [level=2] [ref=e62]
    - button "Open Next.js Dev Tools" [ref=e68] [cursor=pointer]:
        - img [ref=e69]
    - alert [ref=e72]
```

# Test source

```ts
  87  |     await expect(itemCard).not.toBeVisible({ timeout: 10000 });
  88  |
  89  |     // Toggle "Show zero-stock items"
  90  |     await page.getByLabel(/Show zero-stock items/i).check();
  91  |     await expect(itemCard.locator('.text-2xl')).toContainText(/0\s*lb/i);
  92  |   });
  93  |
  94  |   test("Story 4: cooking a recipe deducts ingredients from pantry", async ({ page }) => {
  95  |     // 1. Create a test recipe
  96  |     await page.goto("/recipes/new");
  97  |     const recipeTitle = `Test Deduction ${Math.random().toString(36).substring(7)}`;
  98  |     await page.waitForSelector('#title', { state: 'visible', timeout: 20000 });
  99  |     await page.locator('#title').fill(recipeTitle);
  100 |
  101 |     // Add Ingredient
  102 |     await page.getByPlaceholder(/Search ingredients/i).fill("Salt");
  103 |     await expect(page.locator('div[role="listbox"]')).toBeVisible();
  104 |     await page.locator('div[role="listbox"] >> role=option').first().click();
  105 |
  106 |     // Fill component details
  107 |     const qtyInput = page.locator('input[name*="quantity"]').first();
  108 |     await expect(qtyInput).toBeVisible({ timeout: 10000 });
  109 |     await qtyInput.fill("20");
  110 |     await page.locator('select[name*="unit"]').first().selectOption("g");
  111 |
  112 |     await page.getByRole("button", { name: /Save Recipe/i }).click();
  113 |     // It redirects to /recipes, let's go to the new recipe
  114 |     await expect(page).toHaveURL(/\/recipes$/);
  115 |     await page.getByText(recipeTitle).first().click();
  116 |     const recipeUrl = page.url();
  117 |
  118 |     // 2. Add enough stock
  119 |     await page.goto("/dashboard/pantry");
  120 |     await page.getByRole("button", { name: /Add Item/i }).click();
  121 |     await page.getByPlaceholder(/Search USDA/i).fill("Salt");
  122 |     await expect(page.locator('div[role="listbox"]')).toBeVisible();
  123 |     await page.locator('div[role="listbox"] >> role=option').first().click();
  124 |     await page.getByLabel(/Quantity/i).fill("100");
  125 |     await page.getByLabel(/Unit/i).selectOption("g");
  126 |     await page.getByRole("button", { name: /Add to Pantry/i }).click();
  127 |
  128 |     // 3. Scale and Cook
  129 |     await page.goto(`${recipeUrl}/play?scale=1`);
  130 |
  131 |     // Navigate through steps
  132 |     await expect(page.getByRole("button", { name: /Finish|Next Step/i }).first()).toBeVisible({ timeout: 15000 });
  133 |     let isFinish = false;
  134 |     let iterations = 0;
  135 |     while (!isFinish && iterations < 10) {
  136 |         const btn = page.getByRole("button", { name: /Finish|Next Step/i }).first();
  137 |         const text = await btn.textContent();
  138 |         if (text?.includes("Finish")) isFinish = true;
  139 |         await btn.click();
  140 |         iterations++;
  141 |     }
  142 |
  143 |     // 4. Confirm deduction
  144 |     await expect(page.getByText(/Would you like to deduct/i)).toBeVisible({ timeout: 15000 });
  145 |     await page.getByRole("button", { name: /Yes, deduct stock/i }).click();
  146 |
  147 |     // 5. Verify pantry is reduced (100 - 20 = 80)
  148 |     await page.goto("/dashboard/pantry");
  149 |     const saltCard = page.locator('div.bg-zinc-900').filter({ has: page.locator('h3:has-text("Salt")') }).filter({ hasText: "g" }).first();
  150 |     await expect(saltCard).toBeVisible();
  151 |     await expect(saltCard.locator('.text-2xl')).toContainText(/80\s*g/i);
  152 |   });
  153 |
  154 |   test("Story 5 & 6: Shopping list generation and restocking", async ({ page }) => {
  155 |     await page.goto("/dashboard/shopping-list");
  156 |     await page.getByRole("button", { name: /Update List/i }).click();
  157 |
  158 |     // Check if there are items to buy
  159 |     const buyButton = page.getByRole("button", { name: /^Buy$/i }).first();
  160 |     if (await buyButton.isVisible()) {
  161 |         const itemName = await page.locator('h3').first().textContent();
  162 |         await buyButton.click();
  163 |         await expect(page.getByRole("button", { name: /Purchased/i }).first()).toBeVisible();
  164 |
  165 |         // 4. Verify in Pantry
  166 |         await page.goto("/dashboard/pantry");
  167 |         await expect(page.getByText(itemName!).first()).toBeVisible();
  168 |     }
  169 |   });
  170 |
  171 |   test("Story 7: Pre-cook inventory validation warning", async ({ page }) => {
  172 |     // 1. Create a recipe with a unique ingredient that ISN'T in pantry
  173 |     const uniqueIng = `Rare Spice ${Math.random().toString(36).substring(7)}`;
  174 |     await page.goto("/recipes/new");
  175 |     await page.waitForSelector('#title', { state: 'visible' });
  176 |     await page.locator('#title').fill(`Uncookable ${uniqueIng}`);
  177 |
  178 |     await page.getByPlaceholder(/Search ingredients/i).fill("Saffron");
  179 |     await expect(page.locator('div[role="listbox"]')).toBeVisible();
  180 |     await page.locator('div[role="listbox"] >> role=option').first().click();
  181 |
  182 |     await page.getByRole("button", { name: /Save Recipe/i }).click();
  183 |     await expect(page).toHaveURL(/\/recipes$/);
  184 |     await page.getByText(`Uncookable ${uniqueIng}`).first().click();
  185 |
  186 |     // 2. Verify "Low Stock" badge
> 187 |     await expect(page.getByText(/Low Stock/i).first()).toBeVisible({ timeout: 15000 });
      |                                                        ^ Error: expect(locator).toBeVisible() failed
  188 |   });
  189 | });
  190 |
```
