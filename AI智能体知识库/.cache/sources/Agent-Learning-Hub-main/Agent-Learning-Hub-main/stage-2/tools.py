"""Stage 2 工具：RAG 检索 + mem0 记忆查询。"""

from __future__ import annotations

import json
from typing import Any

from mem0_helper import format_memories_for_prompt, search_memories
from ragflow_helper import format_chunks_for_prompt, retrieve

TOOL_SCHEMAS: list[dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge",
            "description": "从知识库检索与问题相关的文档片段，用于带引用回答",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "检索 query，尽量具体",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "返回片段数量，默认 3",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "recall_user_memory",
            "description": "检索该用户的长期记忆（偏好、历史结论等）",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "记忆检索 query",
                    },
                },
                "required": ["query"],
            },
        },
    },
]


def search_knowledge(query: str, top_k: int = 3) -> str:
    chunks = retrieve(query, top_k=top_k)
    if not chunks:
        return "检索结果为空。请如实告知用户资料中未找到相关内容，不要编造。"
    body = format_chunks_for_prompt(chunks)
    refs = ", ".join(f"[{i}] {c.source}" for i, c in enumerate(chunks, 1))
    return f"检索到 {len(chunks)} 条片段。引用来源: {refs}\n\n{body}"


def recall_user_memory(query: str) -> str:
    memories = search_memories(query)
    return format_memories_for_prompt(memories)


def run_tool(name: str, arguments_json: str) -> str:
    try:
        args = json.loads(arguments_json or "{}")
    except json.JSONDecodeError:
        return "错误：arguments 不是合法 JSON"

    if name == "search_knowledge":
        top_k = int(args.get("top_k", 3))
        return search_knowledge(str(args.get("query", "")), top_k=top_k)
    if name == "recall_user_memory":
        return recall_user_memory(str(args.get("query", "")))
    return f"错误：未知工具 {name}"
