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
  id: task-msab6nokhbkmv7
decision-suggestions:
  - "28 篇笔记标签相似但未互链: 建议补充 [[10-🧠核心概念/深度学习与视觉/音频基础.md]] → [[10-🧠核心概念/深度学习与视觉/迁移学习.md]] (相似度: 100%)"
decision-generated: 2026-08-01T13:21:24.195Z
---

# 视觉Transformer ViT

## 一句话定义
> ViT 将图像切成 patch 当作"单词"，用标准 Transformer 处理——抛弃卷积的局部归纳偏置，靠数据和规模学习视觉特征。

## 它解决什么问题 / 为什么存在
- 挑战卷积在视觉领域的垄断地位：证明纯 Transformer 无需卷积的局部性和平移等变性先验，在大数据量下也能达到甚至超越 CNN。
- 统一视觉与语言的架构：ViT 和 NLP 的 Transformer 使用相同的 block 结构，方便多模态融合（CLIP、BLIP-2、LLaVA 的图像编码器都是 ViT）。
- 解决 CNN 感受野受限于卷积核大小的问题：自注意力从第一层就有全局感受野。

## 核心原理（大二能懂的水平）
- **Patch Embedding**：用一个 kernel=16, stride=16 的卷积将 224×224 图像切成 14×14=196 个 patch，每个投影到 768 维。一步同时完成切分和线性投影。
- **CLS Token**：在序列前加一个可学习的向量 `[CLS; patch_1; ...; patch_196]`。经过 N 层 Transformer 后，CLS 的输出作为全局图像表示，分类头只读这一个向量。
- **位置嵌入**：Transformer 没有空间感知能力，给每个 token 加一个可学习的位置向量。模型通过梯度学习适应 2D 图像结构。
- **Transformer Block（Pre-LN）**：`x = x + MSA(LN(x))`，`x = x + MLP(LN(x))`。MLP 是两层 GELU 激活：Linear(d→4d) → GELU → Linear(4d→d)。ViT-B/16 堆叠 12 个 block，12 头注意力，86M 参数。
- **DeiT 配方**：原版 ViT 需要 JFT-300M 数据才能超越 CNN。DeiT 通过强增强（RandAugment、Mixup、CutMix）、随机深度、重复增强和 CNN 蒸馏，仅用 ImageNet-1k 就训练到 81.8% top-1。

## 关键参数 / 易错点
- Patch 大小权衡：16×16 = 196 token（标准），32×32 = 49 token（快但粗），8×8 = 784 token（精细但注意力 O(n²) 代价高）。
- Pre-LN vs Post-LN：早期 Transformer 用 Post-LN 训练超过 6-8 层就不稳定需要 warmup；Pre-LN 深层训练稳定，ViT 和现代 LLM 都用 Pre-LN。
- 原版 ViT 在 ImageNet-1k 上输给 ResNet——缺乏卷积的归纳偏置在小数据上是劣势，需要大数据或自监督预训练（MAE）才能发挥优势。

## 类比（帮助理解）
- CNN 像一个从小训练"从局部到整体"识别物体的专家，有天生的空间直觉；ViT 像一个没有视觉先验但阅读了上亿张图的学生，通过纯注意力机制自己学会"该看哪里"。数据少时专家赢，数据多时学生更强。

## 设计时怎么用（反推思维）
> 做视觉任务时，如果数据量大或需要与语言模型融合，我会选 ViT（timm 库一行加载预训练权重）；如果数据量小或部署在边缘设备，ConvNeXt 可能更合适。ViT 微调时用层-wise LR 衰减（decay=0.75）保护早期通用特征。

## 典型应用 / 我在哪见过
- 图像分类：timm 中的 ViT、DeiT、Swin 系列
- 多模态：CLIP、SigLIP、BLIP-2、LLaVA 的图像编码器
- 分割：Mask2Former、SegFormer
- 检测：DETR、RT-DETR
- 自监督：MAE、DINOv2 的 backbone

## 关联
- 前置知识：[[Transformer]] [[CNN 卷积神经网络]] [[迁移学习]]
- 相关：[[自监督视觉]] [[CLIP]] [[卷积运算]]
- 反例/误区：在小数据集上从零训练 ViT（缺乏归纳偏置，几乎必定不如 CNN）

## 来源
- AIEFS Vol.2 Deep Learning, Ch.31 "Vision Transformers (ViT)"
