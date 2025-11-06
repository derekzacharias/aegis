# Automated Assessment Methodology

## 1. Executive Summary
- **Goal** – Deliver automated compliance assessments that can run across any customer-selected framework without sacrificing security or auditability.
- **Decision** – Adopt a **hybrid orchestration model**: resident agents handle low-latency in-bound scans where infrastructure teams approve long-running daemons, while short-lived SSH (or WinRM) Mediated jobs cover sensitive fleets and air-gapped enclaves. A shared automation queue coordinates both paths and feeds telemetry back to the Aegis control plane.
- **Next Steps** – Ship the new `assessment.automation.execute` job scaffold (landed in this change), wire queue consumers to Ansible/Chef InSpec runners, and expand scheduler hooks so assessments can be targeted from UI, API, or MCP agents.

## 2. Option Analysis

| Option | Strengths | Risks / Constraints | Recommended Use |
| --- | --- | --- | --- |
| **Resident Agents** (container/VM running inside customer boundary) | • Continuous coverage<br>• Rich local context (logs, osquery, etc.)<br>• Easier retry/batching | • Requires deployment + upgrade lifecycle<br>• Hard to permission in high-side networks<br>• Idle resource cost | Environments with stable orchestration (Kubernetes, ECS, BOSH) and expectations for frequent delta scans. |
| **Ephemeral SSH/WinRM Jobs** (Aegis worker or MCP agent reaches systems on demand) | • Zero standing agents<br>• Works for legacy networks and enclaves<br>• Simplifies emergency rotations | • Needs credentials + bastion routing<br>• Higher latency per job<br>• Requires concurrency limits | Systems with strict change control or where operators already maintain automation gateways (Ansible Tower, AWX, SSM, etc.). |
| **Hybrid (Recommended)** | • Picks best transport per system<br>• Fallback path when resident agents fail<br>• Shared queue + policy enforcement | • Slightly more complex routing logic<br>• Requires catalog of agent capability vs. credential sets | Adopt by default. Store per-system automation profile (resident, ssh, winrm, cloud API) and let scheduler pick the executor. |

Evaluation criteria and scoring:

| Criterion | Resident | SSH/WinRM | Hybrid |
| --- | :---: | :---: | :---: |
| Coverage depth (InSpec + platform hooks) | 4/5 | 3/5 | **5/5** |
| Rollout complexity | 2/5 | 4/5 | **4/5** |
| Operational risk (credential blast radius, isolation) | 3/5 | 4/5 | **4/5** |
| Offline/air-gapped suitability | 3/5 | 5/5 | **5/5** |
| Telemetry richness | 4/5 | 3/5 | **5/5** |
| **Total** | 16 | 19 | **23** |

## 3. Target Architecture

1. **Automation Queue** – New `assessment.automation.execute` job centralises orchestration. Payload defines assessment, frameworks, execution mode, target inventory, and toolchain (Chef InSpec, Ansible playbooks, custom scripts).
2. **Execution Engines** – Worker routes jobs to the appropriate executor:
   - **Resident agent**: gRPC/Webhook call to `aegis-agentd` (future MCP server) with local credential mapping.
   - **SSH/WinRM**: Worker spawns Ansible (for Linux/BSD) or PowerShell remoting wrappers. Chef InSpec executions run via `inspec exec` with JSON output redirected to storage.
   - **Cloud-native scanners**: For AWS/GCP/Azure, the worker calls provider APIs or invokes serverless automation (Lambda/Cloud Run) when network isolation forbids direct access.
3. **Telemetry + Evidence** – Scan results stored in new `AutomationRun` table (coming migration) linked to controls/evidence. Summaries posted to Metrics service and optional Slack/Jira notifications.
4. **Policy Enforcement** – Each job carries safety metadata (credential set, maximum concurrency, network policy). Worker ensures jobs respect tenant quotas and uses the existing audit pipeline for traceability.

## 4. Proof-of-Concept Scope

This change introduces a scaffolding processor and shared payload definitions:

- **Job contract** (`libs/shared/src/lib/assessment.jobs.ts`):
  - `assessmentId`, `frameworkIds`, `executionMode` (`resident`, `ssh`, `winrm`, `cloud`).
  - `targets`: host descriptors (hostname/IP, labels, credential alias).
  - `tooling`: enumerates which runners to invoke (`inspec`, `ansible`, `custom`).
  - `requestedBy`: user or automation actor metadata.
- **Worker skeleton** (`apps/worker/src/workers/assessment.automation.processor.ts`):
  - Registers queue consumer.
  - Emits structured logs/metrics for every job.
  - In POC mode, performs dry-run validation and enqueues follow-up `assessment.automation.result` placeholder for downstream processors.
- **API touchpoint**: Reserve controller/service hook (`AssessmentAutomationService` – to be implemented) that will enqueue jobs once inventories are bound.

The scaffold unblocks integration testing while we wire concrete runners.

## 5. Integration Guidance

1. **Inventory & Credentials**
   - Extend the upcoming `AutomationTarget` model with transport type, endpoint, and secret alias.
   - Store SSH keys / WinRM certificates in the existing secrets manager, referenced by alias in job payloads.
2. **Runner Configuration**
   - Chef InSpec: package baseline profiles per framework (`profiles/nist-800-53`, etc.). Worker downloads/updates profiles via artifact service before execution.
   - Ansible: maintain hardened collections under `automation/ansible/` with playbooks grouped by framework family.
   - Resident agents: document expected gRPC endpoint and health probes; reuse `AgentHealthCheckHandler`.
3. **Security Controls**
   - Enforce per-job least privilege via credential alias mapping.
   - Capture command provenance + checksums, storing them as evidence metadata (`runId`, `profileSha`).
   - Default concurrency: 5 concurrent hosts per job, overrideable per tenant.
4. **User Experience**
   - Dashboard adds “Run Automated Assessment” CTA on assessments and frameworks.
   - Scheduler integration: CRON-like recurrence writes jobs into queue with `executionMode` resolved via automation profile.
   - Notifications: Ops dashboard shows active runs, SLA timers, failures.
5. **Rollout Plan**
   - Phase 1: CLI-triggered runs (internal teams) hitting POC jobs; gather metrics.
   - Phase 2: Integrate with MCP “IaC Policy Guard” for pipeline-triggered scans.
   - Phase 3: GA UI entry point + full evidence ingestion.

## 6. Open Questions / Follow-ups

- **Host Inventory Source** – Finalise whether CMDB sync or agent discovery feeds job targets.
- **Result Normalisation** – Define mapping from InSpec/Ansible exit codes to Aegis control statuses.
- **Cost Controls** – Determine billing/usage metrics for queued automation jobs.
- **FIPS / FedRAMP Constraints** – Validate that bundled toolchains meet FedRAMP High requirements (cryptographic modules, patch cadence).

## 7. Tracking & Next Steps

- [ ] Implement assessment automation processor to call external runners (Chef InSpec, Ansible).
- [ ] Add Prisma models for automation runs and evidence linkage.
- [ ] Build `/automation/runs` API endpoints for status queries.
- [ ] Expand scheduler UI to select automation profiles per assessment.
- [ ] Draft customer-facing operations guide once end-to-end flow is validated.

