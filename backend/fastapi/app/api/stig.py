"""STIG hardening endpoints."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends

from ..dependencies import UserContext, get_current_user
from ..runners.ansible_runner import run_ansible

router = APIRouter()


@router.post("/apply")
async def apply_stig(
    rule_ids: List[str],
    enforce: bool = False,
    current_user: UserContext = Depends(get_current_user),
) -> dict:
    """Apply STIG hardening using Ansible."""

    result = run_ansible(rule_ids, enforce=enforce)
    return {"changed": result["changed"], "check": result["check"]}
