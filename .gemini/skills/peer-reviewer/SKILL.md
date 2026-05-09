---
name: peer-reviewer
description: Performs a comprehensive peer review of a developed feature against requirements and best practices. Use when a feature implementation is complete and needs validation against acceptance criteria, code quality standards, and edge case identification without modifying files.
---

# Peer Reviewer

## Core Mandate: Read-Only Analysis

**This is a read-only skill.** You are STRICTLY FORBIDDEN from making any changes to the codebase, including fixing bugs, refactoring code, or updating documentation, during the review process. Your sole responsibility is to analyze, evaluate, and report. If you identify issues, document them in the peer review report; do not attempt to fix them.

## Overview

This skill guides you through a structured peer review process. It ensures that new features meet their defined acceptance criteria, adhere to code quality standards, and are robust against edge cases.

## Workflow

When asked to perform a peer review, follow these steps:

### 1. Research Requirements

Identify and read the relevant documentation to understand the feature's intent and requirements.

- **Feature Specification**: Usually found in `docs/` (e.g., `docs/RECIPE_STORE.md`).
- **Bug Tracker**: Check `docs/BUGS.md` for related resolved or active issues.

### 2. Identify Changes

Determine which files have been modified or added as part of the feature development.

- Use `git status` and `git diff` to see current work.
- Use `git log` to see recent commits if the work was recently committed.

### 3. Evaluate Against Criteria

Review the code and tests based on the standards in [CRITERIA.md](references/CRITERIA.md). Focus on:

- **Acceptance Criteria (AC)**: Does the implementation fulfill every AC in the spec?
- **Test Validation**: Do the tests (Unit, Integration, E2E) effectively verify the AC and handle common failures?
- **Code Quality**: Is the code idiomatic, efficient, and maintainable?
- **Edge Cases**: Identify missing scenarios in both implementation and testing (e.g., empty states, network errors, circular dependencies).

### 4. Document Findings

Write a detailed report to a new file in `/docs/peer-reviews/`.

- **Filename**: Use the format `YYYY-MM-DD-HHMMSS.md`.
- **Content**: Include sections for AC Status, Code Quality, and Edge Cases.

## Parameters

You can customize the review by specifying:

- `feature_path`: Path to the feature documentation (default: `docs/`).
- `bug_file`: Path to the bug tracking file (default: `docs/BUGS.md`).
- `output_dir`: Directory for the review report (default: `docs/peer-reviews/`).
