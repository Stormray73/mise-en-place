---
name: project-orchestrator
description: Orchestrates the execution of bugs, UI/UX polish, and new features by delegating to specialized agents, preventing race conditions, managing peer reviews, committing changes, and running final validation. Use when asked to resolve all pending backlog items or orchestrate a complete project pipeline.
---

# Project Orchestrator Workflow

This skill guides you in orchestrating a complete project backlog, including bug fixes, UI/UX polish, and feature implementation, using a team of specialized sub-agents and strict review cycles.

## Core Directives

1. **Strategic Delegation:** Act as a Grand Orchestrator. Identify elements that can be built in parallel and create `generalist` sub-agents to build them.
2. **Race Condition Prevention:** NEVER allow multiple sub-agents to modify the same file concurrently. Analyze the scope of tasks before parallelizing. If tasks touch the same domains or files, they MUST be executed sequentially.

## Orchestration Pipeline

Follow these phases strictly in order. Do not proceed to the next phase until the current phase is fully complete and verified.

### Phase 1: Bug Resolution (`docs/BUGS.md`)

1. Read `docs/BUGS.md` to identify all unresolved bugs.
2. For each bug, activate the `bug-fixer` skill (or delegate to a `generalist` sub-agent instructed to activate and follow it) to resolve the issue.
3. **Peer Review & Commit Loop:**
   - After the `bug-fixer` skill finishes running for a specific bug, run the `peer-reviewer` skill against the files that were modified.
   - If the peer review identifies issues, address that feedback immediately.
   - Once all feedback is addressed, prepare and commit the corresponding files with an appropriate, descriptive commit message.

### Phase 2: UI/UX Polish (`docs/upcoming-stories/v1/UI_UX_POLISH.md`)

1. Read `docs/upcoming-stories/v1/UI_UX_POLISH.md` to identify all unresolved polish tasks.
2. Treat these tasks exactly like bugs: Activate the `bug-fixer` skill to address each unresolved issue.
3. **Peer Review & Commit Loop:**
   - Run the `peer-reviewer` skill against the files modified for the UI/UX polish.
   - Address any feedback from the peer review.
   - Once feedback is resolved, commit the corresponding files with an appropriate commit message.

### Phase 3: Feature Implementation

1. Identify the specified feature files in the `docs/upcoming-stories/` directories.
2. Activate the `autonomous-feature-pipeline` skill to complete the specified feature files.
3. **Strict Adherence:** You MUST follow the exact steps outlined in the `autonomous-feature-pipeline` skill. Do not deviate from its established procedures.

### Phase 4: Final Project Validation

Once all bugs, UI/UX polish tasks, and features have been fully implemented and committed, you must perform a final system health check:

1. **Linting:** Run the project's linter. Resolve any issues.
2. **Unit Tests:** Run the project's unit test suite. Resolve any failing tests.
3. **Dependency Audit:** Audit the project to see if any new packages have been added. Run `npm audit` (or the equivalent package manager audit) and resolve any security issues if present.
