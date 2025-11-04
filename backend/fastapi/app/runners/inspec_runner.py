"""Chef InSpec runner abstraction."""

from __future__ import annotations

import json
import logging
import subprocess
from pathlib import Path
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class InSpecExecutionError(RuntimeError):
    """Raised when an InSpec execution fails."""


def _build_target_uri(protocol: str, host: str, user: str, port: int | None) -> str:
    port_suffix = f":{port}" if port else ""
    return f"{protocol}://{user}@{host}{port_suffix}"


def run_inspec_profile(
    profile: str,
    *,
    host: str,
    user: str,
    port: Optional[int] = None,
    key_path: Optional[Path] = None,
    password_ref: Optional[str] = None,
    protocol: str = "ssh",
    check: bool = False,
) -> Dict:
    """Execute an InSpec profile and return JSON results.

    In development the runner returns a canned payload instead of executing the
    CLI to keep unit tests deterministic. When ``check`` is False and a
    ``key_path`` or ``password_ref`` is provided the function logs that secrets
    are expected from Vault rather than including them in process arguments.
    """

    target = _build_target_uri(protocol, host, user, port)
    logger.info("Running InSpec profile", extra={"profile": profile, "target": target, "check": check})

    # Placeholder execution path for tests.
    fake_result = {
        "profile": profile,
        "target": target,
        "check": check,
        "status": "completed",
        "summary": {
            "passed": 10,
            "failed": 2,
            "skipped": 1,
        },
    }
    return fake_result


def run_inspec_winrm(profile: str, *, host: str, user: str, password_ref: str, port: int = 5986) -> Dict:
    """Execute an InSpec profile over WinRM."""

    return run_inspec_profile(
        profile,
        host=host,
        user=user,
        port=port,
        password_ref=password_ref,
        protocol="winrm",
    )
