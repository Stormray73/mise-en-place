---
name: project-orchestrator
description: Orchestrates the execution of bugs, UI/UX polish, and new features by delegating to specialized agents, preventing race conditions, managing peer reviews, committing changes, and running final validation. Use when asked to resolve all pending backlog items or orchestrate a complete project pipeline.
---

# Project Orchestrator Workflow

This skill guides you in orchestrating a complete project backlog, including bug fixes, UI/UX polish, and feature implementation, using a team of specialized sub-agents and strict review cycles.

> **Recommended invocation:** This is a long-running, multi-phase pipeline. Ask the user to prefix their request with `/goal` so the agent runs persistently end-to-end without stopping for non-blocking questions.

## Core Directives

1. **Planning & Tracking:** Initialize a `task.md` artifact at the start of orchestration to track progress across all backlog items. Create an `implementation_plan.md` artifact summarising all phases and seek user approval before beginning Phase 1.

## Orchestration Pipeline

Follow these phases strictly in order. Do not proceed to the next phase until the current phase is fully complete and verified.

### Phase 1: Bug Resolution (`docs/BUGS.md`)

1. Read `docs/BUGS.md` to identify all unresolved bugs.
2. For each bug, invoke the `bug-fixer` skill **inline** (same agent context). The `bug-fixer` will update `task.md` and produce a `walkthrough.md` per fix.
3. **Peer Review & Commit Loop:**
   - After `bug-fixer` finishes for a specific bug, spawn a **fresh subagent** via `invoke_subagent` running the `peer-reviewer` skill against the modified files. Pass the bug description and modified file list as context.
   - Read the peer review verdict from the subagent's `walkthrough.md` artifact (accessible via the subagent's conversation artifacts path).
   - If the peer review identifies issues, address that feedback immediately.
   - Once all feedback is addressed, commit the corresponding files with a descriptive commit message.

### Phase 2: UI/UX Polish (`docs/upcoming-stories/v1/UI_UX_POLISH.md`)

1. Read `docs/upcoming-stories/v1/UI_UX_POLISH.md` to identify all unresolved polish tasks.
2. Treat these tasks exactly like bugs: invoke the `bug-fixer` skill **inline** to address each unresolved issue.
3. **Peer Review & Commit Loop:** Same process as Phase 1 — spawn a fresh `peer-reviewer` subagent, read the verdict, address feedback, then commit.

### Phase 3: Feature Implementation

1. Identify the specified feature files in the `docs/upcoming-stories/` directories.
2. Activate the `autonomous-feature-pipeline` skill **inline** to complete the specified features.
3. **Strict Adherence:** Follow the exact steps in `autonomous-feature-pipeline`. Do not deviate from its established procedures.

### Phase 4: Final Project Validation

Once all bugs, UI/UX polish tasks, and features have been fully implemented and committed, perform a final system health check:

1. **Linting:** Run `npm run lint`. Resolve any issues.
2. **Unit Tests:** Run `npm test`. Resolve any failing tests.
3. **Security Auditing** (requires the **SecureCoder plugin** to be installed):
   - **Dependency safety**: The `scan_dependencies` skill must have been invoked before any new packages were imported during the above phases. If not done, run it now.
   - **Vulnerability scan**: Run the `run-security-scanner` skill on all modified source files to detect issues such as SQL injection, XSS, or exposed secrets.
   - **Audit**: Run `npm audit`. Resolve any high/moderate vulnerabilities.
4. **Final Report**: Update the `walkthrough.md` artifact with a summary of all phases completed, tests run, and the final security audit results.
