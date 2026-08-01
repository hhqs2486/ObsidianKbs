"""
Step 6 — Letta：上下文压缩（Compaction）入门

Letta 源自 MemGPT 论文，把 agent 当成「带操作系统的 LLM」：
- 消息永久存数据库（out-of-context）
- 只有一部分进当前窗口（in-context）
- 窗口满了就 compaction：把旧消息 summarize 成一条摘要

运行：python step06_letta_compaction.py
"""

from __future__ import annotations

from common import letta_enabled
from letta_helper import (
    compact_conversation,
    create_demo_agent,
    get_letta_client,
    list_message_count,
    send_message,
)


def print_letta_intro() -> None:
    print(
        """
=== 第一次接触 Letta？读这里 ===

Letta（前身 MemGPT）解决的核心问题：
  LLM 上下文窗口有限，但 agent 会话可能无限长。

三层结构：
  1. Memory Blocks — 钉在 system prompt 里的可编辑记忆（persona / human）
  2. Messages — 全部持久化；只有一部分在「当前窗口」里
  3. Compaction — 窗口快满时，把最旧的消息 summarize 成摘要消息

和 mem0 的分工：
  - mem0：面向「用户事实」的长期记忆层（谁、偏好、结论）
  - Letta：面向「整段对话历史」的上下文工程（压缩、检索、块编辑）

Compaction 模式（compaction_settings.mode）：
  - sliding_window（默认）：保留最近消息，压缩较旧部分
  - all：整段历史压成一条摘要
  - self_compact_*：压缩请求带上 agent system prompt，利于 prompt cache

官方文档：https://docs.letta.com/guides/core-concepts/messages/compaction/
"""
    )


def demo_without_letta() -> None:
    print("[演示模式] 未配置 LETTA_API_KEY / LETTA_BASE_URL\n")
    print("若已配置，本脚本会：")
    print("  1. 创建带 compaction_settings 的 agent")
    print("  2. 连续发送多条消息")
    print("  3. 调用 agents.summarize() 手动压缩")
    print("  4. 对比压缩前后消息数量\n")
    print("配置示例见 .env.example")


def demo_with_letta() -> None:
    agent = create_demo_agent()
    agent_id = agent.id
    print(f"Agent id: {agent_id}")

    topics = [
        "用三句话解释 RAG 的 ingest/retrieve/generate。",
        "mem0 和 RAG 分别解决什么问题？",
        "什么是 context compaction？为什么 coding agent 需要它？",
        "Claude Code 的 /compact 和 Letta compaction 有什么相似点？",
        "如果检索结果为空，agent 应该怎么回答？",
    ]

    for i, text in enumerate(topics, 1):
        print(f"\n--- 发送消息 {i} ---")
        send_message(agent_id, text)

    before = list_message_count(agent_id)
    print(f"\n压缩前 in-context 消息数（API 返回列表长度）: {before}")

    print("\n--- 调用 agents.summarize (compaction) ---")
    result = compact_conversation(agent_id)
    print(f"压缩前: {result.num_messages_before} 条")
    print(f"压缩后: {result.num_messages_after} 条")
    print(f"摘要预览: {(result.summary or '')[:400]}...")

    # ✍️ 手写练习 5：改 sliding_window_percentage 为 0.5，观察 summary 长度变化

    # 清理：可选删除 demo agent
    try:
        get_letta_client().agents.delete(agent_id)
        print(f"\n已删除 demo agent {agent_id}")
    except Exception as exc:  # noqa: BLE001
        print(f"\n(可选) 删除 agent 失败: {exc}")


def main() -> None:
    print_letta_intro()
    if letta_enabled():
        demo_with_letta()
    else:
        demo_without_letta()


if __name__ == "__main__":
    main()
