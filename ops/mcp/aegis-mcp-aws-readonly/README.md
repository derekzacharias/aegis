# Aegis MCP AWS Read-Only Server

The AWS Read-Only MCP server surfaces IAM, S3, and Security Group insights using
AWS SDK calls and open-source posture tooling (Prowler/Steampipe). The MCP agent
for Epic A-002 consumes these tools to create STIX 2.1 reports and populate
OpenSearch dashboards.

## Capabilities

- Enumerate IAM roles with wildcard permissions or trust policies.
- Summarize IAM account-level risk via policy summaries.
- Identify security groups with public ingress CIDRs.
- Optionally execute Prowler scans and return filtered findings.

## Quickstart

```bash
cd ops/mcp/aegis-mcp-aws-readonly
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

AWS_REGION=us-east-1 MCP_AWS_TOKEN=dev-token aegis-mcp-aws-readonly
```

The server listens on `0.0.0.0:8001` by default (configurable via `MCP_PORT`)
and expects AWS credentials with read-only privileges—ideally via an assumed
role dedicated to compliance scanning.

## Docker

```bash
docker build -t aegis-mcp-aws-readonly .
docker run --rm -e AWS_REGION=us-east-1 -e AWS_ACCESS_KEY_ID=... \\
  -e AWS_SECRET_ACCESS_KEY=... -e MCP_AWS_TOKEN=dev-token \\
  -p 8001:8000 aegis-mcp-aws-readonly
```

Prometheus metrics are available at `/metrics`. Health checks confirm STS caller
identity resolution and token presence.
