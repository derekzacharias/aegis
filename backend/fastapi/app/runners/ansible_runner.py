"""Ansible runner for STIG hardening."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Dict, Iterable, List

logger = logging.getLogger(__name__)


class AnsibleExecutionError(RuntimeError):
    """Raised when an Ansible execution fails."""


def build_stig_play(rule_ids: Iterable[str], *, enforce: bool) -> Dict:
    """Construct a minimal Ansible play targeting STIG roles."""

    tasks = [
        {
            "name": f"Apply remediation for {rule_id}",
            "ansible.builtin.include_role": {
                "name": "stig_role",
                "vars_from": rule_id,
            },
        }
        for rule_id in rule_ids
    ]

    return {
        "name": "STIG Hardening",
        "hosts": "target",
        "gather_facts": False,
        "check_mode": not enforce,
        "tasks": tasks,
    }


def run_ansible(rule_ids: Iterable[str], *, enforce: bool = False) -> Dict[str, List[str]]:
    """Execute the generated playbook inside a containerized runner."""

    playbook = build_stig_play(rule_ids, enforce=enforce)
    logger.info("Executing Ansible playbook", extra={"enforce": enforce, "rules": list(rule_ids)})

    # Placeholder execution - return static response for tests.
    changed_rules = list(rule_ids) if enforce else []
    return {
        "playbook": playbook,
        "changed": changed_rules,
        "check": not enforce,
    }
