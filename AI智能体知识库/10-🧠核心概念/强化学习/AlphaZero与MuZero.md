---
类型: 概念
主题: 强化学习
tags: [AI智能体知识库, 强化学习]
创建: 2026-07-30
复习:
状态: 已完成
---

# AlphaZero 与 MuZero

## 一句话定义
> self-play + 搜索 + 策略改进的统一循环。AlphaZero（2017）用已知规则+MCTS；MuZero（2019）学习模型在隐空间搜索；GRPO（2024）把同一配方用于 LLM 推理——token 即动作，验证器即胜负信号。

## 它解决什么问题 / 为什么存在
- 游戏有 RL 想要的一切：干净奖励（胜负）、无限 episode（self-play 重置）、完美仿真、离散动作、多智能体对抗
- 游戏是每个 RL 突破的测试场：TD-Gammon(1992) → Atari-DQN(2013) → AlphaGo(2016) → AlphaZero(2017) → OpenAI Five(2019) → MuZero(2019) → DeepSeek-R1(2025)
- 这三个里程碑通过统一视角理解：self-play + search + policy improvement。每个推广前一个
- GRPO 是 AlphaZero 配方应用于 LLM 推理：token=动作，数学验证=胜负信号

## 核心原理（大二能懂的水平）
- **统一循环**：
  ```
  while True:
      trajectory = self_play(current_policy, search)     # 自对弈
      policy_target = search.improved_policy(trajectory)  # 搜索改进策略
      policy_net.update(policy_target, value_target)      # 监督学习
  ```
- **AlphaZero（2017）**：已知规则的游戏（棋、将棋、围棋）
  - 策略-值网络 f_θ(s)→(p,v)：p 是合法走子先验，v 是预期结果
  - MCTS：每步展开树。用 (p,v) 做先验+Bootstrap。PUCT 选择：a* = argmax Q(s,a) + c·p(a|s)·√N(s)/(1+N(s,a))
  - 自对弈：agent vs agent。MCTS 访问分布 π_t 作为策略训练目标
  - 损失：L = (v-z)² - π·log p + c·||θ||²。z 是结果(+1/0/-1)
  - 零人类知识、零启发式。几千万局自对弈后精通棋/将棋/围棋
- **MuZero（2019）**：去掉规则已知的要求
  - 学习隐空间动力学模型 (h, g, f)：
    - h(s)：编码观测到隐状态
    - g(s_latent, a)：预测下一隐状态+奖励
    - f(s_latent)：预测策略先验+值
  - MCTS 在学习的隐空间中运行。同一搜索同一训练循环
  - 一个算法玩围棋+象棋+将棋+Atari，不需要规则知识
- **GRPO（2024-2025）**：DeepSeek-R1 配方。AlphaZero 形状的循环用于 LLM 推理
  - "游戏"=做数学/编程/推理题。"赢"=验证器返回 1
  - 策略=LLM，动作=token，状态=提示+部分回答
  - **无 critic**。每个 prompt 采样 G 个 completion，算奖励，group-relative advantage A_i = (r_i - mean_r)/std_r
  - 损失：L_GRPO = -E[(1/G)Σ A_i·log π_θ(o_i|q)] + β·KL(π_θ||π_ref)
  - 无奖励模型、无 critic、无 MCTS。group baseline 替代三者

## 关键参数 / 易错点
- **R1-Zero vs R1**：R1-Zero 直接 GRPO（无 SFT），思维链不可读、混语言。R1 用四阶段管线修复
- **R1 四阶段**：(1) cold-start SFT（几千条长 CoT），(2) reasoning GRPO+语言一致性奖励，(3) rejection sampling+SFT round 2（600K推理+200K非推理），(4) full-spectrum GRPO（推理+对齐）
- **GRPO vs PPO 三原因**：(1) 无值网络省一半内存，(2) group baseline 天然处理稀疏的 trajectory 末端奖励，(3) per-prompt 归一化让不同难度的 advantage 可比
- **group size 太小**：G<4 优势信号噪声大。标准 G=8~64
- **长度偏差**：不同长度 completion 的 log-prob 不同。按 token 数归一化或用序列级 log-prob
- **验证器覆盖**：单元测试通过了但方案有 bug→强化 bug。设计覆盖边缘情况的验证器
- **蒸馏 > RL from scratch**：R1 蒸馏到 Qwen-1.5B~Llama-70B（SFT on R1 traces，无 RL）在学生尺度上一致优于从头 RL

## 类比（帮助理解）
- AlphaZero 就像"左右手互搏"：同一大脑的两个副本对弈，用搜索（MCTS）改进每步选择，然后把搜索结果教给神经网络——"能打败自己搜索的策略才值得学"
- MuZero 就像"蒙眼下棋还能计划"：不知道棋盘规则但学会了在脑中模拟——编码→想象→评估→选择
- GRPO 就像"小组作业互评"：同一个题目做 G 遍，按小组平均分标准化——高于平均的多做、低于平均的少做。不需要外部老师（critic），同组同学互相比就够了

## 设计时怎么用（反推思维）
> 二人零和棋盘游戏用 AlphaZero/MuZero/KataGo。不完美信息（poker）用 CFR+深度学习。Atari 用 Muesli/MuZero。LLM 数学/代码推理用 GRPO。LLM 对齐用 DPO/RLHF-PPO（偏好不可验证，不能用 GRPO）。组合优化问题用 AlphaZero 变体（AlphaTensor、AlphaDev）。

## 典型应用 / 我在哪见过
- AlphaZero：棋/将棋/围棋，零人类知识
- MuZero：围棋+象棋+将棋+Atari，学习模型
- DeepSeek-R1：数学推理，GRPO，AIME/MATH-500 匹配 o1
- AlphaTensor：矩阵乘法算法
- AlphaDev：排序算法

## 关联
- 前置知识：[[深度Q网络DQN]]、[[PPO近端策略优化]]、[[多智能体强化学习]]
- 相关：[[蒙特卡洛方法]]（MCTS）、[[策略梯度REINFORCE]]（GRPO 本质是 REINFORCE+group baseline）、[[Constitutional AI]]
- 反例/误区：验证器可被 hack。GRPO 继承 RLHF 的风险——验证器有漏洞 LLM 就会找到。鲁棒验证器（多测试用例、形式化证明）至关重要

## 来源
- AIEFS Vol.4 LLMs, Ch.31 "RL for Games — AlphaZero, MuZero, and the LLM-Reasoning Era"
