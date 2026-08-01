"""
Step 4 — 跑 smoke cases

运行：python step04_run_smoke_cases.py
"""

from __future__ import annotations

from pathlib import Path

from report_check import check_report
from skill_common import validate_skill_md


CASES = [
    {
        "name": "skill structure",
        "check": lambda: validate_skill_md(Path("my-skill/SKILL.md")),
    },
    {
        "name": "good report",
        "check": lambda: check_report(Path("my-skill/samples/good_report.md").read_text(encoding="utf-8")),
    },
    {
        "name": "bad report should fail",
        "check": lambda: _expect_bad_report(),
    },
]


def _expect_bad_report() -> list[str]:
    problems = check_report(Path("my-skill/samples/bad_report.md").read_text(encoding="utf-8"))
    if not problems:
        return ["bad report unexpectedly passed validation"]
    return []


def main() -> None:
    failed = 0
    for case in CASES:
        problems = case["check"]()
        if problems:
            print(f"[FAIL] {case['name']}")
            for problem in problems:
                print(f"  - {problem}")
            failed += 1
        else:
            print(f"[PASS] {case['name']}")

    if failed:
        raise SystemExit(1)

    print("\nAll smoke cases passed.")


if __name__ == "__main__":
    main()
