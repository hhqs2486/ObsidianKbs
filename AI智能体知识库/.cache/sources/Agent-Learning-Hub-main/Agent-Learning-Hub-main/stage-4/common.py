"""Stage 4 共用配置、LLM 调用和 mock 输出。

Stage 4 的重点是「协调结构」，不是模型效果。未配置 OPENAI_API_KEY 时，
脚本会使用 deterministic mock，确保读者能先跑通流程。
"""

from __future__ import annotations

import json
import os
from typing import Any

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:

    def load_dotenv() -> None:
        return None


load_dotenv()


def get_model() -> str:
    return os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def has_api_key() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def _get_client():
    from openai import OpenAI

    base_url = os.getenv("OPENAI_BASE_URL")
    if base_url:
        return OpenAI(api_key=os.getenv("OPENAI_API_KEY"), base_url=base_url)
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def complete_text(system: str, user: str) -> str:
    """一次普通文本生成。"""
    if not has_api_key():
        return _mock_text(system, user)

    response = _get_client().chat.completions.create(
        model=get_model(),
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
    )
    return (response.choices[0].message.content or "").strip()


def complete_json(system: str, user: str) -> dict[str, Any]:
    """一次 JSON 生成；失败时返回带 error 的对象。"""
    if not has_api_key():
        return _mock_json(system, user)

    response = _get_client().chat.completions.create(
        model=get_model(),
        messages=[
            {
                "role": "system",
                "content": system + "\n只输出 JSON，不要 markdown 代码块。",
            },
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        temperature=0.1,
    )
    raw = response.choices[0].message.content or "{}"
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"error": "invalid_json", "raw": raw}


def _mock_text(system: str, user: str) -> str:
    lowered = system.lower()
    if "researcher" in lowered:
        return (
            "研究要点：\n"
            "- 多 agent 的核心不是让角色互聊，而是用 coordinator 控制输入输出。\n"
            "- research/write/review/revise 适合内容生产，但每个角色必须有停止条件。\n"
            "- 如果任务简单、无需互相校验，单 agent 更可靠。"
        )
    if "writer" in lowered:
        return (
            "草稿：多 agent 系统应先拆清职责，再通过 supervisor 串联。"
            "研究者负责证据，写作者负责表达，审阅者负责风险，修订者负责收敛。"
        )
    if "reviewer" in lowered:
        return (
            "审阅意见：草稿结构清楚，但需要补充“什么时候不要用多 agent”"
            "以及“如何避免循环”的说明。"
        )
    if "reviser" in lowered:
        return (
            "最终稿：多 agent 是一种协调结构，不是更热闹的聊天。"
            "当任务需要检索、写作、审阅和修订分工时，可以用 research -> write -> review -> revise。"
            "当任务很短、目标明确时，应优先使用单 agent 或普通 workflow。"
        )
    return "mock response"


def _mock_json(system: str, user: str) -> dict[str, Any]:
    lowered = system.lower()
    if "planner" in lowered:
        return {
            "plan": ["research", "write", "review", "revise"],
            "reason": "任务需要先收集要点，再写稿、审阅和修订。",
            "stop_condition": "reviewer 通过或达到最大轮数",
        }
    if "supervisor" in lowered:
        state = _extract_state(user)
        if state.get("has_final"):
            return {"next": "done", "reason": "已有最终稿。"}
        if state.get("has_review") and state.get("has_draft"):
            return {"next": "revise", "reason": "已有审阅意见，需要修订。"}
        if state.get("has_draft"):
            return {"next": "review", "reason": "已有草稿，需要审阅。"}
        if state.get("has_research"):
            return {"next": "write", "reason": "已有研究要点，可以写稿。"}
        return {"next": "research", "reason": "需要先收集要点。"}
    if "judge" in lowered:
        simple = len(user) < 80
        return {
            "use_multi_agent": not simple,
            "reason": "短任务不需要多角色；复杂任务才值得引入协调成本。",
        }
    return {"result": _mock_text(system, user)}


def _extract_state(user: str) -> dict[str, Any]:
    if "当前状态：" in user:
        user = user.split("当前状态：", 1)[1].split("输出要求：", 1)[0]
    start = user.find("{")
    end = user.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return {}
    try:
        return json.loads(user[start : end + 1])
    except json.JSONDecodeError:
        return {}
