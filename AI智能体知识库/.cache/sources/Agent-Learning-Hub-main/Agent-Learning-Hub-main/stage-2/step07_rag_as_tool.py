"""
Step 7 — 把 RAG / mem0 接成 Agent 工具（延续 Stage 1 loop）

运行：python step07_rag_as_tool.py "RAG 和 mem0 有什么区别？"
"""

from __future__ import annotations

import sys
import time
from typing import Any

from common import get_client, get_model
from tools import TOOL_SCHEMAS, run_tool

MAX_STEPS = 8


def _append_assistant(messages: list[dict[str, Any]], assistant) -> None:
    messages.append(
        {
            "role": "assistant",
            "content": assistant.content or "",
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in (assistant.tool_calls or [])
            ],
        }
    )


def _append_tool_results(messages: list[dict[str, Any]], assistant) -> None:
    for tc in assistant.tool_calls or []:
        out = run_tool(tc.function.name, tc.function.arguments)
        print(f"  [tool] {tc.function.name} -> {out[:120]}...")
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": out})


def run_agent(question: str) -> str:
    client = get_client()
    model = get_model()
    messages: list[dict[str, Any]] = [
        {
            "role": "system",
            "content": (
                "你是 Stage 2 资料研究助手。"
                "回答事实性问题前必须调用 search_knowledge；"
                "涉及用户偏好时调用 recall_user_memory。"
                "回答必须带引用编号 [1][2]，无依据则明确说明。"
            ),
        },
        {"role": "user", "content": question},
    ]

    for step in range(1, MAX_STEPS + 1):
        print(f"\n--- step {step} ---")
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=TOOL_SCHEMAS,
        )
        assistant = response.choices[0].message
        if not assistant.tool_calls:
            return (assistant.content or "").strip()

        _append_assistant(messages, assistant)
        _append_tool_results(messages, assistant)
        time.sleep(0.2)

    return f"达到最大步数 {MAX_STEPS}"


def main() -> None:
    q = " ".join(sys.argv[1:]).strip() or "Agent 记忆分哪几层？请带引用。"
    print("Q:", q)
    print("\n=== 最终答案 ===")
    print(run_agent(q))


if __name__ == "__main__":
    main()
