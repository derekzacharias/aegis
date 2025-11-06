from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from mcp.server.fastapi import FastAPIMCPServer, ToolError

from .analyzers import (
    analyze_iam_wildcards,
    analyze_s3_public,
    analyze_security_groups,
    load_plan,
)
from .commands import run_command
from .exceptions import InvalidInputError, ToolExecutionError

APP_NAME = "aegis-mcp-iac"
APP_VERSION = "0.1.0"

EXPECTED_TOKEN = os.getenv("MCP_IAC_TOKEN")


def _authorize(authorization: Optional[str] = Header(default=None)) -> None:
    if not EXPECTED_TOKEN:
        return
    token = None
    if authorization:
        parts = authorization.split("Bearer ")
        token = parts[-1].strip() if len(parts) > 1 else authorization.strip()
    if token != EXPECTED_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid MCP token.")


app = FastAPI(title="Aegis MCP IaC Server")
server = FastAPIMCPServer(app, APP_NAME, version=APP_VERSION, dependencies=[Depends(_authorize)])


async def _terraform_validate(working_directory: str) -> dict[str, Any]:
    working_dir = Path(working_directory).expanduser().resolve()
    if not working_dir.exists():
        raise InvalidInputError(f"Terraform working directory not found: {working_dir}")

    result = await run_command(
        ["terraform", "validate", "-json"],
        cwd=str(working_dir),
        expect_json=True,
    )
    return result


@server.tool(description="Run `terraform validate -json` against a module root.")
async def terraform_validate(working_directory: str) -> dict[str, Any]:
    try:
        return await _terraform_validate(working_directory)
    except InvalidInputError as exc:
        raise ToolError(str(exc)) from exc
    except ToolExecutionError as exc:
        raise ToolError(
            {
                "message": str(exc),
                "exit_code": exc.exit_code,
                "stdout": exc.stdout,
                "stderr": exc.stderr,
            }
        ) from exc


def _load_plan_safe(plan_path: Optional[str], state_path: Optional[str]):
    try:
        return load_plan(plan_path=plan_path, state_path=state_path)
    except InvalidInputError as exc:
        raise ToolError(str(exc)) from exc


@server.tool(description="Analyze Terraform security group rules for 0.0.0.0/0 or ::/0 ingress.")
async def check_security_groups(plan_path: Optional[str] = None, state_path: Optional[str] = None) -> dict[str, Any]:
    plan = _load_plan_safe(plan_path, state_path)
    return analyze_security_groups(plan)


@server.tool(description="Detect wildcard IAM permissions in Terraform-managed policies.")
async def check_iam_wildcards(
    plan_path: Optional[str] = None,
    state_path: Optional[str] = None,
    policy_documents: Optional[list[str]] = None,
) -> dict[str, Any]:
    plan = _load_plan_safe(plan_path, state_path)
    return analyze_iam_wildcards(plan, policy_documents=policy_documents)


@server.tool(description="Identify public exposure in Terraform-managed S3 buckets.")
async def check_s3_public(
    plan_path: Optional[str] = None,
    state_path: Optional[str] = None,
    bucket_names: Optional[list[str]] = None,
) -> dict[str, Any]:
    plan = _load_plan_safe(plan_path, state_path)
    return analyze_s3_public(plan, bucket_names=bucket_names or None)


def _ensure_event_loop() -> asyncio.AbstractEventLoop:
    try:
        return asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop


def main() -> None:
    """Entry point for running the MCP server under uvicorn."""
    import uvicorn

    host = os.getenv("MCP_HOST", "0.0.0.0")
    port = int(os.getenv("MCP_PORT", "8000"))

    # Ensure event loop exists before uvicorn starts (for tests/CLI execution).
    _ensure_event_loop()

    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
