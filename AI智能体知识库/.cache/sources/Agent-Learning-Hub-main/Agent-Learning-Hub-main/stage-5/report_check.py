"""Validate review reports against the Stage 5 skill output contract."""

from __future__ import annotations

REQUIRED_SECTIONS = ("## Findings", "## Test Gaps")
EVIDENCE_WORDS = ("Impact:", "Evidence:", "Fix direction:")


def check_report(text: str) -> list[str]:
    problems: list[str] = []

    for section in REQUIRED_SECTIONS:
        if section not in text:
            problems.append(f"missing required section: {section}")

    has_no_findings = "No blocking issues found" in text
    has_finding_shape = all(word in text for word in EVIDENCE_WORDS)
    if not has_no_findings and not has_finding_shape:
        problems.append(
            "report must either say no blocking issues were found or include "
            "Impact/Evidence/Fix direction fields"
        )

    if "summary of changed files" in text.lower():
        problems.append("report looks like a file summary instead of a risk review")

    return problems
