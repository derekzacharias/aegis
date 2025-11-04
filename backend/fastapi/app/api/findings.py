"""Findings APIs including export operations."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status

from ..dependencies import UserContext, get_current_user
from ..enums import FindingSeverity, FindingStatus
from ..schemas import FindingBase
from ..services.export_service import generate_ckl

router = APIRouter()

_SAMPLE_FINDINGS = [
    FindingBase(
        rule_id="V-12345",
        severity=FindingSeverity.CAT_I,
        status=FindingStatus.OPEN,
        comments="Remediate immediately",
        asset_id=1,
    ),
    FindingBase(
        rule_id="V-67890",
        severity=FindingSeverity.CAT_II,
        status=FindingStatus.NOT_A_FINDING,
        comments="Compliant",
        asset_id=1,
    ),
]


@router.get("/export")
async def export_findings(
    format: str = "ckl",
    current_user: UserContext = Depends(get_current_user),
) -> Response:
    """Export findings in the requested format."""

    if format != "ckl":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only CKL export is supported in this build")

    payload = generate_ckl(_SAMPLE_FINDINGS, asset_name="Sample Asset")
    return Response(content=payload, media_type="application/xml")
