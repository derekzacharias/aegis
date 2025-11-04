"""Assessment related API routes."""

from __future__ import annotations

from itertools import count
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import UserContext, get_current_user
from ..enums import AssessmentStatus
from ..runners.inspec_runner import run_inspec_profile
from ..schemas import AssessmentRead, AssessmentRunRequest, DeltaReport
from ..services.delta_service import compute_delta

router = APIRouter()

_ASSESSMENT_SEQUENCE = count(1)
_ASSESSMENT_STORE: Dict[int, Dict[str, dict]] = {}

_SAMPLE_BASELINE = {
    "profiles": [
        {
            "name": "sample",
            "controls": [
                {"id": "V-12345", "impact": 0.9, "results": [{"status": "failed"}]},
                {"id": "V-67890", "impact": 0.5, "results": [{"status": "passed"}]},
            ],
        }
    ]
}

_SAMPLE_POST = {
    "profiles": [
        {
            "name": "sample",
            "controls": [
                {"id": "V-12345", "impact": 0.9, "results": [{"status": "passed"}]},
                {"id": "V-67890", "impact": 0.5, "results": [{"status": "passed"}]},
                {"id": "V-54321", "impact": 0.3, "results": [{"status": "skipped"}]},
            ],
        }
    ]
}


@router.post("/run", response_model=AssessmentRead)
async def run_assessment(
    request: AssessmentRunRequest,
    current_user: UserContext = Depends(get_current_user),
) -> AssessmentRead:
    """Trigger an InSpec assessment run."""

    result = run_inspec_profile(
        str(request.profile_id),
        host=request.connection.get("host", "localhost"),
        user=request.connection.get("user", "root"),
    )

    assessment_id = next(_ASSESSMENT_SEQUENCE)
    _ASSESSMENT_STORE[assessment_id] = {"baseline": _SAMPLE_BASELINE, "post": _SAMPLE_POST, "result": result}

    return AssessmentRead(
        id=assessment_id,
        asset_id=request.asset_id,
        profile_id=request.profile_id,
        status=AssessmentStatus.COMPLETED,
        started_at=None,
        completed_at=None,
    )


@router.get("/{assessment_id}/delta", response_model=DeltaReport)
async def get_delta(
    assessment_id: int,
    current_user: UserContext = Depends(get_current_user),
) -> DeltaReport:
    """Return the before-after delta for an assessment."""

    record = _ASSESSMENT_STORE.get(assessment_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    return compute_delta(record["baseline"], record["post"])
