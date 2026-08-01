---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: AIGC-Interview-Book
创建: 2026-07-23
状态: 种子
---

# 深度学习面试高频考点

## 这条教程在解决什么
- 22 篇深度学习面试笔记：从基础概念到网络架构、训练优化、框架工具
- 库中 DL 基础概念相对较少，本篇系统补充面试必备知识点

## 关键内容

### 核心概念
- 前向传播/反向传播/梯度下降
- 激活函数（ReLU/GELU/Sigmoid/Swish）
- 损失函数（Cross-Entropy/MSE/对比损失）
- 正则化（Dropout/BatchNorm/LayerNorm/Weight Decay）
- [[Transformer]] | [[推理 Reasoning]]

### 网络架构
- CNN 核心操作（卷积/池化/感受野）
- RNN/LSTM/GRU 及其梯度问题
- ResNet 的残差学习思想
- 注意力机制与自注意力
- 图神经网络 GNN 基础

### 训练与优化
- 优化器演进（SGD→Momentum→Adam→AdamW）
- 学习率调度（Warmup/Cosine/Cyclic）
- 过拟合/欠拟合诊断
- 梯度消失/爆炸
- 混合精度训练

### 框架与工具
- PyTorch/TensorFlow 对比
- 分布式训练基础（DDP/FSDP）
- 实验追踪（W&B/TensorBoard）

## 面试高频 QA
- BatchNorm 和 LayerNorm 的区别和适用场景？
- Adam 为什么比 SGD 快？什么时候不适用？
- Dropout 在训练和推理时的行为不同？
- 如何处理梯度消失/爆炸？

## 我能复用/改编的点
> 面试回答公式：「现象 → 原理 → 解决方案 → Transformer/LLM 时代的变化」

## 关联
- 概念：[[Transformer]]
- 教程：[[01-AI Agent 入门与范式]]

## 来源
- AIGC-Interview-Book 深度学习基础（15篇）+ 精华版（7篇）
