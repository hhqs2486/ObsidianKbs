---
类型: 概念
主题: 自我进化
tags:
  - AI智能体知识库
  - 自我进化
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6njilmftns
---

# ReWOO Plan-Execute

## 一句话定义
> ReWOO 是把"思考"和"行动"解耦的 Agent 模式：先一次性把整盘计划（DAG）定下来，再并行去取证据，最后统一作答——而不是像 ReAct 那样边想边做、每步都重背一遍历史。

## 它解决什么问题 / 为什么存在
- [[ReAct]] 把 thought/action/observation 交错在一个流里，简单灵活，但每次工具调用都要带上完整历史（含之前每个 thought），token 随深度**平方级**增长；而且工具中途失败，模型得从错误观察里重新推导整个计划。
- ReWOO（Xu et al., 2023）的赌注：先整体规划，再并行取证据，最后组合答案。

## 核心原理（大二能懂的水平）
- **三个角色**：
  - `Planner`：用户问题 → 计划 DAG（每个节点命名工具、参数、依赖的前驱节点，如 `#E1`、`#E2`）。
  - `Workers`：按拓扑序执行节点（独立节点可并行），每个节点只发自己的工具调用。
  - `Solver`：用户问题 + 计划 DAG + 全部证据 → 最终答案。
- **为什么省 5 倍 token**：ReAct 的 prompt 随步数线性膨胀（第 10 步含 thought1+action1+obs1+…+thought10）；ReWOO 只付一次大的 planner prompt + N 个小 worker prompt（不含链条）+ 一次 solver prompt。HotpotQA 上论文测到约 5 倍更少 token，同时绝对准确率 +4%。
- **为什么更稳**：ReAct 里 worker 3 失败，要在流中间硬推出错；ReWOO 里 worker 3 返回错误串，Solver 在原始计划上下文中看到它，能优雅降级——失败定位是"每节点"而非"每步"。
- **Planner 蒸馏**：因为 Planner 看不到观察，可用 175B 教师的 planner 输出微调 7B 小模型；小模型管规划、不需要大模型推理。这是 2026 生产常态（小 planner + 大 executor，或反之）。
- **泛化族**：
  - **Plan-and-Execute**（LangChain 2023）：ReWOO + 可选 replanner（执行后看结果再修订），比 ReWOO 更近 ReAct 但保留省 token。
  - **Plan-and-Act**（Erdogan et al., ICML 2025）：扩展到长程 web/移动 Agent，关键贡献是合成计划数据（显式标出计划轨迹来微调 planner），在 WebArena 类 >30–50 步任务上保持连贯。

## 关键参数 / 易错点
- **代价是灵活性**：计划是静态的，环境突变时不如 ReAct 反应快。
- **何时选哪种**（Anthropic 五模式框架）：
  - ReAct：短任务、环境未知、需反应式异常处理。
  - ReWOO：工具已知的结构化任务、token 敏感、证据可并行。
  - Plan-and-Execute：类 ReWOO 但要部分执行后重规划。
  - Plan-and-Act：长程（>30 步）web/移动/电脑操控。
  - Tree-of-Thoughts：值得为搜索付费时。
- **Anthropic 经验法则**：最简单能用的就用最简单的——单工具+总结别上 ReWOO；40 步研究任务别只靠 ReAct。

## 类比（帮助理解）
- 像"先列购物清单再去超市"：ReAct 是走到货架前才想"下一步买啥、顺便回忆之前买了啥"；ReWOO 是进门前列好清单（DAG），各区域并行拿，最后结账统一算。
- 像编译器：Planner 出 AST（DAG），Workers 是并行求值，Solver 是代码生成——一次规划多次执行。

## 设计时怎么用（反推思维）
> 做需多步检索/工具调用的 Agent 时，我会先反推"任务是否结构化、是否 token 敏感、能否并行"：已知工具+可并行证据+省 token → 用 ReWOO（小 planner + 大 solver）；环境会变需中途修订 → Plan-and-Execute；>30 步长程操控 → Plan-and-Act。并优先把 planner 蒸馏成小模型降本。

## 典型应用 / 我在哪见过
- LangGraph 的 Plan-and-Execute recipe、CrewAI 的 Flows（直接编码"先定义任务、DAG 执行"）。
- Plan-and-Act 的合成计划数据多用于 WebArena 类长程任务。

## 关联
- 前置知识：[[ReAct]]、[[任务分解]]
- 相关：[[推理 Reasoning]]、[[Tree-of-Thoughts]]
- 反例/误区：长程任务只用 ReAct（轨迹失连贯）；或简单任务硬上 ReWOO（过度工程）。

## 来源
- AIEFS Vol.5 Agents, Ch.55 ReWOO and Plan-and-Execute: Decoupled Planning
- Xu et al., ReWOO (arXiv:2305.18323); Erdogan et al., Plan-and-Act (arXiv:2503.09572)
- Anthropic, "Building Effective Agents"（先选最简单模式）
