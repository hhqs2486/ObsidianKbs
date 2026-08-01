"""
Step 5 — 什么时候单 agent 更好？

运行：python step05_single_vs_multi.py "把 hello 翻译成中文"
"""

from __future__ import annotations

import sys

from agents import run_json_agent


def main() -> None:
    task = " ".join(sys.argv[1:]).strip() or "把 hello 翻译成中文"
    decision = run_json_agent(
        "planner",
        task,
        context=(
            "请判断是否值得使用多 agent。简单、短、无风险、无需审阅的任务，"
            "优先单 agent 或普通 workflow。"
        ),
    )
    print("任务:", task)
    print("Planner decision:", decision)

    print("\n经验规则：")
    print("- 单步可完成：单 agent")
    print("- 需要独立审阅：多 agent")
    print("- 需要并行探索多个方向：多 agent")
    print("- 输出必须稳定可复现：优先 workflow / graph，而不是自由聊天")


if __name__ == "__main__":
    main()
