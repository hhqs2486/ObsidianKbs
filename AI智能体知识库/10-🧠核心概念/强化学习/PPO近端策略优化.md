---
类型: 概念
主题: 强化学习
tags: [AI智能体知识库, 强化学习]
创建: 2026-07-30
复习:
状态: 已完成
---

# PPO 近端策略优化

## 一句话定义
> A2C 每个 rollout 只用一次。PPO 用裁剪的重要性比值把策略梯度包起来，让同一批数据可以做 10+ epoch 而策略不爆。Schulman 2017。九年后仍是默认策略梯度算法。

## 它解决什么问题 / 为什么存在
- A2C 是 on-policy：梯度 E_{π_θ}[A·∇log π_θ] 要求数据来自当前 π_θ。更新一次 π_θ 变了，数据就 off-policy 了
- rollout 很贵：Atari 8 envs × 128 步 = 1024 转移，十几秒环境时间。用一次就扔太浪费
- TRPO（2015）第一个修复：约束每次更新使新旧策略的 KL < δ。理论干净但需共轭梯度求解
- PPO 用简单的裁剪目标替代硬信任域约束。多一行代码，十倍 epoch，无需共轭梯度

## 核心原理（大二能懂的水平）
- **重要性比值**：r_t(θ) = π_θ(a_t|s_t) / π_{θ_old}(a_t|s_t)
  - r=1 没变化；r=2 新策略选这个动作的概率是旧策略的 2 倍
- **裁剪代理目标**：L^{CLIP}(θ) = E_t[min(r_t·A_t, clip(r_t, 1-ε, 1+ε)·A_t)]
  - A_t>0（好动作）且 r 想涨过 1+ε：裁剪让梯度变平——别把好动作推太远
  - A_t<0（坏动作）且 r 想涨过 1-ε：裁剪封顶——别让坏动作概率降太多
  - min 处理另一方向：比值朝有利方向移动时仍有梯度
  - 典型 ε=0.2
- **完整 PPO 损失**：L = L^{CLIP} - c_v·(V_φ(s_t)-V_t^target)² + c_e·H(π_θ)
  - 同 A2C 的 actor-critic 结构。c_v=0.5, c_e=0.01, ε=0.2
- **训练循环**：
  1. 收集 N×T 转移（N 并行 envs，T 步）
  2. 算 GAE 优势，冻结为常量
  3. 冻结 π_{θ_old} 快照
  4. K 个 epoch，每个 mini-batch：算 r_t=exp(log π_θ - log π_old)，应用 L^{CLIP}+value+entropy
  5. 丢弃 rollout，回到步骤 1
  - K=10，mini-batch=64 是标准配置

## 关键参数 / 易错点
- **诊断指标三件套**：
  - **mean KL** E[log π_old - log π_θ]：应在 [0, 0.02]。超过 0.1 → 减 K 或 LR
  - **clip fraction**：比值落在 [1-ε,1+ε] 外的比例。应 ~0.1-0.3。~0 → 提 LR/K；~0.5+ → 降
  - **explained variance** 1-Var(V_target-V_pred)/Var(V_target)：critic 质量，应趋近 1
- **ε=0.2 是事实标准**：0.1 太保守，0.3+ 不稳定
- **K>20 常导致不稳定**：策略漂离 π_old 太远。尤其大网络要限制 epoch
- **奖励归一化**：大奖励尺度吃掉裁剪范围。用 running std 归一化
- **优势归一化**：每 batch 零均值单位方差。跳过这步在大多数 benchmark 上会崩
- **学习率衰减**：线性衰减到零。常数 LR 通常更差
- **比值用 exp(log_new - log_old)**：不要用 new/old，数值不稳定
- **梯度符号**：最大化 surrogate = 最小化 -L^{CLIP}。符号反是最常见 PPO bug

## 类比（帮助理解）
- PPO 裁剪就像"限速带"：好动作可以多选一点（r>1），但最多到 1+ε 就不再加速；坏动作可以少选一点（r<1），但最多到 1-ε。防止一步走太远翻车
- 重要性比值就像"新旧策略的胜负比"：r=1 没变，r=2 新策略更喜欢这个动作。裁剪就是"不管你多喜欢，一次只能多喜欢 20%"
- 多 epoch 训练就像"一道题做十遍"：同一个 batch 反复学习（K=10 epoch），但每遍都检查"偏离原答案太多没"——偏离太多就停

## 设计时怎么用（反推思维）
> PPO 是 2026 年跨领域的默认 RL 算法。MuJoCo/机器人用 PPO+Gaussian+GAE(0.95)。Atari 用 PPO+categorical。RLHF 用 PPO+KL penalty to reference model。大规模游戏用 IMPALA+PPO。Reasoning LLM 用 GRPO（PPO 变体无 critic）。偏好数据用 DPO（PPO+KL 的闭式解，无在线采样）。

## 典型应用 / 我在哪见过
- RLHF for LLMs：PPO + KL penalty to reference model，reward model 在回答末尾打分
- MuJoCo 机器人控制：PPO + Gaussian policy + GAE(0.95)
- AlphaStar / OpenAI Five：IMPALA + PPO + self-play + league
- GRPO：PPO 无 critic 版，DeepSeek-R1 用

## 关联
- 前置知识：[[策略梯度REINFORCE]]、[[Actor-Critic]]
- 相关：[[Constitutional AI]]、[[AlphaZero与MuZero]]
- 反例/误区：PPO 对超参数"鲁棒"不等于"随便设"。不归一化优势/奖励、K 设太大、LR 不衰减——任何一个都足以让训练失败

## 来源
- AIEFS Vol.4 LLMs, Ch.27 "Proximal Policy Optimization (PPO)"
