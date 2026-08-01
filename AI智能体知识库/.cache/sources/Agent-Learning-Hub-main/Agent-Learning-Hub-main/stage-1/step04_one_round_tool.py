"""
Step 4 — 解析模型的 tool call，执行一次，把结果喂回去

只跑「一轮」工具，还没有 while 循环。

运行：python step04_one_round_tool.py
"""

import json

from common import get_client, get_model
from tools import TOOL_SCHEMAS, run_tool


def main() -> None:
    client = get_client()
    model = get_model()

    # ✍️ 手写练习 5：换成会触发 read_file 的问题，例如「读取 notes.txt 并总结」
    messages = [
        {
            "role": "system",
            "content": "你是助手。需要精确计算或读文件时，必须调用工具，不要编造结果。",
        },
        {"role": "user", "content": "请计算 (99 - 11) / 4，只给最终数字。"},
    ]

    first = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=TOOL_SCHEMAS,
    )
    assistant = first.choices[0].message

    if not assistant.tool_calls:
        print("模型未调用工具，直接回答：")
        print(assistant.content)
        return

    # ✍️ 手写练习 6：亲手写下面这段「把 assistant 消息追加进 messages」
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
                for tc in assistant.tool_calls
            ],
        }
    )

    # ✍️ 手写练习 7：对每个 tool_call 执行 run_tool，并追加 role=tool 的消息
    for tc in assistant.tool_calls:
        name = tc.function.name
        args = tc.function.arguments
        result = run_tool(name, args)
        print(f"[tool] {name}({args}) -> {result[:120]}")
        messages.append(
            {
                "role": "tool",
                "tool_call_id": tc.id,
                "content": result,
            }
        )

    second = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=TOOL_SCHEMAS,
    )
    print("\n=== 最终回答 ===")
    print(second.choices[0].message.content)


if __name__ == "__main__":
    main()
