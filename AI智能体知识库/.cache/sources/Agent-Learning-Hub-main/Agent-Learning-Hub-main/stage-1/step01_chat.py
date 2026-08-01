"""
Step 1 — 用 LLM API 完成普通对话

运行：python step01_chat.py
"""

from common import get_client, get_model


def main() -> None:
    client = get_client()
    model = get_model()

    # ✍️ 手写练习 1：把下面 messages 改成你想问的问题
    messages = [
        {"role": "system", "content": "你是一个简洁的编程助教。"},
        {"role": "user", "content": "用一句话解释什么是 agent loop。"},
    ]

    response = client.chat.completions.create(
        model=model,
        messages=messages,
    )

    print("=== 模型回复 ===")
    print(response.choices[0].message.content)


if __name__ == "__main__":
    main()
