# Implementation Backlog

## Near-term (MVP)
1. **Authentication & RBAC** – Implement JWT auth, password reset, and role-based API guards; integrate with frontend session management.
2. **Persist Assessments/Evidence** – Replace fallback stores with Prisma CRUD operations and add migrations/testing.
3. **Evidence Upload Pipeline** – Pre-signed URL issuance, file metadata capture, retention policies, and reviewer workflow.
4. **Report Rendering** – Integrate Puppeteer in worker to render HTML templates and produce FedRAMP-ready PDFs; add storage handling.
5. **Integration Webhooks** – Complete Jira/ServiceNow connectors with OAuth, webhook ingestion, and mapping configuration.
6. **Unit & E2E Tests** – Add Jest and Playwright coverage for critical flows (framework browsing, assessment creation, report queueing).

## Mid-term
1. **Control Crosswalk Engine** – Compute mappings between frameworks, suggest evidence reuse, expose API and UI visualizations.
2. **Continuous Monitoring Scheduler** – Cron-based jobs for evidence review reminders, recurring assessments, and agent health checks.
3. **Policy/Procedure Management** – Versioned document storage, approval workflow, and audit export.
4. **FedRAMP Package Builder** – Generate SSP, SAP, SAR skeletons using stored data.
5. **Infrastructure-as-Code Artifacts** – Helm charts, Terraform modules for SaaS/self-hosted deployments with compliance hardening.

## Long-term
1. **AI-assisted Gap Analysis** – NLP-powered control guidance, risk scoring, and remediation recommendations.
2. **Marketplace & Auditor Portal** – External auditor access with scoped permissions, secure artifact sharing, and engagement tracking.
3. **Data Residency & Key Management** – Customer managed keys, per-tenant encryption policy, and geographic pinning.
4. **Compliance Agent Ecosystem** – Extensible agent framework for CIS benchmarks, vulnerability scans, and cloud posture tools.
