---
类型: 教程
主题: 强化学习
tags:
  - AI智能体知识库
  - 教程
  - 强化学习
  - 推理部署与安全对齐
  - NLP与语言模型
  - AIEFS
来源: AIEFS Vol.4 LLMs
创建: 2026-07-30
状态: 已完成
task:
  id: task-msab6lk7rlnjvp
---

# AIEFS Vol.4 — LLM 训练与强化学习教程笔记

> 本教程笔记源自 *AI Engineering from Scratch, Volume 4: LLMs*，覆盖从生成模型基础到强化学习再到 LLM 训练工程的 19 个核心章节。

---

## 一、生成模型基础

### 1. 自编码器与 VAE（Ch.05）

普通 AE 压缩但不生成——code 空间无结构。VAE 的核心创新是**重参数化 trick**：z = μ + σ·ε，把不可微的采样变成可微的确定性变换+噪声。

- ELBO 损失 = 重建 ||x-x̂||² + β·KL[q(z|x)||N(0,I)]
- β>1 更解耦但更模糊；β<1 更清晰但 code 空间不够高斯
- **posterior collapse**：KL 太强→z 不携带 x 信息。修复：β-annealing
- 2026 年角色：latent-diffusion 模型（SD/Flux）的输入编码器

关联卡片：[[VAE变分自编码器]]

### 2. StyleGAN（Ch.08）

把 z 先映射到中间 w（8层MLP），再通过 AdaIN 在每个分辨率注入 w。解开了潜在空间。

- AdaIN(x,y) = y_scale·(x-mean)/std + y_bias
- 截断 trick：w' = ŵ + ψ·(w-ŵ)，ψ≈0.7 是质量/多样性甜点
- v1→v2(weight demodulation 修复液滴)→v3(alias-free conv 修复纹理粘附)
- 2026 年仍用于窄域高 FPS 生成（4090 上 1024² <10ms）

关联卡片：[[StyleGAN]]

---

## 二、强化学习基础

### 3. MDP：状态、动作与奖励（Ch.20）

五元组 (S, A, P, R, γ)——RL 的一切都在这个框架上优化。

- Markov 性质：未来只依赖当前状态
- Bellman 方程：V^π(s) = Σ π(a|s) Σ P [r + γV(s')]
- γ 的物理意义：有效视野 ≈ 1/(1-γ)
- LLM RL 用 γ=1（短 episode），控制用 0.95-0.99

关联卡片：[[MDP马尔可夫决策过程]]

### 4. 动态规划（Ch.21）

已知模型时迭代 Bellman 方程。策略迭代（评估+改进交替）和值迭代（一步搞定）都收敛到 V*。

- γ-压缩映射保证唯一不动点和几何收敛
- GPI 统一框架：Q-learning、Actor-Critic、PPO 都是实例
- 2026 用途：金标准解、调试采样方法、MCTS/AlphaZero 内循环

关联卡片：[[动态规划]]

### 5. 蒙特卡洛方法（Ch.22）

不需要模型，只需要 episode。跑策略→算回报→取平均。

- first-visit vs every-visit：两者极限无偏，every-visit 数据利用率更高
- ε-greedy 探索：以概率 ε 随机，否则贪心
- off-policy MC 用重要性采样但方差随 horizon 爆炸
- MC 是 REINFORCE/PPO/GRPO 的基石

关联卡片：[[蒙特卡洛方法]]

### 6. 时序差分：Q-Learning 与 SARSA（Ch.23）

TD 每步更新——用 r+γV(s') 作为一步目标。Q-learning 用 max（off-policy），SARSA 用实际 a'（on-policy）。

- 悬崖行走：Q-learning 沿崖边最优但探索时掉崖；SARSA 离崖一步更安全
- n-step TD 插值 TD 和 MC；TD(λ) 用几何权重平均
- 90% 的 2026 RL 论文是 Q-learning 或 SARSA 的变体

关联卡片：[[时序差分与Q-Learning]]

---

## 三、深度强化学习

### 7. DQN（Ch.24）

Q-learning + 神经网络 + 三个 trick：经验回放、目标网络、奖励裁剪。2015 年 Nature 开启深度 RL 时代。

- 致命三体：函数逼近 + Bootstrap + off-policy 可能发散
- Double DQN 修复 max 偏差（默认用）
- Rainbow 叠加六个 trick，增益大致可加

关联卡片：[[深度Q网络DQN]]

### 8. 策略梯度 REINFORCE（Ch.25）

直接参数化策略，∇J(θ) = E[G·∇log π]。log-derivative trick 让期望梯度可计算。

- Baseline 减法（G-V̂(s)）无偏降方差→Actor-Critic
- Reward-to-go：只用未来回报，过去奖励是噪声
- 熵奖励防止策略过早坍缩
- PPO/GRPO/DPO 都是 REINFORCE 的方差降低变体

关联卡片：[[策略梯度REINFORCE]]

### 9. Actor-Critic：A2C 与 A3C（Ch.26）

Actor（策略）+ Critic（值函数）双网络。A2C 同步批量，A3C 异步多线程。

- GAE(λ) 指数加权 n-step 优势。λ=0.95 是 2026 默认
- 组合损失 = 策略梯度 + 值回归 + 熵奖励
- PPO = A2C + 裁剪 IS ratio；GRPO = A2C 无 critic

关联卡片：[[Actor-Critic]]

### 10. PPO 近端策略优化（Ch.27）

裁剪重要性比值让同一批数据做 10+ epoch。ε=0.2 是事实标准。

- 诊断三件套：mean KL [0,0.02]、clip fraction 0.1-0.3、explained variance→1
- 优势归一化（每 batch 零均值单位方差）不可少
- RLHF 用 PPO+KL penalty；reasoning 用 GRPO

关联卡片：[[PPO近端策略优化]]

---

## 四、高级强化学习

### 11. 多智能体 RL（Ch.29）

每个 agent 是对方环境的一部分→非平稳。CTDE 是 2026 合作 MARL 主流。

- Markov Game：(S, A_1...A_n, P, R_1...R_n)
- CTDE：集中训练看全局，分散执行用局部观测
- MAPPO/QMIX/COMA 是三大方法
- Self-play 用于零和博弈；League play 用于策略循环

关联卡片：[[多智能体强化学习]]

### 12. Sim-to-Real 迁移（Ch.30）

仿真器训练的策略在硬件上失败。DR/SI/domain adaptation 三件工具。

- 2026 recipe：GPU 并行仿真 + DR + teacher/student + 安全防护
- Teacher 用特权信息（地形、摩擦真值），Student 只用传感器
- Isaac Lab 单 GPU 跑 4096 并行机器人

关联卡片：[[Sim-to-Real迁移]]

### 13. AlphaZero / MuZero / GRPO（Ch.31）

统一循环：self-play + search + policy improvement。

- AlphaZero：已知规则 + MCTS + 策略值网络
- MuZero：学习隐空间模型，不需规则
- GRPO：AlphaZero 配方用于 LLM 推理。group-relative advantage 替代 critic
- R1 四阶段：cold-start SFT → reasoning GRPO → rejection sampling+SFT → full-spectrum GRPO

关联卡片：[[AlphaZero与MuZero]]

---

## 五、LLM 训练工程

### 14. 数据管道与预训练（Ch.35）

Common Crawl → 清洗 → MinHash+LSH 去重 → 序列打包。Chinchilla 缩放定律指导数据量/参数量配比。

- 去重是质量提升最有效的单一操作
- 序列打包把短样本拼成固定长度避免 padding 浪费
- Chinchilla：20 tokens/参数是最优数据配比

关联卡片：[[数据管道与预训练]]

### 15. 分布式训练（Ch.37）

数据并行 / 张量并行 / 流水线并行三种维度。FSDP/ZeRO 分片优化器/梯度/参数。

- ZeRO Stage 1/2/3：分片优化器状态→梯度→参数
- 3D 并行 = DP×TP×PP
- 混合精度（BF16）几乎免费加速 2x

关联卡片：[[分布式训练]]

### 16. Constitutional AI 与自我改进（Ch.41）

SL-CAI + RLAIF 两阶段。GRPO 无 critic 替代 PPO。

- CAI 用宪法原则让模型自我批评和修正
- ORM（结果奖励）vs PRM（过程奖励）
- R1-Zero 证明 GRPO 可以从基座模型直接学推理

关联卡片：[[Constitutional AI]]

### 17. 差分注意力 V2（Ch.48）

双 softmax 相减消除注意力噪声底座。

- 两个 query-key 对相减：attention = softmax(Q₁K₁) - λ·softmax(Q₂K₂)
- V1→V2：简化了 λ 的计算方式
- 与 FlashAttention 兼容

关联卡片：[[差分注意力]]

### 18. DeepSeek-V3 架构（Ch.52）

MLA（多头潜在注意力）+ 无辅助损失路由 + MTP（多 token 预测）+ DualPipe。

- 671B 总参数，37B 激活参数（MoE）
- MLA 压缩 KV cache
- 无辅助损失路由避免负载不均
- DualPipe 实现 1P+1B 零气泡流水线

关联卡片：[[DeepSeek-V3架构]]

### 19. 梯度检查点（Ch.56）

反向传播需要所有中间激活——70B 模型 128K 上下文单卡 3TB。梯度检查点用 FLOP 换内存。

- 朴素全检查点：33% 额外 FLOP
- 选择性检查点：只重算 attention，5% 额外 FLOP
- √L 最优分段：L=64 层→8 个检查点

关联卡片：[[梯度检查点]]

---

## 总结

AIEFS Vol.4 的主线是**从 RL 基础到 LLM 训练工程**：

1. **MDP → DP → MC → TD**：RL 的数学基石，四个方法逐层放宽假设
2. **DQN → REINFORCE → Actor-Critic → PPO**：深度 RL 的演进，从值函数到策略梯度到稳定多 epoch
3. **MARL → Sim-to-Real → AlphaZero/MuZero/GRPO**：高级 RL，从多智能体到现实部署到游戏/推理
4. **数据管道 → 分布式训练 → CAI → 梯度检查点 → DeepSeek-V3 → 差分注意力**：LLM 训练工程的全栈

GRPO 是贯穿全书的桥梁：它本质是 REINFORCE + group-relative baseline（无 critic），源自 AlphaZero 的 self-play + policy improvement 思想，最终在 DeepSeek-R1 上证明了游戏 RL 技术可以用于 LLM 推理。
