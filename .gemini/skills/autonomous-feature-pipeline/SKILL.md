---
name: autonomous-feature-pipeline
description: Fully autonomous implementation pipeline. Orchestrates feature building, linting, testing, fresh-eye peer reviews, and bug fixing. Use when tasked with delivering a push-ready feature from a user story with minimal intervention.
---

# Autonomous Feature Pipeline

This skill acts as a high-level orchestrator to move a feature from "Story" to "Push-Ready" through an iterative, quality-gated process with isolated Gitflow branch management and PR generation.

> **Recommended invocation:** Ask the user to prefix their request with `/goal` to ensure the agent runs persistently end-to-end without stopping for non-blocking questions.

## Pipeline Workflow

### Phase 1: Branch Planning & Implementation

1. **Branch Isolation:** Before writing code, checkout a dedicated branch from `main` named `feat/<feature-slug>` (e.g. `feat/pantry-leftovers-integration`).
2. **Structured Planning:** Create an `implementation_plan.md` artifact to detail architecture, database migrations, and testing strategies. Seek user review before starting implementation.
3. **Task Tracking:** Initialize a `task.md` artifact to track task checkboxes as progress is made.
4. **Activate `feature-implementer`**: Once the plan is approved, implement the feature, unit tests, and E2E tests following the approved story requirements using the `feature-implementer` skill.
5. **Modular Docs**: Ensure `GEMINI.md` files are created/updated in all touched directories.

### Phase 2: Unit Verification

1. **Unit Regression**: Run `npm run test -- <path_to_domain>`. All unit tests must pass.
2. **Logic Fixes**: If unit tests fail, fix the implementation and re-run until green.

### Phase 3: Fresh-Eye Peer Review

1. **Invoke Reviewer**: Use `invoke_subagent` with the `peer-reviewer` skill to spawn a **fresh, independent agent**.
   - **Context**: Pass the story requirements and the list of modified files.
   - **Mandate**: Review for AC fulfillment, code quality, and edge cases.
   - **Token Optimization:** Instruct the subagent to prefix its `walkthrough.md` response with a structured JSON status verdict (e.g., `{"status": "PASS"}`). Read only this block to verify status instead of parsing the entire walkthrough document.
2. **Evaluate Report**:
   - **If PASS**: Proceed to Phase 5.
   - **If FAIL/NEEDS WORK**: Proceed to Phase 4.

### Phase 4: Autonomous Correction

1. **Activate `bug-fixer`**: Provide the Peer Review walkthrough as the primary input.
2. **Apply Fixes**: Address all critical/major issues identified.
3. **Re-verify**: Return to Phase 2 to ensure no regressions were introduced.

### Phase 5: Final Validation & Stability

1. **Full Regression**: Run the entire domain E2E suite (`npx playwright test <path_to_domain>`).
2. **Stability Check**: Ensure the new E2E spec passes 3 times consecutively.
3. **Security Gates** (requires the SecureCoder plugin):
   - **Dependency safety**: Run the `scan_dependencies` skill before importing any new packages.
   - **Vulnerability scan**: Run the `run-security-scanner` skill on all modified files.
   - **Audit**: Run `npm audit`. Resolve any high/moderate vulnerabilities.
4. **Static Analysis (Push-Ready Check)**:
   - **Linter**: Run `npm run lint`. If fails, use `eslint --fix` or fix manually.
   - **Type Check**: Run `npx tsc --noEmit`. Fix any type errors.
5. **PR Creation**:
   - Push the branch to remote.
   - Generate a draft Pull Request: `gh pr create --title "[Feat] <Feature Title>" --body "Implements <Feature Title>." --draft`.
6. **Documentation Sync**: Perform a final pass on all local `GEMINI.md` files to ensure they match the post-fix implementation.
7. **Handoff**: Update `task.md` to mark all items complete, checkout back to `main`, and report to the user that the Pull Request is open and ready.

## Rules & Constraints

- **Push-Ready Standard**: All gates in [quality-gates.md](references/quality-gates.md) must be satisfied.
- **Independence**: The `peer-reviewer` MUST be a fresh agent via `invoke_subagent` to ensure unbiased analysis.
- **Persistence**: Do not stop until Phase 5 is completed or a blocker is reached. For truly autonomous runs, the user should invoke with `/goal`.
