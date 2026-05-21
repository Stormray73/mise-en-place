# Agentic Ergonomics: Optimization for AI Agents

This document defines standards designed to minimize token consumption and improve the navigation efficiency of AI agents working in this codebase.

## 1. File Header Metadata

Every new or refactored component/library file MUST include a concise JSDoc header at the top. This allows agents to understand a file's purpose by reading only the first few lines.

```typescript
/**
 * @file [FileName]
 * @responsibility [One sentence summary of purpose]
 * @dependencies [Key internal/external modules used]
 */
```

## 2. Standardized Action Results

All Server Actions in `actions.ts` files should return a standardized `ActionResult` object. This eliminates agent guesswork when implementing UI error handling.

```typescript
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

## 3. Discriminated Unions for Core Types

When a type can represent multiple distinct states (e.g., a Recipe Component that is either an Ingredient or a Sub-recipe), use discriminated unions. This makes the logic flow clearer for an agent's reasoning engine.

**Preferred Pattern:**

```typescript
type RecipeComponent =
  | {
      type: "ingredient";
      ingredient: Ingredient;
      quantity: number;
      unit: string;
    }
  | { type: "sub-recipe"; childRecipe: Recipe; quantity: number; unit: string };
```

## 4. Context Efficiency in Navigation

When an agent is navigating the codebase, it MUST prioritize reading `GEMINI.md` files in the current directory before reading implementation code.

- **Local Context:** Every major feature directory (e.g., `app/recipes/`, `lib/pantry/`) must contain a `GEMINI.md` file defining its specific invariants, technical decisions, and testing requirements.
- **Header Metadata:** File headers (as defined in Section 1) remain critical for quick file-level identification.

## 5. Domain Knowledge (The Chef's Glossary)

Culinary logic (e.g., unit categories, macro calculation rules) is documented in the `GEMINI.md` files within the `app/recipes/` and `lib/` directories. Agents must verify culinary assumptions against these local files rather than relying on general model knowledge.
