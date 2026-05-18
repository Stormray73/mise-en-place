# Product Roadmap

This document outlines the priority implementation order for features and polish items, split into v1.0 (Core Stability) and v2.0 (Stretch Goals).

---

## v1.0: Core Polish & Stability (High Priority)

The goal of v1.0 is to refine the existing feature set into a rock-solid experience.

### 1. UI/UX Polish & Refinement

- **Full-Width Layouts:** Widen Meal Planner and Recipe Store to match Pantry/Shopping list and design mockups.
- **Navigation:** Add "Current Week" button and swap previous/next week positions for better ergonomics.
- **Recipe Cards:** Fix hover icon overlap on recipe squares.
- **Documentation:** [v1/UI_UX_POLISH.md](docs/upcoming-stories/v1/UI_UX_POLISH.md)

### 2. Advanced Scheduling & Ordering

- **Ordering:** Logic to sort meals by time of day (Breakfast > Lunch > Dinner).
- **Flexibility:** Drag-and-drop custom meals and exclude recipes from prep-ahead.
- **Documentation:** [v1/ADVANCED_SCHEDULING.md](docs/upcoming-stories/v1/ADVANCED_SCHEDULING.md)

### 3. Pantry & Shopping v2.0

- **Bulk Tracking:** Support for "X packages of Y" format (e.g., 12x 12oz tins).
- **Location Management:** Dropdown-based location management via modal.
- **Flexibility:** Manual entry for non-recipe items (e.g., paper towels).
- **Documentation:** [v1/PANTRY_AND_SHOPPING_v2.md](docs/upcoming-stories/v1/PANTRY_AND_SHOPPING_v2.md)

### 4. Dashboard Enhancements

- **Quick Access:** Integrate shopping list with direct-add capabilities into the dashboard.
- **Documentation:** [v1/DASHBOARD_ENHANCEMENTS.md](docs/upcoming-stories/v1/DASHBOARD_ENHANCEMENTS.md)

### 5. Core LLM & Image Integration

- **Storage:** Cloudflare R2 for generous free tier image hosting.
- **Parsing:** Unified import (URL, Text, PDF, .docx, Image) via GPT-4o Mini.
- **Review:** All AI imports drop users into the Edit form for validation.
- **Documentation:** [v1/LLM_AND_IMAGES.md](docs/upcoming-stories/v1/LLM_AND_IMAGES.md)

### 6. User Tiers & Admin Portal

- **Monetization:** Free vs. Pro tiers with recipe and AI usage limits.
- **Admin:** Manual tier override portal for early adopters and admins.
- **Documentation:** [v1/USER_TIERS.md](docs/upcoming-stories/v1/USER_TIERS.md)

---

## v2.0: Stretch Features (Lower Priority)

Major overhauls and community features deferred until after v1.0.

- **Affiliate Marketing:** "Shop this Recipe" integration for monetization. [v2/AFFILIATE_MARKETING.md](docs/upcoming-stories/v2/AFFILIATE_MARKETING.md)
- **Community Sharing:** Public links and discovery database. [v2/COMMUNITY_SHARING.md](docs/upcoming-stories/v2/COMMUNITY_SHARING.md)
- **Ingredient Mastery Phase 2:** Crowdsourcing and verification. [v2/INGREDIENT_MASTERY.md](docs/upcoming-stories/v2/INGREDIENT_MASTERY.md)

---

## Completed Features

- **Custom Ingredients:** Inline creation and management (Story 3).
- **Favorites & Tags:** Organization system (Story 2).
- **Web Scraping Import:** URL-based extraction (Story 5).
- **Dashboard Hub:** Quick actions and responsive grid (Story 11).
