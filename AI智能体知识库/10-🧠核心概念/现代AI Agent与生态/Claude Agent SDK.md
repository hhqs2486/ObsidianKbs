---
类型: 概念
主题: 现代AI Agent与生态
tags:
  - AI智能体知识库
  - 现代AI Agent与生态
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6ox850euio
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:29.186Z
---

# Claude Agent SDK

## 一句话定义
> Claude Agent SDK 是 Anthropic 把"Claude Code 那套 Agent 能力"做成可编程 SDK 的产品：让开发者在自己的应用里嵌入可调用的 Coding/通用 Agent，支持工具、子 Agent、MCP、权限与钩子。

## 它解决什么问题 / 为什么存在
- Claude Code 是面向人的 CLI 工具；SDK 把它背后的 Agent 运行时抽出来，给程序调用。
- 你可以用几行代码在自己的后端 / 工作流里起一个 Claude Agent，套用工具与权限策略，而不是让用户自己开终端。

## 核心原理（大二电子信息工程专业学生能懂）
- 与 Claude Code 共用同一套核心：工具循环、`tool_use` 执行、子 Agent 隔离、MCP 接入。
- 暴露为 API / 客户端库（TypeScript / Python），支持：
  - **子 Agent（sub-agents）**：把一个大任务拆给多个专职 Agent 并行或串行做。
  - **权限与钩子（hooks）**：在工具调用前后插入自定义逻辑（如审批、日志、拦截）。
  - **MCP 适配**：把 MCP 服务器当成工具源直接挂进来。
- 工具描述质量直接决定模型选对工具的概率（见 [[工具接口设计]]）。

## 关键参数 / 易错点
- 不要把 SDK 当"无脑自动执行器"：危险工具必须接门禁（见 [[Agent 安全门禁]]）。
- 子 Agent 的状态隔离与共享需要设计清楚，否则上下文泄漏或任务丢失。
- 成本与步数上限要设（见 [[Agent 部署与交付]]）。

## 类比（帮助理解）
- Claude Code 是"成品车"，Claude Agent SDK 是"汽车底盘+发动机"，让你自己造车。

## 设计时怎么用（反推思维）
> 做需要把 Agent 嵌进自有系统的产品时，我会用 Claude Agent SDK 而不是自己重写工具循环，省去权限/子 Agent/压缩这些易错工程。

## 典型应用 / 我在哪见过
- 在 CI 里跑"自动修 lint / 生成 changelog"。
- 客服系统里挂一个能查数据库、又能写工单的 Agent。

## 关联
- 前置知识：[[Claude Code]], [[Agent]], [[函数调用 Function Calling]], [[MCP]]
- 相关：[[OpenAI Agents SDK]], [[多智能体]], [[编排 Orchestration]], [[Agent 安全门禁]]
- 反例/误区：认为 SDK 自带完整安全策略——安全门禁仍要自己接。

## 来源
- Anthropic 官方文档 / 通用认知
- Agent-Learning-Hub 仓库 `stage-3/claude-code-docs/`（Claude Code 设计精髓可类比）
