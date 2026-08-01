"""
Step 2 — 让模型输出结构化 JSON

运行：python step02_json.py
"""

import json

from common import get_client, get_model


def main() -> None:
    client = get_client()
    model = get_model()

    # ✍️ 手写练习 2：修改 user 里的字段要求，观察 JSON 如何变化
    messages = [
        {
            "role": "system",
            "content": (
                "你只输出 JSON，不要 markdown 代码块。"
                '格式: {"task": str, "steps": [str], "risk": "low"|"medium"|"high"}'
            ),
        },
        {
            "role": "user",
            "content": "帮我规划：用 Python 写一个最小 calculator 工具函数。",
        },
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    print("=== 原始字符串 ===")
    print(raw)

    # ✍️ 手写练习 3：自己写 json.loads，并访问 data["steps"]
    data = json.loads(raw)
    print("\n=== 解析后的 Python 对象 ===")
    print(data)
    print("\n第一步:", data.get("steps", ["无"])[0])


if __name__ == "__main__":
    main()
