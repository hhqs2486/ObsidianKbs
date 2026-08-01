---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: Agent-Learning-Hub Stage 3
创建: 2026-07-22
状态: 种子
---

# 10-Agent实践-Stage3-Claude Code架构

## 这条教程在解决什么
- 拆解 Claude Code 这个工业级 Agent Runtime 的工程结构：tool system、query loop、权限系统、MCP 集成、状态管理、TUI 与 CLI bootstrap，理解现代 coding agent harness 的设计精髓。

## 关键内容（按 CC 源码 12 章导读提纲）
- **最小 Agent 循环**：在 1884 个源文件、51 万行代码之下，本质仍是「messages[] → Claude API → stop_reason == "tool_use"? → 执行工具 → 循环」。
- **Tool 系统（40+ 内置工具）**：BashTool 实现了最复杂的权限匹配（命令语义前缀解析 + 通配符规则）；所有工具通过 `buildTool()` 工厂创建，`call()` 和 `render*()` 完全分离。
- **Query 引擎**：`query.ts`（最大单文件，785KB）包含 StreamingToolExecutor（并行工具执行）、autoCompact（上下文压缩）、runTools（工具编排）。
- **Agent 系统**：支持递归多 Agent 架构——主 Agent 通过 AgentTool 启动子 Agent，子 Agent 可继续启动孙 Agent。四种执行路径：本地子 Agent、Fork Subagent（Git Worktree 隔离）、Teammate（长期协作者）、Remote Agent。
- **Task 系统**：Shell Task、Agent Task、Remote Agent Task，统一生命周期管理。
- **状态管理**：AppState 不可变状态树（settings/tasks/messages/permissions），子 Agent 的 `setAppState` 是 no-op（隔离），但 Task 状态共享。
- **权限系统**：全局 PermissionMode → alwaysDenyRules/alwaysAllowRules → tool.checkPermissions() → PreToolUse Hook → Auto Classifier → 用户确认 UI。DenialTracking 防止 Agent 死磕被拒操作。
- **设计精髓**：Fail-Closed 默认安全、类型系统即文档、Context 传递而非全局变量、UI 与逻辑解耦、选择性状态隔离、磁盘化大输出。

## 我卡住/没懂的地方
- Feature Gates 导致 108 个模块在 npm 包中不存在，学习时遇到 null 引用是正常的。
- Remote Agent 和 Teammate 的部分代码被 feature gate 隐藏。

## 它背后的原理（别只记操作）
- 工业级 Agent 不是"LLM wrapper"，而是在最小 loop 上包裹了权限、状态、MCP 集成、多 Agent 协作、持久化等生产级线束。
- 权限设计核心：Fail-Closed（默认不安全，必须主动声明安全特性）+ 多层独立检查 + 用户决策可持久化。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 设计自己的 Agent 工具时可以借鉴 `buildTool()` 的工厂模式 + ToolUseContext 显式传递所有运行时状态。
- Fork Subagent 的 Git Worktree 隔离思路可用于任何"实验性修改"场景。

## 关联
- 概念：[[Agent]]、[[Agent范式]]、[[Coding Agent]]、[[MCP]]、[[Agent 运行时 Runtime]]、[[Agent 权限系统]]、[[Agentic 编程]]、[[IDE 集成]]、[[代码审查 Agent]]
- 教程：[[10-Agent实践-Stage1-最小Agent循环]]

## 来源
- Agent-Learning-Hub Stage 3 README + claude-code-docs/00-概览与项目结构 ~ 11-设计精髓
