# Epic: Intelligent Ingredient Matching (Completed)

## Objective

To eliminate the friction of manually resolving imported recipe ingredients by introducing automated, high-confidence database matching and expanding search capabilities beyond the USDA to include branded and packaged goods.

## Scope & Impact

- **Backend:** Update the recipe import actions to perform automated database lookups for each parsed ingredient. Implement a "Waterfall" search strategy.
- **Frontend:** Update the Recipe Editor UI to display confidence flags on imported ingredients, prompting users to resolve ambiguous matches using the new "In-Place Edit" feature.
- **External Integration:** Integrate the Open Food Facts (OFF) API as a fallback search provider.

## Implementation Steps (Stories)

### Story 1: Automated Lookup & Confidence Scoring

**As a user importing a recipe, I want the system to automatically attempt to find the nutritional data for my ingredients so that I don't have to manually link every single item.**

- **[x] AC 1:** During the import action (URL, Text, Image), the server automatically queries the `/api/recipes/search` endpoint for each parsed ingredient name.
- **[x] AC 2:** The system implements a string similarity algorithm (e.g., Levenshtein distance) to compare the parsed name against the top search result.
- **[x] AC 3:** If the similarity score is high (e.g., > 85%), the ingredient is automatically linked to the database item, and macros are applied.
- **[x] AC 4:** If the score is low or no result is found, the ingredient is saved as a "dumb" ingredient but flagged with a `needsReview` boolean in the database/state.

### Story 2: UI Feedback & Resolution Workflow

**As a user reviewing an imported recipe, I want to clearly see which ingredients need my attention so that I can quickly map them to the correct nutritional data.**

- **[x] AC 1:** The Recipe Editor UI displays a visual indicator (e.g., a yellow warning icon or highlighted row) for any ingredient where `needsReview` is true.
- **[x] AC 2:** Clicking the indicator or the "Edit" button opens the "In-Place Ingredient Editing" interface, pre-filled with the parsed name and an active search dropdown.
- **[x] AC 3:** Once the user successfully maps the ingredient using the dropdown, the `needsReview` flag is cleared, and the visual indicator disappears.

### Story 3: Waterfall Search with Open Food Facts

**As a user searching for an ingredient, I want the system to check multiple databases so that I can find branded or packaged items that the USDA doesn't have.**

- **[x] AC 1:** The backend search logic (`app/api/usda/search/route.ts` or a new unified search route) implements a waterfall approach:
  1. Search Local Custom Ingredients.
  2. Search USDA API.
  3. Search Open Food Facts API (if USDA returns 0 results or if a specific "branded" flag is passed).
- **[x] AC 2:** The Open Food Facts API response is normalized into the existing `USDAFood` interface (mapping energy to calories, proteins, fats, carbs, and extracting portion sizes if available) so the frontend requires no changes to handle the new data source.
- **[x] AC 3:** The search dropdown clearly indicates the source of the data (e.g., a small "USDA" or "OFF" badge) to set user expectations regarding data quality.

### Story 4: USDA/Open Food Facts Search in Ingredient Editor

**As a user editing a recipe's ingredient, I want to search the USDA or Open Food Facts APIs directly from the edit view so that I can clean up imported ingredients or modify existing recipes with standardized data.**

- **[x] AC 1:** In the inline ingredient editor, a search option/field is provided to query the unified ingredient search API (`/api/usda/search`).
- **[x] AC 2:** The search utilizes the standard waterfall backend (Custom Ingredients -> USDA -> Open Food Facts) to find matching food items.
- **[x] AC 3:** Selecting a search result updates the ingredient's name, base macros, food portions, and external ID (FDC ID / OFF ID) immediately in the editor.
- **[x] AC 4:** Saving the recipe persists these standardized macros and external reference IDs to the database.

### Story 5: Robust Unit Normalization

**As an importing engine, I want to parse case-insensitive abbreviations and tokenization without spaces (e.g., "2T", "1t", "¼ C", "6oz", "1lb.") so that they map cleanly to standard units.**

- **[x] AC 1:** The unit parser supports common case-insensitive shorthand (e.g., "T", "tbsp", "t", "tsp", "c", "oz", "lb").
- **[x] AC 2:** The unit parser handles ingredients formatted without spaces between the numeric quantity and the unit (e.g. "2T" parsed as quantity `2`, unit `T`).
- **[x] AC 3:** Standardize unicode fractions (like `¼`, `½`, `¾`) into float values prior to matching.

### Story 6: Noise-Stripped Fuzzy Matching

**As a matching engine, I want to strip extraneous description words, prep states, and parentheticals from ingredient names before similarity matching so that I avoid false-positives and reduce unnecessary user reviews.**

- **[x] AC 1:** Pre-process ingredient names to strip adjectives (e.g., "unsalted", "organic") and prep instructions (e.g., "chopped", "sliced", "drained").
- **[x] AC 2:** Remove parenthetical text (e.g., "peanuts (raw)", "beans (drained)") from names prior to database similarity comparison.
- **[x] AC 3:** Run the Levenshtein similarity matching against the cleaned token string, keeping the original raw text for visual display.

### Story 7: Standard Designations in Macro Calculations

**As a macro aggregator, I want to map discrete designations (like "can", "packet", "bunch", "sheet") against USDA portion modifiers or default averages so that their macros are counted rather than silently ignored.**

- **[x] AC 1:** The macro calculator checks if an ingredient has portion modifiers matching terms like "can", "packet", "bunch", or "sheet".
- **[x] AC 2:** If a direct match is found in the USDA portion modifiers database, calculate the weight accordingly.
- **[x] AC 3:** If no match is found, apply a sensible fallback weight (default average) based on standard industry volumes for that food category.
- **[x] AC 4:** Log a warning instead of returning zero macros when a portion matches a discrete designation but is not found in USDA portions.
