"""
Step 5 — mem0：长期用户记忆

运行：python step05_mem0_memory.py
"""

from __future__ import annotations

from mem0_helper import add_conversation, format_memories_for_prompt, get_user_id, search_memories


def main() -> None:
    user_id = get_user_id()
    print(f"=== mem0 长期记忆 (user_id={user_id}) ===\n")

    # ✍️ 手写练习 4：改成你自己的对话，再 add 一次
    messages = [
        {"role": "user", "content": "我叫小陈，主要用 Python 做 Agent，偏好中文回答。"},
        {"role": "assistant", "content": "好的，我会记住你的偏好。"},
        {"role": "user", "content": "我在学 Stage 2，重点看 RAGFlow 和 Letta。"},
        {"role": "assistant", "content": "明白，后续我会结合 RAG 与上下文压缩来帮你。"},
    ]

    print("--- add 对话到 mem0 ---")
    result = add_conversation(messages, user_id=user_id)
    print(result)

    queries = [
        "用户叫什么名字？",
        "用户的技术栈和语言偏好？",
        "用户在学什么？",
    ]
    for q in queries:
        print(f"\n--- search: {q} ---")
        hits = search_memories(q, user_id=user_id)
        print(format_memories_for_prompt(hits))


if __name__ == "__main__":
    main()
