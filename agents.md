# Automation Agents

This document captures the automation agent capabilities that exist in the Aegis Compliance Control Center today. The goal is to keep a running ledger of what has been delivered so far so we have a grounded baseline before layering in broader orchestration and packaging work.

## Concept

Automation agents are lightweight services and scripts that:

- Harvest evidence for specific control families (for example CIS benchmarks on GovCloud workloads).
- Offload long-running or recurring jobs (framework crosswalk calculations, report rendering, ticket syncs) from the primary API.
- Feed operational signals back into dashboards so reviewers can see what the platform is handling automatically.

## Current Implementation Snapshot

### Worker and Job Flow

- A dedicated NestJS worker application (`apps/worker`) now boots through `WorkerModule`, wires centralized configuration, and registers processors for background jobs.
- `ReportingProcessor` consumes the shared in-memory queue (`report.generate`), renders the Handlebars assessment template, exports HTML/PDF artifacts with Puppeteer, and stores them under `tmp/reports/` (with storage URIs recorded for API downloads).
- `EvidenceProcessor` listens for the new `evidence.ingest` jobs emitted after uploads are confirmed, logging placeholder AV / enrichment steps today so we can bolt on quarantine or metadata extraction in a future pass.
- Shared queue/record stores live in `libs/shared` so API, worker, and tests reuse the same job lifecycle logic without a broker; swapping to Redis/BullMQ remains a follow-on.
- `IntegrationProcessor` continues to orchestrate provider-specific outbound flows via `JiraIntegrationProvider` and `ServiceNowIntegrationProvider`, giving each connector a dedicated abstraction for `create`, `update`, and `sync` actions while retaining retry-friendly logging.
- Worker bootstrap logs the configured queue name so we can trace which deployment the agent executor is targeting.

### Continuous Monitoring Scheduler

- The worker now ships with a reusable `ScheduleRunner` that polls schedule definitions, executes registered job handlers, and reschedules future runs using dynamic timers. Handlers cover evidence review reminders, recurring assessment drafts, and agent health checks, each emitting structured logs in preparation for notification integrations.
- Schedule definitions load from an in-memory store by default but can be fetched over HTTP from the API when `SCHEDULER_API_BASE_URL` is configured, allowing the worker to stay stateless while the API manages CRUD.
- Shared schedule types live in `libs/shared`, giving the API, worker, and web client a common contract for frequencies, ownership, and payload metadata. Prisma schema updates reserve tables/relations so the scheduler can persist state during the persistence milestone.

### API Support

- `/auth` issues short-lived access tokens and seven-day refresh tokens, honours configurable password policy (`AUTH_PASSWORD_MIN_LENGTH`), and exposes `/auth/me` plus `/auth/logout`. Every route (except `/health`) is guarded by JWT + RBAC, so automation agents must authenticate exactly like the UI. Tokens respect `AUTH_ACCESS_TOKEN_TTL` / `AUTH_REFRESH_TOKEN_TTL`, giving us deterministic session windows for agent orchestration.
  - Recommendation: provision a dedicated service user per agent (for example `scheduler-agent@aegis.local`) via `POST /api/auth/register`, persist the issued refresh token in the agent’s secret store, and call `/api/auth/refresh` to rotate access tokens before each job burst. The seed script provisions an `ADMIN` account (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) that can bootstrap these service identities in development.
  - Agents should cache `accessTokenExpiresIn` and schedule refresh calls a few minutes before expiry; if a refresh fails, trigger a full login flow and alert operations so RBAC drift or password-policy changes are addressed quickly.
- `/reports` endpoints cover queueing, listing, job detail, and PDF download. RBAC restricts mutations to analysts/admins while allowing read-only/auditor access to status and download routes.
- `/integrations` exposes admin-only endpoints to initiate/complete OAuth, rotate secrets, and record mapping preferences. Webhooks for Jira and ServiceNow verify HMAC signatures before normalizing payloads into the in-memory task domain, keeping automation metrics accurate even without a database.
- `/frameworks/:id/crosswalk` serves the control crosswalk engine. The API blends seeded mappings with cosine-similarity suggestions, supports manual overrides, enforces tag normalization, and stores evidence reuse hints so agents (or analysts) can reapply artifacts across frameworks without leaving the queue flow.
- Evidence APIs now persist uploads with Prisma. `POST /evidence/uploads` returns pre-signed PUT URLs (S3 or local), local uploads stream through `PUT /evidence/uploads/:id/file?token=...`, and `POST /evidence/uploads/:id/confirm` records metadata/retention settings while dispatching ingestion jobs. A lightweight `POST /evidence` quick-create path lets agents register evidence without pushing binaries.
- Assessment endpoints read/write real projects through Prisma, exposing status transitions and progress counters that agents can nudge as they complete controls or raise reviews.
- Framework and evidence services seed automation-specific data (for example CIS scans uploaded by `automation@example.com`) so downstream agents have tangible artefacts to expand on.

### Frontend Touchpoints

- Settings → Integrations now includes full credential forms (scopes, OAuth initiation, webhook secrets) plus mapping editors that drive the worker's outbound adapters; the **Automation Agents** card still offers the CIS Benchmark toggle and placeholder download.
- Reports page triggers the new queue flow, polls status, surfaces requester/error metadata, and enables PDF download once the worker stores artifacts.
- Framework pages ship a Crosswalk Explorer where analysts can filter cross-framework suggestions, elevate them to manual mappings, and attach evidence guidance. These UI hooks consume the same endpoints that future automation agents will hit when they promote algorithmic matches or recycle uploaded evidence during bulk remediation.
- Dashboard widgets surface agent-driven activity (e.g. “CIS Control 4: Vulnerability scan import” owned by _Automation Agent_) so users see what the platform executed autonomously.
- Evidence and assessments views include agent-seeded records, grounding the UI in realistic automation output even before persistence lands.
- The new **Policies** experience consumes automation-friendly APIs: seeded policy authors/approvers double as mock actors, the UI injects `X-Actor-*` headers automatically, and version approvals route through the same role guard the future compliance agents will call when promoting controlled document updates.

### Policy & Procedure Automation Hooks

- Policy management data model (`PolicyDocument`, `PolicyVersion`, `PolicyApproval`) is fully wired for agents to ingest/export policy artifacts. The seed file provisions three automation personas (`alex`, `nina`, `owen`) so scripted agents can test role-specific behaviour without manual setup.
- `PolicyStorageService` mirrors the evidence bucket layout under `tmp/policy-artifacts/`, making it trivial for agents to upload generated policies (e.g., AI-drafted SOPs) and hand them off for approval.
- `PolicyService.submitForApproval` / `recordDecision` expose deterministic transitions that agents can call to escalate drafts or auto-approve/return versions based on checks (e.g., verifying mandatory sections). Unit tests at `apps/api/src/policy/policy.service.spec.ts` cover consensus promotion and rejection handling to keep the automation surface stable.
- Frontend hooks (`usePolicyActor`, `useUploadPolicyVersion`, `usePolicyDecision`) demonstrate how a headless agent would authenticate, submit versions, assign approvers, and record decisions—providing a blueprint for future CLI/bots.

## Operating the Agents Locally

Use these commands to exercise the current flow end-to-end:

```bash
# API (in-memory data, queues report jobs)
npm run dev:api

# Worker (processes queued jobs; runs Puppeteer headless)
npm run dev:worker

# Web client (optional, to drive the UI toggles and report queue)
npm run dev:web

# Run Prisma migrations (required for persisted auth/assessment/evidence flows)
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npx prisma generate --schema apps/api/prisma/schema.prisma

# Seed baseline data (admin account, assessments, evidence samples)
npx ts-node apps/api/prisma/seed.ts
```

With all three services running you can queue report jobs from the Reports page, watch the worker render HTML/PDF artifacts, and review the Automation Agent activity tiles on the dashboard for context.

### Session Close-Out Checklist (All Agents)

- **Commit & Sync:** Before you pivot to the next task, capture the current working state (`git status`, stage meaningful changes, and craft a commit). Even WIP commits on a feature branch are preferable to leaving untracked work that future automation can’t see.
- **Push Before Handoff:** Every agent must push verified commits (or a WIP branch) upstream at the end of a coding session. This keeps the shared automation surface aligned and guarantees follow-on agents operate from the latest code.
- **Log Follow-ups:** Note remaining TODOs in the issue tracker (or the agent runbook) so the next human/automated pass resumes without spelunking diffs.

_Automation roadmap:_ the scheduler will eventually host a “session close-out” job that watches idle branches, pings agents who haven’t pushed, and can auto-open WIP PRs. Until that automation lands, treat the checklist above as mandatory operating procedure.

## Validation & Reference Materials

- API integration behaviour is covered by unit tests in `apps/api/src/integration/integration.service.spec.ts` and the reporting queue contract in `apps/api/src/reporting/reporting.service.spec.ts`.
- Worker processors are validated via `apps/worker/src/workers/reporting.processor.spec.ts` (HTML/PDF lifecycle) and `apps/worker/src/reporting/report-template.spec.ts` (template rendering).
- Connector setup, OAuth prerequisites, and webhook signing instructions live in `docs/integrations.md`. The Near-term backlog links to this guide for quick access.
- Nx lint/test targets remain the preferred validation path; if the Nx daemon socket cannot start (e.g., `EPERM` on pseudo IPC), rerun with the daemon disabled once the environment allows it so automation-related regressions surface quickly.

## Next Enhancements to Track

- Package the CIS Benchmark Agent as an actual download artifact (Script or container + checksum) and wire the toggle to the API.
- Replace the in-memory integration/reporting stores with Prisma-backed persistence once the database milestone lands.
- Connect the worker to a real queue (Redis Streams, SQS, or BullMQ) so automation workloads survive restarts.
- Emit agent execution metrics that can populate the upcoming monitoring views and alerting hooks.
- Automate the session close-out checklist so the scheduler (or a Git integration agent) enforces branch pushes and opens PRs when a coding session ends without a sync.
