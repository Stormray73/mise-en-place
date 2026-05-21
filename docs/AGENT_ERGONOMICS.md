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

- **Local Context:** Every major feature directory (e.g., `app/recipes/`, `lib/`) must contain a `GEMINI.md` file defining its specific invariants, technical decisions, and testing requirements.
- **Header Metadata:** File headers (as defined in Section 1) remain critical for quick file-level identification.

## 5. Domain Knowledge (The Chef's Glossary)

Culinary logic (e.g., unit categories, macro calculation rules) is documented in the `GEMINI.md` files within the `app/recipes/` and `lib/` directories. Agents must verify culinary assumptions against these local files rather than relying on general model knowledge.

## 6. Mandatory GEMINI.md Maintenance After Changes

**After completing any code change, an agent MUST review the `GEMINI.md` file(s) for every directory it modified and update them if there is any deviation.**

This is not optional. Stale documentation is actively harmful to future agents.

Specifically, you MUST update the relevant `GEMINI.md` when your change:

- **Adds** a new file, module, route, or component to a directory
- **Deletes or renames** anything referenced by a `GEMINI.md`
- **Changes** an invariant, constraint, or key architectural decision (e.g., a new required field, a changed data flow)
- **Changes** which component calls which action or API route
- **Introduces** a new testing file or changes the testing strategy for a domain

If no `GEMINI.md` exists for a directory you modified and the directory is substantial enough to warrant one, create it. Use the existing domain GEMINI.md files as templates.

## 7. Automated Story Lifecycle & Completion

To completely automate project management and ensure zero manual overhead for the developer, agents MUST update user story files directly in the codebase as they implement features.

### A. Marking Active Stories

- Before starting work on any story, locate its markdown file in `docs/upcoming-stories/v1/`.
- Mark the story's overall status or active sub-tasks as `[/]` (in-progress) in the workspace to indicate implementation has begun.

### B. Checking Off Acceptance Criteria (AC)

- As soon as a story's acceptance criteria are fully met and verified (via passing unit and E2E tests), edit the respective epic file in `docs/upcoming-stories/v1/` to change the corresponding checkbox from `- [ ]` to `- [x]`.

### C. Archiving Completed Epics

- When **all** stories and ACs in an epic file (e.g., `docs/upcoming-stories/v1/MY_FEATURE.md`) are 100% completed:
  1. Move the file from `docs/upcoming-stories/v1/` to `docs/completed-stories/` (preserving its name).
  2. Locate `docs/ROADMAP.md` and move the epic from the **Active** list to the **Completed Features** section at the bottom.
  3. Ensure that any new design invariants, component additions, or file directories are documented in the respective local `GEMINI.md` (see Section 6).
