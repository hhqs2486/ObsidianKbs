---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: Agent-Learning-Hub Stage 1
创建: 2026-07-22
状态: 种子
---

# 10-Agent实践-Stage1-最小Agent循环

## 这条教程在解决什么
- 用 Python + OpenAI 兼容 API，从零写出一个能选工具、执行工具、循环推理的 50-150 行最小 Agent，理解 Agent loop 的内核。

## 关键内容（按 Stage 1 学习步骤提纲）
- **Step 1-2：调 API** — `messages` 是对话历史（system/user/assistant/tool），`chat.completions.create` 读历史生成下一条，`response_format={"type": "json_object"}` 约束输出为 JSON。
- **Step 3-4：工具从哪来、怎么接回模型** — `TOOL_SCHEMAS` 告诉模型有哪些工具，`tool_calls` 是模型说"我想调工具"，`role: tool` 是把执行结果还给模型，否则模型看不到结果会胡编。
- **单轮数据流（核心）**：user 提问 → API（带 tools）→ assistant 返回 tool_calls → 你执行 run_tool → messages 追加 assistant + tool → 再调 API → assistant 返回最终文字。
- **Step 5：Agent Loop** — `while` 模型还想调工具 → 执行 → 再观察；`MAX_STEPS` 防止死循环；没有 tool_calls 时任务结束。
- **完成标准**：能解释 chatbot 与 agent 的差别；`agent.py` 在需要工具时调工具，纯聊天问题可以不调；能口头说出去掉 `role: tool` 会发生什么。

## 我卡住/没懂的地方
- 兼容 Claude/Gemini 时 tool 格式不同（OpenAI `tools` vs Claude Tool Use vs Gemini Function Calling），原理相同但 SDK 字段名不同。
- 生产环境 `eval` 不安全，需换成 `ast.literal_eval` 或专用数学解析库。

## 它背后的原理（别只记操作）
- Agent 本质是「LLM 读消息历史 → 决定下一步 → 人/系统执行决定 → 结果写回历史 → 循环」的状态机。
- 模型不调工具时会直接编答案——需加强 system prompt 约束"需要计算/读文件时必须调用工具"。
- 90% 的 bug 是 `tool_call_id` 不匹配或漏追加 `role: tool` 消息。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何需要"LLM + 外部操作"的场景都可以复用这个 loop 骨架（代码生成、自动化运维、数据分析）。

## 关联
- 概念：[[Agent]]、[[Agent范式]]、[[大语言模型 LLM]]、[[工具 Tool]]、[[函数调用 Function Calling]]、[[上下文 Context]]、[[Prompt]]、[[推理 Reasoning]]
- 教程：[[Agent 运行时 Runtime]]

## 来源
- Agent-Learning-Hub Stage 1 README + step01-step05 + agent.py
