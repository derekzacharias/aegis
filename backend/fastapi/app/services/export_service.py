"""Export services including CKL regeneration."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from typing import Iterable

from ..enums import FindingSeverity, FindingStatus
from ..schemas import FindingBase


_SEVERITY_LABEL = {
    FindingSeverity.CAT_I: "high",
    FindingSeverity.CAT_II: "medium",
    FindingSeverity.CAT_III: "low",
    FindingSeverity.INFO: "informational",
}

_STATUS_LABEL = {
    FindingStatus.OPEN: "Open",
    FindingStatus.NOT_A_FINDING: "NotAFinding",
    FindingStatus.NOT_APPLICABLE: "NotApplicable",
    FindingStatus.REVIEW_REQUIRED: "Not_Reviewed",
}


def generate_ckl(findings: Iterable[FindingBase], asset_name: str = "Unknown Asset") -> str:
    """Generate a CKL XML payload from normalized findings."""

    checklist = ET.Element("CHECKLIST")
    asset = ET.SubElement(checklist, "ASSET")
    ET.SubElement(asset, "ASSET_NAME").text = asset_name

    stigs = ET.SubElement(checklist, "STIGS")
    istig = ET.SubElement(stigs, "iSTIG")

    for finding in findings:
        vuln = ET.SubElement(istig, "VULN")
        status_text = _STATUS_LABEL.get(finding.status, "Not_Reviewed")
        ET.SubElement(vuln, "STATUS").text = status_text
        ET.SubElement(vuln, "FINDING_DETAILS").text = finding.comments or ""
        ET.SubElement(vuln, "COMMENTS").text = finding.comments or ""

        def _stig_data(attribute: str, value: str) -> None:
            stig_data = ET.SubElement(vuln, "STIG_DATA")
            ET.SubElement(stig_data, "VULN_ATTRIBUTE").text = attribute
            ET.SubElement(stig_data, "ATTRIBUTE_DATA").text = value

        _stig_data("Vuln_Num", finding.rule_id)
        _stig_data("Rule_ID", finding.rule_id)
        severity_label = _SEVERITY_LABEL.get(finding.severity, "low")
        _stig_data("Severity", severity_label)

    return ET.tostring(checklist, encoding="utf-8", xml_declaration=True).decode("utf-8")
