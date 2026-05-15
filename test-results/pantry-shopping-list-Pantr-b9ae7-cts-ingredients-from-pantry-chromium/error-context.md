# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pantry-shopping-list.spec.ts >> Pantry & Shopping List >> Story 4: cooking a recipe deducts ingredients from pantry
- Location: tests/e2e/pantry-shopping-list.spec.ts:94:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name*="quantity"]').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('input[name*="quantity"]').first()

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
        - main [ref=e18]:
            - generic [ref=e19]:
                - generic [ref=e20]:
                    - heading "New Recipe" [level=1] [ref=e21]
                    - paragraph [ref=e22]: Build your next masterpiece. Add ingredients from the USDA database or use your own sub-recipes.
                - generic [ref=e23]:
                    - generic [ref=e24]:
                        - generic [ref=e25]:
                            - generic [ref=e26]: Recipe Title
                            - textbox "Recipe Title" [ref=e28]:
                                - /placeholder: e.g. Tomato Sauce
                                - text: Test Deduction 02rk5r
                        - generic [ref=e29]:
                            - generic [ref=e30]: Yield Amount
                            - spinbutton "Yield Amount" [ref=e32]: "1"
                        - generic [ref=e33]:
                            - generic [ref=e34]: Yield Unit
                            - combobox "Yield Unit" [ref=e36]:
                                - option "mg" [selected]
                                - option "g"
                                - option "kg"
                                - option "oz"
                                - option "lb"
                                - option "ml"
                                - option "cl"
                                - option "L"
                                - option "tsp"
                                - option "tbsp"
                                - option "fl oz"
                                - option "cup"
                                - option "pt"
                                - option "qt"
                                - option "gal"
                        - generic [ref=e37]:
                            - generic [ref=e38]: Servings
                            - spinbutton "Servings" [ref=e40]
                    - generic [ref=e41]:
                        - heading "Ingredients" [level=3] [ref=e42]
                        - generic [ref=e43]:
                            - generic [ref=e44]:
                                - generic [ref=e45]: Add USDA Ingredient
                                - textbox "Search ingredients..." [ref=e47]
                            - generic [ref=e48]:
                                - generic [ref=e49]: Add Sub-recipe
                                - textbox "Search recipes..." [ref=e51]
                        - generic [ref=e53]:
                            - generic [ref=e54]: Salt
                            - generic [ref=e55]:
                                - spinbutton [ref=e58]: "100"
                                - combobox [ref=e61]:
                                    - option "mg"
                                    - option "g" [selected]
                                    - option "kg"
                                    - option "oz"
                                    - option "lb"
                                    - option "ml"
                                    - option "cl"
                                    - option "L"
                                    - option "tsp"
                                    - option "tbsp"
                                    - option "fl oz"
                                    - option "cup"
                                    - option "pt"
                                    - option "qt"
                                    - option "gal"
                                - textbox "Prep (e.g. diced)" [ref=e64]
                                - button "×" [ref=e65]
                    - generic [ref=e68]:
                        - heading "Instructions" [level=3] [ref=e69]
                        - button "Add Step" [ref=e70]
                    - button "Save Recipe" [ref=e72]
    - button "Open Next.js Dev Tools" [ref=e78] [cursor=pointer]:
        - img [ref=e79]
    - alert [ref=e82]
```

# Test source

```ts
  8   |       const query = url.searchParams.get("q");
  9   |
  10  |       const foods = [
  11  |         {
  12  |           fdcId: 1001,
  13  |           description: query || "Test Food",
  14  |           foodCategory: "Test Category",
  15  |           foodPortions: [
  16  |             { gramWeight: 100, amount: 1, measureUnitName: "cup" }
  17  |           ],
  18  |           foodNutrients: [
  19  |             { nutrientName: "Energy", value: 100 },
  20  |             { nutrientName: "Protein", value: 10 },
  21  |             { nutrientName: "Total lipid (fat)", value: 5 },
  22  |             { nutrientName: "Carbohydrate, by difference", value: 20 }
  23  |           ],
  24  |           baseMacros: { calories: 100, protein: 10, fat: 5, carbs: 20 },
  25  |           baseAmount: 100
  26  |         }
  27  |       ];
  28  |
  29  |       await route.fulfill({ json: { foods } });
  30  |     });
  31  |   });
  32  |
  33  |   test("Story 2: can add an item to the pantry with location and threshold", async ({
  34  |     page,
  35  |   }) => {
  36  |     await page.goto("/dashboard/pantry");
  37  |
  38  |     await page.getByRole("button", { name: /Add Item/i }).click();
  39  |
  40  |     // Search for Flour (USDA)
  41  |     const searchInput = page.getByPlaceholder(/Search USDA/i);
  42  |     await searchInput.fill("Flour");
  43  |
  44  |     // Select the first result - wait for listbox
  45  |     await expect(page.locator('div[role="listbox"]')).toBeVisible({ timeout: 15000 });
  46  |     await page.locator('div[role="listbox"] >> role=option').first().click();
  47  |
  48  |     // Fill quantity, unit, location, threshold
  49  |     await page.getByLabel(/Quantity/i).fill("5");
  50  |     await page.getByLabel(/Unit/i).selectOption("lb");
  51  |     await page.getByLabel(/Location/i).fill("Garage");
  52  |     await page.getByLabel(/Restock Threshold/i).fill("1");
  53  |
  54  |     await page.getByRole("button", { name: /Add to Pantry/i }).click();
  55  |
  56  |     // Verify it's in the list
  57  |     await expect(page.getByText(/Garage/i).first()).toBeVisible();
  58  |     await expect(page.locator('div.text-2xl').getByText(/5\s*lb/i).first()).toBeVisible();
  59  |   });
  60  |
  61  |   test("Story 3: can decrement and finish a pantry item", async ({ page }) => {
  62  |     await page.goto("/dashboard/pantry");
  63  |
  64  |     // Add a unique item to avoid collisions
  65  |     const uniqueLocation = `Shelf-${Math.random().toString(36).substring(7)}`;
  66  |     await page.getByRole("button", { name: /Add Item/i }).click();
  67  |     await page.getByPlaceholder(/Search USDA/i).fill("Salt");
  68  |     await expect(page.locator('div[role="listbox"]')).toBeVisible({ timeout: 15000 });
  69  |     await page.locator('div[role="listbox"] >> role=option').first().click();
  70  |     await page.getByLabel(/Quantity/i).fill("10");
  71  |     await page.getByLabel(/Unit/i).selectOption("lb");
  72  |     await page.getByLabel(/Location/i).fill(uniqueLocation);
  73  |     await page.getByRole("button", { name: /Add to Pantry/i }).click();
  74  |
  75  |     // Now test decrement
  76  |     const itemCard = page.locator('div.bg-zinc-900').filter({ hasText: uniqueLocation }).first();
  77  |     await expect(itemCard).toBeVisible();
  78  |
  79  |     // Click -1
  80  |     await itemCard.getByRole("button", { name: "-1" }).click();
  81  |     await expect(itemCard.locator('.text-2xl')).toContainText(/9\s*lb/i);
  82  |
  83  |     // Click Finish
  84  |     await itemCard.getByRole("button", { name: /Finish/i }).click();
  85  |
  86  |     // It should be 0 and hidden by default
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
> 108 |     await expect(qtyInput).toBeVisible({ timeout: 10000 });
      |                            ^ Error: expect(locator).toBeVisible() failed
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
  187 |     await expect(page.getByText(/Low Stock/i).first()).toBeVisible({ timeout: 15000 });
  188 |   });
  189 | });
  190 |
```
