# Upcoming Stories: Advanced Import

## Story 5: Web Scraping Import

As a chef, I want to import recipes from websites by URL so that I can quickly add them to my collection without manual typing.

### Acceptance Criteria

- [ ] Users can paste a URL to import a recipe.
- [ ] The system extracts title, ingredients, steps, and servings from the page.
- [ ] If macros are present on the page, they are imported; otherwise, the USDA API is used to calculate them based on extracted ingredients.
- [ ] Yield and serving size are prioritized during extraction.

### Technical Notes

- Use a library like `recipe-data-extractor` or a custom LLM-based scraper (e.g., Gemini).
- Handle common edge cases (paywalls, complex layouts).

---

## Story 6: File & Image Import (OCR)

As a chef, I want to upload pictures or PDFs of my recipe books so that I can digitize my physical collection.

### Acceptance Criteria

- [ ] Users can upload a PDF or image of a recipe.
- [ ] The system uses OCR to extract text and structure it into a Recipe object.
- [ ] Users are presented with a review screen to correct any extraction errors before saving.

### Technical Notes

- Integrate with an OCR service or use an LLM with vision capabilities (Gemini Pro Vision).

---

## Story 7: Smart Timer Extraction

As a chef, I want the system to automatically identify cooking times in instructions so that timers are set up for me in Play Mode.

### Acceptance Criteria

- [ ] During import (any source) or manual entry, the system detects phrases like "simmer for 20 minutes".
- [ ] Detected times are automatically populated into the `timerInSeconds` field of the corresponding step.
- [ ] Users see a "Timer detected" notification or tool-tip to confirm the extraction.

### Technical Notes

- Use regex or NLP/LLM to identify duration patterns.
- Ensure timers are editable in the step manager.
