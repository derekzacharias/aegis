version 1.0

# Implementation Backlog

Our immediate goal is to mature Aegis into a framework-agnostic GRC platform that can evaluate and maintain compliance for whichever standards a customer selects—beginning with DoD RMF, FedRAMP, NIST CSF, ISO 27001, HIPAA, and PCI DSS—via automated assessment capabilities, and the backlog priorities below should be interpreted through that multi-framework lens even as we finalize the exact automation approach.

## Near-term (MVP)
1. **Authentication & RBAC** – ✅ Hardened JWT rotation (per-refresh `jti`, issuer/audience claims, failure blacklisting), enforced configurable password complexity, and shipped a reusable `npm run test:db-smoke` Prisma migration/seed smoke test. _Next: surface refresh-invalidated events in the admin UI and add audit trails for service-user token issuance._
2. **Persist Assessments/Evidence** – ✅ Replace fallback stores with Prisma CRUD operations, harden Prisma migrations for idempotent replays, and expose npm scripts for the full workflow (`npm run db:migrate`, `npm run prisma:generate`, `npm run prisma:seed`, `npm run test:db-smoke`). _Next: wire the smoke script into CI (GitHub Actions / Buildkite) so every PR validates migrations against a scratch database._
3. **Evidence Upload Pipeline** – Pre-signed URL issuance, file metadata capture, retention policies, reviewer workflow, and ingestion agent that records scan results/quarantine actions. ✅ ClamAV-backed scans now record telemetry, UI cards surface scan timelines/status/notes, and reprocessing flows quarantine failures with reviewer alerts. _Next: publish AV health metrics to the ops dashboard and add configurable auto-release policies once a clean re-scan completes._
4. **Report Rendering** – ✅ Harden the worker renderer with sandbox-configurable Puppeteer launch options, retries/backoff for transient failures, metadata durability (version, bucket, timestamps, media type, byte length), sanitized template loading, and new operational runbook. _Next: wire artifact persistence into object storage, add end-to-end download verification in CI once Nx test harness is repaired, and surface report metadata/version history in the API/UI._
5. **Integration Webhooks** – Complete Jira/ServiceNow connectors with OAuth, webhook ingestion, and mapping configuration. _(See `docs/integrations.md` for setup notes.)_
6. **Unit & E2E Tests** – ✅ Front-end suites now share a central `jest-environment-jsdom` setup with DOM polyfills, and new scripts (`npm run test:dom`, `npm run test:node`, `npm run affected:test`) clarify how to target each environment. _Next: restore Playwright smoke coverage and re-run Nx lint/test pipelines once the host allows pseudo-IPC sockets so the cache reflects the new config._
7. **Assessment Lifecycle Hardening** – ✅ Replace in-memory stores with Prisma persistence, expose full CRUD (status transitions, owner updates, control/task linkage), add audit logging, and ship frontend workspace tooling. _Next: add granular progress caching for large assessments and bulk status update APIs for control groups._
8. **Service User Playbooks** – ✅ Documented provisioning and RBAC guidance, added structured refresh-failure audits/metrics, and published `/users/profile` monitoring notes so operators can trace agent activity end-to-end.
13. **User Provisioning Workflow** – Extend the new Settings › Users experience with invite emails and forced password reset flows, plus bulk role management and CSV export for FedRAMP audit packages.
9. **Profile & Notification Sync** – Build UI around `UserProfileAudit`, surface audit trails in settings, and ensure worker notifications hydrate profile metadata (name, timezone, phone) before dispatching Slack/email payloads.
10. **Custom Framework Publish Hooks** – Trigger worker jobs when drafts are published (kick off crosswalk regeneration, warm control catalog caches, notify report queue), add integration tests, and capture retry logic for failed background runs.
11. **Agent-driven Framework Imports** – Expose CLI/script examples for seeding frameworks via the new API (CSV/JSON payloads), add smoke tests, and enforce metadata/ownership validation before publish.
12. **Automated Assessment Methodology** – Define how automated compliance assessments will execute across customer-selected frameworks by comparing resident agents versus SSH-mediated runs, spiking orchestrations with tools like Ansible and Chef InSpec, and capturing decision criteria (coverage depth, rollout complexity, operational risk). Deliverables include a recommendation doc, early proof-of-concept jobs, and integration guidance for the selected method.
14. **CIS Benchmark Agent Packaging** – Deliver the CIS Benchmark agent as a downloadable artifact (script or container) with published checksums, and connect the existing UI toggle to API flows that serve the artifact metadata, enforce role-based access, and track download attempts for auditability. _Next: document deployment prerequisites, add smoke tests for checksum validation, and wire automated publishing into the release pipeline._
15. **Prisma-backed Integration & Reporting Stores** – Replace remaining in-memory integration and reporting data stores with Prisma persistence so automation state survives restarts and can participate in transactional workflows. _Next: design migration scripts for current schemas, add repository-level integration tests, and update worker/API modules to share the new persistence layer._
16. **Durable Queue Infrastructure** – Connect the worker and API to a production-ready queue such as Redis Streams, SQS, or BullMQ so long-running automation jobs persist across failures. _Next: prototype adapters for the shortlisted providers, add retry/backoff telemetry, and expose configuration toggles that allow local development to continue using the in-memory queue._
17. **Automation Metrics & Observability** – Emit structured metrics for agent execution (throughput, latency, failure rates) that feed the upcoming monitoring dashboards and alerting hooks. _Next: centralize metric emission in `MetricsService`, instrument critical processors, and document dashboard queries for ops teams._
18. **Session Close-out Automation** – Automate the branch close-out checklist by introducing a scheduler job that detects idle work-in-progress branches, notifies responsible users, and opens draft PRs when necessary. _Next: model branch activity metadata, integrate with the notification bridge, and add admin controls to tune thresholds per environment._

## Mid-term
1. **Control Crosswalk Engine** – ✅ API/UI now ship paginated crosswalk responses with search, match-type filters, CSV/JSON export, and richer seed data across NIST, CIS, PCI, and CSF. _Next: tune similarity scoring with TF-IDF weights, persist manual overrides via Prisma (instead of seeds), and add regression tests for multi-tenant data scopes._
2. **Continuous Monitoring Scheduler** – ✅ Initial worker + API skeleton live with in-memory schedules and UI controls; upgrade to Prisma persistence and notification integrations next.
3. **Policy/Procedure Management** – Versioned document storage, approval workflow, and audit export.
4. **FedRAMP Package Builder** – Generate SSP, SAP, SAR skeletons using stored data.
5. **Infrastructure-as-Code Artifacts** – Helm charts, Terraform modules for SaaS/self-hosted deployments with compliance hardening.
6. **Agent Credential Lifecycle** – Introduce automated credential rotation hooks (secret manager integration, rotation playbooks), record last-used metadata per agent, and expose dashboards to track dormant or over-privileged service accounts.
7. **Framework Intelligence Agents** – Build background services that analyse newly published custom frameworks, recommend crosswalk targets, and auto-tag controls for assessments/evidence reuse.

## Long-term
1. **AI-assisted Gap Analysis** – NLP-powered control guidance, risk scoring, and remediation recommendations.
2. **Marketplace & Auditor Portal** – External auditor access with scoped permissions, secure artifact sharing, and engagement tracking.
3. **Data Residency & Key Management** – Customer managed keys, per-tenant encryption policy, and geographic pinning.
4. **Compliance Agent Ecosystem** – Extensible agent framework for CIS benchmarks, vulnerability scans, and cloud posture tools.

## Low-priority
1. **Containerization & Dockerized Deployments** – Create Dockerfiles for services, add Docker Compose orchestration, and document container-based rollout once core platform features stabilize.
