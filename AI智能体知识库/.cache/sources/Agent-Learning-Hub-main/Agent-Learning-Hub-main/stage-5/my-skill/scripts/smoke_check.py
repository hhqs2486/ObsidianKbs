#!/usr/bin/env python3
"""Check whether a generated review report follows the Stage 5 skill contract."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from report_check import check_report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("report", type=Path, help="Markdown report to validate")
    args = parser.parse_args()

    problems = check_report(args.report.read_text(encoding="utf-8"))
    if problems:
        print("Smoke check failed:")
        for problem in problems:
            print(f"- {problem}")
        return 1

    print("Smoke check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
