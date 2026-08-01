---
类型: 概念
主题: 强化学习
tags: [AI智能体知识库, 强化学习]
创建: 2026-07-30
复习:
状态: 已完成
---

# Actor-Critic

## 一句话定义
> REINFORCE 方差太大。加一个 critic 学习 V̂(s)，从回报中减去它得到优势 A(s,a)=G-V̂(s)。期望不变，方差大降。A2C 同步、A3C 异步，是所有现代深度策略方法的思维模型。

## 它解决什么问题 / 为什么存在
- 朴素 REINFORCE 方差极差：MC 回报 G_t 在 episode 间可波动 10 倍
- 乘以 ∇log π 再平均，梯度估计需要数千 episode 才能移动策略
- 方差来源是原始回报。减去 baseline b(s_t) 期望不变方差下降
- 最佳 baseline 是 V̂(s_t)：A(s,a) = G - V̂(s)。动作好于平均→正优势；差→负
- 带学习 critic 的 REINFORCE 就是 Actor-Critic。critic 给 actor 一个低方差的"老师"

## 核心原理（大二能懂的水平）
- **双网络一个损失**：
  - Actor π_θ(a|s)：策略，采样行动，用策略梯度训练
  - Critic V_φ(s)：估计期望回报，用 MSE (V_φ(s)-target)² 训练
- **优势估计两种形式**：
  - MC 优势：A_t = G_t - V_φ(s_t)。无偏，高方差
  - TD 优势：A_t = r_{t+1} + γV_φ(s_{t+1}) - V_φ(s_t)。有偏（用了 V_φ），方差远低。也叫 TD 残差 δ_t
- **n-step 优势**：A_t^(n) = r_{t+1}+γr_{t+2}+...+γ^{n-1}r_{t+n}+γ^nV(s_{t+n})-V(s_t)。n=1 纯 TD，n=∞ 纯 MC。Atari 用 n=5，PPO MuJoCo 用 n=2048
- **GAE(λ)**：所有 n-step 优势的指数加权平均 A_t^GAE = Σ_{l=0}^∞ (γλ)^l δ_{t+l}
  - λ=0 → TD（低方差高偏差）；λ=1 → MC（高方差无偏）
  - **λ=0.95 是 2026 年默认值**
- **A2C（同步）**：N 个并行环境收集 T 步，batch 更新 actor 和 critic。更简单、GPU 利用率更高。2026 默认
- **A3C（异步）**：N 个 worker 线程各自跑环境，本地算梯度异步推到共享参数服务器。不需回放缓冲（worker 通过不同轨迹去相关）。2026 被 GPU-batch A2C 取代
- **组合损失**：L = -E[A_t·log π_θ(a_t|s_t)] + c_v·E[(V_φ(s_t)-G_t)²] - c_e·E[H(π_θ)]
  - 三项：策略梯度损失 + 值回归 + 熵奖励。c_v≈0.5, c_e≈0.01

## 关键参数 / 易错点
- **critic 未热身**：critic 随机时 baseline 无信息，等于在纯噪声上训练。先热身 critic 几百步再开策略梯度
- **优势归一化**：每个 batch 归一化到零均值单位方差。近零成本但大幅稳定训练
- **共享 trunk**：图像输入用共享特征提取器 + 分离头。共享特征搭两个损失的便车
- **on-policy 合约**：A2C 数据只用一次。多用就有偏差（PPO 加 IS 修正来多 epoch）
- **熵坍缩**：c_e>0 不可少，否则几百步内策略变近确定性
- **奖励尺度**：优势幅度依赖奖励尺度。用 running-std 归一化奖励

## 类比（帮助理解）
- Actor-Critic 就像"演员+导演"：actor 演戏（做动作），critic 打分（评估状态好坏）。演员根据"比平均好还是差"来调整表演——比单纯看最终票房（MC 回报）信号清晰得多
- GAE(λ) 就像"模糊调焦"：λ 控制"看多远"。λ=0 只看一步（近视但稳定），λ=1 看到底（远视但模糊），λ=0.95 是中间甜点
- A2C vs A3C 就像"同步编译 vs 分布式编译"：A2C 是一个 GPU 上大批量并行，A3C 是多 CPU 各跑各的再合并——GPU 时代 A2C 赢

## 设计时怎么用（反推思维）
> 看到"advantage"就想到 Actor-Critic。PPO = A2C + 裁剪 IS ratio 做多 epoch。IMPALA = A3C + V-trace off-policy 修正。SAC = off-policy A2C + soft-value critic。GRPO = A2C 去掉 critic（group-relative advantage）。AlphaStar/OpenAI Five = A2C + league training + 模仿预训练。

## 典型应用 / 我在哪见过
- PPO：A2C + clipped IS ratio，2026 默认 RL 算法
- IMPALA：A3C + V-trace，大规模分布式
- SAC：off-policy A2C + soft value
- GRPO：A2C 无 critic，DeepSeek-R1 用
- OpenAI Five / AlphaStar：A2C + self-play + league

## 关联
- 前置知识：[[时序差分与Q-Learning]]、[[策略梯度REINFORCE]]
- 相关：[[PPO近端策略优化]]、[[AlphaZero与MuZero]]、[[多智能体强化学习]]
- 反例/误区：critic 随机时直接开 actor 梯度，等于在噪声上训练——先热身 critic 或用慢 actor 学习率

## 来源
- AIEFS Vol.4 LLMs, Ch.26 "Actor-Critic — A2C and A3C"
