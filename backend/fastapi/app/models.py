"""SQLAlchemy models for core AegisGRC entities."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .enums import AssessmentStatus, FindingSeverity, FindingStatus


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Asset(Base):
    """Managed infrastructure or application subject to compliance checks."""

    __tablename__ = "assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hostname: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    platform: Mapped[Optional[str]] = mapped_column(String(128))
    owner: Mapped[Optional[str]] = mapped_column(String(255))

    assessments: Mapped[List["Assessment"]] = relationship(back_populates="asset", cascade="all, delete-orphan")
    evidence: Mapped[List["Evidence"]] = relationship(back_populates="asset", cascade="all, delete-orphan")


class Profile(Base):
    """Compliance profile grouping controls and benchmarks."""

    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    framework: Mapped[str] = mapped_column(String(128), nullable=False)

    assessments: Mapped[List["Assessment"]] = relationship(back_populates="profile")

class Assessment(Base):
    """Execution of a profile against an asset."""

    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    status: Mapped[AssessmentStatus] = mapped_column(Enum(AssessmentStatus), default=AssessmentStatus.DRAFT, nullable=False)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    findings_snapshot: Mapped[Optional[dict]] = mapped_column(JSON)

    asset: Mapped[Asset] = relationship(back_populates="assessments")
    profile: Mapped[Profile] = relationship(back_populates="assessments")
    findings: Mapped[List["Finding"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")
    evidence: Mapped[List["Evidence"]] = relationship(back_populates="assessment")
class Finding(Base):
    """Normalized compliance finding."""

    __tablename__ = "findings"
    __table_args__ = (UniqueConstraint("assessment_id", "rule_id", name="uq_findings_assessment_rule"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    rule_id: Mapped[str] = mapped_column(String(128), nullable=False)
    severity: Mapped[FindingSeverity] = mapped_column(Enum(FindingSeverity), nullable=False)
    status: Mapped[FindingStatus] = mapped_column(Enum(FindingStatus), nullable=False)
    comments: Mapped[Optional[str]] = mapped_column(Text)
    raw_details: Mapped[Optional[dict]] = mapped_column(JSON)

    assessment: Mapped[Assessment] = relationship(back_populates="findings")
    asset: Mapped[Asset] = relationship()
    waiver: Mapped[Optional["Waiver"]] = relationship(back_populates="finding", uselist=False, cascade="all, delete-orphan")
    evidence: Mapped[List["Evidence"]] = relationship(back_populates="finding")


class Waiver(Base):
    """Risk acceptance for a finding."""

    __tablename__ = "waivers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    finding_id: Mapped[int] = mapped_column(ForeignKey("findings.id"), unique=True, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[Optional[str]] = mapped_column(String(255))
    justification: Mapped[Optional[str]] = mapped_column(Text)

    finding: Mapped[Finding] = relationship(back_populates="waiver")


class Evidence(Base):
    """Artifacts captured during assessments or remediation."""

    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    assessment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("assessments.id"))
    finding_id: Mapped[Optional[int]] = mapped_column(ForeignKey("findings.id"))
    storage_uri: Mapped[str] = mapped_column(String(512), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    content_type: Mapped[Optional[str]] = mapped_column(String(128))
    metadata: Mapped[Optional[dict]] = mapped_column(JSON)
    quarantined: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    asset: Mapped[Asset] = relationship(back_populates="evidence")
    assessment: Mapped[Optional[Assessment]] = relationship(back_populates="evidence")
    finding: Mapped[Optional[Finding]] = relationship(back_populates="evidence")


__all__ = [
    "Asset",
    "Profile",
    "Assessment",
    "AssessmentStatus",
    "Finding",
    "FindingSeverity",
    "FindingStatus",
    "Waiver",
    "Evidence",
    "Base",
]
