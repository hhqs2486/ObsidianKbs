---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: AIGC-Interview-Book
创建: 2026-07-23
状态: 种子
task:
  id: task-msab6m6a4f36tj
---

# AI Agent 面试高频考点

## 这条教程在解决什么
- 来自 AIGC-Interview-Book 的 11 篇 AI Agent 面试笔记，覆盖 Agent 核心架构、工具调用、MCP/A2A 协议、框架选型、记忆系统、安全评估、企业落地
- 适合准备 AI Agent 方向面试，从基础概念到工程落地系统掌握

## 关键内容（按主题）

### Agent 本质与范式
- Agent = LLM + Tools + Memory + Planning + Control Loop + Environment
- Agent vs Chatbot vs Workflow vs Copilot 的区别判断标准
- Agent 核心技术栈九层拆解
- [[Agent]] | [[Agent范式]] | [[大语言模型 LLM]]

### 规划与工具调用
- ReAct / Plan-Execute / Reflection / Tree-of-Thoughts 对比
- Function Calling / Tool Use / Structured Output 区别
- 工具 Schema 设计高频坑点
- [[ReAct]] | [[函数调用 Function Calling]] | [[工具 Tool]] | [[工具描述]] | [[工具选择]]

### MCP/A2A 协议
- MCP 为什么成为 Agent 工具生态重要协议
- MCP vs Function Calling 的区别
- A2A vs MCP 的分工
- [[MCP]] | [[A2A 协议]] | [[A2A 协议]] | [[MCP 协议 v2]]

### 主流 Agent 框架
- OpenAI Agents SDK / LangGraph / CrewAI / AutoGen / Google ADK 对比
- Claude Code / Codex / Cursor / Devin 趋势
- [[OpenAI Agents SDK]] | [[LangGraph]] | [[CrewAI]] | [[AutoGen]] | [[Google ADK]] | [[Claude Code]]

### 记忆与上下文工程
- 短期/长期/任务/工具记忆四维区分
- Memory vs RAG 的区别
- 上下文窗口溢出处理策略
- [[用户记忆]] | [[短期记忆]] | [[长期记忆]] | [[RAG]] | [[上下文工程]] | [[上下文压缩]]

### 安全与评估
- Agent 权限/安全/Guardrails 边界
- 可观测性 tracing 应记录什么
- Agent 常用评测基准
- [[Agent 安全]] | [[Agent 评测基准]] | [[Agent 追踪 Trace]] | [[基准 Benchmark]]

### 面试高频 QA（精选）
- 目录
- 第一章 AI Agent 总览
- Agent、Chatbot、Workflow、Copilot 有什么区别？](#q-002)
- AI Agent 的核心技术栈如何拆解？](#q-003)
- 为什么 2025-2026 年 Agent 从 Demo 走向工程系统？](#q-004)
- 第二章 Agent 循环、规划与工具使用
- ReAct、Plan-and-Execute、Reflection、Tree-of-Thought 如何对比？](#q-006)
- Function Calling、Tool Use、Structured Output 有什么区别？](#q-007)
- 工具 Schema 设计有哪些高频坑？](#q-008)
- Agent 如何选择工具、调用工具并处理工具失败？](#q-009)
- Agent 为什么需要 Human-in-the-loop？](#q-010)
- 第三章 MCP、A2A 与 Agent 标准化
- MCP 和 Function Calling 的区别是什么？](#q-012)
- MCP 的 stdio、Streamable HTTP、SSE 传输如何选择？](#q-013)
- A2A 和 MCP 分别解决什么问题？](#q-014)
- 第一章 编码 Agent 与 AgentOS 总览
- 编码 Agent 与传统 IDE Copilot 有什么区别？](#q-002)
- 一个终端/IDE 编码 Agent 的典型架构是什么？](#q-003)
- 为什么编码 Agent 是 Agent 工程落地最快的场景？](#q-004)
- 第二章 工具系统与权限控制

## 常见面试陷阱
- 把确定性工作流做成不可控 Agent（能用 Workflow 解决就别上 Agent）
- 忽视工具调用错误处理（工具失败后 Agent 如何优雅降级）
- 混淆 Memory 和 RAG（Memory 是个体状态，RAG 是知识检索）

## 我能复用/改编的点
> 面试回答时始终从「本质定义 → 区别对比 → 落地坑点」三段论结构出发

## 关联
- 概念：[[Agent]] | [[Agent范式]] | 多智能体协作 | [[工具 Tool]] | [[MCP]] | [[上下文工程]]
- 教程：[[01-AI Agent 入门与范式]] | [[08-多 Agent 协作]]
- 地图：[[基础与入门地图]] | [[现代AI Agent与生态地图]]

## 来源
- AIGC-Interview-Book AI Agent基础（11篇）
