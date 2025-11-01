# Policy & Procedure Management

The policy module delivers version-controlled document governance, lightweight storage, and routed approvals. This guide summarizes the workflow, data model, configuration, and API/UX touchpoints introduced in the mid-term backlog item.

## Roles & RBAC

| Role        | Authoring | Approval | Notes |
|-------------|-----------|----------|-------|
| `ADMIN`     | ✅        | ✅       | Can assign alternate owners and act as an approver. |
| `ANALYST`   | ✅        | ❌       | May create policies/versions when set as owner. |
| `AUDITOR`   | ❌        | ✅       | Eligible approver once assigned to a version. |
| `READ_ONLY` | ❌        | ❌       | Observer only. |

RBAC is enforced inside `PolicyService` helpers (`ensureAuthorRole`, `ensureApproverRole`, `ensureCanAuthorPolicy`) and surfaced via the `PolicyActorGuard`. The guard expects either `X-Actor-Id` or `X-Actor-Email` headers matching a tenant user.

## Data Model

New Prisma entities live under `apps/api/prisma/schema.prisma`:

- `PolicyDocument` – Top-level record owned by an organization and user. Tracks metadata, categorization, tags, and the current version pointer.
- `PolicyVersion` – Concrete document revision linked to a policy. Captures artifact metadata (`storagePath`, `mimeType`, checksum), lifecycle timestamps, and supersedence relationships.
- `PolicyApproval` – Join table between `PolicyVersion` and `User`, recording reviewer decisions and audit comments.

See migration `apps/api/prisma/migrations/20240901000000_policy_management/migration.sql` for full SQL DDL.

## Storage Layout

Artifacts are persisted under `tmp/policy-artifacts/` relative to the repository root. The `PolicyStorageService` mirrors S3 semantics using the configured bucket name:

```
policies/<org-slug>/<policy-id>/v<version-number>/<timestamp>-<slugified-name>.<ext>
```

The computed `storagePath` is exposed as both a local `tmp` file location and an `s3://`-style URI for future object-store integration.

## API Surface

| Method | Route | Description |
|--------|-------|-------------|
| `GET`  | `/policies` | List policy summaries for the actor's organization. |
| `POST` | `/policies` | Create a policy (authors/admins only). |
| `GET`  | `/policies/:policyId` | Retrieve detail + version history. |
| `POST` | `/policies/:policyId/versions` | Upload a draft version (multipart file + metadata). |
| `POST` | `/policies/:policyId/versions/:versionId/submit` | Promote draft to `IN_REVIEW`, assign approvers. |
| `POST` | `/policies/:policyId/versions/:versionId/decision` | Approver records approve/reject, auto-promotes on consensus. |
| `GET`  | `/policies/:policyId/versions/:versionId/download` | Download artifact (supports `actorId` query fallback). |
| `GET`  | `/policies/actors` | Return eligible authors/approvers for the tenant. |

All routes require the authenticated JWT guard and the policy actor header to be present.

## Frontend UX

- `/policies` sidebar entry surfaces a two-pane experience: inventory on the left, details/version history on the right.
- A sticky actor selector (powered by `PolicyActorProvider`) switches between the seeded analyst (`alex`), admin (`nina`), and auditor (`owen`). This injects the guard headers automatically.
- Multi-select comparison allows reviewers to contrast metadata across two versions without downloading artifacts.
- Submissions and decisions open modal wizards, enforcing required inputs (at least one approver, approval reason, effective date for approvals, etc.).
- Audit trail chips the approval set, highlighting pending reviewers and decision timestamps.

## Environment Notes

- `VITE_POLICY_ACTOR_EMAIL` (optional) seeds the UI's default actor selection when the React app boots. Values should match an email in the `User` table.
- Policy artifacts reuse the evidence bucket configuration (`EVIDENCE_BUCKET`), but are stored locally under `tmp/policy-artifacts` until a remote object store is wired up.

## Testing

`apps/api/src/policy/policy.service.spec.ts` exercises the happy path and edge cases for submissions and approvals:

- prevents non-authors from submitting a version twice,
- enforces approver assignment requirements,
- promotes a version when all approvers accept,
- blocks unauthorized decision attempts.

Run `nx test api --testFile policy/policy.service.spec.ts` (or `npm run test`) to execute the suite.
