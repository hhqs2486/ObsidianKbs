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
  id: task-msab6nhngnm438
---

# Tree-of-Thoughts

## 一句话定义
> Tree-of-Thoughts（思维树）把"线性推理"变成"树状搜索"：在每个中间步骤生成多个候选思路，让模型给每个节点打分，挑有希望的探索、走进死胡同就回溯——而不是一条道走到黑。

## 它解决什么问题 / 为什么存在
- Chain-of-Thought 是线性走：第一步错了，后面全在错前提下干活。Game of 24（用 4 个数字 + −×÷ 凑 24）上 GPT-4 CoT 只有 4% 准确率——它早早选错子表达式且无法挽回。
- 推理需要的，是"提多个候选、评估、选优、能回溯"。那正是搜索。ToT 和 LATS 是两种经典实现。

## 核心原理（大二能懂的水平）
- **ToT（Yao et al., NeurIPS 2023）**：每个节点是一个连贯中间步（"一个 thought"），每节点可扩展 K 个子 thought；LLM 用打分 prompt 自评估每节点。搜索用 BFS / DFS / beam 探索树。
  - 自评估是承重件：论文给三种变体——sure/likely/impossible 分类、1–10 数值分、候选间投票。三者都在 Game of 24 大幅超 CoT（4% → 74%，GPT-4）。
- **LATS（Zhou et al., ICML 2024）**：把 ToT + ReAct + Reflexion 统一到 MCTS（蒙特卡洛树搜索）下。LLM 演三角色：
  - `Policy`：提候选下一步动作（ReAct 式）。
  - `Value function`：给部分轨迹打分（ToT 式自评估）。
  - `Self-reflector`：失败时写自然语言反思（Reflexion 式）并用来重播未来 rollout。
  - 环境反馈（observation）混进 value function，让搜索被真实工具结果（而非仅模型意见）引导。
  - 结果：HumanEval pass@1 92.7%（GPT-4，当时 SOTA）；WebShop 平均 75.9（GPT-3.5，逼近梯度微调）。
- **MCTS 最小四相（每轮）**：
  1. Select：从根按 UCT（上置信界）走到叶。`UCT = Q(s,a) + c·sqrt(ln N(s)/N(s,a))`——前项利用、后项探索，c 按任务调。
  2. Expand：policy 生成 K 个子。
  3. Simulate：从子节点 rollout 到叶，用 value（或环境奖励）打分。
  4. Backpropagate：把叶奖励沿路径回传，更新访问计数与 Q。

## 关键参数 / 易错点
- **成本现实**：搜索爆炸 token。ToT 在 Game of 24 用 CoT 的 100–1000 倍 token；LATS 类似。不是免费的。
- **何时值得搜**：单轨迹明显不够（Game of 24、复杂代码）；墙钟不如正确率重要；有便宜可靠的 value function（代码用单测、数学用显式目标）。
- **何时变糟**：任务单一正确答案但 evaluator 噪声大时，搜索常找到"高分错答案"。
- **2026 定位**：多数生产 Agent 不跑 LATS，而跑 ReAct + 工具验证（CRITIC）。搜索只在细分：跑测试当 value 的 Coding Agent、探索多查询路径的 deep-research、LangGraph 子图内的重规划。AlphaEvolve 是 2025 极端——对代码做进化搜索、机器可校验适应度。

## 类比（帮助理解）
- 像下棋：CoT 是走一步算一步不悔棋；ToT 是摆出几个候选走法、给每个评分、弃掉烂的、走通的继续往下想、死局就退回分叉点。
- 像写代码时开多个分支 git，跑测试筛掉挂掉的，留绿的那条。

## 设计时怎么用（反推思维）
> 做"一步错满盘皆输"的多步推理/生成 Agent 时，我会先反推"有没有可靠 value function、token 预算是否允许爆炸"：有单测当价值（代码）、显式目标（数学）→ 上 ToT/LATS 搜索 + 回溯；简单问答→单轨迹就够，别为搜索付费。并用 `if task_complexity > 阈值` 门控，平时走 ReAct。

## 典型应用 / 我在哪见过
- LangGraph 的 ToT 式子图探索、LlamaIndex 的 TreeOfThoughts agent、AlphaEvolve（进化搜索）。

## 关联
- 前置知识：[[推理 Reasoning]]
- 相关：[[ReAct]]、[[Reflexion 口头强化学习]]、[[自我改进]]
- 反例/误区：所有任务都上搜索（token 爆炸且噪声下更糟）；以为 CoT 足够处理需回溯的题。

## 来源
- AIEFS Vol.5 Agents, Ch.57 Tree of Thoughts and LATS: Deliberate Search
- Yao et al., Tree of Thoughts (arXiv:2305.10601); Zhou et al., LATS (arXiv:2310.04406)
- 关联：AlphaEvolve (arXiv:2506.13131)
