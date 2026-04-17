# Mise-en-place: The Chef's One-Stop-Shop

## Overview

Mise-en-place is a Next.js web application designed for chefs who want to streamline their recipe management, meal planning, pantry monitoring, and shopping lists.

## Documentation Index

- [Core Features](./docs/FEATURES.md): Detailed functionality breakdown.
- [Testing & Quality Standards](./docs/TESTING.md): TDD rules, linting, and Husky enforcement.
- [Architecture & Deployment](./docs/ARCHITECTURE.md): Tech stack and CI/CD strategy.

## Tech Stack Highlights

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict)
- **ORM:** Prisma
- **Database:** Vercel Postgres
- **Testing:** Vitest + React Testing Library
- **CI/CD:** GitHub Actions + Vercel

## Critical Rules

- **TDD Mandatory:** All new features must be developed using Test-Driven Development.
- **Strict Linting:** No linting errors are permitted in pushed code.
- **Pre-push Hooks:** All tests and linters MUST pass locally before a push is allowed.
- **Modular Context:** Keep documentation focused and split across the files linked above to minimize agent context overhead.
