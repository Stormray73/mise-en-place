---
name: feedback-triage
description: Triages raw user feedback into BUGS.md or v1/v2 epics. Automatically mandates the use of 'feature-decomposer' for new epics to ensure they are immediately actionable for builder agents.
---

# Feedback Triage Workflow

This skill provides a standardized workflow for sorting incoming feedback to maintain a clean project roadmap and ensure zero confusion for future agents.

## Triage Logic

When processing feedback, categorize each item using the following hierarchy:

### 1. 🐛 Bugs & Performance Issues -> `docs/BUGS.md`

- **Criteria:** Anything that is broken, crashes, has significant delays, or violates a strict constraint (e.g., duplicates).
- **Action:** Add to the "Active Bugs" section with a unique `BUG-XXX` ID.

### 2. 💅 v1.0 UI/UX Polish -> `docs/upcoming-stories/v1/UI_UX_POLISH.md`

- **Criteria:** Minor styling tweaks, button re-arrangements, or ergonomic refinements that don't require new data models or complex logic.
- **Action:** Add as a checkbox item under the appropriate section.

### 3. 🚀 v1.0 Feature Epics -> `docs/upcoming-stories/v1/`

- **Criteria:** Enhancements or new features required for a solid v1.0 release. Usually involves small logic updates or new UI components.
- **Action:** Add to an existing epic file or create a new one (e.g., `v1/ADVANCED_SCHEDULING.md`).

### 4. 🌟 v2.0 Stretch Goals -> `docs/upcoming-stories/v2/`

- **Criteria:** Major overhauls, community features, or complex integrations that are not critical for the initial stable release.
- **Action:** Move to the `v2/` directory and update the `ROADMAP.md` to reflect the deferral.

## Procedure

1. **Intake:** Read the raw feedback from the user or `docs/FEEDBACK_BACKLOG.md`.
2. **Categorize:** Apply the Triage Logic above to each point.
3. **Update Docs:**
   - Update `docs/BUGS.md` for defects.
   - Update/Create files in `docs/upcoming-stories/v1/` or `v2/`.
   - Update `docs/ROADMAP.md` if new epics are created.
4. **Decompose Epics:** For any NEW epics created in `v1/`, you MUST immediately activate the `feature-decomposer` skill. Use it to transform the high-level epic into a detailed markdown file with actionable user stories, acceptance criteria, and a TDD-based implementation plan.
5. **Cleanup:** If the feedback came from `docs/FEEDBACK_BACKLOG.md`, clear those items from the backlog once they are triaged.
6. **Report:** Provide a summary of where each item was moved and confirm that decomposition is complete.

## Reference Schema

See [SCHEMA.md](references/SCHEMA.md) for the expected markdown structure of bugs and epics.
