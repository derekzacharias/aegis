"""Parser for DoD STIG Checklist (CKL) files."""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional
from xml.etree import ElementTree as ET

from ..enums import FindingSeverity, FindingStatus


@dataclass(slots=True)
class ParsedFinding:
    """Normalized finding extracted from a CKL file."""

    rule_id: str
    severity: FindingSeverity
    status: FindingStatus
    comments: Optional[str]
    asset_id: Optional[int]


class CKLParserError(ValueError):
    """Raised when the CKL payload cannot be parsed."""


_SEVERITY_MAP = {
    "high": FindingSeverity.CAT_I,
    "medium": FindingSeverity.CAT_II,
    "low": FindingSeverity.CAT_III,
    "informational": FindingSeverity.INFO,
}

_STATUS_MAP = {
    "open": FindingStatus.OPEN,
    "notafinding": FindingStatus.NOT_A_FINDING,
    "notapplicable": FindingStatus.NOT_APPLICABLE,
    "review": FindingStatus.REVIEW_REQUIRED,
    "not a finding": FindingStatus.NOT_A_FINDING,
    "not applicable": FindingStatus.NOT_APPLICABLE,
    "not-reviewed": FindingStatus.REVIEW_REQUIRED,
}


def parse_ckl(content: bytes | str, *, asset_id: int | None = None) -> List[ParsedFinding]:
    """Parse CKL XML into normalized findings."""

    try:
        root = ET.fromstring(content)
    except ET.ParseError as exc:  # pragma: no cover - xml parsing errors are simple to surface
        raise CKLParserError("Invalid CKL XML payload") from exc

    findings: List[ParsedFinding] = []
    for vuln in root.findall(".//VULN"):
        stig_data = {
            data.findtext("VULN_ATTRIBUTE", default="").strip(): data.findtext("ATTRIBUTE_DATA", default="").strip()
            for data in vuln.findall("STIG_DATA")
        }

        rule_id = stig_data.get("Rule_ID") or stig_data.get("Vuln_Num")
        severity_raw = (stig_data.get("Severity") or "").strip().lower()
        status_raw = (vuln.findtext("STATUS", default="")).strip().lower()
        comments = vuln.findtext("COMMENTS")

        if not rule_id:
            continue

        severity = _SEVERITY_MAP.get(severity_raw)
        if not severity:
            raise CKLParserError(f"Unsupported severity '{severity_raw}' for rule '{rule_id}'")

        status = _STATUS_MAP.get(status_raw.replace(" ", ""))
        if not status:
            normalized = status_raw.replace("_", " ")
            status = _STATUS_MAP.get(normalized) or FindingStatus.REVIEW_REQUIRED

        findings.append(
            ParsedFinding(
                rule_id=rule_id,
                severity=severity,
                status=status,
                comments=comments.strip() if comments else None,
                asset_id=asset_id,
            )
        )

    return findings
