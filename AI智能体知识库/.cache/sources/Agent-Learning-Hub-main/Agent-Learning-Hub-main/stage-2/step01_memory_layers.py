"""
Step 1 — 理解三种「记忆」层级

短期上下文 / 会话记忆 / 长期记忆 —— 先建立概念，再写代码。

运行：python step01_memory_layers.py
"""

from __future__ import annotations

# ✍️ 手写练习 1：给下面三个 dict 各加一条你自己的例子
SHORT_TERM_CONTEXT = [
    {"role": "system", "content": "你是资料研究助手。"},
    {"role": "user", "content": "RAG 和 fine-tuning 有什么区别？"},
    {"role": "assistant", "content": "RAG 是检索外部资料再回答…"},
]

SESSION_STORE = {
    "session_id": "sess-001",
    "turns": [
        {"user": "帮我查 agent memory", "assistant": "Agent memory 通常分三层…"},
        {"user": "那 mem0 做什么？", "assistant": "mem0 负责长期记忆层…"},
    ],
}

LONG_TERM_MEMORY = [
    "用户偏好中文回答",
    "用户正在学习 Stage 2：RAG + mem0 + Letta",
    "用户项目名：Agent-Learning-Hub",
]


def build_prompt(short_term: list, session: dict, long_term: list) -> str:
    """模拟 agent 如何把多层记忆拼进一次请求。"""
    session_text = "\n".join(
        f"- Q: {t['user']}\n  A: {t['assistant']}" for t in session["turns"]
    )
    memory_text = "\n".join(f"- {m}" for m in long_term)
    recent = short_term[-2:]  # 只取最近几轮进「工作上下文」
    recent_text = "\n".join(f"{m['role']}: {m['content']}" for m in recent)

    return f"""=== 长期记忆 (mem0) ===
{memory_text}

=== 本会话摘要 (session) ===
{session_text}

=== 当前窗口 (short-term) ===
{recent_text}
"""


def main() -> None:
    print("=== Stage 2 · 记忆分层 ===\n")
    print(build_prompt(SHORT_TERM_CONTEXT, SESSION_STORE, LONG_TERM_MEMORY))

    print("\n--- 对照表 ---")
    print("| 层级 | 存什么 | Stage 2 用什么 |")
    print("| --- | --- | --- |")
    print("| 短期上下文 | 当前 messages | OpenAI messages 列表 |")
    print("| 会话记忆 | 同一会话历史 | 可存 SQLite/Redis（本教程简化） |")
    print("| 长期记忆 | 跨会话用户事实 | mem0 |")
    print("| 外部知识 | 文档 chunk | RAGFlow retrieve |")
    print("| 上下文压缩 | 窗口满了怎么办 | Letta compaction |")


if __name__ == "__main__":
    main()
