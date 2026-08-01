---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# MCP 协议 v2

## 一句话定义
> MCP（Model Context Protocol，模型上下文协议）是 Anthropic 于 2024-11 提出、现由 Linux Foundation 的 Agentic AI Foundation 托管的开放协议，用 JSON-RPC 2.0 标准化"AI 应用 ↔ 外部工具/数据源"的连接；所谓"v2"指 2025-11-25 这一版规范。

## 它解决什么问题 / 为什么存在
- 过去每个 Agent 各自写一套工具接口：Cursor 一套、Claude Desktop 一套、VS Code 一套，一个工具要抄三遍。
- MCP 把"传输层"标准化：一个 MCP 服务器（server）可被任意兼容客户端（client）发现并调用，工具变成可移植资产。

## 核心原理（大二电子信息工程专业学生能懂）
- **六种原语**：
  - 服务端 3 个：`tools`（可调用动作）、`resources`（按 URI 读的数据）、`prompts`（可复用模板）。
  - 客户端 3 个：`roots`（服务器可触碰的 URI 范围）、`sampling`（服务器反向请求客户端模型补全）、`elicitation`（运行中向用户要结构化输入）。
- **传输格式**：JSON-RPC 2.0——请求 `{jsonrpc, id, method, params}`、响应 `{jsonrpc, id, result|error}`、通知（无 id）。选它因为支持服务端主动发消息（sampling/通知），REST 只支持客户端发起。
- **三阶段生命周期**：
  1. `initialize`：双方声明 `capabilities`（能力协商），服务器返回 `protocolVersion`（如 `2025-11-25`）。
  2. `operation`：客户端 `tools/list` 发现、`tools/call` 调用；服务器可 `sampling/createMessage`、发变更通知。
  3. `shutdown`：传输层关连接（无独立 shutdown 方法）。
- **2025-11-25 版新增**：async Tasks（SEP-1686）、URL 模式 elicitation（SEP-1036）、带工具的 sampling（SEP-1577）、增量 scope 同意（SEP-835）、OAuth 2.1 resource-indicator 语义等。

## 关键参数 / 易错点
- 能力协商：客户端没声明 `sampling`，服务器就不能调 `sampling/createMessage`——对称、可降级。
- `tools/call` 返回 `content` 数组：text / image / resource，v2 还加了 `ui://` 交互 UI（MCP Apps）。
- 工具描述会原样进入模型上下文，可能藏"工具投毒"指令（见 [[Agent 安全]]）。

## 类比（帮助理解）
- MCP 之于工具调用，如 HTTP 之于网络：统一了"怎么连、怎么问、怎么答"。

## 设计时怎么用（反推思维）
> 做需要让 Agent 接多个外部系统（数据库、GitHub、浏览器）时，我会把它们都做成 MCP 服务器，而不是每个客户端写一套适配。

## 典型应用 / 我在哪见过
- Postgres MCP、GitHub MCP、文件系统 MCP；Claude Desktop / Cursor / VS Code / Gemini 等 300+ 客户端（2026 年数据）。

## 关联
- 前置知识：[[MCP]], [[工具 Tool]], [[函数调用 Function Calling]], [[Agent]]
- 相关：A2A（通用认知）, [[ACP]], [[AG-UI]], [[工具接口设计]]
- 反例/误区：把 MCP 当成"Agent 间通信协议"——它解决的是 agent↔tool，跨 agent 用 A2A/ACP。

## 来源
- ai-engineering-from-scratch 仓库 `phases/13-tools-and-protocols/06-mcp-fundamentals/docs/en.md`
- Model Context Protocol 规范 2025-11-25 / 通用认知
