from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from stix2 import Bundle, Identity, Note, Report

DEFAULT_BASE_URL = os.getenv("MCP_AWS_BASE_URL", "http://localhost:8001")
DEFAULT_TOKEN = os.getenv("MCP_AWS_TOKEN")


class MCPClient:
  """Simple HTTP client for invoking MCP tools."""

  def __init__(self, base_url: str, token: Optional[str]) -> None:
    self.base_url = base_url.rstrip("/")
    self.token = token
    self.session = requests.Session()

  def call_tool(self, tool: str, **arguments: Any) -> Dict[str, Any]:
    headers = {"Content-Type": "application/json"}
    if self.token:
      headers["Authorization"] = f"Bearer {self.token}"

    payloads = [
      {"arguments": arguments},
      arguments,
    ]
    last_error: Optional[Exception] = None

    for body in payloads:
      try:
        response = self.session.post(f"{self.base_url}/tools/{tool}", headers=headers, json=body, timeout=120)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and "result" in data:
          return data["result"]
        return data
      except Exception as exc:  # noqa: BLE001
        last_error = exc

    raise RuntimeError(f"Failed to invoke MCP tool {tool}: {last_error}") from last_error


@dataclass
class RoleFinding:
  role_name: str
  arn: str
  wildcard_inline_policies: List[str]
  wildcard_statements: List[Dict[str, Any]]


@dataclass
class SecurityGroupFinding:
  group_id: str
  group_name: str
  ingress: List[Dict[str, Any]]


@dataclass
class ProwlerFinding:
  service: str
  check: str
  status: str
  severity: str
  resource: str
  region: Optional[str]
  account_id: Optional[str]


def extract_role_findings(payload: Dict[str, Any]) -> List[RoleFinding]:
  findings: List[RoleFinding] = []
  for role in payload.get("roles", []):
    wildcards = role.get("wildcard_inline_policies") or role.get("wildcard_statements") or []
    if not wildcards:
      continue
    findings.append(
      RoleFinding(
        role_name=role.get("role_name", "unknown"),
        arn=role.get("arn", ""),
        wildcard_inline_policies=role.get("wildcard_inline_policies", []),
        wildcard_statements=role.get("wildcard_statements", []),
      )
    )
  return findings


def extract_security_group_findings(payload: Dict[str, Any]) -> List[SecurityGroupFinding]:
  results: List[SecurityGroupFinding] = []
  for group in payload.get("security_groups", []):
    results.append(
      SecurityGroupFinding(
        group_id=group.get("group_id", ""),
        group_name=group.get("group_name", ""),
        ingress=group.get("ingress", []),
      )
    )
  return results


def extract_prowler_findings(payload: Dict[str, Any]) -> List[ProwlerFinding]:
  results: List[ProwlerFinding] = []
  for item in payload.get("findings", []):
    results.append(
      ProwlerFinding(
        service=item.get("Service") or item.get("service", ""),
        check=item.get("CheckID") or item.get("check", ""),
        status=item.get("Status") or item.get("status", ""),
        severity=(item.get("Severity") or {}).get("Label") if isinstance(item.get("Severity"), dict) else item.get("severity", ""),
        resource=(item.get("Resource") or item.get("Resources", [{}])[0]).get("Id") if isinstance(item.get("Resources"), list) else item.get("resource", ""),
        region=item.get("Region") or item.get("region"),
        account_id=item.get("AccountId") or item.get("account_id"),
      )
    )
  return results


def summarise(role_findings: List[RoleFinding], sg_findings: List[SecurityGroupFinding], prowler_findings: List[ProwlerFinding]) -> str:
  lines = [
    "AWS Read-Only Posture Summary",
    f"- IAM roles with wildcards: {len(role_findings)}",
    f"- Security groups with public ingress: {len(sg_findings)}",
    f"- Prowler high/critical findings: {sum(1 for f in prowler_findings if (f.severity or '').upper() in {'HIGH', 'CRITICAL'})}",
    "",
  ]

  if role_findings:
    lines.append("IAM Wildcard Roles:")
    for role in role_findings[:10]:
      lines.append(f"  • {role.role_name} ({role.arn}) — {len(role.wildcard_statements)} wildcard statements")
    if len(role_findings) > 10:
      lines.append(f"  … {len(role_findings) - 10} more")
    lines.append("")

  if sg_findings:
    lines.append("Security Groups with 0.0.0.0/0 or ::/0 ingress:")
    for sg in sg_findings[:10]:
      lines.append(f"  • {sg.group_id} ({sg.group_name}) — {len(sg.ingress)} risky rules")
    if len(sg_findings) > 10:
      lines.append(f"  … {len(sg_findings) - 10} more")
    lines.append("")

  high_sev = [f for f in prowler_findings if (f.severity or '').upper() in {"HIGH", "CRITICAL"}]
  if high_sev:
    lines.append("Prowler High/Critical findings:")
    for finding in high_sev[:10]:
      lines.append(f"  • [{finding.severity}] {finding.check} ({finding.resource})")
    if len(high_sev) > 10:
      lines.append(f"  … {len(high_sev) - 10} more")

  return "\n".join(lines).strip()


def build_stix_bundle(account_id: Optional[str], role_findings: List[RoleFinding], sg_findings: List[SecurityGroupFinding], prowler_findings: List[ProwlerFinding]) -> Bundle:
  now = datetime.now(timezone.utc)
  identity = Identity(
    name="Aegis AWS Posture Scanner",
    identity_class="system",
    description="Automated read-only compliance posture assessment",
  )

  notes: List[Note] = []

  for role in role_findings:
    content = f"IAM role {role.role_name} ({role.arn}) contains wildcard permissions."
    notes.append(
      Note(
        content=content,
        created=now,
        modified=now,
        object_refs=[identity.id],
        authors=["Aegis AWS Scanner"],
      )
    )

  for sg in sg_findings:
    ports = ", ".join(
      f"{rule.get('protocol', 'tcp')}:{rule.get('from_port')}–{rule.get('to_port')}->{rule.get('cidr')}"
      for rule in sg.ingress[:5]
    )
    content = f"Security group {sg.group_id} ({sg.group_name}) allows public ingress: {ports or 'rules truncated'}."
    notes.append(
      Note(
        content=content,
        created=now,
        modified=now,
        object_refs=[identity.id],
        authors=["Aegis AWS Scanner"],
      )
    )

  for finding in prowler_findings:
    content = (
      f"Prowler finding [{finding.severity}] {finding.check} against {finding.resource}. "
      f"Service: {finding.service}, Region: {finding.region or 'n/a'}."
    )
    notes.append(
      Note(
        content=content,
        created=now,
        modified=now,
        object_refs=[identity.id],
        authors=["Prowler"],
      )
    )

  report = Report(
    name=f"AWS Posture Scan {now.strftime('%Y-%m-%d %H:%M:%S UTC')}",
    description="Automated read-only compliance assessment for AWS configuration.",
    published=now,
    object_refs=[identity.id, *[note.id for note in notes]],
    labels=["threat-report", "compliance", "cloud-security"],
  )

  return Bundle(identity, *notes, report, allow_custom=True)


def write_json(path: Path, data: Any) -> None:
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def write_stix(path: Path, bundle: Bundle) -> None:
  path.parent.mkdir(parents=True, exist_ok=True)
  path.write_text(bundle.serialize(pretty=True), encoding="utf-8")


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
  parser = argparse.ArgumentParser(description="AWS Read-Only Posture Scan agent.")
  parser.add_argument("--mcp-base-url", default=DEFAULT_BASE_URL, help="Base URL for the AWS MCP server.")
  parser.add_argument("--mcp-token", default=DEFAULT_TOKEN, help="Bearer token for MCP authentication.")
  parser.add_argument("--region", default=os.getenv("AWS_REGION", "us-east-1"), help="AWS region to target.")
  parser.add_argument(
    "--prowler-check",
    dest="prowler_checks",
    action="append",
    help="Optional Prowler check IDs to include (can be specified multiple times).",
  )
  parser.add_argument("--organization", action="store_true", help="Run Prowler in AWS Organizations mode.")
  parser.add_argument("--output-json", default="aws-posture-findings.json", help="Path to write aggregated JSON findings.")
  parser.add_argument("--output-stix", default="aws-posture-report.stix.json", help="Path to write STIX 2.1 bundle.")
  parser.add_argument("--stdout", action="store_true", help="Also print aggregated summary to stdout.")
  return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
  args = parse_args(argv)

  client = MCPClient(args.mcp_base_url, args.mcp_token)

  list_roles_payload = client.call_tool("list_roles", region=args.region, include_policies=True)
  sg_payload = client.call_tool("describe_security_groups", region=args.region)
  prowler_payload = client.call_tool(
    "run_prowler_scan",
    region=args.region,
    checks=args.prowler_checks,
    organization=args.organization,
  )

  role_findings = extract_role_findings(list_roles_payload)
  sg_findings = extract_security_group_findings(sg_payload)
  prowler_findings = extract_prowler_findings(prowler_payload)

  summary = summarise(role_findings, sg_findings, prowler_findings)

  aggregated = {
    "generated_at": datetime.now(timezone.utc).isoformat(),
    "region": args.region,
    "iam_roles": [vars(role) for role in role_findings],
    "security_groups": [vars(sg) for sg in sg_findings],
    "prowler_findings": [vars(finding) for finding in prowler_findings],
    "summary": summary,
  }

  write_json(Path(args.output_json), aggregated)

  account_id = prowler_findings[0].account_id if prowler_findings and prowler_findings[0].account_id else None
  stix_bundle = build_stix_bundle(account_id, role_findings, sg_findings, prowler_findings)
  write_stix(Path(args.output_stix), stix_bundle)

  if args.stdout:
    print(summary)

  has_critical = any((f.severity or "").upper() == "CRITICAL" for f in prowler_findings)
  return 1 if has_critical else 0


if __name__ == "__main__":
  sys.exit(main())
