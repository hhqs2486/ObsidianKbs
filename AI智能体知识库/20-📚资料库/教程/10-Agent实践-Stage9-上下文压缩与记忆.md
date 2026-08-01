---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: Agent-Learning-Hub Stage 9
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6mbnvzf41c
---

# 10-Agent实践-Stage9-上下文压缩与记忆

## 这条教程在解决什么
- 从零实现上下文压缩（滑动窗口+摘要式）和长期记忆的最小版本：不依赖外部服务，无 API key 也能跑通，理解原理后再接进长任务 loop 看收益。对照 Stage 2 的 mem0/Letta，这是"自己实现一遍"。

## 关键内容（按 Stage 9 学习步骤提纲）
- **两个机制的分工**：Context Compaction 控制当前窗口大小（滑动窗口/摘要）；Memory 把跨会话事实存下来随时召回。
- **主动 vs 被动压缩**：主动压缩（每轮）vs 被动压缩（413 token limit 紧急触发）。锚点（anchor）：系统约束、用户要求、工具 schema 永不丢弃。
- **滑动窗口（step02_sliding_window）**：保留锚点+最近 N 轮消息，超出窗口的旧消息被丢弃。MAX_TOKENS 调小可观察保留消息数的变化。
- **摘要式压缩（step03_summarize_compact）**：整段旧对话压成一条系统消息（如"之前的对话讨论了 RAG 的三个组件：chunk、embed、retrieve"），最省 token 但可能丢失细节。
- **长期记忆（step04_memory_read_write）**：`add_memory(fact, user_id)` 写入 JSON 持久化，`search_memory(query, user_id)` 关键词召回。Memory vs RAG：RAG 查文档，Memory 记用户。
- **接进 loop（step05_loop_with_memory）**：60 轮 loop，每 10 轮压缩+随时召回偏好。对比"无压缩累计 token"与"有压缩最终 token"的差距。
- **与 Stage 2 的关系**：Stage 2 是"用现成库"（mem0/Letta/RAGFlow）；Stage 9 是"自己实现一遍"，搞懂机制后更容易调参与排查。

## 我卡住/没懂的地方
- 摘要质量评估——关键信息丢失的判断标准尚缺乏客观指标。
- 语义记忆（接入 OpenAI embeddings 替换关键词召回）的实现细节。

## 它背后的原理（别只记操作）
- 上下文压缩的本质是「信息蒸馏」：保留关键约束（锚点）不变，旧细节 summary 化。这和人类记忆的遗忘曲线类似——重要事实保留，细节随时间模糊。
- Token 预算 = 系统 prompt 固定开销 + 锚点消息 + 滑动窗口内最新消息 + 压缩摘要。超出预算时要么截断（丢信息）要么压缩（丢精度）——工程上需要权衡。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何需要"长对话管理"的场景：客服对话摘要、代码 Review 历史压缩、项目沟通记录精简。

## 关联
- 概念：[[上下文压缩]]、[[Token 预算管理]]、[[上下文压缩]]、[[长期记忆]]、[[短期记忆]]、[[对话历史管理]]、[[用户记忆]]、[[上下文工程]]
- 概念：[[经验回放与改进]]、[[长上下文]]、[[Prompt 缓存]]
- 教程：[[10-Agent实践-Stage2-RAG与记忆]]

## 来源
- Agent-Learning-Hub Stage 9 README + compactor.py/memory_store.py + step01-step05
