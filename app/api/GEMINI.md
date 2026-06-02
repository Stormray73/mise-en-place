# API Routes (`app/api/`)

## Overview

These are Next.js Route Handlers (not Server Actions). They exist where a traditional REST endpoint is needed — primarily to serve client-side fetch calls from browser components that cannot call Server Actions directly (e.g., debounced search inputs).

**All routes require an active session unless noted.** Unauthenticated requests return `401 Unauthorized`.

---

## Routes

### `GET /api/usda/search?q=<query>&branded=<bool>`

**File:** `app/api/usda/search/route.ts`

The unified ingredient search endpoint. Returns a merged, prioritized list of foods:

1. **Custom Ingredients** (from the app's own `Ingredient` table, scoped to `userId`)
2. **USDA FoodData Central** (via `USDA_API_KEY` env var) — queried for whole foods
3. **Open Food Facts (OFF)** — queried in parallel and combined with USDA results to cover branded items and spices (or queried alone when `branded=true` is passed)

The response shape is `{ foods: USDAFood[] }`, where each item includes `fdcId`, `description`, `foodNutrients`, `foodPortions`, and a `source` field (`"USDA"`, `"OFF"`, or `"Local"`).

**Used by:** `components/IngredientSearch.tsx`

---

### `GET /api/recipes/search?q=<query>`

**File:** `app/api/recipes/search/route.ts`

Searches the authenticated user's own recipes by title (case-insensitive, partial match). Returns up to 10 results. Used for selecting a recipe to add as a sub-recipe inside `RecipeEditor`.

Response shape: `{ recipes: RecipeSearchResult[] }`

**Used by:** `components/ComponentList.tsx` (sub-recipe search)

---

### `POST /api/upload`

**File:** `app/api/upload/route.ts`

Accepts a `multipart/form-data` request with a `file` field. Uploads the file to Cloudflare R2 via `lib/r2.ts`. Returns `{ imageUrl: string }`.

**Constraints:**

- Max file size: 5MB.
- Returns `503` if R2 is not configured (env vars missing).

**Used by:** `components/ImportRecipeModal.tsx` (image import), `components/RecipeEditor.tsx` (recipe cover image)

---

### `GET /api/auth/[...nextauth]` & `POST /api/auth/[...nextauth]`

**File:** `app/api/auth/[...nextauth]/` (delegated to NextAuth.js)

Standard NextAuth.js catch-all handler. Manages OAuth callbacks (Google), sign-in/sign-out flows, and session tokens. Configuration lives in the root `auth.ts` file.

**Do not add custom logic here.** Auth customisation (JWT callbacks, role injection, mock session for E2E) belongs in `auth.ts`.

---

## MSW Mocking (E2E Tests)

The `tests/msw/handlers.ts` file intercepts network requests in E2E tests. If you add a new API route that is called by a component under test, you must add a corresponding MSW handler. See `docs/E2E_TESTING.md` for the testing infrastructure overview.
