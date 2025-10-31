# Aegis Compliance Control Center

A unified cybersecurity compliance platform targeting NIST 800-53, NIST CSF, CIS Controls, PCI DSS, and FedRAMP workflows. The project is structured as an Nx monorepo with a React (Vite) web client, NestJS API, and background worker service.

## Getting Started

> **Prerequisites:** Node.js 18+, npm, PostgreSQL 14+, Redis (optional for future queue support), and Headless Chrome for PDF rendering once implemented.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Generate Prisma client and apply schema:
   ```bash
   npx prisma generate --schema apps/api/prisma/schema.prisma
   npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
   npm run db:migrate
   ```
3. Seed baseline frameworks and sample controls:
   ```bash
   npx ts-node apps/api/prisma/seed.ts
   ```
4. Launch services during development:
   ```bash
   npm run serve:api
   npm run serve:web
   ```

## Project Structure

- `apps/web` – React + Chakra UI frontend with TanStack Query data layer.
- `apps/api` – NestJS service with Prisma data access, modularized for frameworks, assessments, evidence, integrations, and reporting.
- `apps/worker` – NestJS application intended for background jobs (report generation, integration sync).
- `libs/shared` – Reusable TypeScript interfaces shared across services.

## Configuration

Create an `.env` in the repository root (or `apps/api/.env`) with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/compliance
JWT_SECRET=change-me
EVIDENCE_BUCKET=local-evidence
REPORT_BUCKET=local-reports
```

## Scripts

- `npm run dev` – Runs API and web dev servers in parallel.
- `npm run build` – Builds all projects.
- `npm run lint` – Lints all projects.
- `npm run test` – Executes Jest suites (currently placeholder).
- `npm run prisma:generate` – Generates Prisma client for the API service.

## Deployment Modes

The platform targets both multi-tenant SaaS (AWS GovCloud / Azure Gov) and self-hosted deployments. Helm charts and Terraform modules are planned to live under `deploy/` (to be added).

See `docs/architecture.md` and `docs/backlog.md` for implementation details and roadmap.
