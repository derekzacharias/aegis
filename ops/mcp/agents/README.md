# Aegis MCP Agents

This package hosts LangChain-based agents that orchestrate Aegis MCP servers to
deliver compliance automation flows. The first implementation is the IaC Policy
Guard agent that interacts with the Terraform MCP server to validate modules,
summarize findings, and propose remediation patches.

## Setup

```bash
cd ops/mcp/agents
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

Set the following environment variables:

- `MCP_IAC_BASE_URL` – base URL for the IaC MCP server (default `http://localhost:8000`).
- `MCP_IAC_TOKEN` – bearer token matching the IaC server configuration.
- `OPENAI_API_KEY` – optional; when absent the agent falls back to a template-only
  mode that produces deterministic remediation suggestions.

Run the agent:

```bash
iac-policy-guard-agent --module-path path/to/terraform/module
```

The agent will:

1. Call `terraform_validate`, `check_security_groups`, `check_iam_wildcards`, and `check_s3_public`.
2. Summarize risks across the module and align them with NIST controls.
3. Draft remediation guidance (and patches when the LLM integration is enabled).
