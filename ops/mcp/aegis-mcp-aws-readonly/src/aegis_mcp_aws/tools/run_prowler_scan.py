from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))
    from aegis_mcp_aws.server import _run_prowler  # type: ignore  # noqa: E402
else:
    from ..server import _run_prowler  # noqa: F401


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Execute Prowler scan and return filtered findings.")
    parser.add_argument("--region", help="AWS region to target.")
    parser.add_argument(
        "--check",
        dest="checks",
        action="append",
        help="Specific Prowler check ID(s) to include (can be provided multiple times).",
    )
    parser.add_argument("--organization", action="store_true", help="Enable AWS Organizations scanning mode.")
    return parser.parse_args(argv)


async def _run_async(region: str | None, checks: list[str] | None, organization: bool) -> dict:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _run_prowler, region, checks, organization)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    try:
        result = asyncio.run(_run_async(args.region, args.checks, args.organization))  # type: ignore
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
