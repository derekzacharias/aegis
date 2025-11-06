from __future__ import annotations

import argparse
import asyncio
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional

import requests
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

DEFAULT_MCP_BASE_URL = os.getenv("MCP_IAC_BASE_URL", "http://localhost:8000")
DEFAULT_MCP_TOKEN = os.getenv("MCP_IAC_TOKEN")


class MCPClient:
    """Simple HTTP + local fallback client for invoking MCP tools."""

    def __init__(self, base_url: str, token: Optional[str]) -> None:
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.session = requests.Session()

    def call_tool(self, tool_name: str, **arguments: Any) -> Dict[str, Any]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        payload_variants = [
            {"arguments": arguments},
            arguments,
        ]

        last_error: Exception | None = None
        for body in payload_variants:
            try:
                response = self.session.post(
                    f"{self.base_url}/tools/{tool_name}",
                    headers=headers,
                    json=body,
                    timeout=120,
                )
                if response.status_code == 404:
                    continue
                response.raise_for_status()
                data = response.json()
                if isinstance(data, dict) and "result" in data:
                    return data["result"]
                return data
            except requests.RequestException as exc:
                last_error = exc
                continue

        # Fallback to invoking the local server function if HTTP attempts fail (useful during local dev).
        try:
            from aegis_mcp_iac import server as local_server  # type: ignore
        except ModuleNotFoundError as exc:  # pragma: no cover - optional feature
            if last_error:
                raise RuntimeError(f"Failed to call MCP tool {tool_name}: {last_error}") from exc
            raise

        tool = getattr(local_server, tool_name, None)
        if tool is None:
            raise RuntimeError(f"MCP tool {tool_name} not found locally.")

        async def _invoke():
            return await tool(**arguments)

        return asyncio.run(_invoke())


def run_terraform_command(module_path: Path, *args: str) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.setdefault("TF_IN_AUTOMATION", "true")
    env.setdefault("TF_CLI_ARGS_plan", "-input=false -lock=false")
    env.setdefault("TF_CLI_ARGS_init", "-input=false")

    result = subprocess.run(
        ["terraform", *args],
        cwd=module_path,
        text=True,
        capture_output=True,
        check=False,
        env=env,
    )

    if result.returncode != 0:
        raise RuntimeError(f"terraform {' '.join(args)} failed: {result.stderr or result.stdout}")

    return result


def generate_plan_json(module_path: Path) -> Path:
    run_terraform_command(module_path, "init", "-backend=false")
    plan_dir = Path(tempfile.mkdtemp(prefix="iac-agent-plan-"))
    plan_file = plan_dir / "plan.tfplan"

    run_terraform_command(module_path, "plan", "-out", str(plan_file), "-refresh=false")
    show_result = run_terraform_command(module_path, "show", "-json", str(plan_file))

    plan_json = plan_dir / "plan.json"
    plan_json.write_text(show_result.stdout, encoding="utf-8")
    return plan_json


def summarize_findings(findings: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "security_groups": findings.get("security_groups", {}).get("findings", []),
        "iam": findings.get("iam", {}).get("findings", []),
        "s3": findings.get("s3", {}).get("findings", []),
    }


def render_rule_based_summary(module_path: Path, terraform_result: Dict[str, Any], findings: Dict[str, Any]) -> str:
    summary = [f"IaC Policy Guard summary for module `{module_path}`:"]

    diagnostics = terraform_result.get("diagnostics", [])
    if diagnostics:
        summary.append("Terraform validation reported issues:")
        for diag in diagnostics[:10]:
            summary.append(f"- {diag.get('detail', 'Unknown issue')} ({diag.get('severity', 'UNKNOWN')})")
        if len(diagnostics) > 10:
            summary.append(f"- ... {len(diagnostics) - 10} additional diagnostics.")
    else:
        summary.append("Terraform validation passed without diagnostics.")

    sg_findings = findings["security_groups"]
    if sg_findings:
        summary.append(f"Security group issues ({len(sg_findings)}):")
        for item in sg_findings[:5]:
            summary.append(
                f"- {item.get('resource')} allows {item.get('cidr')} on ports {item.get('port_range')} "
                f"→ {item.get('recommendation')}"
            )
        if len(sg_findings) > 5:
            summary.append(f"- ... {len(sg_findings) - 5} additional SG findings.")
    else:
        summary.append("No public security group ingress detected.")

    iam_findings = findings["iam"]
    if iam_findings:
        summary.append(f"IAM wildcard issues ({len(iam_findings)}):")
        for item in iam_findings[:5]:
            summary.append(
                f"- {item.get('resource')} statement {item.get('statement')} uses {item.get('action')} "
                f"→ {item.get('recommendation')}"
            )
        if len(iam_findings) > 5:
            summary.append(f"- ... {len(iam_findings) - 5} additional IAM findings.")
    else:
        summary.append("No IAM wildcard permissions detected.")

    s3_findings = findings["s3"]
    if s3_findings:
        summary.append(f"S3 public access issues ({len(s3_findings)}):")
        for item in s3_findings[:5]:
            summary.append(f"- {item.get('resource')} → {item.get('issue')} ({item.get('recommendation')})")
        if len(s3_findings) > 5:
            summary.append(f"- ... {len(s3_findings) - 5} additional S3 findings.")
    else:
        summary.append("No S3 public exposure detected.")

    summary.append("NIST Controls impacted: CM-2, CM-6, CA-7.")
    summary.append("Suggested next steps: tighten ingress CIDRs, replace wildcard IAM actions, lock down S3 bucket policies.")

    return "\n".join(summary)


def format_findings_payload(findings: Dict[str, Any]) -> str:
    return json.dumps(findings, indent=2)


def call_mcp(client: MCPClient, tool: str, **kwargs: Any) -> Dict[str, Any]:
    return client.call_tool(tool, **kwargs)


def build_langchain_summary(
    module_path: Path,
    terraform_result: Dict[str, Any],
    findings: Dict[str, Any],
) -> str:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return render_rule_based_summary(module_path, terraform_result, findings)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are IaC Policy Guard, a security engineer who reviews Terraform modules. "
                "Summarize misconfigurations, map them to NIST controls, and propose remediation patches in HCL diff form.",
            ),
            (
                "human",
                "Terraform validation diagnostics:\n{terraform}\n\n"
                "Security group findings:\n{security_groups}\n\n"
                "IAM findings:\n{iam}\n\n"
                "S3 findings:\n{s3}\n\n"
                "Module path: {module_path}\n"
                "Provide:\n"
                "1. Executive summary (1 paragraph).\n"
                "2. Findings table mapping to CM-2/CM-6/CA-7.\n"
                "3. Remediation HCL patch(es) with justification.\n",
            ),
        ]
    )

    chain = prompt | llm | StrOutputParser()
    return chain.invoke(
        {
            "terraform": json.dumps(terraform_result, indent=2),
            "security_groups": json.dumps(findings["security_groups"], indent=2),
            "iam": json.dumps(findings["iam"], indent=2),
            "s3": json.dumps(findings["s3"], indent=2),
            "module_path": str(module_path),
        }
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="IaC Policy Guard LangChain agent.")
    parser.add_argument("--module-path", required=True, help="Path to the Terraform module to analyze.")
    parser.add_argument("--plan-json", help="Optional path to an existing Terraform plan JSON file.")
    parser.add_argument("--mcp-base-url", default=DEFAULT_MCP_BASE_URL, help="Base URL for the IaC MCP server.")
    parser.add_argument("--mcp-token", default=DEFAULT_MCP_TOKEN, help="Bearer token for the MCP server.")
    parser.add_argument("--output", help="Optional path to write the agent summary report.")
    parser.add_argument("--skip-plan", action="store_true", help="Skip automatic plan generation (requires --plan-json).")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    module_path = Path(args.module_path).resolve()
    if not module_path.exists():
        print(f"Module path does not exist: {module_path}", file=sys.stderr)
        return 2

    client = MCPClient(args.mcp_base_url, args.mcp_token)

    # Terraform validate via MCP server
    terraform_result = call_mcp(client, "terraform_validate", working_directory=str(module_path))

    plan_json_path: Path | None = Path(args.plan_json).resolve() if args.plan_json else None
    if not plan_json_path and not args.skip_plan:
        try:
            plan_json_path = generate_plan_json(module_path)
        except RuntimeError as exc:
            print(f"[WARN] Failed to generate plan: {exc}", file=sys.stderr)

    findings_payload: Dict[str, Any] = {}
    if plan_json_path and plan_json_path.exists():
        findings_payload["security_groups"] = call_mcp(
            client, "check_security_groups", plan_path=str(plan_json_path)
        )
        findings_payload["iam"] = call_mcp(client, "check_iam_wildcards", plan_path=str(plan_json_path))
        findings_payload["s3"] = call_mcp(client, "check_s3_public", plan_path=str(plan_json_path))
    else:
        print("[WARN] No plan JSON available; skipping detailed analyzers.", file=sys.stderr)
        findings_payload["security_groups"] = {"findings": []}
        findings_payload["iam"] = {"findings": []}
        findings_payload["s3"] = {"findings": []}

    summarized = summarize_findings(findings_payload)
    summary_text = build_langchain_summary(module_path, terraform_result, summarized)

    print(summary_text)
    if args.output:
        Path(args.output).write_text(summary_text, encoding="utf-8")

    # Exit with non-zero status if any critical findings
    has_findings = any(summarized[key] for key in ["security_groups", "iam", "s3"])
    return 1 if has_findings else 0


if __name__ == "__main__":
    raise SystemExit(main())
