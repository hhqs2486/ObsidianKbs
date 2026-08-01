---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: Agent-Learning-Hub Stage 2
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6mhlgqga0v
---

# 10-Agent实践-Stage2-RAG与记忆

## 这条教程在解决什么
- 在 Stage 1 最小 Agent loop 之上，接入 RAGFlow（外部文档检索+引用回答）、mem0（跨会话用户记忆）、Letta（上下文压缩），产出一个「带引用的资料研究助手」。

## 关键内容（按 Stage 2 学习步骤提纲）
- **三个组件的分工**：用户提问 → `search_knowledge`（RAGFlow，查"资料里写了什么"）→ `recall_user_memory`（mem0，查"用户是谁/偏好"）→ messages 窗口（当前对话短期上下文）。
- **RAG 链路**：ingest → chunk/embed → retrieve → generate with citations。未配置 RAGFlow 时自动 fallback 到本地关键词检索。
- **mem0 长期记忆**：`m.add(messages, user_id=...)` 从对话中抽取事实写入向量库；`m.search(query, filters=...)` 语义检索。RAG 查文档，mem0 记用户。
- **Letta 上下文压缩**：来自 MemGPT 论文思路——把 LLM 当作有操作系统的进程，系统负责内存换入换出。全部消息持久化到数据库，只有一部分进 context window。Compaction 把最旧消息用便宜模型 summarise 成摘要替换原文。
- **核心概念**：Agent（有状态实体）、Memory Block（钉在 prompt 里的可编辑字符串）、Compaction（sliding_window/self_compact_sliding_window 模式）。
- **短/长/会话记忆区分**：短期上下文 ≠ 长期记忆 ≠ 外部知识库。
- **工具化**：把 RAG 检索和记忆召回接成 Agent 工具，沿用 Stage 1 的 tool call loop，"带引用的资料研究助手"就是最终产出。

## 我卡住/没懂的地方
- RAGFlow 完整部署需要 Docker，教学用本地 fallback；Letta 自托管也需 Docker。
- Compaction 的 `self_compact_sliding_window` 模式利用 prompt cache 的机制需要进一步理解。

## 它背后的原理（别只记操作）
- RAG 解决 LLM 知识截止、幻觉问题：先检索真实资料，再让 LLM 基于资料回答，约束输出必须有引用。
- Context compaction 是解决无限长对话的核心机制：旧对话 summarize → 腾出 token，历史仍存数据库可查。
- 工具化设计：RAG 检索和记忆召回作为"工具"接入 loop，让 Agent 自主决定何时检索、何时回忆。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 企业知识库问答、客服系统（RAG + 用户记忆）、代码文档检索助手。

## 关联
- 概念：[[RAG]]、[[上下文压缩]]、[[长期记忆]]、[[短期记忆]]、[[用户记忆]]、[[向量数据库]]、[[嵌入 Embedding]]、[[语义检索]]、[[记忆管理]]、[[上下文工程]]
- 项目：[[Agent 运行时 Runtime]]

## 来源
- Agent-Learning-Hub Stage 2 README + step01-step07 + ragflow_helper/mem0_helper/letta_helper
