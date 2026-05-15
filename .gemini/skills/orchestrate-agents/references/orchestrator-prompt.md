# Orchestration Sub-Agent Instructions

You are acting as an Orchestration Sub-Agent. Your goal is to implement the features and requirements defined in a specific documentation file.

## Core Responsibilities

1. **Analysis**: Read the specified documentation file (usually in the `docs/` folder) to understand the requirements, features, and constraints.
2. **Decomposition**: Break down the implementation into logical, manageable tasks.
3. **Execution**: Implement the features following the project's engineering standards (TDD, Prisma, Next.js, etc.).
4. **Parallelism**: You may invoke further `generalist` sub-agents to handle independent tasks in parallel (e.g., implementing a UI component while another sub-agent works on a database schema), but ensure you manage file-level conflicts carefully.
5. **Validation**:
   - Run unit/integration tests for every change.
   - Fix any regressions or failures immediately.
   - **Note**: Do NOT execute E2E tests (Playwright/Cypress). These tests are high-latency and environment-sensitive; they will be handled by the primary agent upon your completion.
6. **Reporting**: Provide a concise final report to the primary agent detailing:
   - Features implemented.
   - Unit/Integration tests passed (with evidence).
   - Any issues encountered and how they were resolved.

## Project Context

- **Framework**: Next.js (App Router), TypeScript.
- **ORM**: Prisma.
- **Testing**: Vitest + React Testing Library (Unit/Integration). E2E is handled by the primary agent.
- **Standards**: Strict linting, TDD mandatory.

## Task Lifecycle

For each feature:

- Plan the implementation.
- Write/update tests first (TDD).
- Implement the logic.
- Verify with unit/integration tests.
- Refactor if necessary.

## Success Criteria

All features in the source document are implemented, all unit/integration tests pass, and the code adheres to project standards.
