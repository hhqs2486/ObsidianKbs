# 多 Agent 术语速查

这是一张“随用随查”的表，配合 [A2A 还是共享状态？](./a2a-vs-shared-state.md) 一起看。遇到名词分不清时，先回这里对齐定义。

## 核心概念

| 术语 | 一句话定义 | 解决什么 | Stage 4 对应 |
| --- | --- | --- | --- |
| Coordinator / Supervisor | 只负责路由与停止的调度者 | 决定下一步谁执行、何时结束 | `coordinator.py` |
| Shared State | 多个 agent 共读共写的状态区 | 同系统内交换中间产物 | `MultiAgentState` |
| Role / RoleSpec | 某个 agent 的职责边界 | 限定输入输出，避免越界 | `roles.py` |
| Agent | 把角色变成可调用函数 | 执行具体任务 | `agents.py` |
| Trace | 逐步记录的执行日志 | 可回放、可调试、可审计 | `state.trace` |
| MaxSteps | 最大步数上限 | 防止死循环 / 无限争论 | 调度循环上限 |
| MCP | agent 调用 tool / 数据源的协议 | 标准化外部工具访问 | Stage 5 |
| A2A | agent 与 agent 跨系统互操作协议 | 发现、发任务、传 artifact | Stage 5 |
| Artifact Store | 产物存储（文件/对象存储） | 持久化大产物、可版本化 | 进阶主题 |
| Message Bus | 消息队列 / 主题 | 异步多 agent 事件驱动 | 进阶主题 |

## 三组最容易混淆的概念

```text
Shared State：agent ↔ 应用状态        → 同一系统内交换中间产物
MCP：        agent ↔ tool / 数据源   → 标准化调用工具和外部数据
A2A：        agent ↔ agent          → 跨系统发现、任务和结果交换
```

一句话选型：

- “我要查数据库 / 文件 / 浏览器” → MCP / tool
- “我要让 writer 读 researcher 的结果” → shared state
- “我要调用另一个平台的 agent” → A2A

## 还没把握准的？

去读完整推导：[多 Agent 交互：A2A 还是共享状态？](./a2a-vs-shared-state.md)。
