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
- `ReportingProcessor` logs lifecycle events for queued report jobs and simulates the rendering delay while we stub out Puppeteer integration.
- `IntegrationProcessor` provides the scaffolding for Jira and ServiceNow sync jobs, including structured payload logging and the retry-friendly delay placeholder.
- Worker bootstrap logs the configured queue name so we can trace which deployment the agent executor is targeting.

### API Support
- `/reports` endpoints queue reporting jobs and expose their status, ensuring the worker has an explicit contract to pull from.
- `/integrations` exposes CRUD-like operations with in-memory state so the automation pipeline can reflect connection health without depending on PostgreSQL yet.
- Framework and evidence services feed automation-specific seed data (for example CIS scans uploaded by `automation@example.com`) that downstream agents will expand on.

### Frontend Touchpoints
- Settings → Integrations surfaces an **Automation Agents** card where operators can toggle the CIS Benchmark Agent and download the (placeholder) package.
- Dashboard widgets surface agent-driven activity (e.g. “CIS Control 4: Vulnerability scan import” owned by _Automation Agent_) so users see what the platform executed autonomously.
- Evidence and assessments views include agent-seeded records, grounding the UI in realistic automation output even before persistence lands.

## Operating the Agents Locally

Use these commands to exercise the current flow end-to-end:

```bash
# API (in-memory data, queues report jobs)
npm run dev:api

# Worker (processes queued jobs; uses build target under the hood)
npx nx serve worker

# Web client (optional, to drive the UI toggles and report queue)
npm run dev:web
```

With all three services running you can queue report jobs from the Reports page, observe worker logs as they “process” them, and review the Automation Agent activity tiles on the dashboard for context.

## Next Enhancements to Track

- Package the CIS Benchmark Agent as an actual download artifact (Script or container + checksum) and wire the toggle to the API.
- Replace the in-memory integration/reporting stores with Prisma-backed persistence once the database milestone lands.
- Connect the worker to a real queue (Redis Streams, SQS, or BullMQ) so automation workloads survive restarts.
- Emit agent execution metrics that can populate the upcoming monitoring views and alerting hooks.
