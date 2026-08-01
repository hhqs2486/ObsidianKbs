---
类型: 概念
主题: 深度学习与视觉
tags:
  - AI智能体知识库
  - 深度学习与视觉
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6nsicnwunv
decision-suggestions:
  - "28 篇笔记标签相似但未互链: 建议补充 [[10-🧠核心概念/深度学习与视觉/音频基础.md]] → [[10-🧠核心概念/深度学习与视觉/迁移学习.md]] (相似度: 100%)"
decision-generated: 2026-08-01T13:21:24.641Z
---

# 激活函数 Activation Function

## 一句话定义
> 激活函数是加在每个神经元输出上的"非线性闸门"——没有它，堆 100 层网络也等价于一层矩阵乘法，啥复杂函数都学不了。

## 它解决什么问题 / 为什么存在
- 两层线性变换 `y = W2(W1x+b1)+b2` 总能合并成 `y = Ax+c`，即一个线性层。无论堆多深，没有非线性就学不了 XOR、分不了螺旋、认不了脸。
- 激活函数把线性链"打断"，让网络能弯折决策边界、逼近任意函数。但选错会导致梯度消失（sigmoid 深网）、梯度爆炸、或神经元永久死亡（ReLU）。

## 核心原理（大二能懂的水平）
- sigmoid：`σ(x)=1/(1+e⁻ˣ)`，输出 (0,1)，导数 `σ'(x)=σ(1−σ)`，最大值仅 0.25。深网里梯度连乘 0.25^k 迅速归零→梯度消失。且输出恒正，梯度同号，下降时锯齿状震荡。
- tanh：`(eˣ−e⁻ˣ)/(eˣ+e⁻ˣ)`，输出 (−1,1)，零中心化，导数最大 1.0（比 sigmoid 好 4 倍），但大输入仍饱和、仍会消失。
- ReLU：`max(0,x)`，导数 x>0 时为 1、否则为 0。正区间梯度恒为 1，打破消失问题，深网才训得动。代价是"死神经元"：输入恒负则输出和梯度都恒 0，永久罢工（实践中 10–40% 可能死）。
- LeakyReLU：`x>0 取 x，x≤0 取 αx`（α≈0.01），负区留一点斜率，死神经元也能复活。
- GELU：`x·Φ(x)`（高斯 CDF 门控），平滑、允许小幅负值、有概率解释。是 BERT/GPT/大多数 Transformer 的默认隐藏层激活，梯度流好且不死神经元。
- Swish/SiLU：`x·sigmoid(x)`，与 GELU 类似，用于 EfficientNet 等视觉模型；语言模型多用 GELU。
- Softmax：仅用于输出层，把 logits 变成概率分布（和为 1），多分类标配。

## 关键参数 / 易错点
- 消失梯度：sigmoid/tanh 深网必现，改用 ReLU 系激活。
- 死神经元：ReLU 负偏置/坏初始化会让神经元恒死；出现就换 GELU 或 LeakyReLU。
- 默认选择（工程共识）：Transformer 隐藏层用 GELU；CNN 隐藏层用 ReLU；分类输出用 softmax；回归输出不用激活（线性）；概率输出用 sigmoid。没证据别乱改。
- 易错：在隐藏层用 softmax（它只该在输出层）；或盲目加大负斜率。

## 类比（帮助理解）
- 像电路里的非线性元件（二极管）：纯电阻网络再复杂也只是线性叠加；加了二极管才出现整流、限幅，电路才有真正"计算"能力。激活函数就是神经网络的"二极管"。
- 又像弹簧的死区：ReLU 像只能拉伸不能压缩的拉簧，压到底就"卡死不动"（死神经元）。

## 设计时怎么用（反推思维）
> 设计一个网络时，我会先按架构套默认：CNN 隐藏层上 ReLU，Transformer 上 GELU，输出层按任务选 softmax/sigmoid/线性。若训练中发现某些通道恒为 0（死神经元），就换成 GELU；若深层梯度健康检查显示浅层梯度趋零，先怀疑是否误用了 sigmoid——这背后正是 [[Backpropagation 反向传播]] 的梯度消失机制。

## 典型应用 / 我在哪见过
- 几乎每张神经网络卡：LeNet 用 tanh、AlexNet 换 ReLU（训练快 6 倍）、现代 LLM 用 GELU。
- ResNet 的残差连接 + ReLU 让 1000 层可训；Transformer 每块都是 GELU。
- 检测死神经元：随机输入前向，统计永不激活的通道比例。

## 关联
- 前置知识：[[Backpropagation 反向传播]]
- 相关：[[优化器 Optimizers]]、多层感知机MLP
- 反例/误区：以为"层数够多就自动非线性"——没有激活函数，深层线性网络 = 单层

## 来源
- Nair & Hinton, 2010, "Rectified Linear Units Improve Restricted Boltzmann Machines"
- Hendrycks & Gimpel, 2016, "Gaussian Error Linear Units (GELUs)"
- AIEFS Vol.2 Deep Learning, ch.07 Activation Functions
