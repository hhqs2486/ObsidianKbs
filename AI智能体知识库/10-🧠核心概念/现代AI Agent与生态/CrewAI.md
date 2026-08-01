---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# CrewAI

## 一句话定义
> CrewAI 是一个以"角色（role）+ 任务（task）+ 流程（process）"为核心抽象的 Agent 框架：把多个有职责边界的 Agent 组成一支"团队（Crew）"协作完成任务。

## 它解决什么问题 / 为什么存在
- 有些任务天然是"几个人分工"：研究员写要点、写手出稿、审稿人挑错。
- CrewAI 把这种"角色扮演/专人专岗"的协作显式化，适合线性或层级化的工作流。

## 核心原理（大二电子信息工程专业学生能懂）
- **Crew = 角色 + 任务 + 流程**：
  - Role：每个 Agent 有 goal、backstory（人设/专长）。
  - Task：要做什么，可指定由哪个角色负责。
  - Process：`sequential`（顺序串行）或 `hierarchical`（经理路由）。
- **状态传递**：任务之间靠 `context` 字段或 `output_pydantic` 结构化产出传递，没有 LangGraph 那种一等公民式的持久状态。
- **Delegation**：`allow_delegation=True` 允许角色把子任务委派给队友。
- 工具可用 LangChain / LlamaIndex / MCP 工具。

## 关键参数 / 易错点
- 复杂分支难表达：CrewAI 的"if"是隐式的（经理 prompt 决定），没有一等公民条件边。
- 跨重启无原生持久状态：需要持久化的话要自己接存储。
- 层级模式（hierarchical）每步都要经理模型决定谁上，token 开销更高。

## 类比（帮助理解）
- 像画一张"公司组织架构图"：每个岗有 JD，经理把活派下去。

## 设计时怎么用（反推思维）
> 做"研究→写作→审校"这类角色清晰、流程偏线性的流水线时，我会用 CrewAI 的角色+任务来表达，比画状态图更快上手。

## 典型应用 / 我在哪见过
- 内容生产流水线、市场调研报告生成、带人设的对话 Agent 组。

## 关联
- 前置知识：[[Agent]], [[多智能体]], [[编排 Orchestration]]
- 相关：[[LangGraph]], [[AutoGen]], Agno（通用认知）, [[工具 Tool]]
- 反例/误区：把 CrewAI 当通用状态机——它的强项是角色协作，不是复杂分支图。

## 来源
- ai-engineering-from-scratch 仓库 `phases/11-llm-engineering/17-agent-framework-tradeoffs/docs/en.md`
- CrewAI 官方文档 / 通用认知
