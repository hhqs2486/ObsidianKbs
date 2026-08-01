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
  id: task-msab6p5h2imov7
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:29.692Z
---

# Agent 协议

## 一句话定义
> Agent 协议是"多个 Agent（或 Agent 与工具）之间怎么说话"的标准约定总称；2026 年主流是四套互补协议——MCP（连工具）、A2A（连同伴 Agent）、ACP（带审计）、ANP（去中心化身份）。

## 它解决什么问题 / 为什么存在
- 把系统拆成多个 Agent（研究员、写码员、审查员）后，第一步往往是用字符串互相传话。能跑，但一旦一方误解了另一方返回的文本、两个 Agent 互相等待死锁、或需要不同团队写的 Agent 协作，这套"裸传字符串"就崩了。
- 没有共享的通信契约，多 Agent 系统就脆弱、不可审计、无法扩展到你亲手写的那几个 Agent 之外。协议就是这套共享契约。

## 核心原理（大二能懂的水平）
- 把四个协议当成"分层"的工具，各解不同层面的问题，**它们是互补不是竞争**：
  - **MCP（Anthropic）**：Agent ↔ 工具/数据源。客户端-服务器，Agent 通过 JSON-RPC 发现并调用工具服务器暴露的能力。注意它只管"连工具"，不管"Agent 之间对话"。
  - **A2A（Google / Linux Foundation）**：Agent ↔ Agent 的对等协作。靠 Agent Card 发现、9 态任务生命周期、SSE 流式、支持 JSON-RPC/REST/gRPC。详见 [[A2A 协议]]。
  - **ACP（IBM / BeeAI）**：企业级 Agent 通信，最大卖点是 **TrajectoryMetadata**——每个回答都附带"我调了哪些工具、输入输出是什么、怎么推理的"完整轨迹，便于审计；用 OpenAPI 3.1 的 REST 定义，正在并入 A2A。
  - **ANP（社区）**：用 W3C DID（`did:wba`）做密码学身份 + HPKE 端到端加密，解决"互不认识的两个组织 Agent 怎么互信"；还有新颖的"元协议协商"——两 Agent 用自然语言现商定数据格式再生成代码。
- 真实企业系统常常四者同用：MCP 给每个 Agent 连工具、A2A 管 Agent 间协作、ACP 包一层审计轨迹、ANP 给不可控的外部 Agent 做身份核验。

## 关键参数 / 易错点
- 选型别混淆：工具访问用 MCP；动态协作用 A2A；受监管行业要审计轨迹用 ACP 思路；跨组织无中心信任用 ANP。
- Schema drift：Agent Card 声明了 `application/json` 输出，但版本升级后 JSON 结构变了，消费方按旧格式解析得到乱码——要对 skill 和输出 schema 做版本化。
- 状态机违规：任务到终态后再 yield 产物会被静默丢弃，要在 yield 前检查终态。
- Discovery 惊群：50 个 Agent 启动时同时拉 `/agents`，把注册中心打爆——用带 TTL 的缓存、错峰发现或推送式注册。
- ACP 轨迹日志很贵：一次跑 200 个工具调用会产生巨大审计条目，按可配置详细级别记。

## 类比（帮助理解）
- 像计算机网络的分层：MCP 是"你的程序调本地库函数"，A2A 是"跨机器的微服务调用"，ACP 是"带全程日志的金融交易留痕"，ANP 是"两个陌生公司用数字证书互签合同"。

## 设计时怎么用（反推思维）
> 做多 Agent 系统时，我会先按"谁连工具 / 谁连谁 / 要不要审计 / 跨不跨组织"四问选协议：工具用 [[MCP]]，同伴协作用 [[A2A 协议]]，监管场景叠加 ACP 式轨迹日志，外部不可控 Agent 用 ANP 式身份核验——而不是一股脑自己发明 JSON 约定。

## 典型应用 / 我在哪见过
- 一个 Protocol Gateway 把四协议合一：先用 ANP 的 DID 验调用方身份 → 用 A2A 发现并委派任务 → 用 ACP 包一层轨迹审计 → 在 A2A 任务里跟踪全生命周期。
- LangGraph、CrewAI、AutoGen、Microsoft Agent Framework 均提供 A2A 适配器；MCP 已成工具连接的事实标准。

## 关联
- 前置知识：[[MCP]] [[A2A 协议]]
- 相关：[[Agent 通信]] [[Agent 拓扑]] [[编排 Orchestration]] [[Agent 安全]]
- 反例/误区：以为四者是"选一个赢家"的竞争关系（其实按层互补）；以为有了 A2A 就不需要 MCP（两者管不同方向）。

## 来源
- AIEFS Vol.5 Agents, Ch.122 "Communication Protocols"（含四协议对比表、Agent Card / DID 实例、Protocol Gateway 代码）
- 参考：MCP 规范（Anthropic）、A2A 规范（Linux Foundation）、ACP（IBM/BeeAI）、ANP（agent-network-protocol）
