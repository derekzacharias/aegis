"""Placeholder parser for Chef InSpec JSON."""

from typing import Any, Dict, List


def parse_inspec(report: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Normalize InSpec JSON results (stub)."""

    return report.get("profiles", [])
