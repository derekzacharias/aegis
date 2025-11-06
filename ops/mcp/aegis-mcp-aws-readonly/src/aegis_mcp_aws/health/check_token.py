from __future__ import annotations

import os
import sys


def main() -> int:
    token = os.getenv("MCP_AWS_TOKEN")
    if not token:
        print("MCP_AWS_TOKEN is not set or empty.", file=sys.stderr)
        return 1
    if len(token) < 16:
        print("MCP_AWS_TOKEN appears too short; please provide a secure token.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
