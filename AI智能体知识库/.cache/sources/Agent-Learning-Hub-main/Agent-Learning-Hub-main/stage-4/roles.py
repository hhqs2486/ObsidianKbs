"""多 agent 角色定义。

每个角色都必须有清晰边界：输入是什么、输出是什么、什么时候停止。
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RoleSpec:
    name: str
    responsibility: str
    input_contract: str
    output_contract: str
    stop_condition: str
    system_prompt: str


ROLES: dict[str, RoleSpec] = {
    "planner": RoleSpec(
        name="planner",
        responsibility="把用户目标拆成有限步骤，决定是否需要多 agent。",
        input_contract="用户任务。",
        output_contract='JSON: {"plan": [role], "reason": str, "stop_condition": str}',
        stop_condition="产出可执行 plan 后停止。",
        system_prompt=(
            "You are a planner. Decide a short multi-agent plan. "
            "Return JSON with plan, reason, stop_condition."
        ),
    ),
    "researcher": RoleSpec(
        name="researcher",
        responsibility="收集事实、约束、可引用要点，不负责写最终稿。",
        input_contract="主题 + 已知上下文。",
        output_contract="要点列表，包含事实、风险、可引用证据。",
        stop_condition="给出足够写作的 3-5 条要点后停止。",
        system_prompt="You are a researcher. Produce concise research notes only.",
    ),
    "writer": RoleSpec(
        name="writer",
        responsibility="把研究要点写成面向用户的草稿。",
        input_contract="用户任务 + researcher notes。",
        output_contract="一版完整但可被审阅的草稿。",
        stop_condition="产出草稿后停止，不自我审阅。",
        system_prompt="You are a writer. Produce a clear draft from notes.",
    ),
    "reviewer": RoleSpec(
        name="reviewer",
        responsibility="发现草稿的问题、遗漏、风险和是否满足任务。",
        input_contract="用户任务 + 草稿。",
        output_contract="审阅意见：通过 / 需修改 + 具体问题。",
        stop_condition="给出明确 verdict 后停止。",
        system_prompt="You are a reviewer. Find issues and give a clear verdict.",
    ),
    "reviser": RoleSpec(
        name="reviser",
        responsibility="根据审阅意见修订草稿，收敛成最终答案。",
        input_contract="用户任务 + 草稿 + 审阅意见。",
        output_contract="最终稿。",
        stop_condition="产出最终稿后停止。",
        system_prompt="You are a reviser. Revise the draft into a final answer.",
    ),
    "supervisor": RoleSpec(
        name="supervisor",
        responsibility="根据当前状态选择下一个角色，防止自由聊天和无限循环。",
        input_contract="任务状态 JSON。",
        output_contract='JSON: {"next": role|"done", "reason": str}',
        stop_condition="选出下一步后停止。",
        system_prompt=(
            "You are a supervisor. Choose exactly one next role from "
            "research, write, review, revise, done. Return JSON."
        ),
    ),
}


def print_role_table() -> None:
    print("| Role | Responsibility | Stop condition |")
    print("| --- | --- | --- |")
    for role in ROLES.values():
        print(f"| `{role.name}` | {role.responsibility} | {role.stop_condition} |")
