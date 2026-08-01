"""
Step 1 — 加载 eval 任务集

运行：python step01_load_tasks.py
"""

from __future__ import annotations

import json
from pathlib import Path

from eval_common import load_tasks


def main() -> None:
    tasks = load_tasks(Path("evals/tasks.csv"))
    print(f"Loaded {len(tasks)} tasks.")
    print(json.dumps(tasks[:3], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
