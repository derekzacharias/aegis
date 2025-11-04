"""Delta computation utilities for InSpec assessments."""

from __future__ import annotations

from collections import defaultdict
from typing import Dict, Iterable, Optional, Tuple

from ..enums import FindingSeverity, FindingStatus
from ..schemas import DeltaFinding, DeltaReport, DeltaSummary

_STATUS_RANK = {
    FindingStatus.OPEN: 3,
    FindingStatus.REVIEW_REQUIRED: 2,
    FindingStatus.NOT_APPLICABLE: 1,
    FindingStatus.NOT_A_FINDING: 0,
}


def _severity_from_impact(impact: Optional[float]) -> FindingSeverity:
    if impact is None:
        return FindingSeverity.CAT_III
    if impact >= 0.7:
        return FindingSeverity.CAT_I
    if impact >= 0.5:
        return FindingSeverity.CAT_II
    if impact > 0:
        return FindingSeverity.CAT_III
    return FindingSeverity.INFO


def _status_from_results(results: Iterable[dict]) -> FindingStatus:
    statuses = {str(result.get("status", "")).lower() for result in results}
    if "failed" in statuses:
        return FindingStatus.OPEN
    if "passed" in statuses:
        return FindingStatus.NOT_A_FINDING
    if "not_applicable" in statuses:
        return FindingStatus.NOT_APPLICABLE
    return FindingStatus.REVIEW_REQUIRED


def _normalize(report: dict) -> Dict[str, Tuple[FindingSeverity, FindingStatus]]:
    normalized: Dict[str, Tuple[FindingSeverity, FindingStatus]] = {}
    for profile in report.get("profiles", []):
        for control in profile.get("controls", []):
            rule_id = control.get("id") or control.get("ref_id")
            if not rule_id:
                continue
            impact = control.get("impact")
            severity = _severity_from_impact(impact)
            status = _status_from_results(control.get("results", []))
            normalized[rule_id] = (severity, status)
    return normalized


def compute_delta(baseline_report: dict, post_report: dict) -> DeltaReport:
    """Compute rule-level delta and aggregate summary."""

    baseline = _normalize(baseline_report)
    post = _normalize(post_report)

    delta_findings: list[DeltaFinding] = []
    summary_counts = {"improved": 0, "regressed": 0, "unchanged": 0}
    severity_buckets: dict[str, dict[str, int]] = defaultdict(lambda: {"improved": 0, "regressed": 0, "unchanged": 0})

    for rule_id in sorted(set(baseline.keys()) | set(post.keys())):
        before = baseline.get(rule_id)
        after = post.get(rule_id)
        before_status = before[1] if before else None
        after_status = after[1] if after else None
        severity = (after or before or (FindingSeverity.CAT_III, FindingStatus.REVIEW_REQUIRED))[0]

        changed = before_status != after_status
        outcome = "unchanged"
        if changed:
            outcome = _classify_change(before_status, after_status)
        summary_counts[outcome] += 1
        severity_buckets[severity.value][outcome] += 1

        delta_findings.append(
            DeltaFinding(
                rule_id=rule_id,
                severity=severity,
                before_status=before_status,
                after_status=after_status,
                changed=changed,
            )
        )

    summary = DeltaSummary(
        total=len(delta_findings),
        improved=summary_counts["improved"],
        regressed=summary_counts["regressed"],
        unchanged=summary_counts["unchanged"],
        by_severity={key: dict(value) for key, value in severity_buckets.items()},
    )

    return DeltaReport(findings=delta_findings, summary=summary)


def _classify_change(before: FindingStatus | None, after: FindingStatus | None) -> str:
    if after is None:
        return "unchanged"
    if before is None:
        if after == FindingStatus.OPEN:
            return "regressed"
        if after == FindingStatus.NOT_A_FINDING:
            return "improved"
        return "unchanged"

    before_rank = _STATUS_RANK.get(before, 1)
    after_rank = _STATUS_RANK.get(after, 1)
    if after_rank < before_rank:
        return "improved"
    if after_rank > before_rank:
        return "regressed"
    return "unchanged"
