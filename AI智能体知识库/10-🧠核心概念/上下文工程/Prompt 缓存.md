---
类型: 概念
主题: 上下文工程
tags: [AI智能体知识库, 上下文工程]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Prompt 缓存

## 一句话定义
> Prompt Cache（提示缓存）是 API 服务层的优化：跨多次请求之间，缓存相同前缀的计算结果，避免重复计算——直接复用之前算好的 KV Cache。

## 它解决什么问题 / 为什么存在
- 每次 LLM 调用都把完整上下文（含不变的 System Prompt、工具定义）重算一遍很浪费。Prompt Cache 让"不变的前缀"只算一次，大幅降延迟、降成本。
- 它是上下文工程的关键经济杠杆，甚至反过头来约束架构设计。

## 核心原理（大二电子信息工程专业学生能懂）
- 与 **KV Cache** 的区别：KV Cache 是模型内部、单次推理内的优化（缓存已算 token 的 K/V）；Prompt Cache 是 API 服务层、跨多次请求的优化（复用相同前缀的 KV Cache）。两者都利用"前缀不变性"。
- 工作方式：服务商对请求前缀做匹配，若多次请求前缀相同（System Prompt + 工具定义不变），直接复用，不再重算。读取成本远低于首次计算（Anthropic/DeepSeek 约 1/10，OpenAI 约五折）。
- 厂商差异：Anthropic 需显式设 `cache_control` 断点才缓存（写入约 1.25 倍加价、最小 1024 token、TTL 约 5 分钟）；OpenAI 自动前缀缓存，无需声明。
- **缓存即架构约束**：缓存键一致性会渗透到提示词设计（动态元素严格放缓存边界之后）、多 Agent 协调（子 Agent 与父 Agent 字节级对齐以命中缓存）、会话恢复。

## 关键参数 / 易错点
- 两个层级缓存都要求**前缀稳定**：改 System Prompt 一个字节（如加时间戳），前缀不同 → 缓存全失效、首 token 延迟飙升。
- 动态信息应追加到上下文末尾（不破坏前缀），而非插入开头。
- Prompt Cache 经济影响更大，因为它直接影响 API 计费。

## 类比（帮助理解）
- Prompt Cache 像"同一份讲义只印一次"：全班（多次请求）共用一份，后面的人直接发复印件，不用重印。

## 设计时怎么用（反推思维）
> 设计 Agent 时，我会把稳定内容（身份、工具定义、通用规则）放缓存边界之前，把时间/用户态等动态内容追加末尾，并在 Anthropic 设 cache_control 以命中 Prompt Cache。

## 典型应用 / 我在哪见过
- Anthropic cache_control、OpenAI 自动前缀缓存、DeepSeek 前缀缓存；Claude Code 的缓存边界设计。

## 关联
- 前置知识：[[Transformer]]、[[上下文 Context]]、[[System Prompt]]
- 相关：[[上下文工程]]、KV Cache、[[上下文压缩]]、[[对话历史管理]]、Agent Skills
- 反例/误区：在 System Prompt 里嵌每次都变的时间戳——前缀失效，缓存白费。

## 来源
- AI Agents in Depth 第2章（2.3.3 KV Cache 与 Prompt Cache：两个层级的缓存；2.3.4 缓存作为架构约束）
