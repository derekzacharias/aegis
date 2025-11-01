# Assessment Lifecycle

## Overview
- Assessments are persisted in Postgres via Prisma `AssessmentProject` models; creation seeds framework memberships, control assignments, and progress counters.
- The lifecycle moves from `draft` → `in-progress` → `complete`; backward transitions only permitted from `complete` to `in-progress` for re-opening audits.
- Detail views include nested frameworks, controls, tasks, and audit log entries sourced from Prisma relations; in-memory stores have been removed.

## Lifecycle Operations
- **Create**: `POST /assessments` requires name, framework IDs, owner email. Validates organization access, published frameworks, and seeds `AssessmentControl` rows for every framework control.
- **Collaborate**: Updates support:
  - `PATCH /assessments/:id` for name, owner, frameworks. Framework changes re-sync control assignments and recalculate progress.
  - `PATCH /assessments/:id/status` enforces allowed transitions.
  - `PATCH /assessments/:id/controls/:controlId` handles control status, owner, due date, comments, and retriggers progress aggregation.
  - `POST /assessments/:id/tasks` / `PATCH` / `DELETE` manage remediation tasks with optional control linkage.
  - All mutations register `AssessmentAuditLog` records containing actor, action, and metadata.
- **Complete**: Marking an assessment complete locks progress to the time of transition, while audit entries preserve history for reviewers.

## RBAC & Security
- Read operations require `READ_ONLY`, `ANALYST`, `AUDITOR`, or `ADMIN` roles; mutations restricted to `ANALYST` and `ADMIN`.
- Ownership changes only accept users within the same organization; emails lacking a corresponding account leave the relational owner `null` but preserve `ownerEmail` for accountability.
- Control / task owners must be valid organization members; invalid assignments raise `400` errors.
- Every mutation is scoped by `organizationId` to prevent cross-tenant access.

## Worker & Reporting
- Reporting API now queries Prisma to validate assessment ownership before queueing jobs.
- The reporting worker fetches summaries via Prisma, renders HTML/PDF assets, and persists metadata through the shared report store.

## Required Environment Variables
- `DATABASE_URL`: Postgres connection string for API and worker Prisma clients.
- `REPORT_BUCKET` (optional): Overrides default report storage bucket used by the worker when rendering assessments.
- Existing auth / queue variables remain unchanged; no new secrets were introduced.

## QA Checklist (Multi-User)
1. Log in as an `ANALYST`; create an assessment with multiple frameworks and confirm progress totals match combined control counts.
2. Update assessment owner to an `ADMIN`, then verify audit logs capture ownership change, and `READ_ONLY` users can view but not mutate.
3. From two different sessions (e.g. `ANALYST` + `AUDITOR`), update control statuses concurrently; ensure optimistic updates or refetch keep UI consistent and audit log records both actions.
4. Create tasks linked to controls, reassign them to another analyst, and confirm linkage persists in detail view and worker-generated reports.
5. Transition assessment through `draft` → `in-progress` → `complete`, then attempt an invalid transition (e.g. `complete` → `draft`) and assert the API rejects it.
6. Trigger reporting job and download rendered artifact; verify it reflects latest owner/progress metadata.

## Testing
- Backend: `npx jest --config apps/api/jest.config.ts apps/api/src/assessment/assessment.service.spec.ts --runInBand`
- Worker: `npx jest --config apps/worker/jest.config.ts apps/worker/src/workers/reporting.processor.spec.ts --runInBand`
- Frontend assessments workflow: `npx jest --config apps/web/jest.config.ts apps/web/src/pages/assessments.spec.tsx --runInBand`

