# Service User Playbooks

Automation agents interact with the platform through the same authentication flows as humans. This guide captures how to create dedicated service identities, assign the right permissions, keep credentials healthy, and monitor their activity so refresh token failures never go unnoticed.

## Provisioning workflow

1. **Sign in as an administrator.** Service users can be created through the admin-only `/api/users` endpoint. The controller enforces the `ADMIN` role and runs every payload through class-validator before persisting the profile in Prisma. 【F:apps/api/src/user/user.controller.ts†L19-L32】【F:apps/api/src/user/user.service.ts†L47-L118】
2. **Issue the account.** POST a payload such as:
   ```json
   {
     "email": "reports-agent@aegis.local",
     "password": "Th1sIsAStrong!Pass",
     "firstName": "Reports",
     "lastName": "Agent",
     "role": "ANALYST"
   }
   ```
   The service normalises the email, hashes the password, records an audit entry that the account was created, and defaults the role to `ANALYST` if none is supplied. 【F:apps/api/src/user/user.service.ts†L73-L117】
3. **Adopt the agent naming convention.** Health monitoring looks for email addresses that include the `-agent@` suffix so keep the format `<capability>-agent@<domain>`. This ensures the scheduler can target automation identities without flagging human users. 【F:apps/worker/src/scheduler/handlers/agent-health-check.handler.ts†L28-L54】
4. **Collect the initial tokens.** Authenticate once with `POST /api/auth/login` using the new credentials to capture the `accessToken` / `refreshToken` pair. Store them in your secret manager alongside the account metadata. Tokens respect the configured TTLs (`AUTH_ACCESS_TOKEN_TTL`, `AUTH_REFRESH_TOKEN_TTL`). 【F:apps/api/src/auth/auth.controller.ts†L21-L33】【F:apps/api/src/config/configuration.ts†L33-L58】

> Tip: `/api/auth/register` remains available for bootstrapping environments, but it returns tokens for the new user immediately. Prefer `/api/users` in shared deployments so service account secrets never transit a developer laptop.

## Role guidance

Pick the narrowest role that lets the automation perform its job:

| Agent behaviour | Recommended role |
| --- | --- |
| Read-only evidence synchronisation or dashboards | `READ_ONLY` |
| Report generation, evidence lifecycle tasks, or scheduler ownership | `ANALYST` |
| Cross-tenant observers or auditors | `AUDITOR` |
| Managing other users or frameworks | `ADMIN` (use sparingly) |

Roles map directly to NestJS guards so the permissions listed in the API controllers apply to agents exactly as they do to the UI. 【F:apps/api/src/auth/guards/roles.guard.ts†L8-L49】【F:apps/api/src/user/user.controller.ts†L19-L68】

## Password rotation and refresh hygiene

- Rotate credentials through `PATCH /api/users/me/password`. The service validates the current password, enforces the platform-wide complexity rules, updates the hash, and invalidates any outstanding refresh tokens so the agent must log in with the new secret. 【F:apps/api/src/user/user.controller.ts†L34-L43】【F:apps/api/src/user/user.service.ts†L200-L239】
- Agents should cache `refreshTokenExpiresIn` and call `POST /api/auth/refresh` a few minutes before expiry. Each successful refresh replaces the stored hash and clears the `refreshTokenInvalidatedAt` timestamp. 【F:apps/api/src/auth/auth.service.ts†L133-L205】
- When a refresh attempt fails, the API now logs a structured `auth.refresh.failure` event, records an audit trail entry (`refreshToken` → `invalidated`), and includes the failure reason/metadata. That makes it easy to correlate alerts with the root cause. 【F:apps/api/src/auth/auth.service.ts†L133-L255】

## Health monitoring and alerts

The worker’s agent health check polls for refresh failures every hour. It looks for profile audit entries where the `refreshToken.current` value contains `invalidated` and the owning email matches the `-agent@` convention. Each incident is emitted as a JSON log (`agent.refresh.failure.detected`) and increments the `agent.refresh.failures` counter so downstream monitoring can page the on-call rotation. 【F:apps/worker/src/scheduler/handlers/agent-health-check.handler.ts†L20-L72】

Wire the health check schedule into your deployment (or leave the seeded schedule active) so the automation layer catches stuck tokens quickly.

## Auditing agent-driven changes

Service users share the same `/api/users/me/audits` feed as humans. Refresh failures, password updates, and profile edits appear in the audit history with actor metadata so operators can trace which automation account triggered each change. Surface the history in the UI via the existing profile settings view or query it directly for reporting. 【F:apps/api/src/user/user.controller.ts†L44-L68】【F:apps/api/src/user/user.service.ts†L240-L313】【F:apps/web/src/sections/settings/profile-settings.tsx†L360-L407】

With these playbooks in place, each automation agent carries the right permissions, rotates credentials safely, and raises observable signals whenever refresh tokens fall out of rotation.
