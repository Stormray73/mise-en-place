---
name: e2e-repair
description: Runs the fetch-e2e-report script, analyzes Playwright test failures, repairs broken tests and/or components, runs strict regression testing, and presents a complete walkthrough report.
---

# E2E Repair Skill

This skill provides specialized instructions for an agent to fetch remote E2E test results, analyze failures, surgically repair broken tests or components under strict regression checks, and produce a beautiful summary walkthrough.

## Core Mandates

1.  **Remote Report Fetching:**
    - Identify the current branch using git: `git branch --show-current`
    - Run the fetch-e2e-report script with the `--branch` flag to target only this branch:
      `./scripts/fetch-e2e-report.sh --branch <current-branch>`
    - Analyze the HTML report/JSON files located in `playwright-report/` to pinpoint exactly which tests failed and why.

2.  **Surgical Test & Component Repair:**
    - Focus on repairing the broken E2E tests and/or the components they target.
    - Prefer repairing and fixing existing tests over deleting them.

3.  **Strict Regression Checking:**
    - If any component is modified to resolve an E2E failure, **both** the unit test suite (`npm test`) and E2E suite must pass perfectly to prevent regressions.
    - If any tests (unit or E2E) fail as a result of component changes, those tests MUST be repaired as part of this cycle.

4.  **No Unauthorized Test Deletions:**
    - **DELETING TESTS IS STRONGLY DISCOURAGED.**
    - If you believe a test is obsolete, redundant, or impossible to fix and should be deleted, you **MUST** halt and ask the user for explicit permission before deleting.

5.  **Local E2E Verification Workflow:**
    - Run Playwright locally using the container environment command:
      `MOCK_AUTH=true AUTH_URL=http://localhost:3000 NEXTAUTH_URL=http://localhost:3000 xvfb-run -a npx playwright test`

## Workflow

1.  **Fetch & Analyze:**
    - Get the current git branch name using `git branch --show-current`.
    - Run `./scripts/fetch-e2e-report.sh --branch <current-branch>` to populate the `playwright-report/` directory.
    - Parse the reports to identify the failing specs.

2.  **Triage:**
    - For each failure, determine if the failure is due to a bug in the application code (component) or a broken/flaky E2E test definition.

3.  **Repair Phase:**
    - Apply the minimum necessary changes to correct the application code or E2E test specs.
    - Do not delete any tests without explicit user permission.

4.  **Verification:**
    - Run the repaired test locally using the Playwright execution workflow.
    - If components were modified, run the entire unit test suite (`npm test`) and Playwright E2E suite to ensure no regressions were introduced. Repair any newly failing tests.

5.  **Walkthrough Report:**
    - Generate or update a comprehensive `walkthrough.md` in the conversation artifacts directory summarizing:
      - The fetched E2E run conclusion and details.
      - Which tests were failing and why.
      - Surgical changes made to code/tests.
      - Local verification command results confirming success.
