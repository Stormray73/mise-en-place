# Feature: E2E & Integration Testing Infrastructure

## Objective

Establish a robust End-to-End (E2E) testing framework using **Playwright** to allow AI agents (and developers) to automatically verify complex features, state changes, and cross-page interactions without requiring manual browser testing.

## Background & Motivation

While the project currently utilizes Vitest and React Testing Library for component-level unit testing, complex features like the Meal Planner (drag/drop, state aggregation) and Recipe "Play" mode (persistent timers across page changes) require a real browser environment to test accurately. An E2E framework allows an agent to simulate a real user clicking through the app and visually verifying outcomes.

Playwright is chosen due to its:

1. **Auto-awaiting:** Automatically waits for elements to be actionable, reducing flaky tests.
2. **Speed & Parallelism:** Fast execution across Chromium, WebKit, and Firefox.
3. **Agent Friendliness:** Extremely readable API and clear trace logs (videos/DOM snapshots) if a test fails, which agents can use to debug.
4. **First-class Next.js Support.**

## Scope & Impact

- **Dependencies:** Install `@playwright/test`.
- **Configuration:** Add `playwright.config.ts`.
- **Scripts:** Add E2E testing commands to `package.json`.
- **CI/CD:** Optionally integrate Playwright into the existing GitHub Actions workflow.

## Implementation Steps (Stories)

### Story 1: Playwright Installation and Configuration

As a developer, I want Playwright installed and configured in the repository so that I have a foundation for writing E2E tests.

- **AC 1:** `@playwright/test` is added as a dev dependency.
- **AC 2:** A `playwright.config.ts` file is created, configured to run against the Next.js local dev server (e.g., automatically starting `npm run dev` on port 3000 before tests run).
- **AC 3:** NPM scripts (`test:e2e` and `test:e2e:ui`) are added to `package.json`.
- **AC 4:** Playwright browser binaries are added to the `.devcontainer` setup or documentation so they are installed automatically.

### Story 2: Baseline Authentication Test

As an AI agent, I want a baseline E2E test covering the login flow so that I can verify my environment works and have an example of how to write future tests.

- **AC 1:** A `tests/e2e/auth.spec.ts` file is created.
- **AC 2:** The test navigates to the application, attempts to log in using the newly planned OAuth flow (or a mocked version of it), and verifies redirection to the `/dashboard`.
- **AC 3:** The test passes successfully when running `npm run test:e2e`.

### Story 3: E2E Documentation & Strict Agent Guidelines

As a contributor (human or AI), I want clear, strict guidelines on when and how to use Playwright vs. Vitest so that the test suite remains robust, agents are prevented from hallucinating success, and external integrations are verified.

- **AC 1:** Update the `docs/TESTING.md` file to explicitly define the boundaries: Vitest/RTL for isolated component logic and utilities; Playwright for the following specific scenarios:
  - **Critical User Journeys:** (e.g., Login, Meal Planning, Recipe Creation).
  - **Multi-Component Interactions:** Where state is passed or managed across distinct components or pages.
  - **Data Persistence:** Verifying that data saved in the UI correctly persists to the database and survives a page reload.
  - **External API Verification:** Writing specific integration tests (potentially with live or rigidly mocked endpoints) to ensure expected output formats from external APIs (like the USDA API) match our internal schemas.
- **AC 2:** Add strict anti-hallucination rules: Agents MUST write failing tests first and use Playwright trace logs to empirically prove a test passed; they cannot assume a UI change worked without an accompanying E2E test verifying the DOM state.
- **AC 3:** Include instructions on how an agent can read Playwright trace logs to self-diagnose failing tests.

## Verification & Testing

- **Self-Verification:** The completion of this feature is verified by the passing of the baseline E2E tests in a completely automated, headless environment.
