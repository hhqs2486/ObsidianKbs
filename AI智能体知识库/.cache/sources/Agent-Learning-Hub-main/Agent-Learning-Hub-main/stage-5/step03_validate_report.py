"""
Step 3 — 校验 review report 是否符合 skill 输出合约

运行：
  python step03_validate_report.py my-skill/samples/good_report.md
  python step03_validate_report.py my-skill/samples/bad_report.md
"""

from __future__ import annotations

import sys
from pathlib import Path

from report_check import check_report


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python step03_validate_report.py <report.md>")
        raise SystemExit(2)

    report_path = Path(sys.argv[1])
    problems = check_report(report_path.read_text(encoding="utf-8"))

    if problems:
        print(f"Report check failed for {report_path}:")
        for problem in problems:
            print(f"- {problem}")
        raise SystemExit(1)

    print(f"Report check passed for {report_path}.")


if __name__ == "__main__":
    main()
