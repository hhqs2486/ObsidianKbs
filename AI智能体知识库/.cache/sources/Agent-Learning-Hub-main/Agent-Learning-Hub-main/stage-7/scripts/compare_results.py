#!/usr/bin/env python3
"""Compare two eval result files for regression review."""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def load_results(path: Path) -> dict[str, dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        return {row["task_id"]: row for row in csv.DictReader(f)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("baseline", type=Path, help="Previous results.csv")
    parser.add_argument("current", type=Path, help="New results.csv")
    args = parser.parse_args()

    baseline = load_results(args.baseline)
    current = load_results(args.current)

    regressions = []
    improvements = []
    for task_id, old in baseline.items():
        new = current.get(task_id)
        if not new:
            continue
        if old["success"] == "true" and new["success"] != "true":
            regressions.append((task_id, new.get("notes", "")))
        if old["success"] != "true" and new["success"] == "true":
            improvements.append(task_id)

    print(f"Baseline: {args.baseline}")
    print(f"Current:  {args.current}")
    print(f"Regressions: {len(regressions)}")
    for task_id, note in regressions:
        print(f"  - {task_id}: {note}")
    print(f"Improvements: {len(improvements)}")
    for task_id in improvements:
        print(f"  - {task_id}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
