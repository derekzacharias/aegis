# Aegis MCP Agents

This package hosts LangChain-based agents that orchestrate Aegis MCP servers to
deliver compliance automation flows. The library currently provides:

- **IaC Policy Guard** — validates Terraform modules, flags risky primitives, and drafts remediation patches.
- **AWS Read-Only Posture Scan** — enumerates IAM wildcards, public network exposure, and Prowler findings while emitting STIX 2.1 bundles.

## Setup

```bash
cd ops/mcp/agents
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

### IaC Policy Guard

```bash
export MCP_IAC_BASE_URL=http://localhost:8000
export MCP_IAC_TOKEN=dev-token
# optional LLM key for remediation patches
export OPENAI_API_KEY=...
i
iac-policy-guard-agent --module-path infra/networking
```

```bash
iac-policy-guard-agent --module-path path/to/terraform/module
```

### AWS Read-Only Posture Scan

```bash
export MCP_AWS_BASE_URL=http://localhost:8001
export MCP_AWS_TOKEN=dev-token
export AWS_REGION=us-east-1

aws-posture-scan-agent \
  --region us-east-1 \
  --output-json reports/aws-posture.json \
  --output-stix reports/aws-posture.stix.json \
  --stdout
```

The agent will:

1. Call `terraform_validate`, `check_security_groups`, `check_iam_wildcards`, and `check_s3_public`.
2. Summarize risks across the module and align them with NIST controls.
3. Draft remediation guidance (and patches when the LLM integration is enabled).

For the AWS posture workflow it will additionally:

1. Call `list_roles`, `describe_security_groups`, and `run_prowler_scan` on the AWS MCP server.
2. Aggregate IAM wildcard roles, public security group ingress, and high/critical Prowler findings.
3. Emit an aggregated JSON report and STIX 2.1 bundle suitable for MISP/OpenCTI ingestion.

Use cron, EventBridge, or another scheduler to run the agent on the cadence defined in the backlog (for example daily in each environment). Rotate `MCP_AWS_TOKEN` alongside MCP server credentials and store bundle outputs in S3 or OpenSearch per the acceptance criteria.
