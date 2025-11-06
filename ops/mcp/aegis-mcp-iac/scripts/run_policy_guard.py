#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterable
from urllib import error as urllib_error
from urllib import request as urllib_request

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from aegis_mcp_iac.analyzers import (  # noqa: E402
    analyze_iam_wildcards,
    analyze_s3_public,
    analyze_security_groups,
    load_plan,
)
from aegis_mcp_iac.exceptions import InvalidInputError  # noqa: E402


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run IaC Policy Guard checks locally or in CI.")
    parser.add_argument(
        "--module",
        dest="modules",
        action="append",
        help="Terraform module directory to scan (can be provided multiple times). Defaults to repository root.",
    )
    parser.add_argument(
        "--skip-plan",
        action="store_true",
        help="Skip generating terraform plan (only run terraform validate).",
    )
    parser.add_argument(
        "--summary-file",
        help="Optional path to write markdown summary output.",
    )
    return parser.parse_args()


def discover_modules(modules: list[str] | None) -> list[Path]:
    if modules:
        return [Path(module).resolve() for module in modules]

    root = Path.cwd()
    terraform_dirs: set[Path] = set()
    for tf_file in root.glob("**/*.tf"):
        terraform_dirs.add(tf_file.parent.resolve())

    return sorted(terraform_dirs) or [root]


def run_terraform(cmd: Iterable[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["terraform", *cmd],
        cwd=cwd,
        text=True,
        capture_output=True,
        check=False,
    )


def generate_plan(module: Path) -> Path | None:
    with tempfile.TemporaryDirectory(prefix="iac-plan-") as tmp_dir:
        plan_path = Path(tmp_dir) / "plan.tfplan"
        plan_json_path = Path(tmp_dir) / "plan.json"

        init_result = run_terraform(["init", "-input=false", "-backend=false"], module)
        if init_result.returncode != 0:
            print(f"[WARN] terraform init failed in {module}: {init_result.stderr}", file=sys.stderr)
            return None

        plan_result = run_terraform(
            ["plan", "-input=false", "-lock=false", "-out", str(plan_path), "-refresh=false"],
            module,
        )
        if plan_result.returncode != 0:
            print(f"[WARN] terraform plan failed in {module}: {plan_result.stderr}", file=sys.stderr)
            return None

        show_result = run_terraform(["show", "-json", str(plan_path)], module)
        if show_result.returncode != 0:
            print(f"[WARN] terraform show failed in {module}: {show_result.stderr}", file=sys.stderr)
            return None

        plan_json_path.write_text(show_result.stdout, encoding="utf-8")
        # Persist plan json by copying to module-specific temp file
        persisted = Path(tempfile.mkdtemp(prefix="iac-plan-data-")) / f"{module.name}-plan.json"
        persisted.write_text(show_result.stdout, encoding="utf-8")
        return persisted


def record_summary(summary: str) -> None:
    step_summary = os.getenv("GITHUB_STEP_SUMMARY")
    if step_summary:
        with open(step_summary, "a", encoding="utf-8") as handle:
            handle.write(summary)
            if not summary.endswith("\n"):
                handle.write("\n")


def _github_api_request(method: str, url: str, token: str, payload: dict | None = None) -> dict | list:
    data = None
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "aegis-policy-guard",
    }
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib_request.Request(url, data=data, headers=headers, method=method)
    with urllib_request.urlopen(request, timeout=30) as response:
        body = response.read().decode("utf-8")
        if not body:
            return {}
        return json.loads(body)


def _find_existing_comment(repo: str, pr_number: int, token: str) -> int | None:
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments?per_page=100"
    comments = _github_api_request("GET", url, token, None)
    if not isinstance(comments, list):
        return None

    for comment in comments:
        body = comment.get("body")
        if isinstance(body, str) and body.startswith("<!-- aegis-policy-guard -->"):
            return comment.get("id")
    return None


def _publish_github_comment(summary: str, success: bool) -> None:
    event_name = os.getenv("GITHUB_EVENT_NAME")
    token = os.getenv("GITHUB_TOKEN")
    repo = os.getenv("GITHUB_REPOSITORY")
    event_path = os.getenv("GITHUB_EVENT_PATH")

    if event_name != "pull_request" or not token or not repo or not event_path:
        return

    try:
        with open(event_path, "r", encoding="utf-8") as handle:
            event_payload = json.load(handle)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"[WARN] Unable to read GitHub event payload: {exc}", file=sys.stderr)
        return

    pr_number = event_payload.get("number") or (event_payload.get("pull_request") or {}).get("number")
    if not pr_number:
        return

    body = (
        "<!-- aegis-policy-guard -->\n"
        f"{'✅' if success else '❌'} **IaC Policy Guard**\n\n"
        f"{summary.strip()}\n"
    )

    try:
        existing_comment_id = _find_existing_comment(repo, int(pr_number), token)
        if existing_comment_id:
            url = f"https://api.github.com/repos/{repo}/issues/comments/{existing_comment_id}"
            _github_api_request("PATCH", url, token, {"body": body})
        else:
            url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
            _github_api_request("POST", url, token, {"body": body})
    except urllib_error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="ignore")
        status = getattr(exc, "code", "unknown")
        reason = getattr(exc, "reason", "unknown")
        print(f"[WARN] Unable to publish GitHub comment: {status} {reason} — {error_body}", file=sys.stderr)
    except Exception as exc:  # pragma: no cover - defensive log
        print(f"[WARN] Unable to publish GitHub comment: {exc}", file=sys.stderr)


def format_findings(title: str, findings: list[dict]) -> str:
    if not findings:
        return f"- ✅ {title}: no findings\n"

    lines = [f"- ❌ {title}: {len(findings)} finding(s)"]
    for finding in findings[:10]:
        summary_parts = []
        resource = finding.get("resource") or finding.get("issue")
        if resource:
            summary_parts.append(f"`{resource}`")
        cidr = finding.get("cidr")
        if cidr:
            summary_parts.append(cidr)
        recommendation = finding.get("recommendation") or finding.get("issue")
        if recommendation:
            summary_parts.append(recommendation)
        lines.append(f"  - {' — '.join(summary_parts)}")
    if len(findings) > 10:
        lines.append(f"  - … {len(findings) - 10} additional finding(s)")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    modules = discover_modules(args.modules)

    overall_status = 0
    summary_lines = ["## IaC Policy Guard Results\n"]

    for module in modules:
        print(f"[INFO] Scanning module: {module}")
        validate_result = run_terraform(["validate", "-json"], module)
        if validate_result.returncode != 0:
            print(validate_result.stdout)
            print(validate_result.stderr, file=sys.stderr)
            summary_lines.append(
                f"- ❌ `{module}`: terraform validate failed (see logs above)."
            )
            overall_status = 1
            continue

        plan_json_path: Path | None = None
        if not args.skip_plan:
            plan_json_path = generate_plan(module)

        if not plan_json_path:
            summary_lines.append(f"- ⚠️ `{module}`: plan unavailable; skipped analyzer checks.")
            continue

        try:
            plan = load_plan(plan_path=str(plan_json_path))
        except InvalidInputError as exc:
            print(f"[WARN] Unable to load plan for {module}: {exc}", file=sys.stderr)
            summary_lines.append(f"- ⚠️ `{module}`: plan load failed; skipped analyzer checks.")
            continue

        if not plan:
            continue

        sg_findings = analyze_security_groups(plan)["findings"]
        iam_findings = analyze_iam_wildcards(plan)["findings"]
        s3_findings = analyze_s3_public(plan)["findings"]

        module_summary = [
            f"### Module `{module}`",
            format_findings("Security Groups", sg_findings),
            format_findings("IAM Policies", iam_findings),
            format_findings("S3 Buckets", s3_findings),
        ]
        summary_lines.append("\n".join(module_summary))

        if any([sg_findings, iam_findings, s3_findings]):
            overall_status = 1

    final_summary = "\n".join(summary_lines)
    print(final_summary)
    record_summary(final_summary)
    if args.summary_file:
        Path(args.summary_file).write_text(final_summary, encoding="utf-8")
    _publish_github_comment(final_summary, overall_status == 0)
    return overall_status


if __name__ == "__main__":
    raise SystemExit(main())
