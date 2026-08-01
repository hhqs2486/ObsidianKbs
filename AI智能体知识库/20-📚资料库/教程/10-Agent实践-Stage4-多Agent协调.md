---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: Agent-Learning-Hub Stage 4
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6mfsy8w8l1
---

# 10-Agent实践-Stage4-多Agent协调

## 这条教程在解决什么
- 学习如何把多个专用 Agent 组织成可控的协调系统，重点不是"让多个角色聊天"，而是明确角色边界、输入输出 schema、停止条件，用 pipeline/supervisor/state 控制流程，并判断什么时候单 Agent 更简单可靠。

## 关键内容（按 Stage 4 学习步骤提纲）
- **为什么多 Agent 不是"角色聊天"**：自由聊天容易导致互相寒暄争论、无明确 owner、任务漂移、上下文膨胀、不知何时结束。正确方式是 Agent 只负责自己的输出，coordinator 负责路由和停止。
- **角色与契约（Day 1）**：`RoleSpec` 不只是 prompt——是职责 + 输入 + 输出 schema + 停止条件。reviewer 不改稿，reviser 不重新研究。多 Agent 第一步是定义边界。
- **两种最小协调模式**：固定 Pipeline（research→write→review→revise，适合稳定流程）和 Supervisor Router（supervisor(state)→next role，适合依赖当前状态的任务）。
- **停止条件与取舍（Day 3）**：多 Agent 的失败常来自停止条件不清；简单任务不要上多 Agent；生产系统需要 trace、schema validation、max steps、fallback。
- **A2A 还是共享状态（Day 4）**：同一应用内部主流是 coordinator + shared state；A2A 更适合跨系统、跨组织、跨 runtime 的 Agent 通信；MCP 解决 agent 调工具，A2A 解决 agent 调 agent，shared state 解决内部中间产物流转。
- **Shared State 的形态**：内存对象、数据库、文件系统、Artifact Store、Message Bus——本质都是把 agent 的输出变成其他 agent 可读取的输入。
- **工程建议**：初学多 Agent 时优先实现 `RoleSpec + SharedState + Coordinator + Trace + MaxSteps`；上 A2A 前先回答状态存哪里、中间产物如何版本化、失败后从哪步恢复等 6 个问题。

## 我卡住/没懂的地方
- Supervisor Router 的 next 取值必须严格限制，否则会出现路由漂移。
- A2A 协议中 artifact 传输的生命周期管理细节尚未深入。

## 它背后的原理（别只记操作）
- 多 Agent 的本质是 coordination problem：谁决定下一步、中间产物存在哪、失败后怎么恢复——这和分布式系统里的协调问题同源。
- Agent 之间不自由聊天的原因是：控制权必须明确、状态必须可回放、边界必须可测试。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何需要"分步骤写作/审查/修改"的内容生产场景（技术文档、报告、论文审核）都可用这套 pipeline 模式。

## 关联
- 概念：[[多智能体]]、[[编排 Orchestration]]、[[角色分工]]、[[监督者 Supervisor]]、[[Agent 拓扑]]、[[任务分解]]、[[A2A 协议]]、[[Agent 通信]]、[[MCP]]
- 概念：[[Agent 追踪 Trace]]、[[Agent 部署与交付]]
- 教程：[[10-Agent实践-Stage5-Skill与能力封装]]

## 来源
- Agent-Learning-Hub Stage 4 README + roles.py/agents.py/coordinator.py + docs/learn/a2a-vs-shared-state.md
