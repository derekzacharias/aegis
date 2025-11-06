import { DocCollection } from './docs.types';

export const docsCollection: DocCollection = {
  version: '1.0.0',
  updatedAt: new Date('2025-02-15T00:00:00Z').toISOString(),
  categories: [
    {
      id: 'overview',
      title: 'Overview',
      description:
        'Understand the mission of AegisGRC, the compliance standards it automates, and who benefits from the platform.',
      order: 1,
      sections: [
        {
          id: 'overview-introduction',
          slug: 'overview/introduction',
          title: 'What is AegisGRC?',
          summary: 'Platform goals, stakeholders, and supported frameworks.',
          order: 1,
          content: `# AegisGRC Overview

AegisGRC is a compliance automation platform that streamlines security hardening and control verification for **DevSecOps teams**, **system owners**, and **auditors**.  
It delivers continuous assurance by codifying security baselines, executing assessments, and translating evidence into actionable reports.

### Why AegisGRC?
- Reduce manual effort for Authority to Operate (ATO) packages.
- Provide a single pane of glass across **NIST RMF**, **NIST CSF**, **DoD STIGs**, and **CIS Benchmarks**.
- Produce auditor-friendly artifacts while giving engineers GitOps-style workflows.

### Supported Standards
| Program | Coverage |
| --- | --- |
| RMF (DoD / FedRAMP) | Control inheritance, POA&M tracking, automated evidence |
| NIST Cybersecurity Framework | Policy mapping, risk tiers, dashboards |
| STIG Baselines | Ansible hardening roles and InSpec verification profiles |
| CIS Benchmarks | OS and cloud workload baselines, drift detection |

> **Audience:** DevSecOps engineers, compliance managers, ISSOs, auditors, and executive stakeholders tracking readiness.`,
          icon: 'Compass'
        }
      ]
    },
    {
      id: 'architecture',
      title: 'Architecture',
      description: 'How the platform is composed and how data moves between services.',
      order: 2,
      sections: [
        {
          id: 'architecture-high-level',
          slug: 'architecture/high-level',
          title: 'System Topology',
          order: 1,
          content: `# Architecture Overview

The AegisGRC architecture is intentionally modular so security operations can scale with new control families and environments.

\`\`\`
┌────────────────────┐      ┌──────────────────────┐
│ React 18 + Vite UI │◄────►│ FastAPI Gateway      │
│ (Tailwind + shadcn)│      │ JWT + RBAC           │
└─────────┬──────────┘      └──────────┬───────────┘
          │                             │
          │ GraphQL/REST                │ Celery Tasks
          ▼                             ▼
┌────────────────────┐      ┌──────────────────────┐
│ PostgreSQL (RDS)   │      │ Celery + Redis Queue │
│ Compliance Models  │      │ Runner Orchestration │
└────────────────────┘      └──────────┬───────────┘
                                       │
                                       │ SSH/WinRM/HTTPS
                                       ▼
                         ┌────────────────────────────┐
                         │ Secure Runners (Ansible,   │
                         │ Chef InSpec, Custom Tools) │
                         └────────────────────────────┘
\`\`\`

**Integrations**: Jira/ServiceNow for ticketing, SIEM pipelines for evidence logging, S3/SharePoint for artifact storage.`,
          icon: 'Network'
        },
        {
          id: 'architecture-components',
          slug: 'architecture/components',
          title: 'Key Components',
          order: 2,
          content: `### Component Summary
- **Frontend** — React 18 application built with Vite, Tailwind, and shadcn/ui. Provides dashboards, runbooks, and configuration interfaces.
- **API Layer** — FastAPI service exposing REST and WebSocket endpoints. Handles authentication, RBAC, and orchestration commands.
- **Workers** — Celery workers triggered by Redis. Execute scans, parse results, fill evidence queues, and send notifications.
- **Data Stores** — PostgreSQL for normalized compliance data, S3 for raw artifacts, Redis for task coordination.
- **Runners** — Containerized Ansible and Chef InSpec environments that connect over SSH/WinRM/VPN to customer assets.`,
          icon: 'Layers'
        }
      ]
    },
    {
      id: 'core-technologies',
      title: 'Core Technologies',
      description: 'Deep dive into the services and frameworks that power AegisGRC.',
      order: 3,
      sections: [
        {
          id: 'core-fastapi',
          slug: 'core/fastapi',
          title: 'FastAPI',
          order: 1,
          content: `## FastAPI — Service Backbone

- Provides typed REST endpoints with automatic OpenAPI documentation.
- Integrates with OAuth2 / SAML SSO providers for secure authentication.
- Emits audit logs through middleware to track every configuration change.

**Example: Querying scan summaries**
\`\`\`bash
curl -H "Authorization: Bearer <token>" \\
  https://aegis.example.com/api/scans?status=FAILED
\`\`\`

**Endpoint Highlights**
- \`GET /api/scans\` — list compliance runs with filtering.
- \`POST /api/baselines/{id}/execute\` — triggers an Ansible deployment.
- \`GET /api/reports/{id}/download\` — retrieve signed PDF artifacts.`,
          icon: 'Server'
        },
        {
          id: 'core-postgresql',
          slug: 'core/postgresql',
          title: 'PostgreSQL',
          order: 2,
          content: `## PostgreSQL — Compliance Data Hub

- Stores normalized relationships between systems, controls, scans, and findings.
- Uses row-level security to enforce tenant boundaries.
- Supports JSONB fields for custom evidence metadata and assessor notes.

**Schema Snapshot**
\`\`\`sql
SELECT system_id, control_id, status, assessed_at
FROM compliance.findings
WHERE status = 'FAILED'
ORDER BY assessed_at DESC
LIMIT 10;
\`\`\``,
          icon: 'Database'
        },
        {
          id: 'core-celery',
          slug: 'core/celery',
          title: 'Celery & Redis',
          order: 3,
          content: `## Celery + Redis — Async Orchestration

- Celery workers manage long-running tasks such as scan execution, report rendering, and evidence ingestion.
- Redis provides durable queuing with retry semantics and exponential backoff.
- Workers emit structured events (\`scan.started\`, \`scan.completed\`, \`report.exported\`) consumed by the UI in real time.`,
          icon: 'Workflow'
        },
        {
          id: 'core-react',
          slug: 'core/react',
          title: 'React + Vite',
          order: 4,
          content: `## React 18 + Vite — Experience Layer

- Uses React Router for SPA navigation and React Query for data synchronization.
- Tailwind + shadcn/ui deliver consistent typography, cards, and tabs with minimal CSS debt.
- Supports light/dark themes, inline code diff viewers, and keyboard shortcuts for analysts.`,
          icon: 'Layout'
        },
        {
          id: 'core-ansible',
          slug: 'core/ansible',
          title: 'Ansible',
          order: 5,
          content: `## Ansible — Infrastructure Hardening

- Baselines for CIS and STIGs packaged as roles with idempotent tasks.
- Supports parameterized inventories (GovCloud, on-prem, air-gapped).
- Can operate in dry-run mode to preview configuration drift.

**Example: Applying CIS Level 1 baseline**
\`\`\`bash
ansible-playbook -i inventories/prod \\
  hardening/cis_level1.yml \\
  -e target_host=app01 -e audit_mode=true
\`\`\``,
          icon: 'Shield'
        },
        {
          id: 'core-chef-inspec',
          slug: 'core/chef-inspec',
          title: 'Chef InSpec',
          order: 6,
          content: `## Chef InSpec — Compliance Verification

- Executes control profiles mapped to NIST, CIS, and STIG requirements.
- Produces JSON, JUnit, and PDF outputs ingested by the Aegis parser.
- Supports waivers and impact adjustments for inherited controls.

**Sample Profile Snippet**
\`\`\`ruby
control 'windows-account-lockout' do
  impact 0.7
  title 'Account lockout threshold'
  desc 'Ensure accounts are locked after five failed attempts.'

  describe security_policy do
    its('LockoutBadCount') { should be <= 5 }
  end
end
\`\`\`

> Upload InSpec profiles through the Baselines catalog or sync from a Git repository.`,
          icon: 'FileCheck'
        }
      ]
    },
    {
      id: 'how-it-works',
      title: 'How It Works',
      description: 'Operational workflow from asset registration to remediation.',
      order: 4,
      sections: [
        {
          id: 'workflow-steps',
          slug: 'workflow/steps',
          title: 'End-to-End Workflow',
          order: 1,
          content: `## Operational Workflow

1. **Register Asset** — Add servers, containers, or cloud accounts via the Assets wizard or API.
2. **Apply Baseline** — Select an Ansible role (CIS, STIG, custom) and push it through secure runners.
3. **Assess Compliance** — Trigger Chef InSpec or third-party profiles; results stream back in real time.
4. **Review Findings** — Prioritize gaps, assign owners, link remediation tasks, and generate POA&M items.
5. **Remediate & Verify** — Re-run baselines or scans, document residual risk, and export compliance evidence.`,
          icon: 'ListOrdered'
        },
        {
          id: 'workflow-data-flow',
          slug: 'workflow/data-flow',
          title: 'Data Flow',
          order: 2,
          content: `## Data Flow

1. **Runner Execution** — Secure Ansible/InSpec containers execute remotely via SSH/WinRM.
2. **Result Parsing** — Raw JSON/CSV artifacts are uploaded to an ingestion queue.
3. **API Processing** — FastAPI validates payloads, maps controls, and persists normalized findings.
4. **Storage** — PostgreSQL stores structured data; binary artifacts land in S3 with immutable versioning.
5. **Presentation** — React dashboards consume REST endpoints and WebSocket events to show latest status, trends, and drill-downs.`,
          icon: 'ArrowPath'
        }
      ]
    },
    {
      id: 'integration-guide',
      title: 'Integration Guide',
      description: 'Connect infrastructure, baselines, and schedules.',
      order: 5,
      sections: [
        {
          id: 'integration-connect-assets',
          slug: 'integration/connect-assets',
          title: 'Connect Assets',
          order: 1,
          content: `## Asset Connectivity

- **SSH (Linux/Unix):** Provide bastion details, user, port, and key path. Enable host-key verification for FedRAMP environments.
- **WinRM (Windows):** Configure HTTPS listener (port 5986) with certificate; supply local or domain credentials.
- **Cloud Accounts:** Use temporary roles (AWS) or service principals (Azure) with least-privilege policies.

> Use the connection tester to validate reachability, sudo rights, and PowerShell remoting.`,
          icon: 'Plug'
        },
        {
          id: 'integration-baselines',
          slug: 'integration/baselines',
          title: 'Upload & Customize Baselines',
          order: 2,
          content: `## Baseline Management

- Import ZIP or Git references containing Ansible roles or InSpec profiles.
- Tag baselines with frameworks (CIS Level 1, STIG SRG) and operating systems.
- Override variables through parameter sets (e.g., password policy length).
- Version baselines — maintain prior releases for audit traceability.`,
          icon: 'FolderCog'
        },
        {
          id: 'integration-scheduling',
          slug: 'integration/scheduling',
          title: 'Scheduling Scans',
          order: 3,
          content: `## Recurring Scans

- Configure schedules (daily/weekly/monthly) or event-driven triggers (CI/CD webhook).
- Choose target assets, baseline, and notification channel.
- Enable \`auto_create_incidents\` to log failed scans directly in Jira/ServiceNow.
- Monitor schedule health in the Automation > Schedules dashboard.`,
          icon: 'CalendarClock'
        }
      ]
    },
    {
      id: 'using-aegis',
      title: 'Using Aegis',
      description: 'Day-to-day workflows for analysts and auditors.',
      order: 6,
      sections: [
        {
          id: 'using-quick-start',
          slug: 'using/quick-start',
          title: 'Quick Start Tour',
          order: 1,
          content: `## Quick Start

1. **Log in** with SSO or local credentials.
2. **Navigate Dashboard** — Review overall compliance score, recent scans, and outstanding POA&M items.
3. **Launch Scan** — From *Assets → Scans*, pick a baseline and target, then click **Run Now**.
4. **Review Results** — Use the Findings tab to filter by severity or framework.
5. **Generate Report** — Choose PDF, CSV, or STIX export formats.

![Dashboard Screenshot](https://placehold.co/1200x640?text=Aegis+Dashboard)`,
          icon: 'Sparkles'
        },
        {
          id: 'using-scans',
          slug: 'using/scans',
          title: 'Viewing Scans & Findings',
          order: 2,
          content: `## Scans & Findings

- Drill into a scan to view status timeline, runner logs, and artifacts.
- Use comparison mode to view drift between consecutive runs.
- Assign findings to owners, set due dates, and track status transitions.
- Attach evidence snippets or link to existing POA&M records.`,
          icon: 'Search'
        },
        {
          id: 'using-reports',
          slug: 'using/reports',
          title: 'Generating Delta Reports',
          order: 3,
          content: `## Delta Reporting

- Navigate to **Reports → Delta** to compare baseline versions or scan results.
- Select two snapshots; the system highlights newly failed controls and resolved findings.
- Export as PDF (executive summary) or CSV (control-level detail).
- Schedule recurring delta exports for weekly governance meetings.`,
          icon: 'FileDiff'
        }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      description: 'Govern users, permissions, and secure execution environments.',
      order: 7,
      sections: [
        {
          id: 'admin-users',
          slug: 'admin/users',
          title: 'User & Role Management',
          order: 1,
          content: `## Users & Roles

- Invite users via email or SCIM provisioning.
- Roles: **Administrator**, **Compliance Manager**, **Analyst**, **Auditor**, **Read-Only**.
- Apply fine-grained RBAC using custom policies (e.g., limit asset access by business unit).
- Audit user actions through the Activity Log, exportable as CSV.`,
          icon: 'Users'
        },
        {
          id: 'admin-config',
          slug: 'admin/config',
          title: 'Platform Configuration',
          order: 2,
          content: `## Configuration

- Manage environment variables (API secrets, SMTP, Slack webhooks) through the secure settings store.
- Configure SSO: SAML (Okta, Azure AD) or OAuth (GitHub, Google).
- Define notification channels: email, Slack, Teams, ServiceNow tasks.
- Customize retention policies for artifacts and logs.`,
          icon: 'Sliders'
        },
        {
          id: 'admin-runners',
          slug: 'admin/runners',
          title: 'Secure Runners',
          order: 3,
          content: `## Runner Hardening

- Deploy Ansible/InSpec runners inside isolated subnets or Kubernetes namespaces.
- Rotate connection credentials automatically via secrets manager.
- Enforce signed container images and enable runtime scanning.
- Configure egress controls — runners only communicate with the API and allowed targets.`,
          icon: 'Lock'
        }
      ]
    },
    {
      id: 'developer-guide',
      title: 'Developer Guide',
      description: 'Extend Aegis with new content and automations.',
      order: 8,
      sections: [
        {
          id: 'dev-extend',
          slug: 'developer/extend',
          title: 'Extending Baselines & Integrations',
          order: 1,
          content: `## Extensibility

- Add new baseline repositories under \`ops/baselines\` and register them via API.
- Extend integrations by creating MCP tools or LangChain agents under \`ops/mcp\`.
- Publish reusable automations as Git submodules or OCI artifacts.`,
          icon: 'Puzzle'
        },
        {
          id: 'dev-api',
          slug: 'developer/api',
          title: 'Automation with the API',
          order: 2,
          content: `## API Usage

- Authenticate with OAuth2 client credentials or PAT.
- Use pagination (\`limit\`, \`cursor\`) for large datasets.
- Webhooks: subscribe to \`scan.completed\`, \`finding.updated\`, \`report.generated\`.

**Sample: Trigger scan via API**
\`\`\`http
POST /api/scans
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetId": "sys-123",
  "baselineId": "cis-level1",
  "schedule": null,
  "notes": "Triggered from CI pipeline"
}
\`\`\``,
          icon: 'Terminal'
        },
        {
          id: 'dev-structure',
          slug: 'developer/structure',
          title: 'Codebase Structure',
          order: 3,
          content: `## Repository Structure

\`\`\`
.
├── apps/
│   ├── api/          # FastAPI / NestJS gateway
│   ├── web/          # React 18 + Vite frontend
│   └── worker/       # Celery + task processors
├── libs/shared/      # Typed DTOs, utilities, shared constants
├── ops/              # MCP servers, baselines, deployment scripts
└── docs/             # Product documentation & diagrams
\`\`\`

Follow the coding conventions in \`docs/contributing.md\`: ESLint + Prettier, conventional commits, and 90% unit test coverage for core services.`,
          icon: 'TreeStructure'
        }
      ]
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance',
      description: 'How AegisGRC aligns with major frameworks and protects data.',
      order: 9,
      sections: [
        {
          id: 'security-alignment',
          slug: 'security/alignment',
          title: 'Framework Alignment',
          order: 1,
          content: `## Alignment with NIST RMF & CSF

- **Categorize → Select → Implement → Assess → Authorize → Monitor** stages mapped to dashboards.
- Crosswalk library translates controls between RMF, CSF, CIS, and STIG guidance.
- Built-in POA&M templates accelerate ATO packages.`,
          icon: 'Balance'
        },
        {
          id: 'security-protection',
          slug: 'security/protection',
          title: 'Data Protection',
          order: 2,
          content: `## Data Protection Strategy

- All data encrypted in transit (TLS 1.2+) and at rest (PostgreSQL TDE, S3 SSE-KMS).
- Support for customer-managed keys (CMK) and key rotation.
- Field-level encryption for credentials, tokens, and evidence attachments.`,
          icon: 'ShieldCheck'
        },
        {
          id: 'security-audit',
          slug: 'security/audit',
          title: 'Audit Logging & Configuration',
          order: 3,
          content: `## Audit & Secure Config

- Immutable audit logs with tamper-evident hashing.
- Config drift detection alerts when environment variables or runner images change.
- Export logs to SIEM (Splunk, Elastic) and enable long-term retention for compliance.`,
          icon: 'ScrollText'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Diagnose and resolve common issues quickly.',
      order: 10,
      sections: [
        {
          id: 'troubleshooting-common',
          slug: 'troubleshooting/common-issues',
          title: 'Common Issues',
          order: 1,
          content: `## Quick Fixes

| Issue | Cause | Resolution |
| --- | --- | --- |
| Runner offline | Firewall or expired credentials | Revalidate tunnel, rotate keys, verify security groups |
| Scan stuck in \`pending\` | Worker queue backlog | Scale Celery workers, verify Redis availability |
| Missing findings | Baseline misaligned | Confirm asset OS, baseline version, and runner logs |
| Permission denied | RBAC policy restricts user | Update role assignment or add resource scope |

Check the **Activity Log** and **Runner Logs** pages for context before escalating.`,
          icon: 'LifeBuoy'
        },
        {
          id: 'troubleshooting-logs',
          slug: 'troubleshooting/logs',
          title: 'Logs & Diagnostics',
          order: 2,
          content: `## Where to Look

- **API Logs:** \`/var/log/aegis/api.log\` (JSON structured).  
- **Worker Logs:** Aggregated in Logstash under \`aegis-worker-*\`.
- **Runner Logs:** Accessible per job via the Scans detail page or stored in S3 under \`artifacts/<scan-id>/runner.log\`.
- **Metrics:** Prometheus endpoints at \`/metrics\` for API, worker, and MCP services.

Enable debug mode temporarily:
\`\`\`bash
kubectl set env deployment/aegis-api LOG_LEVEL=debug
kubectl rollout restart deployment/aegis-api
\`\`\`

> Remember to revert log levels after troubleshooting to avoid noisy alerts.`,
          icon: 'ClipboardCheck'
        }
      ]
    }
  ]
};

export default docsCollection;
