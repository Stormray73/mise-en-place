# Testing & Quality Standards

## Test-Driven Development (TDD)

- **Requirement:** Every high-level feature must be decomposed into stories with clear acceptance criteria (AC).
- **Process:**
  1. Write tests that match the AC.
  2. Run the tests (they should fail).
  3. Implement the minimal code to pass the tests.
  4. Refactor as needed while keeping tests passing.

## Tooling

- **Test Runner:** Vitest
- **Component Testing:** React Testing Library
- **Linting:** ESLint (Strict TypeScript rules)
- **Pre-commit Hooks:** Husky + `lint-staged` (Runs ESLint and Prettier on staged files).
- **Pre-push Hooks:** Husky (Runs `npm run lint` and `npm test` before allowing push).

## Enforcement Rule

Before any code is pushed to the repository, the linter and all tests MUST pass. Failure to pass these checks locally will block the git push.
