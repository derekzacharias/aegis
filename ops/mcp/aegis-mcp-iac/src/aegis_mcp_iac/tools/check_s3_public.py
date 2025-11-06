from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Sequence

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))
    from aegis_mcp_iac.analyzers import analyze_s3_public, load_plan  # type: ignore  # noqa: E402
    from aegis_mcp_iac.exceptions import InvalidInputError  # type: ignore  # noqa: E402
else:
    from ..analyzers import analyze_s3_public, load_plan  # noqa: F401
    from ..exceptions import InvalidInputError  # noqa: F401


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate Terraform S3 resources for public exposure.")
    parser.add_argument("--plan-path", help="Path to Terraform plan JSON.")
    parser.add_argument("--state-path", help="Path to Terraform state JSON.")
    parser.add_argument(
        "--bucket",
        dest="bucket_names",
        action="append",
        help="Filter to specific bucket name(s).",
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)

    try:
        plan = load_plan(plan_path=args.plan_path, state_path=args.state_path)
    except InvalidInputError as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 2

    result = analyze_s3_public(plan, bucket_names=args.bucket_names)
    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
