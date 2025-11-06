from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

from .exceptions import InvalidInputError


@dataclass(slots=True)
class PlanData:
    """Container for Terraform plan/state JSON."""

    source: str
    payload: dict[str, Any]


def _load_json_file(path: str | Path) -> dict[str, Any]:
    file_path = Path(path).expanduser().resolve()
    if not file_path.exists():
        raise InvalidInputError(f"JSON file does not exist: {file_path}")

    with file_path.open("r", encoding="utf-8") as handle:
        try:
            return json.load(handle)
        except json.JSONDecodeError as exc:
            raise InvalidInputError(f"Unable to parse JSON data at {file_path}") from exc


def load_plan(plan_path: str | None = None, state_path: str | None = None) -> PlanData:
    """
    Load Terraform plan or state JSON.

    At least one of `plan_path` or `state_path` must be provided.
    """

    if plan_path:
        return PlanData(source=str(Path(plan_path).expanduser().resolve()), payload=_load_json_file(plan_path))

    if state_path:
        return PlanData(source=str(Path(state_path).expanduser().resolve()), payload=_load_json_file(state_path))

    raise InvalidInputError("Either `plan_path` or `state_path` must be supplied.")


def _ensure_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _normalize_port_range(rule: dict[str, Any]) -> str:
    from_port = rule.get("from_port")
    to_port = rule.get("to_port")
    if from_port is None or to_port is None:
        return "unknown"
    if from_port == to_port:
        return str(from_port)
    return f"{from_port}-{to_port}"


def analyze_security_groups(plan: PlanData) -> dict[str, Any]:
    """Identify overly permissive security group rules."""

    findings: list[dict[str, Any]] = []

    for change in plan.payload.get("resource_changes", []):
        resource_type = change.get("type")
        address = change.get("address")
        after = (change.get("change") or {}).get("after") or {}

        if resource_type == "aws_security_group":
            for idx, rule in enumerate(_ensure_list(after.get("ingress"))):
                for cidr in _ensure_list(rule.get("cidr_blocks")):
                    if cidr == "0.0.0.0/0":
                        findings.append(
                            {
                                "resource": address,
                                "rule_id": f"{address}:ingress[{idx}]",
                                "cidr": cidr,
                                "port_range": _normalize_port_range(rule),
                                "severity": "CRITICAL",
                                "recommendation": "Restrict ingress CIDR to approved ranges.",
                            }
                        )
                for cidr in _ensure_list(rule.get("ipv6_cidr_blocks")):
                    if cidr in {"::/0", "0:0:0:0:0:0:0:0/0"}:
                        findings.append(
                            {
                                "resource": address,
                                "rule_id": f"{address}:ingress[{idx}]",
                                "cidr": cidr,
                                "port_range": _normalize_port_range(rule),
                                "severity": "HIGH",
                                "recommendation": "Restrict IPv6 ingress to approved ranges.",
                            }
                        )

        if resource_type == "aws_security_group_rule":
            after = (change.get("change") or {}).get("after") or {}
            if after.get("type") != "ingress":
                continue

            cidr_blocks = set(_ensure_list(after.get("cidr_blocks")))
            cidr_blocks.update(_ensure_list(after.get("ipv6_cidr_blocks")))
            if "0.0.0.0/0" in cidr_blocks or "::/0" in cidr_blocks:
                cidr = "0.0.0.0/0" if "0.0.0.0/0" in cidr_blocks else "::/0"
                findings.append(
                    {
                        "resource": address,
                        "rule_id": after.get("id") or address,
                        "cidr": cidr,
                        "port_range": _normalize_port_range(after),
                        "severity": "CRITICAL" if cidr == "0.0.0.0/0" else "HIGH",
                        "recommendation": "Restrict ingress CIDR to approved ranges.",
                    }
                )

    return {"source": plan.source, "findings": findings}


def _iter_policy_documents(plan: PlanData) -> Iterable[tuple[str, dict[str, Any]]]:
    for change in plan.payload.get("resource_changes", []):
        resource_type = change.get("type")
        address = change.get("address")
        after = (change.get("change") or {}).get("after") or {}

        policy_strings: list[tuple[str, str]] = []

        if resource_type in {"aws_iam_policy", "aws_iam_role_policy", "aws_iam_user_policy"}:
            if "policy" in after:
                policy_strings.append((address, after["policy"]))

        if resource_type == "aws_iam_role":
            assume_policy = after.get("assume_role_policy")
            if assume_policy:
                policy_strings.append((f"{address}:assume_role_policy", assume_policy))
            for name, policy in (after.get("inline_policies") or {}).items():
                policy_strings.append((f"{address}:inline::{name}", policy))

        if resource_type == "aws_iam_group_policy":
            if "policy" in after:
                policy_strings.append((address, after["policy"]))

        for key, policy in policy_strings:
            if isinstance(policy, str):
                try:
                    yield key, json.loads(policy)
                except json.JSONDecodeError:
                    continue
            elif isinstance(policy, dict):
                yield key, policy


def analyze_iam_wildcards(plan: PlanData, policy_documents: list[str] | None = None) -> dict[str, Any]:
    """Detect wildcard IAM permissions."""

    findings: list[dict[str, Any]] = []

    if policy_documents:
        for document_path in policy_documents:
            try:
                doc = _load_json_file(document_path)
            except InvalidInputError as exc:
                findings.append(
                    {
                        "resource": document_path,
                        "statement": "N/A",
                        "action": "N/A",
                        "resource_scope": "N/A",
                        "severity": "ERROR",
                        "nist_controls": ["CM-6"],
                        "recommendation": str(exc),
                    }
                )
                continue
            for idx, stmt in enumerate(_ensure_list(doc.get("Statement"))):
                findings.extend(_iam_statement_findings(stmt, f"{document_path}#Statement[{idx}]"))

    for address, policy in _iter_policy_documents(plan):
        for idx, stmt in enumerate(_ensure_list(policy.get("Statement"))):
            findings.extend(_iam_statement_findings(stmt, f"{address}#Statement[{idx}]"))

    return {"source": plan.source, "findings": findings}


def _iam_statement_findings(statement: dict[str, Any], resource_label: str) -> list[dict[str, Any]]:
    actions = _ensure_list(statement.get("Action"))
    resources = _ensure_list(statement.get("Resource"))

    wildcard_action = any(action in {"*", "*:*"} or (isinstance(action, str) and action.endswith(":*")) for action in actions)
    wildcard_resource = any(resource in {"*", "*:*"} for resource in resources)

    findings: list[dict[str, Any]] = []
    if wildcard_action or wildcard_resource:
        findings.append(
            {
                "resource": resource_label,
                "statement": statement.get("Sid") or "unspecified",
                "action": actions if len(actions) > 1 else actions[0] if actions else "*",
                "resource_scope": resources if len(resources) > 1 else resources[0] if resources else "*",
                "severity": "HIGH" if wildcard_action else "MEDIUM",
                "nist_controls": ["CM-6"],
                "recommendation": "Replace wildcard with least-privilege actions/resources.",
            }
        )

    return findings


def analyze_s3_public(plan: PlanData, bucket_names: list[str] | None = None) -> dict[str, Any]:
    """Evaluate S3 buckets for public exposure."""

    findings: list[dict[str, Any]] = []
    bucket_filters = set(bucket_names or [])

    for change in plan.payload.get("resource_changes", []):
        resource_type = change.get("type")
        address = change.get("address")
        after = (change.get("change") or {}).get("after") or {}

        bucket_name = after.get("bucket") or after.get("id") or address
        if bucket_filters and bucket_name not in bucket_filters:
            continue

        if resource_type == "aws_s3_bucket":
            acl = after.get("acl")
            if acl in {"public-read", "public-read-write", "website"}:
                findings.append(
                    {
                        "resource": address,
                        "issue": f"Bucket ACL set to {acl}.",
                        "severity": "HIGH",
                        "nist_controls": ["CM-2"],
                        "recommendation": "Set bucket ACL to private and enable block public access.",
                    }
                )

            policy = after.get("policy")
            if isinstance(policy, str):
                try:
                    policy_doc = json.loads(policy)
                except json.JSONDecodeError:
                    policy_doc = None
            elif isinstance(policy, dict):
                policy_doc = policy
            else:
                policy_doc = None

            if policy_doc:
                if _policy_allows_public_access(policy_doc):
                    findings.append(
                        {
                            "resource": address,
                            "issue": "Bucket policy allows public access.",
                            "severity": "HIGH",
                            "nist_controls": ["CM-2"],
                            "recommendation": "Restrict bucket policy principals and conditions.",
                        }
                    )

        if resource_type == "aws_s3_bucket_policy":
            policy_doc = after.get("policy")
            if isinstance(policy_doc, str):
                try:
                    policy_doc = json.loads(policy_doc)
                except json.JSONDecodeError:
                    policy_doc = None

            if policy_doc and _policy_allows_public_access(policy_doc):
                findings.append(
                    {
                        "resource": address,
                        "issue": "Bucket policy allows public access.",
                        "severity": "HIGH",
                        "nist_controls": ["CM-2"],
                        "recommendation": "Restrict bucket policy principals and conditions.",
                    }
                )

        if resource_type == "aws_s3_bucket_public_access_block":
            if after.get("block_public_acls") is False or after.get("block_public_policy") is False:
                findings.append(
                    {
                        "resource": address,
                        "issue": "Block public access controls are disabled.",
                        "severity": "HIGH",
                        "nist_controls": ["CM-2"],
                        "recommendation": "Enable all S3 block public access settings.",
                    }
                )

    return {"source": plan.source, "findings": findings}


def _policy_allows_public_access(policy: dict[str, Any]) -> bool:
    for stmt in _ensure_list(policy.get("Statement")):
        if stmt.get("Effect") != "Allow":
            continue

        principals = stmt.get("Principal")
        principal_all = principals == "*" or principals == {"AWS": "*"}
        if isinstance(principals, dict):
            principal_all = any(value == "*" or value == ["*"] for value in principals.values())

        if not principal_all:
            continue

        condition = stmt.get("Condition") or {}
        if condition:
            # Treat conditions as mitigating only if they restrict to specific sources.
            aws_principal_orgs = condition.get("StringEquals", {}).get("aws:PrincipalOrgID")
            if aws_principal_orgs:
                continue

        return True

    return False
