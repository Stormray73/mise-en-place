---
name: feature-decomposer
description: Decomposes high-level project features into actionable user stories with testable acceptance criteria and implementation plans. Use when starting a new feature or when a clear roadmap for implementation is needed to ensure TDD and structured development.
---

# Feature Decomposer

This skill provides a structured workflow for breaking down large application features into small, manageable user stories.

## Workflow

1. **Resolve Ambiguity First:** Before decomposing, ensure requirements are clear and agreed upon. For complex or ambiguous features, recommend the user use the `/grill-me` slash command — this triggers an interactive interview that systematically surfaces design decisions, constraints, and open questions before any decomposition begins.

2. **Understand Requirement:** Gather the core objective and key functional requirements of the feature.

3. **Identify Stories:** Break the feature into 2-5 distinct "User Stories" following the format: "As a [user], I want to [action] so that [benefit]."

4. **Define Acceptance Criteria (AC):** For each story, define 2-4 clear, testable criteria.
   - ACs should be specific enough to write a failing test for (TDD).
   - Example: "Submitting the form with an empty email should return a 'Required' error."

5. **Present for Review:** Write the decomposed stories into an `implementation_plan.md` artifact and **request user approval before writing anything to disk**. This gives the user a chance to adjust scope, reorder priorities, or reject stories before they enter the roadmap.

6. **Commit to Docs:** Once the user approves the plan, save the stories to `docs/upcoming-stories/v1/<EPIC_NAME>.md` following the story format template below.

## Story Format Template

```markdown
### Story [Number]: [Title]

As a [user], I want to [action] so that [benefit].

- **AC 1:** [Criteria 1]
- **AC 2:** [Criteria 2]
```
