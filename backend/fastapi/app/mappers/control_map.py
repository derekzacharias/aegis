"""Example control mappings between STIG and NIST 800-53 controls."""

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class ControlMapping:
    source_control: str
    target_control: str
    confidence: float
    rationale: str


STIG_TO_800_53: Dict[str, List[ControlMapping]] = {
    "V-12345": [
        ControlMapping(
            source_control="V-12345",
            target_control="AC-2",
            confidence=0.9,
            rationale="Account management requirements align with AC-2 baseline language.",
        )
    ],
    "V-67890": [
        ControlMapping(
            source_control="V-67890",
            target_control="SI-2",
            confidence=0.8,
            rationale="Malware protection procedures overlap with SI-2 expectations.",
        ),
        ControlMapping(
            source_control="V-67890",
            target_control="CM-6",
            confidence=0.6,
            rationale="Configuration hardening intersects with CM-6 configuration settings.",
        ),
    ],
}

__all__ = ["ControlMapping", "STIG_TO_800_53"]
