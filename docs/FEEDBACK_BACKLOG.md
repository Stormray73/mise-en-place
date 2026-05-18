# Feedback Backlog

This file serves as a temporary intake for raw, unsorted user feedback and feature requests. Items here are periodically triaged into `BUGS.md`, `ROADMAP.md`, or specific epics in `docs/upcoming-stories/`.

---

## Unsorted Feedback

- **AI Parser Schema Error (Critical):**
  - **Observation:** The AI Ingredient Parser is failing during recipe imports with an `invalid_json_schema` error (HTTP 400) from the OpenAI API.
  - **Location:** `lib/ai-parser.ts` within the `generateObject` call.
  - **Trace:** `scrapeRecipe` -> `parseIngredients` -> `generateObject`.
  - **Root Cause:** OpenAI's "Structured Outputs" requires that _all_ properties defined in the JSON schema must be included in the `required` array when `strict` mode is enabled. The `IngredientSchema` includes a `prepState` property that is not being correctly marked as required in the generated JSON schema, causing the API to reject the request.
  - **Impact:** Recipe scraping and AI-powered text imports are currently broken.

- **Calendar Alignment:** The meal-prep week currently starts on Saturday. It should be changed to start on Sunday to align with traditional calendars and improve user predictability.
