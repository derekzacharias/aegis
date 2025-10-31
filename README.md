# Aegis Compliance Control Center

A unified cybersecurity compliance platform targeting NIST 800-53, NIST CSF, CIS Controls, PCI DSS, and FedRAMP workflows. The project is structured as an Nx monorepo with a React (Vite) web client, NestJS API, and background worker service.

## Getting Started

> **Prerequisites:** Node.js 18+, npm, PostgreSQL 14+, Redis (optional for future queue support), and Headless Chrome for PDF rendering once implemented.

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional, WIP) Generate Prisma client and apply schema:
   ```bash
   npx prisma generate --schema apps/api/prisma/schema.prisma
   npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
   npm run db:migrate
   ```
   > ⚠️ The Prisma schema is still evolving for the persistence milestone, so these commands
   > may fail until the database layer is finalized.

3. (Optional) Seed baseline frameworks and sample controls:
   ```bash
   npx ts-node apps/api/prisma/seed.ts
   ```
   > Requires a configured database + Prisma client generation.
4. Launch services during development:
   ```bash
   # Start the in-memory API (returns seed data and captures create/update calls in memory)
   # Restart the command after making API code changes.
   npm run dev:api

   # Start the Vite dev server for the React UI
   npm run dev:web
   ```

   > The legacy Nx-powered command is still available as `npm run dev:nx`, but it requires
   > a fully configured database and Prisma client. For the UI MVP you can rely on the
   > in-memory API described above.

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

- `npm run dev` – Starts the Vite dev server for the React UI (alias for `dev:web`).
- `npm run dev:api` – Boots the in-memory NestJS API for UI development.
- `npm run dev:nx` – Original Nx orchestrator (requires database + Prisma setup).
- `npm run build` – Builds all projects.
- `npm run lint` – Lints all projects.
- `npm run test` – Executes Jest suites (currently placeholder).
- `npm run prisma:generate` – Generates Prisma client for the API service.

## Deployment Modes

The platform targets both multi-tenant SaaS (AWS GovCloud / Azure Gov) and self-hosted deployments. Helm charts and Terraform modules are planned to live under `deploy/` (to be added).

See `docs/architecture.md` and `docs/backlog.md` for implementation details and roadmap.
