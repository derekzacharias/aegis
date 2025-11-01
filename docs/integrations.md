# Integration Connectors

This guide captures the credentials, OAuth, webhook, and mapping steps required to stand up the Jira and ServiceNow integrations that now ship with the API, worker, and web applications.

## Prerequisites
- **Environment** – Ensure `DATABASE_URL` and `JWT_SECRET` are configured; integrations re-use the existing organization seed (`demo-org`).
- **Local HTTPS** – Jira and ServiceNow require secure redirect URIs even in development. Use a tunnel (e.g. `ngrok`) or map `https://app.local` to your dev server with a self-signed certificate.
- **Nx targets** – All commands assume you run them from the repository root (`/home/dzacharias/aegis`).

## Jira
1. **OAuth App**
   - Create an OAuth 2.0 (3LO) app in Atlassian developer console.
   - Add redirect URI `https://app.local/oauth/jira`.
   - Grant `read:jira-work` and `write:jira-work` scopes.
   - Copy the client ID/secret into the Integrations UI or store them in env vars:
     ```bash
     export JIRA_CLIENT_ID="..."
     export JIRA_CLIENT_SECRET="..."
     ```
2. **Webhook**
   - Configure a webhook that points to `https://{api-host}/api/integrations/jira/webhook`.
   - Use the shared secret shown in the Integrations settings page.
   - Jira signs requests with `X-Jira-Signature` using an HMAC-SHA256 hex digest of the JSON body.
3. **Mapping**
   - Adjust project key, status, and priority mappings inside **Settings → Integrations**.
   - The default fallback mapping is `default → backlog` for statuses and `default → medium` for priorities.
4. **Testing**
   - Trigger a sample webhook with:
     ```bash
     payload='{"issue":{"id":"10001","fields":{"summary":"FedRAMP AC-2","status":{"name":"In Progress"},"priority":{"name":"High"},"project":{"key":"FEDRAMP"}}}}'
     secret="$(jq -r '.[] | select(.provider==\"JIRA\").webhook.secret' tmp/integration-summary.json)"
     signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$secret" | cut -d' ' -f2)
     curl -XPOST https://localhost:3333/api/integrations/jira/webhook \
       -H "Content-Type: application/json" \
       -H "X-Jira-Signature: $signature" \
       -d "$payload"
     ```

## ServiceNow
1. **OAuth App**
   - Create an OAuth endpoint in your instance.
   - Add redirect URI `https://app.local/oauth/servicenow`.
   - Request `ticket.read` and `ticket.write` scopes.
2. **Webhook (Outbound REST Message)**
   - Configure an Outbound REST message to `https://{api-host}/api/integrations/servicenow/webhook`.
   - Sign the request body with `X-ServiceNow-Signature` (HMAC-SHA256 using the shared secret).
3. **Mapping**
   - Map assignment groups, state values, and priorities to internal task states through the UI.
4. **Testing**
   - Similar to Jira: send a sample payload with `record.sys_id`, `state`, and `priority`.

## Worker Sync Jobs
- The worker service now contains provider-specific outbound handlers (`apps/worker/src/integrations`).
- Trigger a dry run with:
  ```bash
  npx nx test worker --testFile workers/integration.processor.spec.ts
  ```
- A background job enqueues `create`, `update`, or `sync` actions with payloads shaped to match the mappings captured during webhook ingestion.

## Validation
1. Update credentials and mapping via the web UI.
2. Run Nx lint/tests for the three applications:
   ```bash
   npx nx lint api
   npx nx lint web
   npx nx lint worker
   npx nx test api
   npx nx test worker
   ```
3. Confirm webhook deliveries appear under Integrations → Ticketing & Workflow (last delivery timestamp updates after a signed POST).

## Troubleshooting
- **Signature mismatch** – Ensure the payload JSON you sign exactly matches the request body. Pretty printing or re-ordering fields will invalidate signatures.
- **OAuth failures** – State tokens expire after five minutes; restart the initiation flow if the callback is delayed.
- **Mapping overrides** – The default entry (`default → …`) provides the fallback. Removing it is disallowed to avoid orphaned tasks.
