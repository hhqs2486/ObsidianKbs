---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# OpenAI Agents SDK

## 一句话定义
> OpenAI Agents SDK 是 OpenAI 的轻量级 Agent 开发框架（Python / TypeScript），提供 Agent、Handoff（交接）、Guardrails、Tracing 等原语，用来搭建多步骤、多 Agent 的工作流。

## 它解决什么问题 / 为什么存在
- 把"while True 工具循环"封装成可组合的原语，少写样板代码。
- 强调"轻量"：核心是 Agent（模型+指令+工具）、交接（把对话转给另一个 Agent）、护栏（输入/输出校验）、追踪（内置 trace）。

## 核心原理（大二电子信息工程专业学生能懂）
- **Agent**：一个带 system 指令和工具集的模型调用单元。
- **Handoff（交接）**：一个 Agent 判断该把任务交给另一个专职 Agent（如： triage Agent 把"退款"转给 refund Agent）。
- **Guardrails**：在 Agent 运行前后跑校验（如话题分类、越狱检测），不通过就拦截（见 [[Agent 安全]]）。
- **Tracing**：每次运行自动产出 trace，记录每一步工具调用与模型输出，便于调试（见 [[Agent 追踪 Trace]]）。
- 支持把外部工具 / MCP 工具挂进来，也支持流式输出。

## 关键参数 / 易错点
- Handoff 不是"自由聊天"：它是显式的职责转移，避免多 Agent 互相扯皮（对照 [[多智能体]] 与 a2a-vs-shared-state 思路）。
- 护栏要覆盖输入与输出两侧，单层不够。
- 要设 max turns，防止 Agent 之间无限交接。

## 类比（帮助理解）
- 像一个客服呼叫中心：前台（triage）听需求，再把电话转给对应专员。

## 设计时怎么用（反推思维）
> 做"需要把任务分流给多个专员 Agent"的系统时，我会用 OpenAI Agents SDK 的 Handoff 来表达职责边界，而不是让所有 Agent 共享一个聊天框。

## 典型应用 / 我在哪见过
- 多步骤客服、研究助手、带工具调用的聊天机器人。
- 与 [[Realtime API]]（见 [[Realtime API]]）配合做语音 Agent。

## 关联
- 前置知识：[[Agent]], [[函数调用 Function Calling]], [[大语言模型 LLM]]
- 相关：[[Claude Agent SDK]], [[编排 Orchestration]], [[多智能体]], [[Agent 安全]], [[Agent 追踪 Trace]]
- 反例/误区：用 Handoff 模拟"自由讨论"——交接是路由，不是聊天。

## 来源
- OpenAI 官方文档 / 通用认知
