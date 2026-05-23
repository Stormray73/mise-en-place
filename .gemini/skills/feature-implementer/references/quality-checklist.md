# Feature Implementation Quality Checklist

Before completing a story implementation, verify the following:

## 1. Context & Documentation

- [ ] Did you read the local `GEMINI.md` in all target directories?
- [ ] Did you update/create a `GEMINI.md` in **EVERY** directory touched by your changes?
- [ ] Does each `GEMINI.md` clearly record how the feature functions in that scope as context for future agents?
- [ ] Are file headers updated/added following [AGENT_ERGONOMICS.md](../../../docs/AGENT_ERGONOMICS.md)?

## 2. Testing (TDD)

- [ ] Do unit tests cover the new logic (100% path coverage for new code)?
- [ ] Does a corresponding E2E test exist in `tests/e2e/` for the user story?
- [ ] Did you run the full suite for the affected domain to check for regressions?

## 3. Standards & Types

- [ ] Are all Server Actions returning the standardized `ActionResult<T>`?
- [ ] Is TypeScript set to strict (no `any`, proper Prisma types)?
- [ ] Are database migrations meaningful and correctly named?

## 4. UI/UX

- [ ] Is the UI consistent with existing components (`Button`, `Card`, `Input`, etc.)?
- [ ] Does the UI handle error states (via `ActionResult` from actions)?
- [ ] Is the UI responsive (checked via Playwright viewports if possible)?
