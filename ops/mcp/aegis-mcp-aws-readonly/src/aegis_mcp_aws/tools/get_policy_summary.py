from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

if __package__ in (None, ""):
    sys.path.append(str(Path(__file__).resolve().parents[2]))
    from aegis_mcp_aws.server import _get_policy_summary  # type: ignore  # noqa: E402
else:
    from ..server import _get_policy_summary  # noqa: F401


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize IAM policies with wildcard statements.")
    parser.add_argument("--region", help="AWS region to query.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    try:
        result = asyncio.run(_get_policy_summary(region=args.region))  # type: ignore
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
