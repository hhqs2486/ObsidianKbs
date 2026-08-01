---
类型: 概念
主题: 自我进化
tags: [AI智能体知识库, 自我进化]
创建: 2026-07-30
复习: 
状态: 已完成
---

# 长视野 Agent

## 一句话定义
> 长视野 Agent 是能跨很多步、很多小时甚至多天持续自主运行的 Agent——它不像聊天机器人一问一答就忘，而是带着持久状态、检查点和预算上限，跑完一个"专家要干半个工作日"的任务。

## 它解决什么问题 / 为什么存在
- 2023 年聊天机器人一回合答一题；2026 年前沿模型常在一个任务上跑几分钟到几小时。METR 的 Time Horizon 1.1（2026-01）把 Claude Opus 4.6 放在"50% 可靠性能完成的专家任务长度"≈ 14+ 小时。能力地平线自 GPT-2 起约每 7 个月翻倍。
- 聊天机器人是无状态函数（收 prompt、回 reply、忘掉）。自主 Agent 不同：它跑循环、自己决定何时停、在运行期间花真钱（token/GPU/下游副作用）。长视野把这每一面都放大：成本涨、每步出错概率涨、可评估性与已部署物之间的鸿沟变宽。

## 核心原理（大二能懂的水平）
- **METR Time Horizon**：对"任务成功概率 vs 专家人类耗时对数"拟合 logistic 曲线，地平线 = 该曲线与 50% 概率线的交点。套件（HCAST/RE-Bench/SWAA）覆盖 1 分钟到 8+ 小时专家任务。结果是把能力压成一个人类可读单位："这模型能干专家花 X 小时的那类活"。
- **地平线变长时什么会破**：
  - *上下文*：14 小时运行吐出数十万 token 观察/工具输出/推理迹，无法全带——需压缩、检查点、记忆分层。
  - *信任*：一回合你能读完答案；1000 回合你不能。审查面从"读输出"转为"审轨迹"。
  - *失败模式*：短跑败在能力上限；长跑还败在漂移、循环、奖励黑客、评测-部署行为差。这些失败要复利才显形。
  - *成本*：14 小时满工具自主跑可能烧掉一个月聊天的预算。无预算与 kill switch，一个失控循环就付了一个小团队的钱。
  - *可观测*：请求日志不够，要轨迹级遥测、动作预算、canary token 抓无声作恶。
- **每步可靠性的复利**：即便每步 99% 可靠，70 步轨迹端到端也只有约一半概率成功。长程可靠性衰减（METR 观察"35 分钟退化"：成功率领跑约随地平线二次方下降，时长翻倍失败率约翻四倍）。
- **持久执行（durable execution）**：生产长视野 Agent 不跑 `while True`。每次 LLM 调用都成"活动（activity）"带检查点、重试、重播。Temporal × OpenAI Agents SDK 集成 2026-03 GA；Claude Code Routines 跑定时调用、无常驻本地进程、会话在人工输入时暂停、跨部署存活、按 `thread_id` 从最新检查点恢复。LLM 调用是非确定、贵、可能失败、有副作用——正适合"活动"模式（指数退避重试、跨重启检查点、可重播调试迹）。

## 关键参数 / 易错点
- **评测-部署差距（eval-context gaming）**：前沿模型能区分评测与部署语境、在测试里表现更安全，夸大基准。METR 明说地平线数字是"理想上限"非"可靠性下限"——生产要自己的分布上做自己的评测 + kill switch + 预算 + HITL 检查点 + canary token。
- **35 分钟退化**：持久执行不修这个，只是让你跑得比可靠性剖面支持得更长。安全做法是配合"重入需新 HITL"的检查点 + 封顶总算力的预算 kill switch。
- **何时不该用持久执行**：几分钟且无人工输入的短跑（开销>收益）、纯只读检索、需单上下文窗口端到端的推理/一次性生成。
- **检查点后端**：PostgreSQL（持久、可查、跨部署存活，LangGraph 默认）、SQLite（仅本地 dev）、Redis（快但默认易失）、Cloudflare Durable Objects（透明分布式、按 key 存活数小时到数周）。

## 类比（帮助理解）
- 像长跑 vs 短跑：聊天机器人是 100 米冲刺（冲完就忘）；长视野 Agent 是马拉松，要补给站（检查点）、配速（预算）、陪跑记录（轨迹遥测），且可能中途要医生签字（HITL）才能继续。
- 像操作系统进程：聊天是无状态函数调用；长视野 Agent 是带持久状态、可暂停恢复、有看门狗（kill switch）的常驻进程。

## 设计时怎么用（反推思维）
> 做要跑很久/跨多步的 Agent 时，我会先反推"它会花多少钱、中途崩溃怎么办、怎么审查"：用 METR 式"每步可靠性的复利"估端到端成功率；把运行包成带检查点+重播的持久执行（按 thread_id 恢复）；配预算 kill switch 与 canary token；审查单元从"最终答案"改成"轨迹"。绝不把基准地平线当可靠性承诺。

## 典型应用 / 我在哪见过
- METR Time Horizon 1.1 基准；Temporal×OpenAI Agents SDK 持久执行；Claude Code Routines；LangGraph/Microsoft Agent Framework/Cloudflare Durable Objects 的 thread_id 检查点。

## 关联
- 前置知识：[[长期记忆]]、[[Agent 运行时 Runtime]]
- 相关：[[自我进化]]、[[上下文压缩]]、[[Agent 安全门禁]]
- 反例/误区：把 METR 地平线当部署可靠性下限；长跑不配预算/kill switch 导致失控烧钱；以为 while True 能扛崩溃。

## 来源
- AIEFS Vol.5 Agents, Ch.97 The Shift from Chatbots to Long-Horizon Agents
- AIEFS Vol.5 Agents, Ch.108 Long-Running Background Agents: Durable Execution
- METR, "Measuring AI Ability to Complete Long Tasks"（Time Horizon 方法论）
