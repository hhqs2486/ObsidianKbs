"""
Step 2 — 固定 pipeline：research -> write -> review -> revise

运行：python step02_fixed_pipeline.py "写一段介绍多 agent 协调的短文"
"""

from __future__ import annotations

import sys

from coordinator import print_trace, run_fixed_pipeline


def main() -> None:
    task = " ".join(sys.argv[1:]).strip() or "写一段介绍多 agent 协调的短文"
    state = run_fixed_pipeline(task)

    print("=== Final ===")
    print(state.final)
    print_trace(state)

    print(
        "\n观察：这里没有让 agent 互相聊天，而是 coordinator 把上一步输出"
        "作为下一步输入。"
    )


if __name__ == "__main__":
    main()
