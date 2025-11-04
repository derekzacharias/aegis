"""Tests for CKL parser."""

from backend.fastapi.app.enums import FindingSeverity, FindingStatus
from backend.fastapi.app.parsers.ckl_parser import CKLParserError, parse_ckl


SAMPLE_CKL = """<?xml version='1.0' encoding='UTF-8'?>
<CHECKLIST>
  <STIGS>
    <iSTIG>
      <VULN>
        <STIG_DATA>
          <VULN_ATTRIBUTE>Rule_ID</VULN_ATTRIBUTE>
          <ATTRIBUTE_DATA>V-12345</ATTRIBUTE_DATA>
        </STIG_DATA>
        <STIG_DATA>
          <VULN_ATTRIBUTE>Severity</VULN_ATTRIBUTE>
          <ATTRIBUTE_DATA>high</ATTRIBUTE_DATA>
        </STIG_DATA>
        <STATUS>Open</STATUS>
        <COMMENTS>Needs remediation</COMMENTS>
      </VULN>
    </iSTIG>
  </STIGS>
</CHECKLIST>
"""


def test_parse_ckl_success():
    findings = parse_ckl(SAMPLE_CKL, asset_id=10)
    assert len(findings) == 1
    finding = findings[0]
    assert finding.rule_id == "V-12345"
    assert finding.severity == FindingSeverity.CAT_I
    assert finding.status == FindingStatus.OPEN
    assert finding.comments == "Needs remediation"
    assert finding.asset_id == 10


def test_parse_ckl_invalid_severity():
    bad_ckl = SAMPLE_CKL.replace("high", "critical")
    try:
        parse_ckl(bad_ckl)
    except CKLParserError as exc:
        assert "Unsupported severity" in str(exc)
    else:  # pragma: no cover - ensures exception is raised
        raise AssertionError("CKLParserError was not raised")
