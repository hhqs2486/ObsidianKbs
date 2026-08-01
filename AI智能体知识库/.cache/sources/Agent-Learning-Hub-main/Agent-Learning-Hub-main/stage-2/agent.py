"""
Stage 2 最终产出 — 资料研究助手

能力：
  - RAGFlow（或本地 fallback）检索知识库
  - mem0 长期用户记忆
  - Agent loop 自动选工具、带引用回答

运行：
  python agent.py
  python agent.py "根据资料解释 context compaction，并引用来源"
"""

from __future__ import annotations

import sys
import time
from typing import Any

from common import get_client, get_model
from mem0_helper import add_conversation, get_user_id
from tools import TOOL_SCHEMAS, run_tool

MAX_STEPS = 10
REQUEST_TIMEOUT_SEC = 90.0


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
        try:
            out = run_tool(tc.function.name, tc.function.arguments)
        except Exception as exc:  # noqa: BLE001
            out = f"工具执行异常: {exc}"
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": out})


def run_research_agent(question: str, *, remember_turn: bool = True) -> str:
    client = get_client()
    model = get_model()
    messages: list[dict[str, Any]] = [
        {
            "role": "system",
            "content": (
                "你是 Stage 2 资料研究助手。"
                "1) 事实性问题先 search_knowledge；"
                "2) 用户相关偏好用 recall_user_memory；"
                "3) 回答必须标注引用 [1][2]；"
                "4) 检索为空时禁止编造，明确说未找到；"
                "5) 工具失败或空结果时换 query 重试一次，仍失败则如实说明。"
            ),
        },
        {"role": "user", "content": question},
    ]

    for step in range(1, MAX_STEPS + 1):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                tools=TOOL_SCHEMAS,
                timeout=REQUEST_TIMEOUT_SEC,
            )
        except Exception as exc:  # noqa: BLE001
            return f"API 调用失败（step {step}）: {exc}"

        assistant = response.choices[0].message
        if not assistant.tool_calls:
            answer = (assistant.content or "").strip() or "(空回复)"
            if remember_turn:
                try:
                    add_conversation(
                        [
                            {"role": "user", "content": question},
                            {"role": "assistant", "content": answer},
                        ],
                        user_id=get_user_id(),
                    )
                except Exception:  # noqa: BLE001
                    pass  # mem0 不可用时仍返回回答
            return answer

        _append_assistant(messages, assistant)
        _append_tool_results(messages, assistant)
        time.sleep(0.2)

    return f"已达最大步数 {MAX_STEPS}，请缩小问题或提高 MAX_STEPS。"


def main() -> None:
    q = " ".join(sys.argv[1:]).strip()
    if not q:
        q = "根据知识库说明 RAG 流程，并解释 Letta compaction 解决什么问题。"
    print("Q:", q)
    print("A:", run_research_agent(q))


if __name__ == "__main__":
    main()
