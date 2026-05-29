# Epic: LLM, R2 & Import Workflow Management

## Objective

To enable rich multimedia recipe support and streamline bulk recipe ingestion by integrating Cloudflare R2 image hosting, building a unified AI recipe parser, and providing a dedicated "Drafts" workspace to review, link, and validate large imports.

## Scope & Impact

- **Storage:** Configure Cloudflare R2 client/server adapters for image uploads.
- **AI Engine:** Build a unified backend action leveraging GPT-4o Mini to parse raw text, PDFs, URLs, and image uploads into a structured JSON recipe format.
- **Drafts Dashboard:** Build a dedicated workspace within the Recipe Store to display unapproved bulk imports.
- **Auto-linking:** Implement sub-recipe detection during bulk ingestion.

## Implementation Steps (Stories)

### Story 1: Cloudflare R2 Image Hosting

As a user, I want my recipe images to be uploaded to and served from Cloudflare R2 so that pages load instantly and we stay within storage limit allocations.

- **AC 1:** Configure a secure server-side endpoint to generate pre-signed upload URLs for Cloudflare R2.
- **AC 2:** When a user uploads a recipe image, the client-side browser fetches the pre-signed URL and uploads the file directly to the Cloudflare R2 bucket. This bypasses the Next.js/Vercel serverless function payload size limits (avoiding 413 Payload Too Large errors for files up to 5MB). The resulting R2 image URL is then passed to the recipe parser and saved.
- **AC 3:** Files uploaded via client-side pre-signed URLs are placed inside a `tmp/` folder inside the R2 bucket. When a recipe import is finalized and successfully saved, the image is moved to a persistent `images/` directory in R2, or a server-side action copies it to a persistent key (the `tmp/` folder is subject to external auto-clearing).

### Story 2: Unified AI Import Parser

As a user, I want a single text/file intake form to import recipes so that I can easily ingest recipes from websites, PDFs, images, or word documents.

- **AC 1:** Build a single `/recipes/import` interface accepting URLs, pasted text, PDF/Word documents, and image files.
- **AC 2:** Parse the content into a standard recipe schema using structured Vercel AI SDK outputs.
- **AC 3:** Replace the content _locally_ inside the import modal container with an interactive loading spinner and helper text (e.g., "Processing...") displaying real-time processing updates as the AI reads and structure-parses the file, without taking over the entire screen.
- **AC 4:** Implement robust size validation and render coherent, user-friendly error messages _within_ the import modal in case of failure, removing the loading spinner and allowing the user to retry.

### Story 3: Dedicated "Draft Recipes" Workspace for Bulk Imports

As a user importing a large document of recipes, I want a dedicated "Drafts" workspace in the Recipe Store so that I can see and edit all imported drafts without being limited to a subset of reviews.

- **AC 1:** Create a "Draft Recipes" tab/section in the Recipe Store navigation.
- **AC 2:** When a multi-page document or batch of recipes is imported, save all parsed items with a `status: "DRAFT"` attribute.
- **AC 3:** The Draft Recipes dashboard lists all unapproved drafts in a clean, paginated grid.
- **AC 4:** Clicking a draft opens the editor; saving the editor updates its status to `status: "PUBLISHED"`, removing it from the Drafts workspace.

### Story 4: Sub-Recipe Auto-Linking on Import

As a user importing a batch of recipes, I want the import engine to automatically link parsed ingredients to other recipes in my library or the same import batch so that sub-recipes are correctly configured without manual step-by-step linking.

- **AC 1:** During bulk import, the import parser compares parsed ingredient names against both the user's existing recipes and the list of other recipes being imported in the same batch.
- **AC 2:** If a parsed ingredient matches the title of a recipe (via case-insensitive matching), it is automatically classified as a `sub-recipe` component rather than a plain `ingredient`.
- **AC 3:** The editor displays a clean visual link indicator to show that the ingredient has been successfully linked as a sub-recipe.
