from __future__ import annotations

import sys

from botocore.exceptions import BotoCoreError, ClientError

from ..session import client


def main() -> int:
    try:
        sts = client("sts")
        identity = sts.get_caller_identity()
    except (BotoCoreError, ClientError) as exc:
        print(f"Failed to resolve STS identity: {exc}", file=sys.stderr)
        return 1

    account = identity.get("Account", "unknown")
    print(f"Caller identity confirmed for account {account}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
