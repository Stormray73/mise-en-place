# Feedback Backlog

This file serves as a temporary intake for raw, unsorted user feedback and feature requests. Items here are periodically triaged into `BUGS.md`, `ROADMAP.md`, or specific epics in `docs/upcoming-stories/`.

---

## Unsorted Feedback

- I'm not seeing feedback from the Open Food Facts API in the search dropdown when editing an ingredient - only items tagged with USDA. Should items coming back from the Open Food Facts API be marked with OFF?

- In your most recent change, you've switched the placement of the previous and next week buttons in the meal planner. Please switch them back - I want the previous week button on the left and the next week button on the right

- When importing a document or image, there needs to be better feedback to the user to show what's going on. When the user clicks import, I would like the contents of the upload modal to be replaced with the loading spinner that's used to transition between pages with helper text that says 'Processing...' or something similar. If there is an error, the loading spinner should be removed and a useful error message should be displayed to the user so they know the upload has failed.

- When importing recipes via larger images (e.g. 4.5 MB), the upload fails with a 413 Payload Too Large error on Vercel due to the 4.5 MB serverless payload size limit. We need to implement a presigned URL flow to upload images directly to the Cloudflare R2 bucket from the client-side browser, bypassing the Next.js server/Vercel serverless function limits entirely, and then pass only the R2 image URL to the recipe parser.
