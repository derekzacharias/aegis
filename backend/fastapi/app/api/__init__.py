"""API router assembly for the FastAPI application."""

from fastapi import APIRouter

from . import assessments, findings, stig, uploads

api_router = APIRouter()
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(stig.router, prefix="/stig", tags=["stig"])
api_router.include_router(findings.router, prefix="/findings", tags=["findings"])

__all__ = ["api_router"]
