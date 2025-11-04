# Policy & Procedure Administrator Guide

This reference equips tenant administrators with the steps and background needed to operate the policy management module, enforce governance workflows, and support end users.

## Role Overview

- **Admin** – Full control. May author policies, approve versions, assign alternate owners, and manage retention.
- **Analyst** – Author-only. Can create policies and upload versions they own.
- **Auditor** – Approver-only. Cannot author, but can review and approve assigned versions.
- **Read Only** – Viewer. Cannot modify policies or versions.

RBAC is enforced through the policy service and the `X-Actor-*` headers injected by the front-end. Switching actors in the UI is the simplest way to test role behavior.

## Initial Setup Checklist

1. **Seed actors:** Ensure the seeded users (alex, nina, owen, etc.) exist in the tenant. They are included with the dev database seeders.
2. **Framework catalog:** Populate frameworks relevant to your controls. Policies leverage these for mapping evidence requirements.
3. **Review cadence defaults:** Decide on organization-wide norms (e.g., annual reviews) to guide policy creation.

## Managing Ownership & Actors

- **Change owner:** Open a policy, click **Edit policy**, and choose a new owner. Only administrators can reassign ownership.
- **Acting as:** Use the actor selector to impersonate users for troubleshooting.
- **Participants endpoint:** The UI calls `/policies/actors` to list authors and approvers. If the set looks wrong, verify user roles in the database.

## Enforcing Retention Policies

Retention metadata controls how long documents must be preserved.

1. Edit a policy and set:
   - **Retention period (days)** – a positive number that defines the minimum retention duration.
   - **Retention reason** – rationale displayed to users.
   - **Retention expiration** – optional calendar date that ends the enforced period.
2. Save changes. The service logs a `RETENTION_UPDATED` audit event capturing the new configuration.
3. Retention values flow to the detail pane so authors know the obligations before publishing.

## Framework Mapping Governance

Framework mappings connect versions to compliance control families.

- During uploads, authors select frameworks and record comma-separated control families and IDs.
- The service validates that selected frameworks belong to the organization.
- Framework coverage is surfaced in the policy detail, version cards, and comparisons so reviewers can spot gaps before approval.
- Encourage authors to keep the mapping precise—control IDs accept any string, so align on naming conventions (e.g., `AC-2`, `ID.AM-1`).

## Approval Workflow Policy

- Enforce separation of duties by ensuring approvers are not the same actor as the author unless necessary (only Admins can double up).
- A version cannot be submitted without at least one valid approver in the tenant.
- Rejections automatically close outstanding approvals and mark the version with a `VERSION_ARCHIVED` audit event for traceability.
- Approvals promote the version to current, mark prior versions as historical, and log `VERSION_PUBLISHED`.

## Audit Trail & Monitoring

The service tracks critical events with `PolicyAuditLog` entries:

| Action | Trigger |
|--------|---------|
| `POLICY_CREATED` | Policy creation |
| `VERSION_CREATED` | Uploading a version |
| `VERSION_SUBMITTED` | Submission for approval |
| `APPROVAL_RECORDED` | An approver records a decision |
| `VERSION_PUBLISHED` | Final approval promotes the version |
| `VERSION_ARCHIVED` | A rejection finalizes the review |
| `RETENTION_UPDATED` | Retention metadata changes |
| `DOCUMENT_DOWNLOADED` | Actor downloads a version artefact |

The audit trail is visible via the API response (`policyDetail.auditTrail`) and can be surfaced in future dashboards.

## API & Automation Entry Points

The administrator role often integrates policy workflows with external tools.

- **Inventory:** `GET /policies` returns summaries with current version status.
- **Details:** `GET /policies/:policyId` yields full history, retention metadata, frameworks, audit trail, and version information.
- **Create:** `POST /policies` with `CreatePolicyDto` starts a new record.
- **Update:** `PATCH /policies/:policyId` supports partial updates for metadata, ownership, and retention.
- **Version upload:** `POST /policies/:policyId/versions` accepts multipart uploads plus framework JSON.
- **Approval pipeline:** Use `/submit` and `/decision` endpoints to move versions through review.
- **Downloads:** `GET /policies/:policyId/versions/:versionId/download` returns the artifact with audit logging.

Ensure automation supplies the correct `X-Actor-*` headers to mimic a valid tenant user; otherwise the policy guard will reject the request.

## Operational Best Practices

- **Quarterly reviews:** Filter for policies whose `reviewCadenceDays` indicate they are due for an update and prompt owners accordingly.
- **Framework drift:** Compare policy framework mappings against the authoritative framework catalog each release cycle.
- **Backup artifacts:** Policy storage currently writes to `tmp/policy-artifacts`. Configure the backing bucket as part of production hardening.
- **CI checks:** Extend tests in `apps/api/src/policy/policy.service.spec.ts` when you adjust workflow logic to keep regression safety nets intact.
- **Incident response:** Use audit logs to trace who changed retention settings, approved a version, or fetched a document when investigating compliance issues.

For deeper architectural context, see `docs/policies.md`. For onboarding end users, share the complementary `docs/policies-user-guide.md`.
