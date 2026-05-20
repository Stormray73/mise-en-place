# Library Domain (Shared Logic)

## Overview

Contains the core business logic, data models, and utility functions that power the Mise-en-place platform.

## Key Modules

- **`units.ts` (Unit Conversion):** Handles sophisticated mass-to-volume and mass-to-count conversions. It uses a heuristic engine to scan USDA `foodPortions` for "whole item" weights (e.g., the weight of 1 medium onion) to enable recipe scaling and accurate macro calculations for discrete items.
- **`ai-parser.ts` (LLM Integration):** Interfaces with the Vercel AI SDK (OpenAI) to provide structured JSON outputs for recipe extraction, ingredient parsing, and vision-based image imports.
- **`r2.ts` (Object Storage):** Manages image uploads to Cloudflare R2 using an S3-compatible client.
- **`file-extractor.ts` (Document Processing):** Extracts raw text from `.pdf` and `.docx` files for downstream LLM processing.
- **`prisma.ts`:** Centralized Prisma client management with custom extensions for database retries and dynamic driver adapter selection (Neon Serverless vs. Native PG).

## Invariants & Constraints

- **Conversions:** All nutritional calculations are normalized to a 100g/ml base weight.
- **Structured Outputs:** AI schemas must use `.nullable()` for optional fields to satisfy OpenAI strict mode requirements.
