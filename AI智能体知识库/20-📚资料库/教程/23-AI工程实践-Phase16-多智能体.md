---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: ai-engineering-from-scratch Phase 16
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6m79c77ais
---

# AI工程实践-Phase16-多智能体

## 摘要
一个 Agent 终将撞墙——不是模型不够聪明，而是单个上下文窗口装不下 50 个文件的内容，一套系统提示无法同时做好研究、编码、审查和测试。Phase 16 覆盖多 Agent 系统的核心理由、FIPA-ACL 的历史遗产、2026 四大协议（MCP/A2A/ACP/ANP）、编排模式和通信协议栈。

## 这条教程在解决什么
- 单个 Agent 的天花板在哪里（上下文饱和、角色混淆、顺序瓶颈），什么时候该拆分？
- 2026 年两个 Agent 通信时有哪些协议可选，各自解决什么问题？
- FIPA-ACL（2000 年）为什么在 2026 年被重新发现？现代协议是创新还是重新发明？
- 四种多 Agent 编排模式（Pipeline、Fan-out/Fan-in、Orchestrator-Worker、Peer Swarm）怎么选？

## 关键内容提纲
1. **单 Agent 天花板的三堵墙** — 上下文饱和（150k token 后关键信息丢失）、角色混淆（一个系统提示覆盖所有角色导致什么都做不好）、顺序瓶颈（不能并行读取文件）
2. **多 Agent 解决方案** — 每个 Agent 一个工作、一个上下文窗口、一个精调的系统提示；通过消息传递协作
3. **FIPA-ACL 的历史遗产** — 2000 年 IEEE 标准定义了 20 种 performatives（inform/request/query-if/propose/cfp/subscribe...）、7 字段信封和交互协议（合同网、订阅/通知、请求条件）；因本体论开销过重被 Web 栈取代
4. **2026 年四大协议** — MCP（Agent-to-Tool）、A2A（Agent-to-Agent，Google/Linux Foundation，任务生命周期 9 状态）、ACP（Agent-to-Agent + 审计追踪，IBM/BeeAI，TrajectoryMetadata）、ANP（去中心化身份，W3C DID + HPKE 端到端加密 + 元协议协商）
5. **Agent 通信协议栈** — ANP（身份层）→ A2A/ACP（协作/审计层）→ MCP（工具层）；四协议协同工作而非竞争
6. **编排模式选择** — Pipeline（阶段式流转）、Fan-out/Fan-in（并行拆分汇合）、Orchestrator-Worker（智能调度）、Peer Swarm（对等涌现）；从简单到复杂的光谱
7. **FIPA 的现代启示** — 每个 FIPA performative 对应一个 2026 协议原语（MCP tools/call = FIPA request；A2A 任务生命周期 = 合同网 + request-when）；丢失了形式语义但获得了 JSON 兼容性和 LLM 可解释性
8. **协议故障模式** — Schema drift（版本不兼容）、状态机违规（terminal 状态后继续产出）、信任解析失败（DID 域名不可达时 fail-closed vs fail-open）、轨迹膨胀（200 工具调用产生巨型审计日志）

## 我卡住/没懂的地方
- 多 Agent 的"信息压缩损失"——每个 Agent 边界都是一次有损摘要，这对准确性有什么量化影响？
- 四大协议真的不竞争吗？A2A 融合 ACP 后会不会把 ANP 也吞掉？
- ANP 的元协议协商（meta-protocol negotiation）在实际跨组织 Agent 通信中真的可行吗？谁来决定协商失败后怎么办？

## 它背后的原理
- FIPA 的"言语行为理论"（Austin/Searle）是理解 Agent 通信的根本——消息不仅是传递信息，更是执行动作；`inform`、`request`、`propose` 的本质是动作意图
- 多 Agent 的核心权衡：每个 Agent 内部上下文清洁 vs 跨 Agent 消息的有损压缩
- 去中心化身份（DID）的核心假设是"我可以验证你的身份而不需要一个中心机构"——ANP 就是把这个假设搬到了 Agent 通信上

## 我能复用/改编的点
- FIPA 映射器（FIPA mapper）——在任何新协议被采用前先问：它的 performative 原语是什么？这是创新还是 `inform` 换了个 JSON 外壳？
- 协议选择决策树：需要工具 → MCP；需要 Agent 协作 → A2A；需要审计 → +ACP；跨组织信任 → +ANP
- 四大协议统一网关（ANP 验证身份 → A2A 发现 Agent → ACP 审计运行 → A2A 创建任务）是可复用的企业架构模式

## 关联
- 概念：[[多智能体]]、[[Agent 通信]]、[[编排 Orchestration]]、[[角色分工]]、[[黑板模式]]、[[辩论模式]]、[[任务分解]]、[[监督者 Supervisor]]、[[Agent 拓扑]]、[[A2A 协议]]
- 项目：[[ ]]

## 来源
- ai-engineering-from-scratch Phase 16: Multi-Agent & Swarms，子主题 01-03
- FIPA ACL Message Structure (fipa00037); Liu et al., Survey of Agent Interoperability Protocols (arXiv:2505.02279)
- Google A2A spec v1.0; IBM/BeeAI ACP spec v0.2.0; ANP community spec; MCP spec 2025-11-25
