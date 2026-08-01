---
类型: 概念
主题: 强化学习
tags:
  - AI智能体知识库
  - 强化学习
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6r92lf2xxt
---

# 策略梯度 REINFORCE

## 一句话定义
> 不再估计值函数，直接参数化策略 π_θ(a|s)，计算期望回报的梯度然后上坡。Williams 1992 一个定理，是 PPO、GRPO 和所有 LLM RL 循环的起点。

## 它解决什么问题 / 为什么存在
- Q-learning/DQN 参数化值函数，通过 argmax Q 选动作。离散动作可以，连续动作不行（10 维力矩怎么 argmax？）
- 也不能得到随机策略（argmax 天然确定性）
- 策略梯度直接参数化策略 π_θ(a|s)，采样来行动，计算期望回报 J(θ)=E_{π_θ}[G] 对 θ 的梯度，梯度上升
- REINFORCE 定理：∇J(θ) = E_π[G·∇_θ log π_θ(a|s)]。跑 episode → 算回报 → 乘 log π 梯度 → 平均
- 2026 年所有 LLM-RL（PPO、DPO、GRPO）都是 REINFORCE 的精化

## 核心原理（大二能懂的水平）
- **策略梯度定理**：∇J(θ) = E_{τ~π_θ}[Σ_t G_t·∇_θ log π_θ(a_t|s_t)]
  - G_t = Σ_{k=t}^T γ^{k-t} r_{k+1} 是从步 t 的折扣回报
  - 证明很短：对 J(θ)=Σ_τ P(τ;θ)G(τ) 求导，用 log-derivative trick ∇P = P·∇log P
- **log-derivative trick**：∇P(τ;θ) = P(τ;θ)·∇log P(τ;θ)。把不可微的期望梯度变成可微的 log 概率梯度
- **方差降低技巧**：
  1. **Baseline 减法**：用 G_t - b(s_t) 替换 G_t。b(s_t) 不依赖 a_t，所以 E[b·∇log π]=0，无偏但方差大降。典型 b(s_t)=V̂(s_t) → Actor-Critic
  2. **Reward-to-go**：只用从 t 开始的回报，不用 G_0。过去奖励对当前动作只贡献零均值噪声
- **Softmax 策略**：π_θ(a|s) = softmax(f_θ(s,a))。梯度 ∇log π(a|s) = ∇f_θ(s,a) - Σ_{a'} π(a'|s)·∇f_θ(s,a')，即"选中动作的分数减去期望分数"
- **Gaussian 策略**（连续动作）：π_θ(a|s) = N(μ_θ(s), σ_θ(s))。∇log N 有闭式解
- **熵奖励**：+β·H(π(·|s)) 防止策略过早坍缩为确定性动作

## 关键参数 / 易错点
- **方差极大**：朴素 REINFORCE 需要数千 episode。critic baseline 或 TRPO/PPO 信任域是标准修复
- **梯度爆炸**：回报可能很大。始终将 G 在 batch 内归一化到 ~N(0,1)
- **熵坍缩**：策略过早变确定性，停止探索。加熵奖励 β·H(π)
- **样本效率低**：on-policy 意味着每次更新后数据就废了。重要性采样可以复用但方差大（PPO 的 ratio 就是裁剪后的 IS 权重）
- **信用分配**：不用 reward-to-go 时过去奖励贡献噪声。永远用 reward-to-go
- **∇log π(a|s) = e_a - π(·|s)**：softmax 策略梯度的核心——选中动作的 one-hot 减去概率向量

## 类比（帮助理解）
- REINFORCE 就像"只看结果给评价"：做完整局棋，赢了就把每步棋的概率都提高一点，输了就降低。不关心中间局面，只看最终结果
- log-derivative trick 就像"把'多大概率走到这里'变成'怎么调参数能让这条路概率更高'"——数学上等价但可微
- Baseline 就像"减去平均分"：一门课考了 80 分，不知道好不好。减去班级平均 75 分，+5 分说明考得不错。不改变长期平均但降低波动

## 设计时怎么用（反推思维）
> 看到 `loss = -advantage * log_prob` 就是 REINFORCE with baseline。连续控制用 PPO/SAC + Gaussian 策略。LLM RLHF 用 PPO + KL 惩罚。LLM reasoning 用 GRPO（REINFORCE + group-relative baseline，无 critic）。偏好数据用 DPO（REINFORCE 重写成偏好似然损失，无采样）。整个 DPO/GRPO/RLOO 论文都是在这个一行公式上做方差降低。

## 典型应用 / 我在哪见过
- LLM RLHF：PPO with KL penalty on token-level policy
- LLM reasoning（DeepSeek）：GRPO — REINFORCE + group-relative baseline
- 连续控制：PPO/SAC with Gaussian policy
- 多智能体：centralized-critic REINFORCE（MADDPG、COMA）

## 关联
- 前置知识：[[蒙特卡洛方法]]、[[时序差分与Q-Learning]]、[[多层感知机MLP]]
- 相关：[[Actor-Critic]]、[[PPO近端策略优化]]、[[AlphaZero与MuZero]]
- 反例/误区：朴素 REINFORCE 在 4×4 GridWorld 上需要 ~500 episode（有 baseline），无 baseline 需要数千。方差是致命问题

## 来源
- AIEFS Vol.4 LLMs, Ch.25 "Policy Gradient — REINFORCE from Scratch"
