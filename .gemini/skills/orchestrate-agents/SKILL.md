---
name: orchestrate-agents
description: Orchestrates complex feature implementation by spinning up a dedicated sub-agent to follow a plan from a markdown file. Use when asked to implement a feature set described in a documentation file (e.g., in the docs/ folder).
---

# Orchestrate Agents

This skill enables the primary agent to delegate the implementation of an entire feature set or project phase to a specialized orchestration sub-agent. This keeps the primary agent's context clean and allows for focused, high-volume execution.

## Workflow

1. **Identify the Source**: Determine the markdown file containing the implementation plan or feature requirements (e.g., `docs/MEAL_PLANNER.md`).
2. **Invoke Orchestrator**: Use the `invoke_agent` tool to call the `generalist` sub-agent.
3. **Provide Context**: Your prompt to the sub-agent MUST include:
   - The path to the source documentation file.
   - A instruction to act as an "Orchestration Agent".
   - Reference the instructions in `references/orchestrator-prompt.md` within this skill.
4. **Monitor & Wait**: The sub-agent will operate autonomously. Wait for it to report success and a summary of work before continuing.
5. **Primary Validation**: Once the sub-agent completes the implementation and unit/integration tests, **you (the primary agent) MUST execute the full E2E test suite** to ensure overall system integrity and functional parity.

## Prompt Template

When invoking the sub-agent, use a prompt similar to this:

```text
You are the Orchestration Agent for the 'mise-en-place' project.
Your task is to implement all features described in: [PATH_TO_DOC_FILE]

Please follow the "Orchestration Sub-Agent Instructions" found in the 'orchestrate-agents' skill references.

Execute the implementation using TDD and ensure all unit and integration tests pass. Do NOT run E2E tests (Playwright/Cypress); these will be handled by the primary agent to prevent timeouts. Report back with a summary of implemented features and test results once complete.
```

## When to Use

- When a user provides a high-level requirement document and asks for its full implementation.
- For complex, multi-file features that would benefit from a dedicated execution context.
- When you want to leverage parallel sub-agents for faster delivery while maintaining a high-level overview in the main session.
