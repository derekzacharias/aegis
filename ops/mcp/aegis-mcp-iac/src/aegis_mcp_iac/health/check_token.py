from __future__ import annotations

import os
import sys


def main() -> int:
    token = os.getenv("MCP_IAC_TOKEN")
    if not token:
        print("MCP_IAC_TOKEN is not set or empty.", file=sys.stderr)
        return 1

    if len(token) < 16:
        print("MCP_IAC_TOKEN appears too short; ensure a secure token is provided.", file=sys.stderr)
        return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
