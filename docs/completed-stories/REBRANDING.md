# Epic: KitchenCINC Rebranding (Completed)

## Objective

Rebrand the application to align with the "KitchenCINC" domain (where CINC stands for Chef-in-Chief) to establish a distinct, memorable brand identity.

## Scope & Constraints

- **Scope:** Broad overhaul of user-facing language, page titles, SEO metadata, layout headers, instructions, onboarding copy, and other brand assets to use "KitchenCINC" instead of "Mise-en-place".
- **Strict Invariants:**
  - Do **NOT** change the walkthrough section on the home page.
  - Do **NOT** change the overall color theme, CSS styling, or general card/page layouts.

## Implementation Steps (Stories)

### Story 1: Global Identity and Layout Rebranding

As a user, I want the application name, headers, and metadata to consistently refer to "KitchenCINC" so that the brand matches the new domain.

- **[x] AC 1:** The main layout navigation headers and brand logo text are updated from "Mise-en-place" to "KitchenCINC".
- **[x] AC 2:** Page-level metadata, browser titles, and SEO meta descriptions are updated in layout files to refer to "KitchenCINC".
- **[x] AC 3:** The home page hero text and landing page brand copy are updated to "KitchenCINC" and explain "Chef-in-Chief" (CINC), while keeping the walkthrough section completely unchanged.

### Story 2: Onboarding & User Copy Terminology Shift

As a user, I want the instructions, empty states, features copy, and onboarding text to refer to "KitchenCINC" so that terminology is unified.

- **[x] AC 1:** Any references to "Mise-en-place" in empty states, dashboard welcoming copy, pantry instructions, and meal planner info blocks are replaced with "KitchenCINC".
- **[x] AC 2:** All document templates, legal footer references, or other text copy across the application are checked and updated to align with the brand.
- **[x] AC 3:** Ensure no underlying CSS or styling frameworks (e.g. Tailwind or custom modules) are altered in the process.
