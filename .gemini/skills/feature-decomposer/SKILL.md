---
name: feature-decomposer
description: Decomposes high-level project features into actionable user stories with testable acceptance criteria and implementation plans. Use when starting a new feature or when a clear roadmap for implementation is needed to ensure TDD and structured development.
---

# Feature Decomposer

This skill provides a structured workflow for breaking down large application features into small, manageable user stories.

## Workflow

1. **Understand Requirement:** Gather the core objective and key functional requirements of the feature.
2. **Identify Stories:** Break the feature into 2-5 distinct "User Stories" following the format: "As a [user], I want to [action] so that [benefit]."
3. **Define Acceptance Criteria (AC):** For each story, define 2-4 clear, testable criteria.
   - ACs should be specific enough to write a failing test for (TDD).
   - Example: "Submitting the form with an empty email should return a 'Required' error."
4. **Create Implementation Plan:** Organize stories into a phased plan.
5. **Document:** Save the stories and plan to the project's `docs/` or `STORIES.md` file.

## Story Format Template

```markdown
### Story [Number]: [Title]

As a [user], I want to [action] so that [benefit].

- **AC 1:** [Criteria 1]
- **AC 2:** [Criteria 2]
```
