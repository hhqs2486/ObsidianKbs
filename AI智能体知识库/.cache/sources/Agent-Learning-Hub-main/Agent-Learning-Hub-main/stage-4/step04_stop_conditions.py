"""
Step 4 — 停止条件：防止循环、争论和任务漂移

运行：python step04_stop_conditions.py
"""

from __future__ import annotations

from coordinator import MultiAgentState


def should_stop(state: MultiAgentState, step: int) -> tuple[bool, str]:
    if state.final:
        return True, "已有 final"
    if step >= state.max_steps:
        return True, "达到 max_steps"
    recent_routes = [e.action for e in state.trace[-4:] if e.role == "supervisor"]
    if len(recent_routes) >= 4 and len(set(recent_routes)) == 1:
        return True, "supervisor 重复选择同一角色，疑似循环"
    return False, "继续"


def main() -> None:
    print("=== 常见停止条件 ===")
    checks = [
        "reviewer verdict = pass",
        "reviser 已产出 final",
        "达到 max_steps",
        "连续 N 次相同 route，判定循环",
        "输出不符合 schema，停止并报错",
    ]
    for item in checks:
        print("-", item)

    print("\n=== 为什么重要 ===")
    print(
        "多 agent 最容易失败的地方不是某个角色不会回答，"
        "而是系统没有定义什么时候结束、谁有权决定下一步。"
    )


if __name__ == "__main__":
    main()
