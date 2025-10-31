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
- Report service queues jobs for HTML/PDF export (backed by worker).
- API: `POST /api/reports` returns queued job metadata.

## Data Storage

- **PostgreSQL** – Primary relational store managed via Prisma. Schema defined in `apps/api/prisma/schema.prisma`.
- **Object Storage (S3 compatible)** – Evidence and report artifacts stored outside database; represented via `storageUri` in Prisma models.
- **Redis / Message Queue** – Planned for job scheduling (report generation, reminders, automation ingestion).

## Security Considerations

- Request validation via Nest `ValidationPipe` with class-validator.
- Helmet, CSRF (cookie-based) and cookie parser configured globally.
- JWT auth (future): placeholder secrets captured in config.
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
