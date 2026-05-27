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

- **AC 1:** Configure a secure client-side R2 upload endpoint using pre-signed URLs.
- **AC 2:** When a user uploads a recipe image, the upload is sent directly to R2 and its public URL is saved in the recipe record.

### Story 2: Unified AI Import Parser

As a user, I want a single text/file intake form to import recipes so that I can easily ingest recipes from websites, PDFs, images, or word documents.

- **AC 1:** Build a single `/recipes/import` interface accepting URLs, pasted text, PDF/Word documents, and image files.
- **AC 2:** Parse the content into a standard recipe schema using structured Vercel AI SDK outputs.
- **AC 3:** Replace the import dialog contents with an interactive loading spinner displaying real-time processing updates as the AI reads and structure-parses the file.
- **AC 4:** Implement robust size validation and render coherent, actionable error messages in the dialog in case of failure (e.g., if files exceed size/token/image limitations).

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
