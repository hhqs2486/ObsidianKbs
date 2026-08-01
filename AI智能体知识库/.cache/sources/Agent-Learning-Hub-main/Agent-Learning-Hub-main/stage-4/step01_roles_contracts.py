"""
Step 1 — 定义角色边界与输入输出契约

运行：python step01_roles_contracts.py
"""

from roles import ROLES, print_role_table


def main() -> None:
    print("=== 多 agent 不是角色扮演，而是职责边界 ===\n")
    print_role_table()

    print("\n=== 示例：reviewer 的契约 ===")
    reviewer = ROLES["reviewer"]
    print("输入:", reviewer.input_contract)
    print("输出:", reviewer.output_contract)
    print("停止:", reviewer.stop_condition)

    print(
        "\n✍️ 手写练习：新增一个 `fact_checker` 角色，"
        "只负责核对事实，不负责改写文章。"
    )


if __name__ == "__main__":
    main()
