"""
Step 5 — 完整的 agent loop（while 循环）

模型可以多次调用工具，直到不再返回 tool_calls。

运行：python step05_agent_loop.py "你的问题"
"""

import sys

from common import get_client, get_model
from tools import TOOL_SCHEMAS, run_tool

MAX_STEPS = 8


def append_assistant_with_tool_calls(messages: list, assistant) -> None:
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


def append_tool_results(messages: list, assistant) -> None:
    for tc in assistant.tool_calls or []:
        result = run_tool(tc.function.name, tc.function.arguments)
        print(f"  [tool] {tc.function.name} -> {result[:100]}")
        messages.append(
            {
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            }
        )


def run_agent(user_question: str) -> str:
    client = get_client()
    model = get_model()
    messages = [
        {
            "role": "system",
            "content": "你是助手。需要计算或读文件时必须用工具。",
        },
        {"role": "user", "content": user_question},
    ]

    # ✍️ 手写练习 8：亲手写出这个 while 循环（先不看 agent.py）
    for step in range(1, MAX_STEPS + 1):
        print(f"\n--- step {step} ---")
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=TOOL_SCHEMAS,
        )
        assistant = response.choices[0].message

        if not assistant.tool_calls:
            return assistant.content or ""

        append_assistant_with_tool_calls(messages, assistant)
        append_tool_results(messages, assistant)

    return f"达到最大步数 {MAX_STEPS}，已停止。"


def main() -> None:
    question = (
        " ".join(sys.argv[1:])
        or "先读取 notes.txt，再计算 (10+5)*2，最后用中文总结。"
    )
    print("问题:", question)
    answer = run_agent(question)
    print("\n=== 最终答案 ===")
    print(answer)


if __name__ == "__main__":
    main()
