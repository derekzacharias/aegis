from __future__ import annotations

import asyncio
import json
import os
import subprocess
from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from mcp.server.fastapi import FastAPIMCPServer, ToolError

from .exceptions import AWSToolError, ToolExecutionError
from .session import client
from .utils import ensure_list, statement_has_wildcard

APP_NAME = "aegis-mcp-aws-readonly"
APP_VERSION = "0.1.0"
EXPECTED_TOKEN = os.getenv("MCP_AWS_TOKEN")


def _authorize(authorization: Optional[str] = Header(default=None)) -> None:
    if not EXPECTED_TOKEN:
        return
    token = None
    if authorization:
        parts = authorization.split("Bearer ")
        token = parts[-1].strip() if len(parts) > 1 else authorization.strip()
    if token != EXPECTED_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid MCP token.")


app = FastAPI(title="Aegis MCP AWS Read-Only Server")
server = FastAPIMCPServer(app, APP_NAME, version=APP_VERSION, dependencies=[Depends(_authorize)])


async def _to_thread(func, *args, **kwargs):
    return await asyncio.to_thread(func, *args, **kwargs)


async def _list_roles(region: Optional[str] = None, include_policies: bool = True) -> dict[str, Any]:
    iam = client("iam", region=region)

    def _list() -> list[dict[str, Any]]:
        paginator = iam.get_paginator("list_roles")
        roles = []
        for page in paginator.paginate():
            roles.extend(page.get("Roles", []))
        return roles

    roles = await _to_thread(_list)
    response: list[dict[str, Any]] = []

    for role in roles:
        role_name = role["RoleName"]
        role_entry = {
            "role_name": role_name,
            "arn": role["Arn"],
            "path": role.get("Path"),
            "assume_role_policy_document": role.get("AssumeRolePolicyDocument"),
            "wildcard_trust_policy": False,
            "wildcard_inline_policies": [],
            "wildcard_statements": [],
            "inline_policies": [],
        }

        assume_doc = role_entry["assume_role_policy_document"]
        if assume_doc:
            for stmt in ensure_list(assume_doc.get("Statement")):
                if statement_has_wildcard(stmt):
                    role_entry["wildcard_trust_policy"] = True
                    break

        if include_policies:
            inline = await _to_thread(iam.list_role_policies, RoleName=role_name)
            for policy_name in inline.get("PolicyNames", []):
                policy = await _to_thread(iam.get_role_policy, RoleName=role_name, PolicyName=policy_name)
                document = policy["PolicyDocument"]
                role_entry["inline_policies"].append({"name": policy_name, "document": document})
                for stmt in ensure_list(document.get("Statement")):
                    if statement_has_wildcard(stmt):
                        role_entry["wildcard_inline_policies"].append(policy_name)
                        role_entry["wildcard_statements"].append({"policy": policy_name, "statement": stmt})
                        break

            attached = await _to_thread(iam.list_attached_role_policies, RoleName=role_name)
            role_entry["attached_policies"] = attached.get("AttachedPolicies", [])
            for policy_ref in role_entry["attached_policies"]:
                policy_arn = policy_ref.get("PolicyArn")
                if not policy_arn:
                    continue
                policy_meta = await _to_thread(iam.get_policy, PolicyArn=policy_arn)
                default_version_id = policy_meta["Policy"]["DefaultVersionId"]
                policy_version = await _to_thread(
                    iam.get_policy_version, PolicyArn=policy_arn, VersionId=default_version_id
                )
                document = policy_version["PolicyVersion"]["Document"]
                for stmt in ensure_list(document.get("Statement")):
                    if statement_has_wildcard(stmt):
                        role_entry["wildcard_statements"].append({"policy": policy_ref.get("PolicyName"), "statement": stmt})
                        break

        response.append(role_entry)

    return {"roles": response}


async def _get_policy_summary(region: Optional[str] = None) -> dict[str, Any]:
    iam = client("iam", region=region)

    def _fetch():
        return iam.get_account_authorization_details(MaxItems=1000)

    details = await _to_thread(_fetch)
    policies = details.get("Policies", [])
    summaries = []

    for policy in policies:
        document_versions = policy.get("PolicyVersionList", [])
        latest = next((p for p in document_versions if p.get("IsDefaultVersion")), None)
        if not latest:
            continue
        document = latest.get("Document") or {}
        wildcard_statements = [
            stmt for stmt in ensure_list(document.get("Statement")) if statement_has_wildcard(stmt)
        ]
        if wildcard_statements:
            summaries.append(
                {
                    "policy_name": policy.get("PolicyName"),
                    "arn": policy.get("Arn"),
                    "wildcard_statements": wildcard_statements,
                }
            )

    return {"policies": summaries}


async def _describe_security_groups(region: Optional[str] = None, vpc_id: Optional[str] = None) -> dict[str, Any]:
    ec2 = client("ec2", region=region)

    def _fetch():
        params = {}
        if vpc_id:
            params["Filters"] = [{"Name": "vpc-id", "Values": [vpc_id]}]
        return ec2.describe_security_groups(**params)

    result = await _to_thread(_fetch)
    groups = []
    for sg in result.get("SecurityGroups", []):
        findings = []
        for permission in sg.get("IpPermissions", []):
            ip_ranges = permission.get("IpRanges", [])
            ipv6_ranges = permission.get("Ipv6Ranges", [])
            from_port = permission.get("FromPort")
            to_port = permission.get("ToPort")
            protocol = permission.get("IpProtocol")
            for cidr in ip_ranges:
                if cidr.get("CidrIp") == "0.0.0.0/0":
                    findings.append(
                        {
                            "cidr": cidr["CidrIp"],
                            "from_port": from_port,
                            "to_port": to_port,
                            "protocol": protocol,
                        }
                    )
            for cidr in ipv6_ranges:
                if cidr.get("CidrIpv6") == "::/0":
                    findings.append(
                        {
                            "cidr": cidr["CidrIpv6"],
                            "from_port": from_port,
                            "to_port": to_port,
                            "protocol": protocol,
                        }
                    )
        if findings:
            groups.append(
                {
                    "group_id": sg.get("GroupId"),
                    "group_name": sg.get("GroupName"),
                    "description": sg.get("Description"),
                    "vpc_id": sg.get("VpcId"),
                    "ingress": findings,
                }
            )

    return {"security_groups": groups}


def _run_prowler(region: Optional[str] = None, checks: Optional[list[str]] = None, organization: bool = False):
    cmd = ["prowler", "aws", "--output", "json-asff"]
    if region:
        cmd.extend(["-r", region])
    if checks:
        cmd.extend(["-c", ",".join(checks)])
    if organization:
        cmd.append("--organization")

    env = os.environ.copy()
    env.setdefault("AWS_REGION", region or env.get("AWS_REGION", "us-east-1"))

    process = subprocess.run(
        cmd,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )

    if process.returncode != 0:
        raise ToolExecutionError(
            "Prowler scan failed",
            exit_code=process.returncode,
            stdout=process.stdout,
            stderr=process.stderr,
        )

    try:
        findings = json.loads(process.stdout)
    except json.JSONDecodeError as exc:
        raise ToolExecutionError("Failed to parse Prowler JSON output", stdout=process.stdout, stderr=process.stderr) from exc

    if isinstance(findings, dict) and "findings" in findings:
        findings_list = findings["findings"]
    elif isinstance(findings, list):
        findings_list = findings
    else:
        findings_list = []

    filtered = [
        item
        for item in findings_list
        if item.get("Severity", {}).get("Label") in {"HIGH", "CRITICAL"}
        or item.get("Resources", [{}])[0].get("Type") in {"AWS::IAM::Role", "AWS::S3::Bucket", "AWS::EC2::SecurityGroup"}
    ]
    return {"findings": filtered}


@server.tool(description="List IAM roles and highlight wildcard permissions.")
async def list_roles(region: Optional[str] = None, include_policies: bool = True) -> dict[str, Any]:
    try:
        return await _list_roles(region=region, include_policies=include_policies)
    except AWSToolError as exc:
        raise ToolError({"message": str(exc), "service": exc.service}) from exc


@server.tool(description="Summarize IAM policies with wildcard statements.")
async def get_policy_summary(region: Optional[str] = None) -> dict[str, Any]:
    try:
        return await _get_policy_summary(region=region)
    except AWSToolError as exc:
        raise ToolError({"message": str(exc), "service": exc.service}) from exc


@server.tool(description="Describe security groups allowing public ingress.")
async def describe_security_groups(region: Optional[str] = None, vpc_id: Optional[str] = None) -> dict[str, Any]:
    try:
        return await _describe_security_groups(region=region, vpc_id=vpc_id)
    except AWSToolError as exc:
        raise ToolError({"message": str(exc), "service": exc.service}) from exc


@server.tool(description="Run Prowler AWS scan and return filtered findings.")
async def run_prowler_scan(
    region: Optional[str] = None,
    checks: Optional[list[str]] = None,
    organization: bool = False,
) -> dict[str, Any]:
    try:
        return await _to_thread(_run_prowler, region=region, checks=checks, organization=organization)
    except ToolExecutionError as exc:
        raise ToolError(
            {
                "message": str(exc),
                "exit_code": exc.exit_code,
                "stdout": exc.stdout,
                "stderr": exc.stderr,
            }
        ) from exc


def _ensure_event_loop() -> asyncio.AbstractEventLoop:
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop


def main() -> None:
    import uvicorn

    host = os.getenv("MCP_HOST", "0.0.0.0")
    port = int(os.getenv("MCP_PORT", "8000"))

    _ensure_event_loop()
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
