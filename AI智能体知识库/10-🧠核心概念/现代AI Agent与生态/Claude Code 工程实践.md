---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Claude Code 工程实践

## 一句话定义
> Claude Code 工程实践指把 Claude Code 当作"编码 Agent"来用的架构与经验：它跑一个 Agent 循环，在权限模式下调用文件/Shell/工具，靠脚手架（检索、规划、沙箱、编辑-验证循环）把模型能力变成可交付的 patch。

## 它解决什么问题 / 为什么存在
- "哪个 coding agent 最强"是错的问题。正确问题是：在我的任务分布上、用我生产里要跑的那套脚手架，端到端可靠性是多少？
- 2022→2026 的关键教训：**脚手架（scaffolding）是承重墙**。同一个 Claude Sonnet 4.5 在 SWE-agent v1 上 43.2%，在 Cline 的自主脚手架里 59.8%——同样的权重，差 16.6 个百分点。基座模型是零件，循环才是产品。

## 核心原理（大二能懂的水平）
- Claude Code 本质是一个 coding agent：接收自然语言任务 → 进入 Agent 循环（读代码、改文件、跑命令、看结果、再迭代）。
- **两种执行架构**（行业共性，不只 Claude Code）：
  - JSON 工具调用：每步是一次 tool call，经显式校验器，易审计、天然较安全，但组合性弱——托管服务（Anthropic Managed Agents、OpenAI Assistants）多用。
  - CodeAct：模型直接吐 Python 代码、由 Jupyter 式内核在沙箱里跑，一步能是一个完整程序，组合性强，但**必须配加固沙箱**（OpenHands 用 Docker 隔离）。开源平台（OpenHands、smolagents）多用 CodeAct。
- **权限模式**决定"每一步要不要问人"，是 Claude Code 工程实践的核心开关（详见 [[Agent 权限系统]]）：从 `plan`（每步先审）到 `default`(UI 标 Manual)、`acceptEdits`、`auto`（分类模型预审）、`dontAsk`、`bypassPermissions`。
- **脚手架要素**（决定可靠性的不是模型单点）：检索层（找相关代码）、规划器（拆任务）、沙箱（隔离执行）、编辑-验证循环（改完跑测试）、反馈格式（让模型读懂报错）。
- 长时跑用 [[Agent 运行时 Runtime]] 的耐用执行（checkpoint/resume），并用 `max_turns`、`max_budget_usd` 等预算做护栏。

## 关键参数 / 易错点
- 基准饱和会掩盖回归：SWE-bench Verified 已接近饱和，且 500 题里 161 题只需 1–2 行改动，把高分拉高；真实质量看 SWE-bench Pro（10+ 行改动），同一批前沿模型只在 23–59%。**"过了 Verified"不等于能泛化**。
- 选型看任务分布 + 脚手架，不看榜单单点。
- 无沙箱别用 CodeAct：沙箱运行时允许什么，失败模式就是什么。
- 自主模式必须在可丢弃/无凭据/无生产挂载的工作区里跑（见 [[Agent 权限系统]]）。

## 类比（帮助理解）
- 像造车：引擎（基座模型）重要，但底盘、变速箱、刹车（脚手架=检索/规划/沙箱/验证循环）才决定这车能不能上路、安不安全。
- 权限模式像"自动驾驶的介入等级"：从全程人工接管（plan）到限定区域全自动（bypassPermissions 仅在一次性容器）。

## 设计时怎么用（反推思维）
> 做"让 Agent 改我们仓库代码"的系统时，我会用 Claude Code 式的工程实践：先把脚手架（代码检索 + 任务分解 + 沙箱执行 + 跑测试验证）搭稳，再谈模型；用 [[Agent 权限系统]] 按任务风险选模式（陌生任务用 plan，已知重构用 acceptEdits），并用 [[Agent 运行时 Runtime]] 的耐用执行 + 预算护栏管住长时运行。

## 典型应用 / 我在哪见过
- OpenHands（原 OpenDevin，MIT）CodeAct in Docker，最活跃开源平台，事件流可重放。
- SWE-agent（MIT，ACI 接口）、Aider（Apache-2，本地 diff 编辑，回归稳定强）、Cline（Apache-2，VS Code agent）。
- 行业曲线：2022 约 4% → 2024 约 14% → 2026 前沿模型 70–80%+（SWE-bench Verified）。

## 关联
- 前置知识：[[Claude Code]] [[Agent 运行时 Runtime]]
- 相关：[[Coding Agent]] [[Agent 权限系统]] [[工具沙箱]] [[代码生成]] [[仓库级代码生成]]
- 反例/误区：以为"换更强模型就够"（忽略脚手架）；用 bypassPermissions 跑在有凭据的真实机器上（灾难）。

## 来源
- AIEFS Vol.5 Agents, Ch.105 "The Autonomous Coding Agent Landscape (2026)"（SWE-bench 曲线、CodeAct vs JSON、脚手架对比表）
- 参考：OpenHands (arXiv:2407.16741)、SWE-bench (arXiv:2310.06770)、SWE-bench Verified/Pro
