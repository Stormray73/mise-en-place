# Library Domain (Shared Logic)

## Overview

Contains the core business logic, data models, and utility functions that power the Mise-en-place platform. All modules here are server-only unless otherwise noted.

## Module Index

### Data Access (Domain Logic)

These modules are each covered in detail by their domain's `GEMINI.md` file. Refer there for invariants and testing strategy.

- **`recipes.ts`** — Recipe CRUD, scaling, and nutrition aggregation. See [app/recipes/GEMINI.md](../app/recipes/GEMINI.md).
- **`pantry.ts`** — Pantry stock management and FIFO deduction. See [app/dashboard/pantry/GEMINI.md](../app/dashboard/pantry/GEMINI.md).
- **`shopping-list.ts`** — Shopping list generation from meal plans and low stock. See [app/dashboard/shopping-list/GEMINI.md](../app/dashboard/shopping-list/GEMINI.md).
- **`meal-plans.ts`** — Meal scheduling, leftovers, and prep-ahead aggregation. See [app/meal-planner/GEMINI.md](../app/meal-planner/GEMINI.md).

### Ingredient & Nutrition

- **`ingredients.ts` (USDA & Custom Ingredient Management):** Handles USDA FoodData Central ingredient lookups, custom ingredient creation, and `determineDepartment` — a heuristic that classifies an ingredient into a shopping department (e.g., "Produce", "Meat & Seafood") based on its name and category. This is the largest lib module at ~300 lines.
- **`units.ts` (Unit Conversion):** Handles sophisticated mass-to-volume and mass-to-count conversions. Uses a heuristic engine to scan USDA `foodPortions` for "whole item" weights (e.g., the weight of 1 medium onion) to enable recipe scaling and accurate macro calculations for discrete items.
- **`ingredient-matcher.ts` (Step-to-Ingredient Matching):** Fuzzy-matches recipe instruction text against a list of `RecipeComponent`s to surface the relevant ingredients for each step in `RecipePlayMode`. Uses word-level partial matching with a stop-word filter.
- **`off.ts` (Open Food Facts Integration):** Wraps the Open Food Facts public API. Provides a `searchOpenFoodFacts` function that returns normalized `OFFNormalizedFood` objects — the same shape as USDA results so the USDA search route can merge both sources transparently.

### Import & AI

- **`ai-parser.ts` (LLM Integration):** Interfaces with the Vercel AI SDK (OpenAI) to provide structured JSON outputs for recipe extraction, ingredient parsing, and vision-based image imports.
- **`scraper.ts` (URL Recipe Scraper):** Fetches a URL and extracts recipe data from `application/ld+json` (Schema.org `Recipe`) markup using `cheerio`. Falls back to AI parsing if structured data is absent.
- **`file-extractor.ts` (Document Processing):** Extracts raw text from `.pdf` (`pdf2json`) and `.docx` (`mammoth`) files for downstream LLM processing via `ai-parser.ts`.
- **`r2.ts` (Object Storage):** Manages image uploads to Cloudflare R2 using an S3-compatible client (`@aws-sdk/client-s3`). Exports `isR2Configured` so callers can gracefully degrade when env vars are absent.

### Infrastructure

- **`prisma.ts` (Database Client):** Centralized Prisma client management with custom extensions for database retries and dynamic driver adapter selection (Neon Serverless for edge/serverless environments vs. Native PG for local dev and long-running processes).
- **`db-retry.ts` (Transient Retry Utility):** `withRetry<T>(fn, retries, delay)` — wraps any async Prisma call and retries on known transient errors (ENOTFOUND, ECONNREFUSED, Prisma codes P2024/P1001) with exponential backoff. Used internally by `prisma.ts`.
- **`limits.ts` (Tier Enforcement):** Defines the `LIMITS` constant object (keyed by `Tier.FREE` / `Tier.PRO`) and exports `checkRecipeLimit`, `checkAiLimit`, and `incrementAiUsage`. Called from Server Actions before any gated operation. See [app/admin/GEMINI.md](../app/admin/GEMINI.md) for tier values.

## Invariants & Constraints

- **Conversions:** All nutritional calculations are normalized to a 100g/ml base weight.
- **Structured Outputs:** AI schemas must use `.nullable()` for optional fields to satisfy OpenAI strict mode requirements.
- **Source Normalization:** Ingredient search results from all sources (USDA, OFF, custom) are normalized to the `USDAFood` interface defined in `types/index.ts` before being returned to clients.
