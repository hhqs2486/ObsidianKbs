"""
Step 2 — 运行 eval

运行：python step02_run_eval.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def main() -> None:
    runner = Path("scripts/eval_runner.py")
    report = Path("scripts/render_eval_report.py")
    cmd = [sys.executable, str(runner), "--tasks", "evals/tasks.csv", "--out", "evals/results.csv"]
    code = subprocess.call(cmd)
    if code == 0:
        subprocess.call([sys.executable, str(report), "--results", "evals/results.csv", "--out", "evals/report.html"])
    raise SystemExit(code)


if __name__ == "__main__":
    main()
