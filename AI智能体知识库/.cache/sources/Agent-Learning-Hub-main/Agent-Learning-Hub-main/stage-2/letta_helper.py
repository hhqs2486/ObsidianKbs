"""Letta 客户端与上下文压缩（compaction）封装。"""

from __future__ import annotations

import os
from typing import Any

from common import get_model, letta_enabled


def get_letta_client():
    from letta_client import Letta

    api_key = os.getenv("LETTA_API_KEY")
    base_url = os.getenv("LETTA_BASE_URL")
    if base_url:
        return Letta(base_url=base_url, api_key=api_key)
    if api_key:
        return Letta(api_key=api_key)
    raise RuntimeError("Letta 未配置，请设置 LETTA_API_KEY 或 LETTA_BASE_URL")


def get_letta_model() -> str:
    return os.getenv("LETTA_MODEL", f"openai/{get_model()}")


def create_demo_agent(name: str = "stage2_compaction_demo") -> Any:
    client = get_letta_client()
    return client.agents.create(
        name=name,
        model=get_letta_model(),
        embedding="openai/text-embedding-3-small",
        memory_blocks=[
            {
                "label": "persona",
                "value": "我是 Stage 2 教学助手，擅长解释 RAG、记忆与上下文压缩。",
            },
            {
                "label": "human",
                "value": "用户正在学习 Agent 的 RAG 与记忆管理。",
            },
        ],
        compaction_settings={
            "mode": "sliding_window",
            "sliding_window_percentage": 0.3,
            "model": get_letta_model(),
        },
    )


def send_message(agent_id: str, content: str) -> Any:
    client = get_letta_client()
    return client.agents.messages.create(
        agent_id=agent_id,
        messages=[{"role": "user", "content": content}],
    )


def list_message_count(agent_id: str) -> int:
    client = get_letta_client()
    messages = client.agents.messages.list(agent_id=agent_id)
    return len(messages)


def compact_conversation(agent_id: str) -> Any:
    """手动触发 Letta compaction（summarize 旧消息）。"""
    client = get_letta_client()
    return client.agents.summarize(
        agent_id=agent_id,
        compaction_settings={
            "mode": "sliding_window",
            "sliding_window_percentage": 0.3,
            "model": get_letta_model(),
        },
    )


def letta_available() -> bool:
    return letta_enabled()
