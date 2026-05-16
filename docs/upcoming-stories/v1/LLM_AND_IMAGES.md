# Upcoming Stories: Core LLM & Image Integration

## Story: Cloudflare R2 Image Storage

As a system administrator, I want to configure Cloudflare R2 as our image storage backend so that we can leverage a generous free tier for image hosting.

### Acceptance Criteria

- [ ] AC 1: Application can authenticate and upload objects to a Cloudflare R2 bucket.
- [ ] AC 2: Uploads are restricted to max 5MB in size.
- [ ] AC 3: Public URLs for uploaded images are correctly generated and accessible.

### Technical Notes

- Use `@aws-sdk/client-s3` for R2 compatibility.
- Store credentials in `.env` (not committed).

## Story: Recipe Image Attachments

As a user, I want to upload an image of my recipe so that I can see what the final dish looks like.

### Acceptance Criteria

- [ ] AC 1: Users can upload an image from the UI during recipe creation/editing.
- [ ] AC 2: Image URL is securely stored in the database associated with the recipe.
- [ ] AC 3: Images are displayed on the Recipe View page.

## Story: Unified Import UI & Intelligent Routing

As a user, I want a single "Import" button that handles all types of ingestion (URL, Text, or File Uploads) so that I have a consistent and straightforward way to add recipes.

### Acceptance Criteria

- [ ] AC 1: The Recipe Store includes an "Import" button that opens a modal with options: "Upload from URL", "Insert as Text", and "Upload File".
- [ ] AC 2: The "Upload File" option accepts `.txt`, `.pdf`, `.docx`, `.jpg`, `.jpeg`, and `.png` files.
- [ ] AC 3: The application intelligently routes the input:
  - URLs go to the existing web scraper.
  - Raw text goes directly to the LLM (GPT-4o Mini).
  - Images (`.jpg`, `.png`) go directly to the LLM's vision API.
  - Documents (`.pdf`, `.docx`) are first processed by extraction libraries (`pdf2json`, `mammoth`) to extract text, which is then sent to the LLM.
- [ ] AC 4: Extracted JSON data from any method drops the user into the "Edit Recipe" form to review/correct the AI's work before saving.

## Story: Edge Cases & Validation Handling

As a developer, I want to robustly handle parsing failures so that the user receives clear feedback when something goes wrong.

### Acceptance Criteria

- [ ] AC 1: If the AI determines the input contains NO valid recipe data, display a user-friendly error ("No recipe detected. Please check the file and try again.").
- [ ] AC 2: If the LLM times out or fails unexpectedly, gracefully catch the error and display a fallback message.

## Story: Bulk Import Draft Queue & Limits

As a user uploading a massive document with multiple recipes, I want the system to parse all of them so I can review them one by one.

### Acceptance Criteria

- [ ] AC 1: If a document contains multiple recipes, all recipes are extracted and saved in a new "Draft" status.
- [ ] AC 2: User is presented with a "Review Drafts" queue on their dashboard to manually review and publish each one via the Edit form.
- [ ] AC 3: If the total number of extracted recipes from a bulk import would cause the user to exceed their tier limit, the entire import is rejected upfront with a prompt to upgrade or delete old recipes.

## Story: Smart Timer Extraction

As a chef, I want the system to automatically identify cooking times in instructions so that timers are set up for me in Play Mode.

### Acceptance Criteria

- [ ] During AI import (any source) or manual entry, the system detects phrases like "simmer for 20 minutes".
- [ ] Detected times are automatically populated into the `timerInSeconds` field of the corresponding step.
- [ ] Users see a "Timer detected" notification or tool-tip to confirm the extraction.

### Technical Notes

- Prompt the LLM to extract these durations during the parsing phase.
- Ensure timers are editable in the step manager.
