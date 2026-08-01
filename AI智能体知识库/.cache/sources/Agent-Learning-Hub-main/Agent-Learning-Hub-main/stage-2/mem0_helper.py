"""mem0 长期记忆封装。"""

from __future__ import annotations

import os
from typing import Any

from mem0 import Memory


def get_user_id() -> str:
    return os.getenv("MEM0_USER_ID", "stage2_demo_user")


def get_memory() -> Memory:
    return Memory()


def add_conversation(messages: list[dict[str, str]], user_id: str | None = None) -> Any:
    uid = user_id or get_user_id()
    return get_memory().add(messages, user_id=uid)


def search_memories(query: str, user_id: str | None = None, limit: int = 5) -> list[dict]:
    uid = user_id or get_user_id()
    result = get_memory().search(query, filters={"user_id": uid}, limit=limit)
    if isinstance(result, dict):
        return result.get("results", [])
    return result or []


def format_memories_for_prompt(memories: list[dict]) -> str:
    if not memories:
        return "（暂无相关长期记忆）"
    lines = []
    for i, item in enumerate(memories, 1):
        text = item.get("memory") or item.get("text") or str(item)
        score = item.get("score")
        suffix = f" (score={score:.2f})" if isinstance(score, (int, float)) else ""
        lines.append(f"[M{i}] {text}{suffix}")
    return "\n".join(lines)
