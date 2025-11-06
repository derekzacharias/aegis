version 1.0

# Implementation Backlog

Our immediate goal is to mature Aegis into a framework-agnostic GRC platform that can evaluate and maintain compliance for whichever standards a customer selects—beginning with DoD RMF, FedRAMP, NIST CSF, ISO 27001, HIPAA, and PCI DSS—via automated assessment capabilities, and the backlog priorities below should be interpreted through that multi-framework lens even as we finalize the exact automation approach.

## Agile Backlog Structure

### Hierarchy
| Level | Meaning | Example |
| --- | --- | --- |
| Epic | A large functional area that delivers high-level value | Control Management |
| Feature | A distinct component of that epic | Control evidence upload |
| User Story | A single user goal expressed from the user’s point of view | “As an ISSO, I can upload evidence for a control so it can be reviewed by the SCA.” |
| Task | The technical work to implement that story | “Create API endpoint for file uploads” |

### Story Template
- Use: `As a [role], I want [goal], so that [reason].`
- Example: `As an ISSO, I want to upload security control evidence so that the Security Control Assessor can validate compliance.`

### Acceptance Criteria Guidelines
- Capture the observable conditions of satisfaction for each story.
- Example criteria:
  - User can select and upload files (PDF, DOCX, JPG).
  - System validates file size and type.
  - File is stored securely and linked to a control.
  - Reviewer can see and download it.
  - Upload is logged in the audit trail.

### Core Epics and Sample User Stories
- **Epic 1 – System & Workflow Management**  
  - As a System Owner, I can register a new system with metadata so it’s tracked in RMF.  
  - As an ISSO, I can see my assigned systems so I know which ones I manage.  
  - As a Reviewer, I can view RMF step progress so I know which stage the system is in.  
  - As an AO, I can approve or reject authorization requests so I can control ATO status.
- **Epic 2 – Security Control Management**  
  - As an ISSO, I can view all controls applicable to my system so I can track compliance.  
  - As an ISSE, I can update implementation statements so documentation stays current.  
  - As an SCA, I can mark a control as assessed so results are logged.  
  - As an AO, I can view compliance percentages so I can make informed authorization decisions.
- **Epic 3 – Evidence & Artifact Management**  
  - As an ISSO, I can upload evidence files for controls so assessors can review them.  
  - As an SCA, I can view evidence and leave comments so I can document my findings.  
  - As a System Owner, I can version artifacts so I can track changes over time.  
  - As an Admin, I can restrict access to evidence based on role so sensitive files remain secure.
- **Epic 4 – Authorization & Accreditation (A&A)**  
  - As an ISSO, I can generate a System Security Plan (SSP) from existing data so documentation is automated.  
  - As an SCA, I can upload a Security Assessment Report (SAR) so I can record test results.  
  - As an AO, I can approve an ATO package and record my decision so the system can operate.  
  - As a Reviewer, I can export a POA&M for reporting open risks.
- **Epic 5 – Asset & Configuration Management**  
  - As an ISSO, I can add assets so I know what’s in my system boundary.  
  - As a System Owner, I can link assets to controls so compliance is traceable.  
  - As a Security Engineer, I can import Nessus scan data so vulnerabilities appear automatically.  
  - As an Assessor, I can view compliance at the asset level so I can target fixes.
- **Epic 6 – Reporting & Dashboards**  
  - As an AO, I can view a dashboard showing control status by category so I can assess readiness.  
  - As an ISSO, I can generate an SSP report in PDF or Excel so I can submit it to leadership.  
  - As an Admin, I can view compliance trends over time so I can monitor progress.  
  - As a Manager, I can export enterprise metrics so I can brief leadership.
- **Epic 7 – Integration & API**  
  - As a DevSecOps Engineer, I can connect vulnerability scanners so scan data imports automatically.  
  - As a Developer, I can use an API to retrieve control status so I can build dashboards.  
  - As an Automation Engineer, I can trigger updates via webhook when scans complete.  
  - As a System Admin, I can integrate SSO/CAC login so users authenticate securely.
- **Epic 8 – Collaboration & Communication**  
  - As an ISSO, I can tag an assessor in a comment on a control so I can request clarification.  
  - As a Reviewer, I can reply to comments so we can resolve findings collaboratively.  
  - As a System Owner, I can see discussion history per control so decisions are transparent.
- **Epic 9 – Continuous Monitoring & Automation**  
  - As an ISSO, I can schedule periodic control reassessments so compliance stays current.  
  - As a Security Engineer, I can receive alerts when controls drift from baseline.  
  - As an SCA, I can track POA&M item closure automatically when findings resolve.  
  - As a Manager, I can see trend analysis showing risk reduction over time.
- **Epic 10 – Access Control & Security**  
  - As an Admin, I can assign roles so users only access what’s needed.  
  - As a User, I can log in using CAC/SSO so authentication meets DoD policy.  
  - As an Auditor, I can view immutable logs of all actions for accountability.  
  - As a System Owner, I can configure permissions per artifact or control.

### Technical Implementation Stories
- As a Developer, I can define SQLAlchemy models for Control, System, and Evidence entities.
- As a Developer, I can implement FastAPI endpoints for control CRUD operations.
- As a Developer, I can build a React dashboard showing control compliance percentages.

### MVP Prioritization
1. System registration & RMF workflow
2. Control management (CRUD + status)
3. Evidence upload & linking
4. ATO package generation (baseline SSP export)
5. Dashboard summary (core compliance metrics)

### Delivery Guidance
- Iterate epic by epic; for each user story include backend scaffolding, secured endpoints, UI, and automated tests.
- Apply acceptance criteria during refinement to ensure “definition of done” clarity before implementation begins.

## Near-term (MVP)
1. **Authentication & RBAC** – ✅ Hardened JWT rotation (per-refresh `jti`, issuer/audience claims, failure blacklisting), enforced configurable password complexity, and shipped a reusable `npm run test:db-smoke` Prisma migration/seed smoke test. _Next: surface refresh-invalidated events in the admin UI and add audit trails for service-user token issuance._
2. **Persist Assessments/Evidence** – ✅ Replace fallback stores with Prisma CRUD operations, harden Prisma migrations for idempotent replays, and expose npm scripts for the full workflow (`npm run db:migrate`, `npm run prisma:generate`, `npm run prisma:seed`, `npm run test:db-smoke`). ✅ GitHub Actions CI now runs the Prisma smoke test against a scratch Postgres instance on every PR. _Next: add Buildkite parity and archive migration logs for easier failure triage._
3. **Evidence Upload Pipeline** – Pre-signed URL issuance, file metadata capture, retention policies, reviewer workflow, and ingestion agent that records scan results/quarantine actions. ✅ ClamAV-backed scans now record telemetry, UI cards surface scan timelines/status/notes, reprocessing flows quarantine failures with reviewer alerts, the ops dashboard surfaces AV health metrics (scan volume, detections, failures, quarantine inventory, and latency trends), and clean re-scans can auto-release quarantined evidence per configurable policy with admin controls and notifications. _Next: log automatic release events to the evidence timeline and surface release history in the Evidence Vault UI._
4. **Report Rendering** – ✅ Harden the worker renderer with sandbox-configurable Puppeteer launch options, retries/backoff for transient failures, metadata durability (version, bucket, timestamps, media type, byte length), sanitized template loading, new operational runbook, and surfaced report metadata/version history in both API responses and the reports UI. _Next: wire artifact persistence into object storage and add end-to-end download verification in CI once the Nx test harness is repaired._
5. **Integration Webhooks** – ✅ Completed Jira/ServiceNow connectors with OAuth flows, tenant-scoped signed webhook ingestion, and mapping configuration UI. _Next: expand coverage to GitHub Issues and ServiceNow change tickets while surfacing integration health telemetry in the ops dashboard._
6. **Unit & E2E Tests** – ✅ Front-end suites now share a central `jest-environment-jsdom` setup with DOM polyfills, and new scripts (`npm run test:dom`, `npm run test:node`, `npm run affected:test`) clarify how to target each environment. ✅ Playwright smoke coverage now lives under `apps/web-e2e` with an auth-flow spec and `npm run test:e2e` helper. _Next: wire the Playwright target into CI once agents allow pseudo-IPC sockets and expand coverage beyond the login happy path._
7. **Assessment Lifecycle Hardening** – ✅ Replace in-memory stores with Prisma persistence, expose full CRUD (status transitions, owner updates, control/task linkage), add audit logging, and ship frontend workspace tooling. _Next: add granular progress caching for large assessments and bulk status update APIs for control groups._
8. **Service User Playbooks** – ✅ Documented provisioning and RBAC guidance, added structured refresh-failure audits/metrics, and published `/users/profile` monitoring notes so operators can trace agent activity end-to-end.
9. **User Provisioning Workflow** – ✅ Extended the Settings › Users experience with invitation flows, forced password resets, bulk role management, and CSV exports for FedRAMP audit packages. _Next: surface invitation acceptance telemetry in the admin dashboard and wire email delivery to tenant-configurable providers._
10. **Profile & Notification Sync** – ✅ Settings → Profile now surfaces `UserProfileAudit` history, admin role controls, timezone/phone helpers, lazy audit loading, and worker notifications now hydrate payloads with enriched profile metadata plus alerting for stale or incomplete contact details. ✅ Ops dashboard presents contact completeness metrics with attention lists, and a scheduled worker now sends reminders to users with missing or stale contact fields. _Next: trend completeness over time, expose reminder delivery telemetry in the ops dashboard, and add tenant controls for reminder cadence._
11. **Custom Framework Publish Hooks** – ✅ Publishing a framework now enqueues a worker warmup job that refreshes crosswalk suggestions, precomputes control catalog facets, writes cache snapshots, and retries up to three times with metrics/logging. ✅ A follow-on reporter processor fans out `report.generate` jobs for complete assessments referencing the framework, with retry/backoff and telemetry. _Next: surface warmup/report status in the admin UI and extend caching to target-specific crosswalk filters._
12. **Agent-driven Framework Imports** – Expose CLI/script examples for seeding frameworks via the new API (CSV/JSON payloads), add smoke tests, and enforce metadata/ownership validation before publish.
13. **Automated Assessment Methodology** – Define how automated compliance assessments will execute across customer-selected frameworks by comparing resident agents versus SSH-mediated runs, spiking orchestrations with tools like Ansible and Chef InSpec, and capturing decision criteria (coverage depth, rollout complexity, operational risk). Deliverables include a recommendation doc, early proof-of-concept jobs, and integration guidance for the selected method.
14. **CIS Benchmark Agent Packaging** – Deliver the CIS Benchmark agent as a downloadable artifact (script or container) with published checksums, and connect the existing UI toggle to API flows that serve the artifact metadata, enforce role-based access, and track download attempts for auditability. _Next: document deployment prerequisites, add smoke tests for checksum validation, and wire automated publishing into the release pipeline._
15. **Prisma-backed Integration & Reporting Stores** – Replace remaining in-memory integration and reporting data stores with Prisma persistence so automation state survives restarts and can participate in transactional workflows. _Next: design migration scripts for current schemas, add repository-level integration tests, and update worker/API modules to share the new persistence layer._
16. **Durable Queue Infrastructure** – Connect the worker and API to a production-ready queue such as Redis Streams, SQS, or BullMQ so long-running automation jobs persist across failures. _Next: prototype adapters for the shortlisted providers, add retry/backoff telemetry, and expose configuration toggles that allow local development to continue using the in-memory queue._
17. **Automation Metrics & Observability** – Emit structured metrics for agent execution (throughput, latency, failure rates) that feed the upcoming monitoring dashboards and alerting hooks. _Next: centralize metric emission in `MetricsService`, instrument critical processors, and document dashboard queries for ops teams._
18. **Session Close-out Automation** – Automate the branch close-out checklist by introducing a scheduler job that detects idle work-in-progress branches, notifies responsible users, and opens draft PRs when necessary. _Next: model branch activity metadata, integrate with the notification bridge, and add admin controls to tune thresholds per environment._
19. **Documentation Hub** – ✅ Added an in-app Documentation space with policy user/admin guides, badge-driven summaries, and Markdown download support. _Next: index additional product areas (assessments, evidence, integrations), add search/filtering, and automate publishing from the docs repository._

## Mid-term
1. **Control Crosswalk Engine** – ✅ API/UI now ship paginated crosswalk responses with search, match-type filters, CSV/JSON export, and richer seed data across NIST, CIS, PCI, and CSF. _Next: tune similarity scoring with TF-IDF weights, persist manual overrides via Prisma (instead of seeds), and add regression tests for multi-tenant data scopes._
2. **Continuous Monitoring Scheduler** – ✅ Initial worker + API skeleton live with in-memory schedules and UI controls; upgrade to Prisma persistence and notification integrations next.
3. **Policy/Procedure Management** – ✅ Shipped the two-pane policy workspace with retention controls, version approvals, audit logging, and in-app documentation for authors/administrators. _Next: automate audit-ready exports, back artifacts with object storage, and align reporting templates with policy metadata._
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

## Compliance Automation Platform Backlog

### 1. Product Vision & Goals

#### Vision
- Create an automation platform that:
  - Runs compliance scans using Chef InSpec and/or Ansible STIG/CIS playbooks.
  - Aggregates and stores results centrally.
  - Displays compliance vs. non-compliance visually via dashboards.
  - Provides APIs for reporting, alerting, and evidence generation.
  - Enables continuous compliance through scheduled or event-driven scans.

#### Strategic Goals
| Goal | Description |
| --- | --- |
| Automate | Replace manual STIG/CIS validation with code-driven scans. |
| Visualize | Deliver interactive dashboards showing pass/fail, trend, and severity data. |
| Remediate | Integrate with Ansible for automated fix actions. |
| Govern | Export results for ATO packages, POA&M items, or eMASS-style evidence. |

### 2. High-Level Epics
| Epic ID | Epic Name | Description |
| --- | --- | --- |
| E1 | Scan Engine Integration | Connect to Chef InSpec and Ansible for compliance data collection. |
| E2 | Data Storage & Normalization | Store and normalize scan results in a unified schema. |
| E3 | Compliance Dashboard | Visualize compliance and non-compliance across systems and controls. |
| E4 | Reporting & Evidence Export | Generate human-readable and machine-readable reports. |
| E5 | Scheduling & Automation | Enable scheduled scans and event triggers. |
| E6 | Remediation Automation | Use Ansible to fix failed findings. |
| E7 | User & Role Management | Manage authentication, authorization, and audit logs. |
| E8 | API & Integration Layer | Provide REST / GraphQL API for external tools. |
| E9 | Continuous Improvement | Add trend analysis, risk scoring, and historical baselines. |

### 3. User Stories & Acceptance Criteria

#### Epic E1 — Scan Engine Integration
- **As a DevSecOps Engineer, I can run a Chef InSpec profile against a target so I can evaluate compliance.**  
  - CLI/REST trigger runs `inspec exec`; results stored in JSON.
- **As a System Owner, I can select Ansible playbooks or roles to perform hardening or scans.**  
  - Drop-down or YAML config to choose Ansible content; logs visible.
- **As an Admin, I can define credentials and connection types (SSH, WinRM, cloud API).**  
  - Securely stored secrets; test-connection button.
- **As a User, I can see scan history per host.**  
  - Paginated table showing scan date, tool, result ID.

#### Epic E2 — Data Storage & Normalization
- **As a Developer, I can parse InSpec JSON and Ansible results into a normalized schema.**  
  - Common fields: control_id, status, severity, evidence.
- **As a Security Analyst, I can correlate findings across tools.**  
  - Duplicate detection; unified view by control ID.
- **As an Admin, I can archive old scans.**  
  - Retention policy configurable; archived data marked “inactive.”

#### Epic E3 — Compliance Dashboard
- **As an ISSO, I can view compliance % per system.**  
  - Donut chart = passed vs failed controls.
- **As a Manager, I can view non-compliant controls grouped by severity.**  
  - Table + filter by CAT I/II/III or High/Med/Low.
- **As a System Owner, I can drill down into a specific finding.**  
  - Modal or page shows description, evidence, remediation steps.
- **As an Executive, I can export a dashboard view as PDF/PNG.**  
  - Button triggers snapshot export.

#### Epic E4 — Reporting & Evidence Export
- **As an Auditor, I can download compliance reports in CSV/JSON/PDF.**  
  - Export endpoint and UI button.
- **As a Security Engineer, I can generate before/after comparisons.**  
  - Diff view shows delta by control.
- **As an AO, I can receive a POA&M report listing failed controls.**  
  - Export grouped by status and due date.

#### Epic E5 — Scheduling & Automation
- **As a DevOps Lead, I can schedule scans daily, weekly, or on commit.**  
  - Cron-style scheduler in UI/API.
- **As a Pipeline Manager, I can trigger scans from CI/CD.**  
  - GitHub Action/Jenkins step examples.
- **As a User, I receive email/Slack alerts on scan completion.**  
  - Configurable notification channels.

#### Epic E6 — Remediation Automation
- **As a Security Engineer, I can generate Ansible playbooks for failed controls.**  
  - Auto-generated YAML from findings.
- **As an ISSO, I can run remediation tasks directly from the UI.**  
  - “Remediate” button triggers Ansible run.
- **As an Auditor, I can verify remediations post-run.**  
  - Follow-up scan automatically scheduled.

#### Epic E7 — User & Role Management
- **As an Admin, I can create roles (Admin, Engineer, Viewer).**  
  - RBAC enforced on endpoints.
- **As a User, I can log in via SSO or CAC.**  
  - OIDC/SAML integration configured.
- **As an Auditor, I can view immutable action logs.**  
  - Tamper-evident audit trail UI.

#### Epic E8 — API & Integration Layer
- **As a Developer, I can call a REST endpoint to start a scan.**  
  - `POST /api/scans` accepts JSON payload.
- **As a Dashboard Developer, I can query compliance data per system or control.**  
  - `GET /api/results?system_id=` returns filtered data.
- **As a Tool Integrator, I can send scan results to external GRC systems.**  
  - Webhook or export function available.

#### Epic E9 — Continuous Improvement
- **As a Manager, I can see trends over time for compliance scores.**  
  - Line chart by week/month.
- **As a Security Engineer, I can calculate risk scores per asset.**  
  - Weighted scoring based on severity and impact.
- **As an Analyst, I can compare benchmarks (STIG vs CIS).**  
  - Toggle benchmark type in dashboard.

### 4. Recommended Sprint Roadmap
| Sprint | Goal | Key Deliverables |
| --- | --- | --- |
| Sprint 1 (MVP) | Integrate Chef InSpec & Ansible runners | CLI execution, JSON parsing, baseline storage. |
| Sprint 2 | Build data schema + REST API | FastAPI backend, Postgres models, CRUD for scans. |
| Sprint 3 | Create Compliance Dashboard (UI) | React charts + filters for pass/fail. |
| Sprint 4 | Add Reporting & Evidence Exports | PDF/CSV reports, delta view. |
| Sprint 5 | Implement Scheduling & Notifications | Job scheduler + email/Slack alerts. |
| Sprint 6 | Remediation Automation | Generate/run Ansible fix playbooks. |
| Sprint 7 | RBAC & Audit Logging | Secure user management. |
| Sprint 8+ | Trend Analysis & API Integrations | Time-series metrics, external connectors. |

### 5. Example Codex Prompt for Implementation
You are building a compliance automation platform that integrates Chef InSpec and Ansible.

Sprint 1 (MVP) Objectives:
1. Scaffold FastAPI backend with modules:
   - scans (trigger, monitor)
   - results (store normalized data)
2. Implement CLI integration:
   - Run `inspec exec <profile> --reporter json`
   - Parse JSON to Postgres
3. Create React frontend:
   - Upload target config
   - View basic pass/fail summary
4. Provide REST endpoints for scan start, list, and result retrieval.
5. Unit tests for parser and API.

Use PostgreSQL, SQLAlchemy, JWT auth, and Celery for async jobs.
