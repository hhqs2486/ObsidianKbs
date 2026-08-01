"""
Step 1 — 区分 Prompt / Tool / Skill

运行：python step01_boundaries.py
"""

from __future__ import annotations


def main() -> None:
    rows = [
        ("Prompt", "一次性指令", "改语气、改格式", "长期维护、自动发现"),
        ("Tool", "可执行接口", "search、read_file、calculator", "告诉 agent 何时组合使用"),
        ("Skill", "可复用流程知识包", "触发条件、步骤、模板、验收标准", "代替真实工具执行"),
        ("MCP", "工具/数据源协议", "连接外部服务和数据", "定义任务流程"),
        ("A2A", "Agent 间协作协议", "发现、通信、委派", "替代宿主应用接口"),
        ("ACP", "宿主应用协议", "IDE/终端和 agent 的统一接口", "替代 skill 本身"),
    ]

    print("=== Stage 5: Prompt / Tool / Skill / Protocol ===\n")
    for name, does, example, not_for in rows:
        print(f"[{name}]")
        print(f"  负责: {does}")
        print(f"  例子: {example}")
        print(f"  不负责: {not_for}\n")

    print("判断口诀:")
    print("  prompt = 一次对话里的写法")
    print("  tool   = 机器可以调用的函数")
    print("  skill  = 一类任务的操作手册 + 资源包")


if __name__ == "__main__":
    main()
