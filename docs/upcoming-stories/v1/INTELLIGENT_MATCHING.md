# Epic: Intelligent Ingredient Matching

## Objective

To eliminate the friction of manually resolving imported recipe ingredients by introducing automated, high-confidence database matching and expanding search capabilities beyond the USDA to include branded and packaged goods.

## Background & Motivation

Currently, when a recipe is imported via URL, Text, or Image, the AI successfully parses the raw text (e.g., "1 cup flour"), but the system saves it as a "dumb" local ingredient without nutritional data. To get macros, users must delete and manually re-add the ingredient using the search bar. This is a highly tedious experience. Furthermore, the USDA database often fails to return relevant results for branded, packaged, or international items.

## Scope & Impact

- **Backend:** Update the recipe import actions to perform automated database lookups for each parsed ingredient. Implement a "Waterfall" search strategy.
- **Frontend:** Update the Recipe Editor UI to display confidence flags on imported ingredients, prompting users to resolve ambiguous matches using the new "In-Place Edit" feature.
- **External Integration:** Integrate the Open Food Facts (OFF) API as a fallback search provider.

## Implementation Steps (Stories)

### Story 1: Automated Lookup & Confidence Scoring

**As a user importing a recipe, I want the system to automatically attempt to find the nutritional data for my ingredients so that I don't have to manually link every single item.**

- **AC 1:** During the import action (URL, Text, Image), the server automatically queries the `/api/recipes/search` endpoint for each parsed ingredient name.
- **AC 2:** The system implements a string similarity algorithm (e.g., Levenshtein distance) to compare the parsed name against the top search result.
- **AC 3:** If the similarity score is high (e.g., > 85%), the ingredient is automatically linked to the database item, and macros are applied.
- **AC 4:** If the score is low or no result is found, the ingredient is saved as a "dumb" ingredient but flagged with a `needsReview` boolean in the database/state.

### Story 2: UI Feedback & Resolution Workflow

**As a user reviewing an imported recipe, I want to clearly see which ingredients need my attention so that I can quickly map them to the correct nutritional data.**

- **AC 1:** The Recipe Editor UI displays a visual indicator (e.g., a yellow warning icon or highlighted row) for any ingredient where `needsReview` is true.
- **AC 2:** Clicking the indicator or the "Edit" button opens the "In-Place Ingredient Editing" interface, pre-filled with the parsed name and an active search dropdown.
- **AC 3:** Once the user successfully maps the ingredient using the dropdown, the `needsReview` flag is cleared, and the visual indicator disappears.

### Story 3: Waterfall Search with Open Food Facts

**As a user searching for an ingredient, I want the system to check multiple databases so that I can find branded or packaged items that the USDA doesn't have.**

- **AC 1:** The backend search logic (`app/api/usda/search/route.ts` or a new unified search route) implements a waterfall approach:
  1. Search Local Custom Ingredients.
  2. Search USDA API.
  3. Search Open Food Facts API (if USDA returns 0 results or if a specific "branded" flag is passed).
- **AC 2:** The Open Food Facts API response is normalized into the existing `USDAFood` interface (mapping energy to calories, proteins, fats, carbs, and extracting portion sizes if available) so the frontend requires no changes to handle the new data source.
- **AC 3:** The search dropdown clearly indicates the source of the data (e.g., a small "USDA" or "OFF" badge) to set user expectations regarding data quality.

## Alternatives Considered

- **Bulk Seeding OFF Data:** Rejected due to massive database storage costs and the complexity of keeping millions of records up to date. Federation (on-the-fly querying) is more scalable.
- **Strict Matching Only:** Rejected because culinary terms vary wildly (e.g., "scallions" vs. "green onions"). Fuzzy matching with user resolution is required for a smooth experience.
