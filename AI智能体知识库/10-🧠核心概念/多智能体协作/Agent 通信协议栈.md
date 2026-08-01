---
类型: 概念
主题: 多智能体协作
tags: [AI智能体知识库, 多智能体协作]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Agent 通信协议栈

## 一句话定义
> 多 Agent 系统之间要"说同一种话"需要一套分层约定：消息长什么样（格式）、怎么传（传输）、彼此怎么理解对方在说什么（语义协商）——这就是 Agent 通信协议栈。

## 它解决什么问题 / 为什么存在
- 你把系统拆成"研究员 / 程序员 / 审查员"等多个 Agent，各自很能干活，但它们之间得真的能对话。
- 最朴素的办法是"互相传字符串"：研究员吐一段文本，程序员自己想办法解析。能跑，直到程序员误读摘要、两个 Agent 死锁互等、或者你需要让不同团队写的 Agent 协作——"传字符串"立刻崩溃。
- 没有共享的通信契约，多 Agent 系统就脆弱、不可审计、超过几个人写的规模就根本扩不动。通信协议栈就是用来把"约定"标准化。

## 核心原理（大二能懂的水平）
- 把通信想成**分层**（类似 OSI/TCPIP 的思路，但为 Agent 重做）：
  - **消息格式层（Format）**：一条消息由什么字段组成？现代协议用 `MessagePart` 表达多模态内容——`{kind:"text"}` / `{kind:"data", mediaType}` / `{kind:"file"}`，外加 `role`、`replyTo`、`trajectory`（推理轨迹）。对应 FIPA 时代的"信封七字段 + content 负载"。
  - **传输层（Transport）**：消息走什么通道？HTTP + JSON-RPC、REST、gRPC、SSE 流式、WebRTC（语音）都属于这一层。
  - **语义协商层（Semantics / Negotiation）**：双方怎么确认"你说的话我懂"？现代用自描述的 [[Agent 通信]] 文档（如 A2A 的 Agent Card 列出技能、MIME 类型、安全方案）；ANP 更激进——两个陌生 Agent 用自然语言来回协商数据格式（meta-protocol negotiation），最多 10 轮达成一致后动态生成解析代码。
- 现代四类协议各管一层问题（不是互相替代，是互补）：
  - **MCP**：Agent ↔ 工具。客户端-服务端，发现并调用工具。（`tools/call` 本质是 FIPA 的 `request` 言语行为）
  - **A2A**：Agent ↔ Agent 对等协作。每个 Agent 在 `/.well-known/agent-card.json` 发布能力卡，靠任务状态机（submitted→working→...→completed/failed/canceled/rejected，终态后不可变）协作，SSE 流式。
  - **ACP**：企业级可审计。每个响应带 `TrajectoryMetadata`（调了哪些工具、输入输出是什么），满足受监管行业"答案可溯源"。
  - **ANP**：跨组织去中心化身份与信任。用 W3C DID（`did:wba`）+ 端到端加密，互信逐次验证，不需要中央权威。

## 关键参数 / 易错点
- **Schema 漂移**：Agent A 的 Agent Card 宣称输出 `application/json`，但 JSON schema 跨版本变了，Agent B 按旧格式解析得到乱码。→ 给 skill 和输出 schema 加版本号。
- **状态机违规**：任务到达终态后还 yield 新 artifact，会被静默丢弃或报错。→ 在 yield 前检查终态。
- **信任解析失败**：想校验对方 DID，但对方域名挂了。ANP 建议 fail-closed（最小信任原则），不要 fail-open 接受未验证 Agent。
- **Trajectory 膨胀**：ACP 轨迹日志很贵，一次跑 200 次工具调用会产生巨大审计条目。→ 按可配置详细度记录，合规场景记工具 IO，非合规场景略过推理步骤。
- **发现惊群（thundering herd）**：50 个 Agent 启动时同时 GET `/agents`。→ Agent Card 加 TTL 缓存、错峰发现、或改用推送注册。

## 类比（帮助理解）
- 就像微服务架构：MCP 是"服务怎么调用单个函数"，A2A 是"服务怎么把整块任务委派给另一个服务并跟踪进度"，ACP 是"每次调用都留审计日志"，ANP 是"跨公司的服务怎么用证书互信"。
- 就像人类公司：Agent Card 是"招聘启事/名片"，任务状态机是"工单系统"，TrajectoryMetadata 是"工作留痕被审计"。

## 设计时怎么用（反推思维）
> 做多 Agent 协作系统时，我会先反推"它们要交换什么、是否跨组织、要不要可审计"，再选协议栈：只是调工具→[[MCP]]；动态发现并委派任务→[[A2A 协议]]；受监管要留痕→ACP 式轨迹；跨公司不可信→ANP 式 DID。并且一开始就给消息格式定 schema 版本、给任务状态机设终态保护，而不是等出 bug 再补。

## 典型应用 / 我在哪见过
- Google A2A（已捐给 Linux Foundation，v1.0，有 Python/TS SDK）。
- IBM/BeeAI 的 ACP（正并入 A2A，轨迹元数据思想被吸收）。
- 社区 ANP（AgentConnect SDK）。
- 真实企业系统通常四者并用：MCP 连工具、A2A 管协作、ACP 包审计、ANP 验身份。

## 关联
- 前置知识：[[Agent 通信]]、[[多智能体]]
- 相关：[[A2A 协议]]、[[FIPA ACL 协议]]、[[Agent 通信协议栈]]
- 反例/误区：以为"传字符串就行"——规模一大就出现误读、死锁、不可审计；以为四协议互斥——其实互补分层。

## 来源
- AIEFS Vol.5 Agents, Ch.122 Communication Protocols（含 A2A/ACP/ANP 真实线格式与代码）
- Liu et al., "A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, ANP" (arXiv:2505.02279)
