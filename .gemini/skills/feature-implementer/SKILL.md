---
name: feature-implementer
description: Surgical implementation of features based on user stories. Requires TDD (Unit & E2E), modular documentation updates, and strict adherence to architectural standards. Use when asked to implement a specific story or feature set.
---

# Feature Implementer

This skill guides the agent through a surgical, TDD-driven implementation of features. It ensures high code quality, comprehensive testing, and up-to-date modular documentation.

## Workflow

### 1. Research & Planning

- **Read Context**: Locate and read the `GEMINI.md` in the target directories. If it doesn't exist, create it after implementation.
- **Analyze Story**: Read the feature specification (e.g., in `docs/upcoming-stories/`).
- **Decompose**: If the story is large, break it into atomic implementation steps.

### 2. Implementation Loop (Per Story/Step)

For each requirement:

1. **Unit Test (TDD)**: Create or update a Vitest test in `__tests__/`. Verify it fails.
2. **Implement**: Write the minimal code needed to satisfy the test. Adhere to:
   - [AGENT_ERGONOMICS.md](../../../docs/AGENT_ERGONOMICS.md) (File headers, ActionResults).
   - Discriminated unions for state-heavy types.
3. **Verify Unit**: Run `npm run test` for the affected file.
4. **E2E Test (TDD)**: Create or update a Playwright spec in `tests/e2e/`.
5. **Verify E2E**: Run `npx playwright test` for the specific spec.

### 3. Verification & Regression Testing

- **Mandatory Suite**: Run the full unit test suite for the affected domain (`npm run test -- <path>`).
- **Dependency Check**: If adding new dependencies, run `npm audit` and ensure zero high/moderate vulnerabilities.
- **E2E Stability**: Run the specific E2E spec at least 3 times to ensure it's not flaky.
- **Cross-Domain**: If the change affects shared libraries (e.g., `lib/units.ts`), run all E2E tests that depend on those units (Pantry, Recipes, Shopping List).

### 4. Documentation & Context Persistence

- **Modular Updates**: For EVERY directory touched during implementation, you MUST update (or create) the local `GEMINI.md`.
- **Content**: Document how the new/modified features function within that specific scope, including new technical invariants, API changes, or updated testing instructions.
- **Agent Context**: This is critical for ensuring future developer agents have immediate, relevant context to prevent regressions and minimize token waste.
- **Quality Audit**: Use the [quality-checklist.md](references/quality-checklist.md) to perform a final self-review.
- **Peer Review**: Suggest the user run the `peer-reviewer` skill for a final validation.

## Constraints

- **Surgical Changes**: Do not refactor unrelated code. Stay within the scope of the story.
- **No `any`**: Maintain strict TypeScript safety.
- **ActionResult**: All server actions MUST return `{ success: boolean, data?: T, error?: string }`.

## When to Use

- When tasked with implementing a feature described in a user story or roadmap doc.
- For bug fixes that require regression tests.
- When expanding existing features with new functionality.
