# Implementation Backlog

## Near-term (MVP)
1. **Authentication & RBAC** – Implement JWT auth, password reset, and role-based API guards; integrate with frontend session management.
2. **Persist Assessments/Evidence** – Replace fallback stores with Prisma CRUD operations and add migrations/testing.
3. **Evidence Upload Pipeline** – Pre-signed URL issuance, file metadata capture, retention policies, reviewer workflow, and ingestion agent that records scan results/quarantine actions. _Next: integrate a real AV engine (e.g. ClamAV/Lambda), emit reviewer notifications on failures, and add a reprocessing endpoint for quarantined artifacts._
4. **Report Rendering** – Integrate Puppeteer in worker to render HTML templates and produce FedRAMP-ready PDFs; add storage handling.
5. **Integration Webhooks** – Complete Jira/ServiceNow connectors with OAuth, webhook ingestion, and mapping configuration. _(See `docs/integrations.md` for setup notes.)_
6. **Unit & E2E Tests** – Add Jest and Playwright coverage for critical flows (framework browsing, assessment creation, report queueing). _Next: add `jest-environment-jsdom` so web suites run locally and re-run Nx lint/test when pseudo-IPC socket permissions are available._
7. **Assessment Lifecycle Hardening** – ✅ Replace in-memory stores with Prisma persistence, expose full CRUD (status transitions, owner updates, control/task linkage), add audit logging, and ship frontend workspace tooling. _Next: add granular progress caching for large assessments and bulk status update APIs for control groups._
8. **Service User Playbooks** – Capture end-to-end guidance for provisioning automation identities (per-agent accounts, RBAC assignments, password rotation), wire health alerts for failed refresh tokens, and extend `/users/profile` docs so operators can audit agent-driven changes.
9. **Profile & Notification Sync** – Build UI around `UserProfileAudit`, surface audit trails in settings, and ensure worker notifications hydrate profile metadata (name, timezone, phone) before dispatching Slack/email payloads.
10. **Custom Framework Publish Hooks** – Trigger worker jobs when drafts are published (kick off crosswalk regeneration, warm control catalog caches, notify report queue), add integration tests, and capture retry logic for failed background runs.
11. **Agent-driven Framework Imports** – Expose CLI/script examples for seeding frameworks via the new API (CSV/JSON payloads), add smoke tests, and enforce metadata/ownership validation before publish.

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
