---
类型: 概念
主题: 代码智能体
tags: [AI智能体知识库, 代码智能体]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Agent 运行时 Runtime

## 一句话定义
> Agent 运行时（Runtime）是 Agent 执行循环真正跑起来的运行环境：负责调度循环、维护状态、执行工具调用、并把危险操作隔离在沙箱里——相当于 Agent 的"操作系统"。

## 它解决什么问题 / 为什么存在
- 一个 Agent 不是"调一次模型就完"。它要反复：想→调工具→看结果→再想。这一连串步骤在哪跑、状态存哪、工具怎么安全执行、中途崩了怎么办，都需要运行时来管。
- 尤其对长时 Agent：朴素 `while True` 循环一旦宿主重启，所有工具副作用重做、用户重复审批、LLM 调用重计费。运行时要解决"可恢复、可重放、可隔离"。

## 核心原理（大二能懂的水平）
- 类比工作流引擎（Temporal/Cadence），但多了"LLM 调用"这个新活动类型：
  - **Workflow（工作流）**：确定性的编排代码，定义活动顺序/分支/等待；必须确定性，才能从事件日志重放而不跑偏。
  - **Activity（活动）**：非确定、可能失败的工作单元——LLM 调用、工具调用、写文件、HTTP 请求；每个活动把输入和（完成后的）输出记进日志。
  - **Event log（事件日志）**：持久化后端，记录每次活动起/完/败/重试和工作流决策。
  - **Replay（重放）**：恢复时工作流从开头重跑，已完成的活动直接回放日志结果、不重执行，只跑没完成的——和 Git 从 commit 重建工作树同理。
- **为什么 LLM 调用适合这模式**：非确定（temp>0 甚至 0 也会跨版本漂移）、贵（钱+延迟）、可能失败（限流/超时）、有副作用（若调工具）。包成 activity 就获得指数退避重试、跨重启 checkpoint、可重放调试轨迹。
- **按 thread_id 的 checkpoint**：LangGraph / Microsoft Agent Framework / Cloudflare Durable Objects / Claude Code Routines 都收敛到同一形状——用 thread_id（或等价）标识会话，每次状态转移持久化到后端（PostgreSQL 默认、SQLite 仅本地、Redis 快但需配 AOF/快照、Durable Objects 透明分布式），resume 读最新 checkpoint。
- **人在环作为一等状态**："等人工输入"是可暂停状态，外部队列Hold请求，审批后从原处继续。

## 关键参数 / 易错点
- 后端选择影响持久性：PostgreSQL 耐部署、SQLite 跨机丢、Redis 需配持久化。
- **35 分钟退化**：METR 观测到 Agent 连续运行超 ~35 分钟可靠性明显衰减（时长翻倍失败率约翻四倍）。耐用执行不修这个问题，只是让你能跑得比可靠性曲线支持的更久——要配合"重入需新 HITL + 预算熔断"才安全。
- 工作流里写非确定代码（如用墙钟时间戳做分支）会在重放时分歧——真实引擎用 `Workflow.now()` 等副作用注册机制规避。
- 短于几分钟、纯只读、或必须单上下文窗口内端到端的任务，上耐用执行是过度设计。

## 类比（帮助理解）
- 像操作系统的进程管理 + 检查点：你关掉电脑（宿主重启），再开机能从保存的进度继续，已完成的事不重做；thread_id 像进程号，checkpoint 像休眠镜像。
- LLM 调用像"会花钱、会超时、还可能给出不同答案的外部服务调用"，所以每个都要记账（日志）以便重放。

## 设计时怎么用（反推思维）
> 做需要"跑很久、可能重启、要可恢复"的 Agent（如 overnight 代码重构、长程研究）时，我会用耐用执行运行时：把 LLM/工具调用包成 activity 并记事件日志，用 thread_id 做 checkpoint/resume，把"等人工"做成可暂停状态；同时配 [[工具沙箱]] 隔离副作用，并用预算熔断兜底。衔接上 [[Claude Code 工程实践]] 的自主跑法。

## 典型应用 / 我在哪见过
- Temporal 的 OpenAI Agents SDK 集成 2026-03 GA；Claude Code Routines 跑定时 Claude Code 调用而无常驻进程。
- LangGraph、Microsoft Agent Framework、Cloudflare Durable Objects 同形状 checkpoint。

## 关联
- 前置知识：[[Agent]] [[工具沙箱]] [[Claude Code 工程实践]]
- 相关：[[Agent 权限系统]] [[编排 Orchestration]] [[Agent 追踪 Trace]] [[多智能体]]
- 反例/误区：用裸 `while True` 跑长时 Agent（重启即全丢）；把非确定逻辑写进工作流（重放分歧）。

## 来源
- AIEFS Vol.5 Agents, Ch.108 "Long-Running Background Agents: Durable Execution"（activity/workflow/replay、thread_id checkpoint、35 分钟退化）
- 参考：Temporal、Cadence、Cloudflare Durable Objects
