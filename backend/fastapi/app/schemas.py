"""Pydantic schemas for API requests and responses."""

from datetime import datetime
from typing import List, Optional

try:
    from pydantic import BaseModel, Field
except ModuleNotFoundError:  # pragma: no cover - fallback for lightweight test environments
    class BaseModel:  # type: ignore[override]
        """Minimal stand-in for pydantic.BaseModel when dependency is unavailable."""

        def __init__(self, **data):
            for key, value in data.items():
                setattr(self, key, value)

    def Field(default=None, **_kwargs):  # type: ignore[override]
        return default

from .enums import AssessmentStatus, FindingSeverity, FindingStatus


class TokenPair(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AssetCreate(BaseModel):
    hostname: str
    ip_address: Optional[str] = None
    platform: Optional[str] = None
    owner: Optional[str] = None


class AssetRead(AssetCreate):
    id: int

    class Config:
        orm_mode = True


class AssessmentRunRequest(BaseModel):
    asset_id: int
    profile_id: int
    connection: dict = Field(..., description="Parameters for runner connection, e.g. SSH host/credentials references.")


class AssessmentRead(BaseModel):
    id: int
    asset_id: int
    profile_id: int
    status: AssessmentStatus
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        orm_mode = True


class FindingBase(BaseModel):
    rule_id: str
    severity: FindingSeverity
    status: FindingStatus
    comments: Optional[str] = None
    asset_id: int


class FindingRead(FindingBase):
    id: int

    class Config:
        orm_mode = True


class CKLUploadResponse(BaseModel):
    count: int
    findings: List[FindingBase]


class DeltaFinding(BaseModel):
    rule_id: str
    severity: FindingSeverity
    before_status: Optional[FindingStatus]
    after_status: Optional[FindingStatus]
    changed: bool


class DeltaSummary(BaseModel):
    total: int
    improved: int
    regressed: int
    unchanged: int
    by_severity: dict[str, dict[str, int]]


class DeltaReport(BaseModel):
    findings: List[DeltaFinding]
    summary: DeltaSummary
