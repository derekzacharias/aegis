# Architecture Overview

## High-level Components

- **Web (React + Vite)** – Chakra UI driven interface with TanStack Query for data fetching, React Router for navigation, and modular sections for dashboard, frameworks, assessments, evidence, reporting, and settings.
- **API (NestJS)** – Modular service exposing REST endpoints. Integrates Prisma for PostgreSQL access and provides fallback in-memory data to support early iterations without a database.
- **Worker (NestJS)** – Application context intended for asynchronous jobs (report generation, integration sync, evidence ingestion). Currently stubs logging behaviour; planned to integrate with Redis/SQS.
- **Shared Library** – TypeScript types shared between frontend and backend to encourage contract consistency.

## Domain Modules

### Framework Registry
- Stores framework metadata (NIST SP 800-53 Rev5, NIST CSF 2.0, CIS v8, PCI DSS 4.0).
- Seeds controls and supports crosswalk mappings (modelled via `ControlMapping`).
- API: `GET /api/frameworks`.

#### Crosswalk Explorer
- API: `GET /api/frameworks/:id/crosswalk` accepts `targetFrameworkId`, `minConfidence`, `search`, `status`, `page`, and `pageSize` query params. Returns paginated matches with confidence scoring, provenance (SEED/ALGO/MANUAL), evidence hints, and applied filters.
- API: `POST /api/frameworks/:id/crosswalk` upserts manual mappings (confidence, rationale, optional evidence reuse hints) and invalidates cached explorer state.
- UI: React/Vite page at `/frameworks/:frameworkId/crosswalk` supports search, framework switching, match-type filtering, pagination, and CSV/JSON export. State is URL-driven to allow sharing filtered views.
- Data: Prisma seed (`apps/api/prisma/seed.ts`) now provisions representative controls and crosswalk mappings for every shipped framework (NIST SP 800-53, NIST CSF, CIS v8, PCI DSS) so development builds surface meaningful results.
- Limitations: suggestion engine relies on token similarity, so relevance degrades for sparse control descriptions; exports reflect the currently loaded page; pagination caps at 100 rows per request.

### Assessments
- `AssessmentProject` with statuses Draft/In-Progress/Complete.
- Many-to-many relation to frameworks via `AssessmentFramework`.
- `AssessmentControl` tracks per-control implementation status, owner and evidence links.
- API: `GET /api/assessments`, `POST /api/assessments` (create or queue future updates).

### Evidence Vault
- `EvidenceItem` entity linking to controls and frameworks via join tables.
- Supports review dates, status transitions, and secure storage URIs.
- API: `GET /api/evidence` (future endpoints for upload, attestation, retention).

### Integrations
- `IntegrationConnection` for Jira / ServiceNow credentials.
- API: `GET /api/integrations`, `PUT /api/integrations` (upsert connection).
- Worker will process outbound synchronization jobs (issue creation/update).

### Reporting
- Report service enqueues jobs for HTML/PDF export via a shared in-memory queue (BullMQ/Redis pluggable in future).
- API: `POST /api/reports` queues a job, `GET /api/reports` lists job status, `GET /api/reports/:id` returns metadata, and `GET /api/reports/:id/download` streams the rendered PDF (RBAC protected).
- Worker consumes the `report.generate` queue, renders hardened Handlebars templates, retries transient Chromium failures, and records immutable artifact metadata (schema version, assessment ID, generated-at timestamp, bucket, media type, byte size).
- Renderer configuration is exposed via `REPORT_RENDERER_*` variables (timeout, attempts, sandbox flags, Chromium executable path, memory limit, template override). Local mode (`REPORT_RENDERER_MODE=local`) flips headless off, enables DevTools, and relaxes sandboxing for developer convenience; CI/prod defaults preserve sandboxing.

### User Profiles
- Prisma-backed `User` records capture contact metadata (first/last name, job title, phone number, timezone, avatar URL, bio) plus audit trails in `UserProfileAudit`.
- API: `/api/users/me` (fetch/update), `/api/users/me/password`, `/api/users/me/audits`, and `/api/users/:id/role` for admin-led role changes. All endpoints are guarded by JWT + RBAC.
- Frontend: Settings → Profile presents editable Chakra forms with optimistic updates; audit history is sourced from the new audit table.

## Data Storage

- **PostgreSQL** – Primary relational store managed via Prisma. Schema defined in `apps/api/prisma/schema.prisma`.
- **Object Storage (S3 compatible)** – Evidence and report artifacts stored outside database; represented via `storageUri` in Prisma models.
- **Redis / Message Queue** – Planned for job scheduling (report generation, reminders, automation ingestion).

## Security Considerations

- Request validation via Nest `ValidationPipe` with class-validator.
- Helmet, CSRF (cookie-based) and cookie parser configured globally.
- JWT auth with refresh tokens (`AUTH_ACCESS_TOKEN_TTL`, `AUTH_REFRESH_TOKEN_TTL`) and profile hydration on login.
- Profile changes and password rotations create immutable audit entries, ensuring administrators can trace role or contact updates.
- FedRAMP compliance features: audit trail, customer-managed keys, deployment preferences captured in settings UI.

## Deployment Strategy

- Nx monorepo builds through GitHub Actions (to be added).
- Docker images for `web`, `api`, `worker` with multi-stage builds.
- Terraform modules for SaaS (AWS GovCloud) and self-hosted Kubernetes clusters.
- Observability via OpenTelemetry, Prometheus, and centralized logging (planned future work).

## Next Technical Milestones

1. Implement authentication/authorization (RBAC, SSO, MFA) across API/web.
2. Integrate Prisma migrations and persistence for control catalogs & assessments.
3. Wire worker queue with Redis/SQS and Puppeteer-based report rendering.
4. Build evidence upload API (pre-signed URLs, virus scan hooks).
5. Deliver integration flows (Jira issue mapping, ServiceNow ticket sync).
6. Add automated compliance agent ingestion (CIS benchmarks, vulnerability scans).
