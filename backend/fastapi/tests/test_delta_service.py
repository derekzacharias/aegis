"""Tests for delta computation service."""

from backend.fastapi.app.enums import FindingSeverity, FindingStatus
from backend.fastapi.app.services.delta_service import compute_delta


BASELINE = {
    "profiles": [
        {
            "name": "baseline",
            "controls": [
                {"id": "V-12345", "impact": 0.9, "results": [{"status": "failed"}]},
                {"id": "V-67890", "impact": 0.5, "results": [{"status": "passed"}]},
            ],
        }
    ]
}

POST = {
    "profiles": [
        {
            "name": "post",
            "controls": [
                {"id": "V-12345", "impact": 0.9, "results": [{"status": "passed"}]},
                {"id": "V-67890", "impact": 0.5, "results": [{"status": "failed"}]},
                {"id": "V-54321", "impact": 0.3, "results": [{"status": "skipped"}]},
            ],
        }
    ]
}


def test_compute_delta_generates_summary():
    report = compute_delta(BASELINE, POST)
    assert report.summary.total == 3
    assert report.summary.improved == 1
    assert report.summary.regressed == 1
    assert report.summary.unchanged == 1

    finding = next(item for item in report.findings if item.rule_id == "V-12345")
    assert finding.before_status == FindingStatus.OPEN
    assert finding.after_status == FindingStatus.NOT_A_FINDING
    assert finding.changed is True
    assert finding.severity == FindingSeverity.CAT_I

    new_control = next(item for item in report.findings if item.rule_id == "V-54321")
    assert new_control.before_status is None
    assert new_control.after_status == FindingStatus.REVIEW_REQUIRED
