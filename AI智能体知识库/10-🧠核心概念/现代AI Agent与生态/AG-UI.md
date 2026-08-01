---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# AG-UI

## 一句话定义
> AG-UI（Agent-User Interaction Protocol，Agent-用户交互协议，由 CopilotKit 提出）是专门规范"Agent 运行时 ↔ 前端 UI"之间实时事件流的开放协议：把 Agent 的思考、工具调用、状态变化以标准化事件推给界面。

## 它解决什么问题 / 为什么存在
- 前端要展示 Agent 的"进度"：正在想、调了哪个工具、工具返回了什么、生成到哪了。如果每家 Agent 的事件格式都不一样，UI 要反复重写。
- AG-UI 统一了这些"UI 事件"，让前端组件可复用、可接任意兼容后端。

## 核心原理（大二电子信息工程专业学生能懂）
- **事件流（event stream）**：后端通过 SSE / WebSocket 向前端推送语义化事件，例如：
  - `run_started` / `run_finished`
  - `text_message_start` / `text_message_content` / `text_message_end`（流式文本）
  - `tool_call_start` / `tool_call_args` / `tool_call_end`（工具调用进度）
  - `state_snapshot` / `state_delta`（共享状态变化）
- 与 ACP/MCP 互补：ACP 管 client↔agent 的"任务级"通信，AG-UI 管 agent↔UI 的"渲染级"事件。
- 前端拿事件直接驱动组件：打字机效果、工具调用卡片、进度条。

## 关键参数 / 易错点
- 事件要幂等/可重放：断线重连时 UI 能重建状态（用 `state_snapshot`）。
- 不要把敏感中间结果（如 tool 原始返回里的密钥）直接推给不可信前端。

## 类比（帮助理解）
- 像 Agent 给前端发的"实时字幕+舞台提示"，前端照着演。

## 设计时怎么用（反推思维）
> 做带可视化 Agent 流程的产品（如聊天里展示"正在搜索/已读到 X"）时，我会用 AG-UI 规范事件流，让前端组件与后端解耦。

## 典型应用 / 我在哪见过
- Copilot 式助手 UI、带工具调用可视化的聊天、前端驱动的多步 Agent 流程。

## 关联
- 前置知识：[[Agent]], [[ACP]], [[MCP]]
- 相关：[[Agent 追踪 Trace]], [[Realtime API]], [[上下文工程]]
- 反例/误区：把 AG-UI 当成 agent↔tool 协议——它只对前端，工具层仍用 MCP。

## 来源
- CopilotKit AG-UI 规范 / 通用认知
