# Architecture & Deployment

## Core Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (Strict mode enabled)
- **Database:** Vercel Postgres (Serverless)
- **ORM:** Prisma
- **Styles:** Tailwind CSS (Default)

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
- **Database Connection:** Managed via `@vercel/postgres` and Prisma.
