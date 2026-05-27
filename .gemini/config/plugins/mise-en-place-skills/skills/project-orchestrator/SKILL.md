---
name: project-orchestrator
description: Orchestrates the execution of bugs, UI/UX polish, and new features by delegating to specialized agents, preventing race conditions, managing peer reviews, committing changes, and running final validation. Use when asked to resolve all pending backlog items or orchestrate a complete project pipeline.
---

# Project Orchestrator Workflow

This skill guides you in orchestrating a complete project backlog, including bug fixes, UI/UX polish, and feature implementation, using a team of specialized sub-agents, structured Git Gitflow branch operations, and strict quality-gated verification.

> **Recommended invocation:** This is a long-running, multi-phase pipeline. Ask the user to prefix their request with `/goal` so the agent runs persistently end-to-end without stopping for non-blocking questions.

## Core Directives

1. **Planning & Dependency Mapping:**
   - Initialize a `task.md` artifact at the start of orchestration.
   - Create an `implementation_plan.md` artifact summarizing all tasks, explicitly organizing the **PR Merge Order** to avoid logical and git conflicts (e.g. core infra/database migrations -> bug fixes -> UI/UX polish -> new features).
   - Seek user approval on the plan and merge order before proceeding.
2. **Branch Isolation:** Every task in the pipeline MUST be executed on a dedicated git branch checked out from `main`.

---

## Orchestration Pipeline

Follow these phases strictly in order. Do not proceed to the next phase until the current phase is fully complete, verified, and its PR is created.

### Phase 1: Bug Resolution (`docs/BUGS.md`)

1. Read `docs/BUGS.md` to identify all unresolved bugs.
2. For each bug, execute the following isolated Gitflow loop:
   - **Branch Out:** Checkout a new git branch from `main` named `fix/<BUG-ID>-description` (e.g. `fix/BUG-044-document-truncation`).
   - **Fix:** Invoke the `bug-fixer` skill **inline** (same agent context) to reproduce, surgically fix, and verify the bug.
   - **Peer Review & Commit Loop:**
     - Spawn a **fresh subagent** via `invoke_subagent` running the `peer-reviewer` skill against the modified files.
     - To minimize token burn, instruct the peer-reviewer to output a small, structured JSON verdict block at the very top of their `walkthrough.md` (e.g., `{"status": "PASS", "confidence": "HIGH"}`). Read only this block to verify status.
     - If the reviewer identifies issues, address them immediately.
     - Once verified, commit the changes locally.
   - **PR Creation:**
     - Run ES Linting and Type Check on the modified files to ensure zero regressions.
     - Push the branch to remote.
     - Create a Pull Request using the GitHub CLI: `gh pr create --title "[Fix] <BUG-ID>: <Description>" --body "Closes <BUG-ID>. Verified via E2E test." --draft`.
     - Checkout back to `main`.

### Phase 2: UI/UX Polish (`docs/upcoming-stories/v1/UI_UX_POLISH.md`)

1. Read `docs/upcoming-stories/v1/UI_UX_POLISH.md` to identify all unresolved polish tasks.
2. Treat these tasks exactly like bugs:
   - Checkout a dedicated branch `polish/<task-slug>` from `main`.
   - Invoke `bug-fixer` inline to address the issue.
   - Run the Peer Review and Commit Loop (utilizing the token-saving JSON verdict pattern).
   - Verify modified files, push, and create a Pull Request: `gh pr create --title "[Polish] <Task Description>" --body "Refined UI/UX layout." --draft`.
   - Checkout back to `main`.

### Phase 3: Feature Implementation

1. Identify the specified feature files in the `docs/upcoming-stories/` directories.
2. For each feature, activate the `autonomous-feature-pipeline` skill **inline** to manage the feature branch, development, testing, and PR creation.

---

## Phase 4: Final Project Validation

Once all PRs have been successfully generated and reviewed, perform a final system health check on `main`:

1. **Linting:** Run `npm run lint`. Resolve any issues.
2. **Unit Tests:** Run `npm test`. Resolve any failing tests.
3. **Security Auditing** (requires the **SecureCoder plugin**):
   - **Dependency safety**: Ensure `scan_dependencies` was run before importing any packages.
   - **Vulnerability scan**: Run `run-security-scanner` on modified files.
   - **Audit**: Run `npm audit`. Resolve any high/moderate issues.
4. **Final Report**: Update `walkthrough.md` with a summary of all phases completed, tests run, PR references, and final security audit results.
