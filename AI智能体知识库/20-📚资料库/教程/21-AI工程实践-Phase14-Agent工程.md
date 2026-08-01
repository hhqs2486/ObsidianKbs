---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: ai-engineering-from-scratch Phase 14
创建: 2026-07-22
状态: 种子
---

# AI工程实践-Phase14-Agent工程

## 摘要
每一个 2026 年的 Agent（Claude Code、Cursor、Devin、Operator）都是 2022 年 ReAct 循环的变体。Phase 14 从裸 ReAct 循环出发，逐一展开规划分离（ReWOO）、言语强化学习（Reflexion）、树搜索推理（ToT/LATS）、自我纠错（Self-Refine/CRITIC）这些 Agent 工程的核心模式。

## 这条教程在解决什么
- 单次 LLM 调用只是一次自动补全，如何让模型在一个循环中持续观察、思考、行动？
- ReAct 每步都带着完整上下文，token 消耗随深度平方增长；如何分离规划与执行来节省 5x token？
- Agent 失败了怎么办？如何不靠梯度更新而靠"写一段反思存进记忆"来改进？
- 线性思维链第一步错了就全错；如何用树搜索找到更优路径？
- 输出"差不多对"的时候，如何让 Agent 自己发现并修正错误？

## 关键内容提纲
1. **ReAct 循环** — Thought → Action → Observation 三步交替，加上消息缓冲、工具注册表、停止条件、迭代预算、观察格式化器五个要素
2. **ReWOO 规划-执行分离** — Planner 一次性规划 DAG → Workers 并行取证据 → Solver 合成答案；5x 更少 token，+4% HotpotQA 准确率，可蒸馏到 7B 模型
3. **Reflexion 言语强化学习** — Actor 执行 → Evaluator 评分 → Self-Reflector 写自然语言反思 → 反思存入 episodic memory → 下一轮尝试看到反思并改进
4. **Tree of Thoughts / LATS 树搜索** — 推理变成搜索：每个节点是"思路"，展开 K 个候选，LLM 自评分，MCTS 选择/扩展/模拟/回传；Game of 24 从 CoT 4% 飙到 74%
5. **Self-Refine / CRITIC 自我纠错** — 生成→反馈→优化的循环；CRITIC 的核心洞察：LLM 不可靠于自我验证，必须用外部工具（搜索、代码解释器、测试）接地验证

## 我卡住/没懂的地方
- LATS 的 token 消耗是 CoT 的 100-1000x，什么情景下这个开销值得？实际生产中有没有 Agent 真的跑 LATS？
- Reflexion 的 episodic memory 随时间膨胀后，旧反思变成"迷信"（针对一次性 flaky run 的叙事），TTL 和压缩策略怎么设？
- Plan-and-Act 的合成训练数据方法虽然能扩展到 30-50 步的长程规划，但生成这些数据的成本本身是否已经超过手动标注？

## 它背后的原理
- ReAct 的观察流是模型的"感知器官"——去掉它，模型就是在黑暗中推理
- 言语强化学习的核心洞察：自然语言足够丰富来承载"从失败中学到的东西"，不需要梯度
- 树搜索的价值函数必须是廉价的——如果价值函数本身比执行还贵，搜索就没意义
- CRITIC 的本质是"信任但要验证"：LLM 可以生成，但必须由确定性工具验证

## 我能复用/改编的点
- ReWOO 的 Planner 蒸馏策略（用大模型做规划，小模型做执行）是降低生产成本的通用模式
- 评估器-优化器（Evaluator-Optimizer）是 Anthropic 定义的五大工作流模式之一，在所有 Agent 框架中都适用
- CRITIC 风格的外部验证器可以直接作为 OpenAI Agents SDK 的 output guardrail 使用
- Reflexion 模式直接映射到 Claude Code 的 CLAUDE.md 学习机制和 Letta 的 sleep-time compute

## 关联
- 概念：[[ReAct]]、[[反思 Reflection]]、[[自我进化]]、[[自我改进]]、[[经验学习]]、[[轨迹回放]]、[[推理模型]]、[[Agent范式]]、[[大语言模型 LLM]]、[[经验回放与改进]]
- 项目：[[ ]]

## 来源
- ai-engineering-from-scratch Phase 14: Agent Engineering，子主题 01-05
- Yao et al., ReAct (arXiv:2210.03629); Shinn et al., Reflexion (arXiv:2303.11366); Yao et al., Tree of Thoughts (arXiv:2305.10601); Zhou et al., LATS (arXiv:2310.04406); Madaan et al., Self-Refine (arXiv:2303.17651); Gou et al., CRITIC (arXiv:2305.11738)
- Anthropic, Building Effective Agents (Dec 2024)
