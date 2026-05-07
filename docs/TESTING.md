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
- **E2E Testing:** Playwright
- **Linting:** ESLint (Strict TypeScript rules)
- **Pre-commit Hooks:** Husky + `lint-staged` (Runs ESLint and Prettier on staged files).
- **Pre-push Hooks:** Husky (Runs `npm run lint` and `npm test` before allowing push).

## End-to-End (E2E) Testing with Playwright

### When to use Playwright vs. Vitest

- **Vitest & React Testing Library:** Use for isolated component logic, hooks, and utility functions. If a test can be performed without a full browser environment, prefer Vitest for speed.
- **Playwright:** Use for scenarios that require a real browser and cross-page interactions:
  - **Critical User Journeys:** Core flows like Login, Meal Planning, and Recipe Creation.
  - **Multi-Component Interactions:** Where state is managed across multiple components or pages.
  - **Data Persistence:** Verifying that UI actions correctly update the database (e.g., saving a recipe and reloading the page).
  - **External API Verification:** Ensuring integrations with external services (e.g., USDA API) work as expected with real or rigidly mocked network responses.

### Agent Guidelines & Anti-Hallucination Rules

To ensure test reliability and prevent AI agents from hallucinating success:

1. **Write Failing Tests First:** Before implementing a feature or fix, write an E2E test that fails in the current state. This proves the test is capable of detecting the issue.
2. **Empirical Verification:** Agents MUST NOT assume a change worked. They must run the E2E suite and use Playwright trace logs to confirm the DOM state and behavior.
3. **Trace Log Analysis:** If a test fails, agents must inspect the Playwright trace (including screenshots, console logs, and network activity) to diagnose the root cause rather than guessing.

### Running E2E Tests

- `npm run test:e2e`: Runs all E2E tests in headless mode.
- `npm run test:e2e:ui`: Opens the Playwright Test Runner UI for interactive debugging.

### Debugging with Trace Logs

When a test fails in a CI/headless environment, Playwright generates a trace file. You can view this trace using the Playwright Trace Viewer. Traces provide a step-by-step recording of the test, allowing you to see exactly what the browser was doing at each point.

## Enforcement Rule

Before any code is pushed to the repository, the linter and all tests MUST pass. Failure to pass these checks locally will block the git push.
