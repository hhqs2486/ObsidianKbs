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
  id: task-msab6ovgvy2zpf
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:29.097Z
---

# Claude Code

## 一句话定义
> Claude Code 是 Anthropic 推出的终端原生（terminal-native）Coding Agent：以 CLI 形式运行，让 Claude 直接读写文件、执行命令、调用工具与 MCP 服务器，完成软件工程任务。

## 它解决什么问题 / 为什么存在
- 传统聊天机器人只能在对话里给代码片段，开发者还要手动复制粘贴。
- Claude Code 把模型变成"能动手的工程师"：自己读仓库、跑测试、改代码、提 PR，闭环在终端里完成。
- 它是一套"工业级 Agent Runtime"的参考实现，很多 Agent 工程范式（权限、子 Agent 隔离、上下文压缩）都体现在其源码里。

## 核心原理（大二电子信息工程专业学生能懂）
- **工具循环**：模型输出带 `tool_use` 块（如 Read / Edit / Bash），运行时执行并把结果回灌给模型，循环直到任务结束。
- **Fail-Closed 默认安全**：`TOOL_DEFAULTS` 里所有敏感选项默认关闭（默认非只读、默认串行），工具必须主动"解锁"能力，错误方向是安全的。
- **Context 显式传递**：每次工具调用都携带 `ToolUseContext`（消息、配置、AbortController 等），不用全局变量，便于测试与子 Agent 隔离。
- **子 Agent 状态隔离**：`createSubagentContext()` 让子 Agent 拥有独立消息历史与文件缓存，但 Task 状态可被父 Agent 看到（选择性穿透）。
- **大输出磁盘化**：工具输出超过阈值就存盘，模型只收到引用+预览，避免撑爆上下文窗口。
- **中断链式传播**：用户 Ctrl+C 通过 `AbortController` 一路取消工具、子 Agent、MCP 调用。

## 关键参数 / 易错点
- 权限边界：破坏性 / 写操作需要明确授权，否则应走人工确认。
- 上下文压缩（autoCompact）：长任务会触发消息压缩，注意"压缩前后"的连贯性。
- `MAX_STEPS` / 超时：防止死循环把服务拖垮（参考 Agent 部署与交付、Agent 安全门禁）。

## 类比（帮助理解）
- 像一个"住在终端里的实习工程师"：你给需求，它自己开文件、跑命令、看报错、再改。
- Fail-Closed 像电路里的"常闭触点"——不通电时安全，通电（显式授权）才动作。

## 设计时怎么用（反推思维）
> 做 Coding Agent 系统时，我会参考 Claude Code 的 Fail-Closed 默认值和 Context 传递方式，把"危险工具默认要审批"写进架构，而不是默认放开权限。

## 典型应用 / 我在哪见过
- 终端里"帮我修复这个 bug / 给这个模块写测试 / 重构这个函数"。
- 配合 `claude-code-permissions` 与三级门禁（见 [[Agent 安全门禁]]）。

## 关联
- 前置知识：[[Agent]], [[大语言模型 LLM]], [[函数调用 Function Calling]], [[工具 Tool]], [[MCP]]
- 相关：[[Claude Agent SDK]], [[Coding Agent]], [[上下文工程]], [[Agent 安全门禁]]
- 反例/误区：把模型当"全自动执行器"而放开所有权限——这是最常见的事故来源。

## 来源
- Agent-Learning-Hub 仓库 `stage-3/claude-code-docs/`（11-设计精髓.md 等）
- Anthropic 官方文档 / 通用认知
