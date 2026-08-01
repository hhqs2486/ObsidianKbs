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
  id: task-msab6oqer142k5
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:28.747Z
---

# LangGraph

## 一句话定义
> LangGraph 是 LangChain 生态里的"Agent 图运行时"：把 Agent 循环画成一张有状态、可检查点、可中断、可时间回溯的图（StateGraph），而不是手写 `while True`。

## 它解决什么问题 / 为什么存在
- 手写 ReAct 循环（Thought→Action→Observation）一旦出错就变成黑盒：不能暂停、不能回退、不能分支。
- LangGraph 让"状态机"显式化，换来四件能力：检查点（checkpoint）、中断（interrupt / 人工确认）、流式（streaming）、时间旅行（time-travel 回退重放）。

## 核心原理（大二电子信息工程专业学生能懂）
- **StateGraph 三要素**：
  1. `State`：贯穿全图的带类型状态（TypedDict / Pydantic），每节点返回部分更新。
  2. `Nodes`：函数 `state -> partial_state`（如"模型思考""跑工具""总结"）。
  3. `Edges`：静态边 + 条件边（router 函数按模型输出决定走哪条）。
- **Reducer（归约器）**：决定字段如何合并。`messages` 字段要用 `add_messages`，否则多条消息会被覆盖（最常见的 bug）。
- **四节点 ReAct 图**：`agent`→（有 tool_call）`tools`→（回到）`agent`→（无 tool_call）`END`。
- **Checkpointer**：每次节点转移后把状态存下来（内存/Sqlite/Redis/Postgres），用 `thread_id` 区分会话，可断点续跑。
- **Interrupt / Time-travel**：`interrupt_before` 在危险节点前暂停等人审；`get_state_history` 可回到任意历史节点试另一条分支。

## 关键参数 / 易错点
- 漏写 `add_messages`：消息列表被覆盖，丢一半对话。
- 没接 checkpointer：不能断点续跑、不能中断、不能时间旅行——生产必接。
- 中断要放在"副作用节点之前"，不要在删库之后才拦。

## 类比（帮助理解）
- 把 Agent 从"一遍过的录像"变成"可暂停、可快退重录的剪辑工程"。

## 设计时怎么用（反推思维）
> 做需要人工审批、需要失败后回放、需要长程有状态流程的 Agent 时，我会用 LangGraph 的图+检查点，而不是自己维护一个 while 循环和全局变量。

## 典型应用 / 我在哪见过
- 带 human-in-the-loop 的审批流、长文档研究流水线、supervisor-worker 多 Agent（见 [[多智能体]]）。

## 关联
- 前置知识：[[Agent]], [[Agent范式]], [[函数调用 Function Calling]], [[大语言模型 LLM]]
- 相关：[[CrewAI]], [[AutoGen]], [[编排 Orchestration]], [[上下文工程]], [[Agent 追踪 Trace]]
- 反例/误区：把 LangGraph 当"全自动黑盒编排器"——它的价值恰恰在显式状态与可控中断。

## 来源
- ai-engineering-from-scratch 仓库 `phases/11-llm-engineering/16-langgraph-state-machines/docs/en.md`
- LangGraph 官方文档 / 通用认知
