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
  id: task-msab6p7zt72ktr
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:29.905Z
---

# A2A 协议

## 一句话定义
> A2A（Agent-to-Agent Protocol）是谷歌提出、现由 Linux Foundation 托管的开放协议，用来让不同系统上的 Agent 像"调用另一个 Agent"一样互相发现能力、委派任务、取回结果。

## 它解决什么问题 / 为什么存在
- 你有一个 Agent 想调用另一个系统上的 Agent：最原始的做法是各自暴露一个 HTTP 接口、定义一套只有你们俩懂的 JSON schema。一旦 Agent 一多，每一对都是一次定制集成，无法扩展。
- A2A 把"Agent 如何被发现、任务长什么样、结果怎么回传、怎么鉴权"标准化成统一的线协议（wire protocol），目标类似"HTTP+REST，但 Agent 是一等公民"。

## 核心原理（大二能懂的水平）
- 把 Agent 通信想成系统设计里的"跨服务调用"，但两端都是会自己推理的程序，不是被动的 CRUD 服务。
- 四个核心元素：
  1. **Agent Card（智能体名片）**：放在 `/.well-known/agent.json`（或 `agent-card.json`）的一份 JSON，声明这个 Agent 叫什么、有哪些 skill、支持什么输入/输出模态（text / json / image…）、用什么鉴权。别的 Agent 先 GET 这张卡来"认识"它。
  2. **Task（任务）**：工作单元，是个有状态、异步的对象，生命周期：`submitted → working → completed / failed / canceled / rejected`（还有 `input-required`、`auth-required` 等中间态）。到达终态后不可变，后续只能在同一 `contextId` 下开新任务。
  3. **Artifact（产物）**：任务产出的结果，是"带类型"的——文本、结构化 JSON、图片、音频、视频都是一等公民。
  4. **Opaque lifecycle（不透明生命周期）**：客户端只看到状态变化和产物，远端 Agent 内部怎么求解（用哪个框架、调哪些工具）对客户端完全隐藏，自由实现。
- 传输层：JSON-RPC 2.0 为主，也支持 REST / gRPC；长任务用 SSE（Server-Sent Events）流式推送状态，或客户端轮询 `/tasks/{id}`。
- **与 MCP 的分工**：MCP 是"竖着"的——Agent ↔ 工具（连工具和数据源）；A2A 是"横着"的——Agent ↔ Agent（对等协作）。生产系统两者并用：一个 A2A 对等体在自己这边再调 MCP 工具。一句话记：**MCP 管工具，A2A 管同伴**。

## 关键参数 / 易错点
- Agent Card 里要带 `version`，并对 skill 和输出 schema 做版本化——否则一端改了 JSON 结构，另一端按旧格式解析直接拿到垃圾（schema drift）。
- 终态后不可再 yield artifact，代码要在 yield 前检查终态，否则更新会被静默丢弃。
- A2A 是异步生命周期，不适合亚毫秒级的紧耦合微调用（那种直接用 RPC）。
- 鉴权三件套：Bearer token（OAuth2 或 opaque）、mTLS（双向 TLS，互证身份）、签名请求（HMAC）。鉴权方式写在 Agent Card 里，客户端发现后照做。
- 同类协议对比：ACP（IBM/BeeAI，强调审计轨迹 TrajectoryMetadata，正并入 A2A）、ANP（社区，用 W3C DID 做去中心化身份与端到端加密）、NLIP（Ecma 自然语言交互协议）。截至 2026-04，A2A 采用最广（150+ 组织支持）。

## 类比（帮助理解）
- 把 MCP 想成"你的电脑插了个 U 盘（工具）"，A2A 想成"你给另一个公司里的同事（Agent）发工单，他干完把成果文件回传给你"——工单有状态（已受理/处理中/已完成），成果有格式约定。
- Agent Card 就像公司的"服务目录网页"：先查它能干啥、找谁、要不要门禁卡。

## 设计时怎么用（反推思维）
> 做"跨系统/跨团队的多 Agent 协作"时，我会用 A2A 协议来让我的 Agent 能发现并委派任务给外部 Agent，而不是为每个合作方写一套私有接口；同时用 MCP 让每个 Agent 连自己的工具。需要跨信任边界（公司 A 调公司 B）时，优先上 A2A + mTLS/签名鉴权。

## 典型应用 / 我在哪见过
- 企业里研究 Agent 把"网页调研"委派给另一个团队的调研 Agent，取回结构化 JSON。
- Google Cloud 把 A2A 支持进 Vertex AI Agent Builder（2025–2026）；Microsoft Agent Framework、LangGraph、CrewAI、AutoGen 都发了 A2A 适配器。
- 长时任务（跑几个小时）：靠不透明生命周期 + 轮询，天然适配。

## 关联
- 前置知识：[[Agent 协议]] [[MCP]]
- 相关：[[Agent 通信]] [[工具沙箱]] [[Agent 安全]]
- 反例/误区：以为 A2A 能替代 MCP（错，它管的是 Agent↔Agent，不是 Agent↔工具）；以为同进程内两个紧耦合 Agent 也要走 A2A（过度设计，直接函数调用更省）。

## 来源
- AIEFS Vol.5 Agents, Ch.131 "A2A — The Agent-to-Agent Protocol"；Ch.122 通信协议对比
- 官方规范 a2a-protocol.org/latest/specification/；Liu et al. "A Survey of Agent Interoperability Protocols" (arXiv:2505.02279)
