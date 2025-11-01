# Aegis Compliance Control Center

A unified cybersecurity compliance platform targeting NIST 800-53, NIST CSF, CIS Controls, PCI DSS, and FedRAMP workflows. The project is structured as an Nx monorepo with a React (Vite) web client, NestJS API, and background worker service.

## Getting Started

> **Prerequisites:** Node.js 18+, npm, PostgreSQL 14+, Redis (optional for future queue support).
> Report generation requires system libraries for headless Chromium (Ubuntu/Debian: `apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-dev libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2`) and runs Puppeteer in headless mode by default.

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

3. (Optional) Seed baseline data (frameworks, initial admin user, sample evidence records):
   ```bash
   npx ts-node apps/api/prisma/seed.ts
   ```
   > Requires a configured database + Prisma client generation. The seed script respects
   > `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` if you want to customize the default
   > administrator account (defaults to `admin@aegis.local` / `ChangeMeNow!42`).
4. Launch services during development:
   ```bash
   # Start the in-memory API (returns seed data and captures create/update calls in memory)
   # Restart the command after making API code changes.
   npm run dev:api

   # Start the Vite dev server for the React UI
   npm run dev:web

   # Start the worker with the in-memory queue + Puppeteer renderer
   npm run dev:worker
   ```

   > The legacy Nx-powered command is still available as `npm run dev:nx`, but it requires
   > a fully configured database and Prisma client. For the UI MVP you can rely on the
   > in-memory API described above.

## Project Structure

- `apps/web` – React + Chakra UI frontend with TanStack Query data layer.
- `apps/api` – NestJS service with Prisma data access, modularized for frameworks, assessments, evidence, integrations, reporting, and policy management.
- `apps/worker` – NestJS application intended for background jobs (report generation, integration sync).
- `libs/shared` – Reusable TypeScript interfaces shared across services.

### Policy & Procedure Management

The mid-term policy management backlog item is now scaffolded end-to-end:

- **Data model** – `PolicyDocument`, `PolicyVersion`, and `PolicyApproval` tables with relational ties to `Organization` and `User`. Prisma migrations (`20240901000000_policy_management`) and seed data create sample authors/approvers and two baseline policies.
- **API module** – `PolicyModule` exposes CRUD, version promotion, approval workflows, artifact downloads, and participant discovery guarded by role-aware RBAC. Storage writes land under `tmp/policy-artifacts/` (mirrors the evidence bucket semantics).
- **Frontend UI** – `/policies` route surfaces inventory, version history, side-by-side comparison, submission, decision capture, and an audit trail of approvals. A lightweight actor switcher (tied to seeded users) injects `X-Actor-Id/X-Actor-Email` headers for RBAC simulation.
- **Testing** – Jest unit tests cover critical approval transitions (submit, approve, reject gating).
- **Documentation** – see `docs/policies.md` for workflow diagrams, role expectations, and API usage.

## Configuration

Create an `.env` in the repository root (or `apps/api/.env`) with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/compliance
JWT_SECRET=change-me
SEED_ADMIN_EMAIL=admin@aegis.local
SEED_ADMIN_PASSWORD=ChangeMeNow!42
AUTH_ACCESS_TOKEN_TTL=900              # seconds (default 15 minutes)
AUTH_REFRESH_TOKEN_TTL=604800          # seconds (default 7 days)
AUTH_PASSWORD_MIN_LENGTH=12
AUTH_PASSWORD_MIN_LENGTH=12            # enforce password policy at register/login
EVIDENCE_BUCKET=local-evidence
EVIDENCE_STORAGE_MODE=local            # 'local' (default) or 's3'
EVIDENCE_STORAGE_ENDPOINT=             # optional S3/MinIO endpoint
EVIDENCE_STORAGE_REGION=us-east-1
EVIDENCE_STORAGE_ACCESS_KEY=
EVIDENCE_STORAGE_SECRET_KEY=
EVIDENCE_STORAGE_FORCE_PATH_STYLE=true
EVIDENCE_UPLOAD_URL_TTL=900            # seconds; lifespan of presigned PUT URLs
EVIDENCE_LOCAL_DIR=./tmp/evidence      # filesystem path for local uploads
REPORT_BUCKET=local-reports
SCHEDULER_REFRESH_INTERVAL_MS=180000
# Optional: select the default UI actor for policy workflows (falls back to seeded analyst)
VITE_POLICY_ACTOR_EMAIL=alex.mercier@example.com
# Optional: point the worker scheduler at the live API instance
# SCHEDULER_API_BASE_URL=http://localhost:3333/api
```

### Authentication & RBAC

- **API endpoints** – `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`,
  `/api/auth/logout`, and `/api/auth/me` provide session issuance, rotation, and profile
  lookups. Access tokens are bearer JWTs (15 minute default expiry) signed with
  `JWT_SECRET`; refresh tokens expire after seven days.
- **Password policy** – Registrations enforce a minimum character length (default 12) and
  require upper/lowercase letters, a number, and a special character. Tweak
  `AUTH_PASSWORD_MIN_LENGTH` (and the validator in
  `apps/api/src/auth/dto/register.dto.ts`) to tighten or relax the rules.
- **RBAC** – Nest guards wrap every controller except health. Use the `@Roles()` decorator to
  scope endpoints to specific roles (`ADMIN`, `ANALYST`, `AUDITOR`, `READ_ONLY`). The seeded
  admin account (configurable via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`) can invite or
  register new members during development.
- **Frontend** – The React app now presents a login screen, stores sessions in `localStorage`,
  handles automatic refresh, and surfaces authorization errors at the top of the shell.

### Evidence Upload Pipeline

- The evidence module persists uploads using Prisma models (`EvidenceItem`, `EvidenceUploadRequest`,
  `EvidenceStatusHistory`) and enforces retention metadata, reviewer assignment, and ingestion
  status tracking.
- `POST /api/evidence/uploads` returns a pre-signed PUT URL (AWS S3 compatible). In `local`
  storage mode the URL points to `/api/evidence/uploads/:id/file?token=...` and streams files
  into `EVIDENCE_LOCAL_DIR`. Switch to `s3` mode by setting `EVIDENCE_STORAGE_MODE=s3` and
  providing the S3 configuration variables above (install `@aws-sdk/client-s3` and
  `@aws-sdk/s3-request-presigner` to enable this mode).
- After uploading the binary, clients call `POST /api/evidence/uploads/:id/confirm` to persist
  metadata (frameworks, controls, retention policy, reviewer). An ingestion job is dispatched
  to the worker for virus scanning / enrichment (currently a stub that logs activity).

## Scripts

- `npm run dev` – Starts the Vite dev server for the React UI (alias for `dev:web`).
- `npm run dev:api` – Boots the in-memory NestJS API for UI development.
- `npm run dev:nx` – Original Nx orchestrator (requires database + Prisma setup).
- `npm run build` – Builds all projects.
- `npm run lint` – Lints all projects.
- `npm run test` – Executes Jest suites (currently placeholder).
- `npm run prisma:generate` – Generates Prisma client for the API service.
- `npx nx test api` / `npx nx test web` – Run the backend/frontend Jest suites (auth + guard
  smoke tests included).

## Deployment Modes

The platform targets both multi-tenant SaaS (AWS GovCloud / Azure Gov) and self-hosted deployments. Helm charts and Terraform modules are planned to live under `deploy/` (to be added).

See `docs/architecture.md` and `docs/backlog.md` for implementation details and roadmap.
