"""
Stage 1 最终产出 — 最小 Agent（约 100 行）

能力：选择工具 -> 执行 -> 把结果喂回模型 -> 直到给出最终答案
约束：最大步数、超时、基础错误处理

运行：
  python agent.py
  python agent.py "读取 notes.txt 并计算文件里出现的数字之和（若有）"
"""

from __future__ import annotations

import sys
import time
from typing import Any

from common import get_client, get_model
from tools import TOOL_SCHEMAS, run_tool

MAX_STEPS = 10
REQUEST_TIMEOUT_SEC = 60.0


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
        messages.append(
            {"role": "tool", "tool_call_id": tc.id, "content": out}
        )


def run_agent(question: str) -> str:
    client = get_client()
    model = get_model()
    messages: list[dict[str, Any]] = [
        {
            "role": "system",
            "content": (
                "你是 Stage 1 最小 Agent。"
                "需要精确计算或读取文件时必须调用工具，禁止编造文件内容或计算结果。"
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
            return (assistant.content or "").strip() or "(空回复)"

        _append_assistant(messages, assistant)
        _append_tool_results(messages, assistant)
        time.sleep(0.2)  # 教学用：避免连续请求过快

    return f"已达最大步数 {MAX_STEPS}，请缩小任务或提高 MAX_STEPS。"


def main() -> None:
    q = " ".join(sys.argv[1:]).strip()
    if not q:
        q = "用 calculator 算 (20-4)*3，并说明你是否使用了工具。"
    print("Q:", q)
    print("A:", run_agent(q))


if __name__ == "__main__":
    main()
