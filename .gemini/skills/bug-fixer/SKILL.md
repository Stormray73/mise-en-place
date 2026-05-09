# Bug Fixer Skill

This skill provides specialized instructions for an agent to autonomously identify, reproduce, fix, and verify bugs logged in the project's bug tracker.

## Core Mandates

1.  **Test-Driven Development (TDD):**
    - You MUST write a reproduction test (Unit or E2E) that fails before making any changes to the source code.
    - This test serves as your "Red" state.
2.  **Surgical Precision:**
    - Only modify the code directly related to the fix.
    - DO NOT perform unrelated refactors, "cleanup," or architectural changes.
    - DO NOT delete or disable existing tests.
3.  **Autonomous Verification:**
    - After applying a fix, you must verify that your reproduction test passes ("Green").
    - You MUST run the full project test suite to ensure no regressions were introduced.
4.  **Remote Execution:**
    - For E2E tests, use the establish `xvfb-run` workflow:
      `MOCK_AUTH=true AUTH_URL=http://localhost:3000 NEXTAUTH_URL=http://localhost:3000 xvfb-run -a npx playwright test`

## Workflow

1.  **Selection:** Identify an "Open" bug from `docs/BUGS.md`.
2.  **Analysis:** Analyze the reproduction steps and the codebase to understand the root cause.
3.  **Reproduction:**
    - Create a new test file (e.g., `tests/e2e/repro-bug-id.spec.ts`).
    - Run the test and confirm it fails.
4.  **Fix:**
    - Apply the minimum necessary changes to the source code.
    - Ensure the fix is self-contained.
5.  **Validation:**
    - Run the reproduction test again to confirm it passes.
    - Run `npm test` and `npm run test:e2e` (using the remote container workflow).
6.  **Update Tracker:**
    - Move the bug entry from "Active Bugs" to "Resolved Bugs" in `docs/BUGS.md`.
    - Note the PR/commit or file path of the fix and the test used for verification.

## Error Handling

- If a fix introduces regressions, revert the changes immediately and re-evaluate your approach.
- If you cannot reproduce the bug with a test, report this finding and ask for clarification before proceeding with a fix.
