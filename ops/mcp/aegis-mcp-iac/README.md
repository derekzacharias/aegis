# Aegis MCP IaC Server

The IaC Policy Guard MCP server exposes Terraform validation and static analysis
capabilities via the Model Context Protocol so LangChain agents can scan pull
requests for misconfigurations (public security groups, IAM wildcards, S3
exposure) and suggest remediations.

## Features

- Wraps `terraform validate -json` for module sanity checks.
- Analyzes Terraform plan/state JSON for:
  - Security groups allowing `0.0.0.0/0` or `::/0` ingress.
  - IAM policies granting wildcard actions or resources.
  - S3 buckets with public ACLs/policies or disabled block settings.
- Emits structured findings for GitHub PR annotations and compliance mapping.
- Provides health checks for Terraform availability and MCP token validity.

## Local Development

```bash
cd ops/mcp/aegis-mcp-iac
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# Run the MCP server locally
aegis-mcp-iac
```

Environment variables:

- `MCP_IAC_TOKEN` – required shared secret for MCP clients.
- `AWS_REGION`, `AWS_PROFILE` – optional, forwarded to Terraform tooling when
  remote state or modules require AWS access.

## Container Image

Build and run the container locally:

```bash
docker build -t aegis-mcp-iac .
docker run --rm -p 8000:8000 -e MCP_IAC_TOKEN=dev-token aegis-mcp-iac
```

The server listens on `0.0.0.0:8000` by default and exposes MCP tool endpoints
under `/tools/<tool_name>`. Prometheus metrics are available at `/metrics`.
