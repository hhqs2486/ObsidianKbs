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
  id: task-msab6niiattdnc
---

# Self-Refine 自我纠错

## 一句话定义
> Self-Refine 是"一个模型自己生成→自己批评→自己改"的循环：产出差点意思的东西，让它先给自己写反馈，再根据这个反馈修订，直到没毛病或预算用完。无需训练、无需 RL、单模型即可。

## 它解决什么问题 / 为什么存在
- Agent 产出"差不多对"的答案：一行代码有语法错、摘要太长、计划漏了边界情况。我们想要的是——让 Agent 批评自己的输出，再修掉它。
- Self-Refine（Madaan et al., 2023）证明单模型、无训练数据、无 RL 就能做到。但有个坑：LLM 在硬事实上"自己验证自己"不可靠。CRITIC（Gou et al., 2023）给出解法——把验证步骤路由给外部工具。

## 核心原理（大二能懂的水平）
- **Self-Refine 三提示循环（同一模型三角色）**：
  - `generate(task) → output_0`
  - `feedback(task, output_0) → critique_0`
  - `refine(task, output_0, critique_0, history) → output_1` …重复直到 feedback 说"没问题"或预算耗尽。
  - **关键细节**：refine 看到**完整历史**（所有 prior 输出 + 批评），所以不会重复犯错。论文消融：去掉 history 质量骤降。
  - 头牌：7 个任务（数学/代码/缩写/对话）平均 +20 绝对提升，含 GPT-4。无训练、无外部工具、单模型。
- **CRITIC 的关键洞察**：Self-Refine 的 feedback 是 LLM 自评自己，对事实主张不可靠（幻觉在产出它的模型看来往往很可信）。CRITIC 把 `feedback(task, output)` 换成 `verify(task, output, tools)`：
  - 搜索引擎（事实）、代码解释器（代码正确性）、计算器（算术）、领域验证器（单测/类型检查/linter）。
  - 验证器产出扎根于工具结果的结构化批评，refiner 据此修订。
  - 头牌：CRITIC 在事实任务上胜过 Self-Refine（批评有根基）；无外部验证器的任务（创意写作/格式化）退化为 Self-Refine。
- **停止条件**（2026 默认组合）：验证器通过 **或** 模型说"没问题且迭代≥2" **或** 迭代≥上限。绝不单条件。
- **框架映射**：Anthropic "evaluator-optimizer" 工作流（两角色：evaluator 打分+批评，optimizer 按批评修订，循环到通过——本质即 Self-Refine/CRITIC）；OpenAI Agents SDK 的 output guardrails（对最终输出跑验证器，trip 则拒并重试，可调工具=CRITIC 式）。

## 关键参数 / 易错点
- **橡皮图章循环（rubber-stamp）**：同模型同风格既生成又批评，会收敛到"我看挺好"。→ 用结构不同的 prompt，或换小便宜模型做批评。
- **过度精炼（over-refinement）**：每轮加延迟加 token。预算 1–3 轮，之后升级人工审。
- **CRITIC 用在小任务上**：无外部验证器时 CRITIC 退化为 Self-Refine，别为桩验证器付延迟。
- **验证器噪声**：真实护栏栈常 30% 假阳性——循环要能扛。

## 类比（帮助理解）
- 像自己写完文章后朗读挑错：先写初稿，再当编辑给自己写批注，照批注改；但涉及"事实对不对"时，别信自己的记忆，去查资料/跑代码验证（CRITIC）。
- 像编译器+linter：Self-Refine 是自己审自己，CRITIC 是让单测和类型检查当"外部裁判"。

## 设计时怎么用（反推思维）
> 做"产出要反复打磨"的 Agent（代码/摘要/计划）时，我会先反推"有没有可执行的外部验证"：有（单测/类型/linter/搜索）→ CRITIC 式把验证路由给工具，批评才扎根；无→Self-Refine 但给 refine 看完整历史且用结构不同的批评 prompt 防橡皮图章。停止条件必须"验证通过 或 迭代封顶"双保险。

## 典型应用 / 我在哪见过
- Anthropic evaluator-optimizer 工作流、OpenAI Agents SDK output guardrails、LangGraph reflection 节点、Gemini 2.5 Computer Use 每步安全 evaluator（CRITIC 变体）。

## 关联
- 前置知识：[[反思 Reflection]]
- 相关：[[自我改进]]、[[Reflexion 口头强化学习]]、[[自我进化]]
- 反例/误区：以为"自己批评自己"在事实上可靠（需 CRITIC 外部验证）；单一停止条件导致无限循环或过早停。

## 来源
- AIEFS Vol.5 Agents, Ch.58 Self-Refine and CRITIC: Iterative Output Improvement
- Madaan et al., Self-Refine (arXiv:2303.17651); Gou et al., CRITIC (arXiv:2305.11738)
- Anthropic, "Building Effective Agents"（evaluator-optimizer）
