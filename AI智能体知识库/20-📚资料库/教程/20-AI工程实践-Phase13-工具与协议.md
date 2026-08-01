---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: ai-engineering-from-scratch Phase 13
创建: 2026-07-22
状态: 种子
---

# AI工程实践-Phase13-工具与协议

## 摘要
从 LLM 的 token 输出到真实世界的行动之间的鸿沟，由一个四步循环（描述→决策→执行→观察）弥合。Phase 13 深入解析了这个循环在 OpenAI、Anthropic、Gemini 三大供应商上的不同编码方式，以及 MCP、A2A 等协议的泛化。

## 这条教程在解决什么
- LLM 只能输出 token，如何让它调用外部 API、读取文件、执行操作？
- 三大供应商（OpenAI / Anthropic / Gemini）的函数调用 API 形状不同，如何统一？
- 并行工具调用如何降低延迟（3 个城市天气从 4 次往返降到 1 次）？
- 结构化输出如何从 85-95% 的"恳求 JSON"成功率提升到 98-99%？
- 工具描述怎么写才能让模型在 30 个工具中精确选对？

## 关键内容提纲
1. **四步工具调用循环** — describe（声明工具）→ decide（模型选择）→ execute（宿主执行）→ observe（结果回传），这是所有协议的不变量
2. **三大供应商对比** — OpenAI 用 `tools` + stringified JSON，Anthropic 用 `tool_use` block + 已解析对象，Gemini 用 `functionDeclarations` + OpenAPI 3.0 子集
3. **并行工具调用** — ``parallel_tool_calls`` 让模型一次发出多个调用，fan-out 场景延迟从总和降到最大值，实测减少 60-70%
4. **流式工具调用** — 三个供应商的 chunk 格式不同，但都需按 id 累积 partial arguments，切忌在 JSON 完整前解析
5. **结构化输出与约束解码** — ``strict: true`` 利用 logit 掩码阻止模型产生违反 schema 的 token，失败模式从三种坍缩为一种（refusal）
6. **工具 Schema 设计** — ``snake_case`` 命名 + "Use when / Do not use for" 描述模式 + 原子化工具（勿用 ``action: str`` 万能工具）可带来 10-20 百分点的选择准确率提升
7. **纯工具 vs 副作用工具** — 纯工具可安全投机调用；副作用工具（发邮件、删文件、执行交易）必须通过确认门控
8. **Schema 版本化** — 永不变姓名，添加 ``_v2`` 并废弃旧版；从不改变参数类型；仅安全地添加可选参数

## 我卡住/没懂的地方
- 流式场景下多个并行调用 interleave 时，如何在不完整 JSON 上做"提前执行"（start executing early）的风险控制？
- Anthropic 的 schema 是"建议性"而非"强制性"的这一设计哲学差异，在安全性要求高的场景如何处理？
- 工具描述中的间接注入（indirect injection）——恶意 MCP 服务器在描述中嵌入指令——是 2026 年最让人头疼的安全问题

## 它背后的原理
- 模型看到工具 schema 后，在系统提示层被编码为特殊 token，不是自由文本，这就是为什么 native function calling 比"请回复 JSON"可靠得多
- 约束解码背后是 FSM（确定性有限自动机）或 logit 掩码技术——开源实现如 ``outlines``、``guidance``、``lm-format-enforcer`` 都基于同一原理
- 工具选择准确率的波动本质上是"提示工程的形式化"——把模糊的自然语言描述变成精确的 when-to-use 规则

## 我能复用/改编的点
- 工具 Schema Linter（检查 snake_case、描述长度、use/do not use 模式、enum 缺失）可以直接集成到 CI 中
- 四步循环是 Agent 框架的硬不变量——无论用 LangGraph、AutoGen 还是 CrewAI，底层都是这个
- 供应商翻译器模式（canonical Tool → 三种供应商格式）是多云部署的基础设施

## 关联
- 概念：[[工具 Tool]]、[[函数调用 Function Calling]]、[[工具描述]]、[[MCP]]、[[ReAct]]、[[工具选择]]、[[工具调用错误处理]]、[[工具沙箱]]、[[外部 API]]、[[Skill 封装]]
- 项目：[[ ]]

## 来源
- ai-engineering-from-scratch Phase 13: Tools & Protocols，子主题 01-05
- OpenAI Function Calling Guide, Anthropic Tool Use docs, Gemini Function Calling docs
- Composio Tool Design Field Guide
