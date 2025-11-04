"""Upload endpoints for ingesting assessment artifacts."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ..dependencies import UserContext, get_current_user
from ..parsers.ckl_parser import CKLParserError, parse_ckl
from ..schemas import CKLUploadResponse, FindingBase

router = APIRouter()


@router.post("/ckl", response_model=CKLUploadResponse)
async def upload_ckl(
    file: UploadFile = File(...),
    asset_id: int | None = None,
    current_user: UserContext = Depends(get_current_user),
) -> CKLUploadResponse:
    """Ingest a CKL file and return normalized findings."""

    content = await file.read()
    try:
        parsed = parse_ckl(content, asset_id=asset_id)
    except CKLParserError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    findings = [
        FindingBase(
            rule_id=item.rule_id,
            severity=item.severity,
            status=item.status,
            comments=item.comments,
            asset_id=asset_id or 0,
        )
        for item in parsed
    ]

    return CKLUploadResponse(count=len(findings), findings=findings)
