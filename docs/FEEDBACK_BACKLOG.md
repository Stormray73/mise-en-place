# Feedback Backlog

This file serves as a temporary intake for raw, unsorted user feedback and feature requests. Items here are periodically triaged into `BUGS.md`, `ROADMAP.md`, or specific epics in `docs/upcoming-stories/`.

---

## Unsorted Feedback

- Duplicate checkboxes when editing ingredients, remove the boxes outlined in the red square in ./docs/scratch/additional-ingredient-checkboxes.png, and move the buttons below into that place. Keep the other checkboxes where they are

- Add the ability for the user to add measurement information and to mark an ingredient as optional or to taste when they search for it (so they don't have to click in and edit) once its been added

- When importing a large file, it looks like only 4 recipes get imported when I use the import document feature. I'm using a word document that has the same recipes as College Recipes.txt (./docs/scratch) and only the first four recipes are being added to my drafts (see ./docs/scratch/draft-recipes-import.png) - How are we handing data off to OpenAI?

- Let's replace the contents of the import dialog with some sort of loading spinner (can we get live updates from OpenAI as it processes?) so that the user has feedback. If there's a failure, there should be a coherent error message in that dialog. (ie. if the file's too large for example) Does OpenAI have image upload limits?
