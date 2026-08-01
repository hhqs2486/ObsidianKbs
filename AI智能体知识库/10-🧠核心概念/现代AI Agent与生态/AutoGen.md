---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# AutoGen

## 一句话定义
> AutoGen（微软）是一个以"多 Agent 对话"为核心的框架：多个 `ConversableAgent` 轮流转消息，靠聊天让答案自然涌现，典型如 proposer-critic、teacher-student。

## 它解决什么问题 / 为什么存在
- 有些任务靠"两个 Agent 来回讨论"比"单个 Agent 直答"质量更高（如互相挑错、辩论、协作求解）。
- AutoGen 把"对话即编排"做成一等公民：谁发言、何时停，由对话动态决定。

## 核心原理（大二电子信息工程专业学生能懂）
- **ConversableAgent**：能收发消息的 Agent，可在 `human_input_mode` 下让真人介入。
- **GroupChat**：N 个 Agent 的托管群聊，由 `GroupChatManager` 用 `speaker_selection_method` 选下一个发言者（默认 LLM 驱动）。
- **状态 = 聊天记录 + 用户自定义 context**：对话记录天然持久，但"任意工作流状态"不自动持久，跨重启要自己写适配器。
- 工具用 `FunctionTool` 包装任意 Python 可调用对象；也支持 MCP 适配。

## 关键参数 / 易错点
- 分支是"涌现"的：谁发言由模型决定，难以精确审计与回放。
- 没有持久化检查点：需要断点续跑要自己接存储。
- 追踪粒度是"每条消息"，不是"每个节点"（不如 LangGraph 细）。

## 类比（帮助理解）
- 像拉一个 Slack 群聊：两个 Agent 互相 @，第三个当主持人。

## 设计时怎么用（反推思维）
> 做"proposer-critic / 老师-学生"这类靠对话辩论提升质量的任务时，我会用 AutoGen 的群聊，而不是硬写成状态图。

## 典型应用 / 我在哪见过
- 代码互审、头脑风暴、多视角求解、需要"互相纠错"的推理任务。

## 关联
- 前置知识：[[Agent]], [[多智能体]], [[编排 Orchestration]]
- 相关：[[LangGraph]], [[CrewAI]], [[函数调用 Function Calling]], [[AG-UI]]
- 反例/误区：用 AutoGen 做已知 DAG 的确定性流水线——它的对话式分支会让流程不可控。

## 来源
- ai-engineering-from-scratch 仓库 `phases/11-llm-engineering/17-agent-framework-tradeoffs/docs/en.md`
- AutoGen 官方文档 / 通用认知
