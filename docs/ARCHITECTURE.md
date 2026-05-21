# Architecture & Deployment

## Core Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict mode enabled)
- **Database:** Postgres, managed via Prisma. Uses the **Neon Serverless** driver adapter in production (edge/serverless compatible) and the standard **native PG** driver locally. Both are configured dynamically in `lib/prisma.ts`.
- **ORM:** Prisma
- **Styles:** Tailwind CSS for global utilities; CSS Modules (`.module.css`) for page-scoped styles (e.g., `app/login/login.module.css`).

## CI/CD Pipeline (GitHub Actions)

Triggered on: `push` to `main` and all `pull_request`.

**Jobs:**

1. **Lint:** Runs `npm run lint`.
2. **Test:** Runs `npm run test` (Vitest).
3. **Security:** Runs `npm audit` to screen for vulnerabilities.
4. **Build:** Runs `npm run build`.

## Vercel Integration

- **Deployment:** Vercel automatically deploys the `main` branch once CI/CD checks pass.
- **Environment Variables:** Managed via the Vercel Dashboard and pulled locally using `npx vercel env pull .env.local`.
- **Database Connection:** Managed via Prisma with the Neon Serverless adapter (`@neondatabase/serverless`). Local development uses a standard Postgres connection string.
