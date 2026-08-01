"""角色执行器：把 RoleSpec 变成可调用 agent。"""

from __future__ import annotations

from dataclasses import dataclass

from common import complete_json, complete_text
from roles import ROLES, RoleSpec


@dataclass
class AgentResult:
    role: str
    content: str


def run_text_agent(role_name: str, task: str, context: str = "") -> AgentResult:
    role = _get_role(role_name)
    prompt = f"""任务：
{task}

上下文：
{context or "（无）"}

输出要求：
{role.output_contract}
"""
    return AgentResult(role=role.name, content=complete_text(role.system_prompt, prompt))


def run_json_agent(role_name: str, task: str, context: str = "") -> dict:
    role = _get_role(role_name)
    prompt = f"""任务：
{task}

当前状态：
{context or "（无）"}

输出要求：
{role.output_contract}
"""
    data = complete_json(role.system_prompt, prompt)
    data["role"] = role.name
    return data


def _get_role(name: str) -> RoleSpec:
    if name not in ROLES:
        raise ValueError(f"未知角色: {name}")
    return ROLES[name]
