---
name: autonomous-feature-pipeline
description: Fully autonomous implementation pipeline. Orchestrates feature building, linting, testing, fresh-eye peer reviews, and bug fixing. Use when tasked with delivering a push-ready feature from a user story with minimal intervention.
---

# Autonomous Feature Pipeline

This skill acts as a high-level orchestrator to move a feature from "Story" to "Push-Ready" through an iterative, quality-gated process.

## Pipeline Workflow

### Phase 1: Implementation

1. **Activate `feature-implementer`**: Implement the feature, unit tests, and E2E tests following the story requirements.
2. **Modular Docs**: Ensure `GEMINI.md` files are created/updated in all touched directories.

### Phase 2: Unit Verification

1. **Unit Regression**: Run `npm run test -- <path_to_domain>`. All unit tests must pass.
2. **Logic Fixes**: If unit tests fail, fix the implementation and re-run until green.

### Phase 3: Fresh-Eye Peer Review

1. **Invoke Reviewer**: Use `invoke_agent` with the `peer-reviewer` skill.
   - **Context**: Pass the story requirements and the list of modified files.
   - **Mandate**: Review for AC fulfillment, code quality, and edge cases.
2. **Evaluate Report**:
   - **If PASS**: Proceed to Phase 5.
   - **If FAIL/NEEDS WORK**: Proceed to Phase 4.

### Phase 4: Autonomous Correction

1. **Activate `bug-fixer`**: Provide the Peer Review report as the primary input.
2. **Apply Fixes**: Address all critical/major issues identified.
3. **Re-verify**: Return to Phase 2 to ensure no regressions were introduced.

### Phase 5: Final Validation & Stability

1. **Full Regression**: Run the entire domain E2E suite (`npx playwright test <path_to_domain>`).
2. **Stability Check**: Ensure the new E2E spec passes 3 times consecutively.
3. **Static Analysis (Push-Ready Check)**:
   - **Linter**: Run `npm run lint`. If fails, use `eslint --fix` or fix manually.
   - **Type Check**: Run `npx tsc --noEmit`. Fix any type errors.
4. **Documentation Sync**: Perform a final pass on all local `GEMINI.md` files to ensure they match the post-fix implementation.
5. **Handoff**: Report to the user that the feature is "Push-Ready".

## Rules & Constraints

- **Push-Ready Standard**: All gates in [quality-gates.md](references/quality-gates.md) must be satisfied.
- **Independence**: The `peer-reviewer` MUST be a fresh agent via `invoke_agent` to ensure unbiased analysis.
- **Persistence**: Do not stop until Phase 5 is completed or a blocker is reached that requires human decision (e.g., conflicting requirements).

## When to Use

- When given a user story and asked to "fully implement" or "handle the end-to-end delivery."
- For complex features where multi-stage quality control is required to prevent regressions.
