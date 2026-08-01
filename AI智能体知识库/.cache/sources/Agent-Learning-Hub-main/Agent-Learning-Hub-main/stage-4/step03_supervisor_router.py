"""
Step 3 — Supervisor：让一个协调器选择下一步

运行：python step03_supervisor_router.py "写一篇多 agent 最佳实践"
"""

from __future__ import annotations

import sys

from coordinator import print_trace, run_supervised


def main() -> None:
    task = " ".join(sys.argv[1:]).strip() or "写一篇多 agent 最佳实践"
    state = run_supervised(task, max_steps=8)

    print("=== Final ===")
    print(state.final or "未得到最终稿")
    print_trace(state)

    print(
        "\nSupervisor 的价值：每一步只选择一个 next role，"
        "避免多个 agent 自由争论导致任务漂移。"
    )


if __name__ == "__main__":
    main()
