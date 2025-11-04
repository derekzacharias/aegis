"""Shared enumeration definitions for findings and assessments."""

from enum import Enum


class AssessmentStatus(str, Enum):
    DRAFT = "draft"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class FindingSeverity(str, Enum):
    CAT_I = "CAT_I"
    CAT_II = "CAT_II"
    CAT_III = "CAT_III"
    INFO = "INFO"


class FindingStatus(str, Enum):
    OPEN = "open"
    NOT_A_FINDING = "not_a_finding"
    NOT_APPLICABLE = "not_applicable"
    REVIEW_REQUIRED = "review_required"


__all__ = ["AssessmentStatus", "FindingSeverity", "FindingStatus"]
