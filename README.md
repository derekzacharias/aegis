# Aegis Compliance Control Center

A unified cybersecurity compliance platform targeting NIST 800-53, NIST CSF, CIS Controls, PCI DSS, and FedRAMP workflows. The project is structured as an Nx monorepo with a React (Vite) web client, NestJS API, and background worker service.

## Getting Started

> **Prerequisites:** Node.js 18+, npm, PostgreSQL 14+, Redis (optional for future queue support).
> Report generation requires system libraries for headless Chromium (Ubuntu/Debian: `apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-dev libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2`) and runs Puppeteer in headless mode by default.

### Quick start

The easiest way to bring everything up locally is with the provided runner:

```bash
./run
```

It will:

- verify/install Node dependencies and generate the Prisma client if needed
- ensure PostgreSQL is reachable (starting the `aegis-postgres` Docker container when available)
- run pending Prisma migrations and seed baseline data (admin user, sample org, frameworks, etc.)
- launch the API (`npm run dev:api`) and web UI (`npm run dev:web`) together with the Nx daemon disabled to avoid socket issues
- stream both service logs to the terminal while also writing them to timestamped files under `logs/<run-id>/`

When both services are ready you will see a message like:

```
✅  Aegis UI is ready at http://localhost:4200/. Use your credentials (default: admin@aegis.local / ChangeMeNow!42) to sign in.
```

All output for the current session is stored in `logs/latest`, so you can inspect `api.log`, `web.log`, or `run.log` after the fact.

If you prefer to operate the services manually, follow the steps below.

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional, WIP) Generate Prisma client and apply schema:
   ```bash
   npm run prisma:generate
   npm run db:migrate
   ```
   > ⚠️ The Prisma schema is still evolving for the persistence milestone, so these commands
   > may fail until the database layer is finalized.

3. (Optional) Seed baseline data (frameworks, initial admin user, sample evidence records):
   ```bash
   npm run prisma:seed
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

### Testing

- `npm run test` – run every Jest target (Node + jsdom).
- `npm run test:node` – back-end and shared-library suites only.
- `npm run test:dom` – browser-oriented suites (React, DOM utilities).
- `npm run affected:test` – Nx-aware test subset for CI and pre-commit workflows.
- See `docs/testing.md` for deeper guidance on environments, polyfills, and debugging tips.

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

### Custom Framework Builder

- **Wizard-driven workflow** – Analysts and admins can create drafts, import controls from CSV or JSON, enrich metadata, and publish bespoke catalogs. Drafts persist metadata and are resumable.
- **API endpoints** – `/frameworks` handles create/update/draft storage, `/:frameworkId/controls` persists control definitions atomically, and `/:frameworkId/publish` promotes drafts. All operations are scoped by organization.
- **Control metadata** – Tags, baselines, keywords, and manual mappings are stored via Prisma and surfaced instantly to catalogs, crosswalks, and assessments.
- **Documentation** – see `docs/custom-frameworks.md` for import schemas, governance notes, and testing guidance.

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
AUTH_PASSWORD_COMPLEXITY=lower,upper,digit,symbol
AUTH_TOKEN_ISSUER=aegis-api
AUTH_TOKEN_AUDIENCE=aegis-clients
CORS_ORIGINS=http://localhost:4200     # comma-separated list of allowed web origins
EVIDENCE_BUCKET=local-evidence
EVIDENCE_STORAGE_MODE=local            # 'local' (default) or 's3'
EVIDENCE_STORAGE_ENDPOINT=             # optional S3/MinIO endpoint
EVIDENCE_STORAGE_REGION=us-east-1
EVIDENCE_STORAGE_ACCESS_KEY=
EVIDENCE_STORAGE_SECRET_KEY=
EVIDENCE_STORAGE_FORCE_PATH_STYLE=true
EVIDENCE_UPLOAD_URL_TTL=900            # seconds; lifespan of presigned PUT URLs
EVIDENCE_LOCAL_DIR=./tmp/evidence      # filesystem path for local uploads
EVIDENCE_SCAN_ENABLED=true             # enable antivirus scans (ClamAV by default)
EVIDENCE_SCAN_ENGINE=clamav
EVIDENCE_SCAN_CLAMD_PATH=clamdscan     # override if clamdscan is not on PATH
EVIDENCE_SCAN_TIMEOUT_MS=10000         # worker-side CLI timeout in ms
EVIDENCE_SCAN_QUARANTINE_ON_ERROR=true # quarantine evidence when scans fail
NOTIFICATION_SERVICE_URL=              # optional; POST endpoint for reviewer alerts
NOTIFICATION_EVIDENCE_CHANNEL=evidence-reviewers
REPORT_BUCKET=local-reports
SCHEDULER_REFRESH_INTERVAL_MS=180000
# Optional: select the default UI actor for policy workflows (falls back to seeded analyst)
VITE_POLICY_ACTOR_EMAIL=alex.mercier@example.com
# Optional: point the worker scheduler at the live API instance
# SCHEDULER_API_BASE_URL=http://localhost:3333/api
```

> Tip: add any LAN/external URL you use to reach Vite (for example `http://192.168.20.13:4200`) to `CORS_ORIGINS` so the API accepts requests from that origin during development.

### Authentication & RBAC

- **API endpoints** – `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`,
  `/api/auth/logout`, and `/api/auth/me` provide session issuance, rotation, and profile
  lookups. Access tokens are bearer JWTs (15 minute default expiry) signed with
  `JWT_SECRET`; refresh tokens expire after seven days.
- **Password policy** – Registrations enforce a minimum character length (default 12) and
  configurable complexity. Adjust `AUTH_PASSWORD_MIN_LENGTH` for length and
  `AUTH_PASSWORD_COMPLEXITY` (comma-separated mix of `lower`, `upper`, `digit`, `symbol`) to
  mirror your password standard. The same rules apply to `/api/users/me/password`.
- **RBAC** – Nest guards wrap every controller except health. Use the `@Roles()` decorator to
  scope endpoints to specific roles (`ADMIN`, `ANALYST`, `AUDITOR`, `READ_ONLY`). The seeded
  admin account (configurable via `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`) can invite or
  register new members during development.
- **Service users** – Follow the [Service User Playbooks](docs/service-users.md) to provision
  automation accounts, manage their credentials, and subscribe to refresh-token health alerts.
- **Frontend** – The React app now presents a login screen, stores sessions in `localStorage`,
  handles automatic refresh, and surfaces authorization errors at the top of the shell.

### User Profile Management

- **API endpoints** – `/api/users/me` (fetch), `/api/users/me` `PATCH` (update contact details),
  `/api/users/me/password` (change password), `/api/users/me/audits` (recent change history),
  and `/api/users/:id/role` (admin-only role updates). Each write is covered by class-validator
  DTOs and recorded in `UserProfileAudit` for traceability.
- **Stored fields** – Profiles now capture `phoneNumber`, `jobTitle`, `timezone`, `avatarUrl`,
  and `bio` in addition to first/last name. Avatar values are stored as HTTPS URLs so you can
  point to your preferred asset store; no binary upload pipeline is required.
- **Frontend experience** – Settings → Profile presents editable Chakra forms with optimistic
  updates, audit history, and password-change workflows. Administrators see a role selector that
  calls the admin endpoint while other roles receive a read-only summary.
- **Password changes** – Successful updates invalidate refresh tokens server-side; the current
  session continues until its access token expires, but subsequent refreshes require the new
  credentials. The password form enforces the same complexity rules as registration.

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
- Detailed environment settings and manual QA scenarios are captured in
  [`docs/evidence.md`](docs/evidence.md).

## Scripts

- `npm run dev` – Starts the Vite dev server for the React UI (alias for `dev:web`).
- `npm run dev:api` – Boots the in-memory NestJS API for UI development.
- `npm run dev:nx` – Original Nx orchestrator (requires database + Prisma setup).
- `npm run build` – Builds all projects.
- `npm run lint` – Lints all projects.
- `npm run test` – Executes Jest suites (currently placeholder).
- `npm run prisma:generate` – Generates Prisma client for the API service.
- `npm run test:db-smoke` – Runs Prisma migrations and seed scripts to validate schema drift in CI.
- `npx nx test api` / `npx nx test web` – Run the backend/frontend Jest suites (auth + guard
  smoke tests included).

## Manual QA Checklist

Use the seeded admin account (or a freshly registered user) to verify the profile experience end-to-end:

1. Sign in, open **Settings → Profile**, and update contact fields (name, job title, timezone, avatar URL, bio). Confirm the toast notification and refreshed metadata.
2. Enter an invalid phone number (e.g., `abc123`) and ensure the form surfaces validation feedback without saving.
3. Change the password with an incorrect current value (expect an error) and then with a valid new password (expect success and the form to reset).
4. Toggle **Show audit history** and confirm that recent edits appear with actor, field, and timestamp details.
5. For an admin user, adjust the role selector and verify the change persists after a reload; non-admin users should see a read-only role summary.

## Deployment Modes

The platform targets both multi-tenant SaaS (AWS GovCloud / Azure Gov) and self-hosted deployments. Helm charts and Terraform modules are planned to live under `deploy/` (to be added).

See `docs/architecture.md`, `docs/control-catalog.md`, and `docs/backlog.md` for implementation details and roadmap.
