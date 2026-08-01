---
类型: 概念
主题: 强化学习
tags: [AI智能体知识库, 强化学习]
创建: 2026-07-30
复习:
状态: 已完成
---

# 时序差分与 Q-Learning

## 一句话定义
> MC 等 episode 结束，TD 每步就更新——用 r + γV(s') 作为一步目标。Q-learning 是 off-policy（乐观），SARSA 是 on-policy（谨慎）。一行代码的差异。

## 它解决什么问题 / 为什么存在
- MC 两个问题：(1) episode 必须终止，(2) 只能到最后才更新。1000 步 episode 要等 1000 步
- DP 相反：零方差 Bootstrap，但需要已知模型
- TD 折中：从单步转移 (s,a,r,s') 构成一步目标 r+γV(s')，逐步更新 V(s)。无模型、无需完整 episode
- 有偏差（用了近似 V），但方差远低于 MC，从第一步就能在线更新
- 这是现代 RL（DQN、A2C、PPO、SAC）的枢纽

## 核心原理（大二能懂的水平）
- **TD(0) 更新**：V(s) ← V(s) + α[r + γV(s') - V(s)]。方括号里是 TD 误差 δ = r+γV(s')-V(s)，是 MC 中 G_t-V(s) 的在线版本
- **Q-learning（off-policy）**：
  - Q(s,a) ← Q(s,a) + α[r + γ·max_{a'} Q(s',a') - Q(s,a)]
  - max 假设从 s' 起遵循贪心策略——不管 agent 实际做了什么
  - 解耦了目标和行为：agent 用 ε-greedy 探索，Q 学的是 Q*。深度版就是 DQN
- **SARSA（on-policy）**：
  - Q(s,a) ← Q(s,a) + α[r + γ·Q(s',a') - Q(s,a)]
  - 用 agent 实际采取的下一个动作 a'，不是 max
  - 学的是当前 ε-greedy 策略的 Q^π。ε→0 时趋近 Q*
  - 名字就是五元组 (s, a, r, s', a')
- **悬崖行走差异**：cliff-walking 中掉崖=-100。Q-learning 学沿崖边最优路径但探索时偶尔掉崖；SARSA 学离崖一步的安全路径，因为把探索噪声计入 Q 值
- **Expected SARSA**：用 Σ_{a'} π(a'|s')Q(s',a') 代替采样的 a'。方差更低，on-policy 目标不变
- **n-step TD 与 TD(λ)**：n=1 是 TD，n=∞ 是 MC。TD(λ) 用几何权重 (1-λ)λ^{n-1} 平均所有 n。深度 RL 常用 n=3~20

## 关键参数 / 易错点
- **一个符号的差异**：Q-learning 用 max（off-policy），SARSA 用采样的 a'（on-policy）。这决定了一切
- **初始 Q 值重要**：乐观初始化（负奖励任务 Q=0）鼓励探索；悲观初始化可能永久困住贪心策略
- **α 调度**：常数 α 适合非平稳问题；α_n=1/n 理论收敛但太慢。实际固定 α∈[0.05, 0.3]
- **ε 调度**：从 ε=1.0 衰减到 ε=0.05。GLIE（无限探索下趋近贪心）是收敛条件
- **max 偏差**：Q-learning 的 max 对噪声 Q 向上偏估。Hasselt 的 Double Q-learning（DDQN）用两个 Q 表修复
- **重要性采样比值**：exp(log_new - log_old) 而非 new/old，保证数值稳定

## 类比（帮助理解）
- TD 就像"边走边调整预估"：每走一步就根据这一步的体验 + 对前方的预估来修正当前位置的评分，不用走完全程
- Q-learning vs SARSA 就像"乐观的 GPS vs 谨慎的 GPS"：Q-learning 假设你之后会走最优路线（max），SARSA 考虑你之后可能走错（实际采样的 a'）
- 悬崖行走：Q-learning 是"理论最优但实际会掉崖"，SARSA 是"考虑到你会犯错所以离崖远一点"

## 设计时怎么用（反推思维）
> 表格环境用 Q-learning 学最优策略。安全关键场景用 SARSA/Expected SARSA（探索时更保守）。高维状态用 DQN（Q-learning + 神经网络）。LLM RL 用 PPO/GRPO（Actor-Critic + TD 式优势 via GAE）。90% 的 2026 RL 论文是 Q-learning 或 SARSA 的某种变体。

## 典型应用 / 我在哪见过
- GridWorld：Q-learning 和 SARSA ~2000 episode 后都接近最优
- Cliff walking：Q-learning 沿崖边，SARSA 离崖一步——探索时 SARSA 更安全
- DQN on Atari：Q-learning + 神经网络 + 经验回放 + 目标网络
- PPO/GRPO 的优势估计：GAE 本质是 TD(λ) 的变体

## 关联
- 前置知识：[[MDP马尔可夫决策过程]]、[[动态规划]]、[[蒙特卡洛方法]]
- 相关：[[深度Q网络DQN]]、[[Actor-Critic]]、[[PPO近端策略优化]]
- 反例/误区：Q-learning 的 max 在 Q 有噪声时会高估。在 noisy-reward GridWorld 上 Q-learning 会显著高估 V*(0,0)，Double Q-learning 不会

## 来源
- AIEFS Vol.4 LLMs, Ch.23 "Temporal Difference — Q-Learning & SARSA"
