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
  id: task-msab6o67jmpb98
decision-suggestions:
  - "28 篇笔记标签相似但未互链: 建议补充 [[10-🧠核心概念/深度学习与视觉/音频基础.md]] → [[10-🧠核心概念/深度学习与视觉/迁移学习.md]] (相似度: 100%)"
decision-generated: 2026-08-01T13:21:25.355Z
---

# PyTorch框架

## 一句话定义
> PyTorch 是深度学习的事实标准框架——用 Python 写代码立即执行（eager execution），自动求导、GPU 加速、丰富的预置模块，将"从活塞造引擎"变成"开现成的车"。

## 它解决什么问题 / 为什么存在
- 解决纯 Python 框架的速度问题：手写框架比 PyTorch 慢 500 倍，因为无法利用 GPU 和优化过的 C++/CUDA 内核。
- 提供自动微分（autograd）：不需要手写每个模块的 backward()，框架自动记录计算图并反向传播。
- 提供完整的工程生态：GPU 加速、混合精度、分布式训练、模型序列化、调试工具。

## 核心原理（大二能懂的水平）
- **Tensor（张量）**：多维数组，核心属性为 shape、dtype、device。`torch.randn(2, 3, 224, 224)` 表示 2 张 224x224 的 RGB 图像。所有运算要求张量在同一设备上（CPU 或 GPU）。
- **Autograd（自动求导）**：前向传播时自动记录操作到计算图（tape-based autodiff），调用 `.backward()` 反向遍历图计算梯度。三条规则：只有 `requires_grad=True` 的叶子张量累积梯度、梯度默认累积需 `zero_grad()`、`torch.no_grad()` 关闭追踪用于评估。
- **nn.Module**：所有网络组件的基类。在 `__init__` 中赋值的子模块和参数自动注册，`model.parameters()` 递归收集所有参数。`forward()` 方法定义前向传播。
- **标准训练循环**：`zero_grad()` → `forward()` → `loss()` → `backward()` → `optimizer.step()`。这五步是所有 PyTorch 训练的核心模式。
- **关键构建块**：`nn.Linear`（全连接）、`nn.Conv2d`（卷积）、`nn.BatchNorm2d`、`nn.LayerNorm`、`nn.Dropout`、`nn.ReLU`/`nn.GELU`、`nn.Embedding`、`nn.CrossEntropyLoss`、`torch.optim.AdamW`。

## 关键参数 / 易错点
- 设备不匹配是最常见错误：`RuntimeError: Expected all tensors to be on the same device`。确保模型和数据在同一 GPU 上。
- 梯度累积是默认行为：忘记 `optimizer.zero_grad()` 会导致梯度跨 batch 叠加。
- dtype 选择：float32（默认训练）、float16/bfloat16（混合精度）、int8（量化推理）。bfloat16 与 float32 同范围但精度低，适合 LLM 训练。
- `nn.CrossEntropyLoss` 期望输入是 logits（未过 softmax），不要提前做 softmax。

## 类比（帮助理解）
- PyTorch 像一个全自动厨房：你只管写菜谱（nn.Module + forward），它自动帮你切菜（Tensor 操作）、控火候（GPU 加速）、算营养表（autograd 求梯度）、洗碗（内存管理）。你的手写框架像是从种菜开始全手动操作。

## 设计时怎么用（反推思维）
> 做深度学习项目时，我会用 PyTorch 的 nn.Module 搭建模型、AdamW 优化器、标准五步训练循环。模型结构复杂时用 nn.Sequential 快速组装简单层，自定义逻辑写在 forward() 中。评估时记得 `model.eval()` 和 `torch.no_grad()`。

## 典型应用 / 我在哪见过
- 所有主流 AI 研究：2022 年 PyTorch 在 ML 论文中占比超 75%
- Meta、Google DeepMind、OpenAI、Anthropic、Hugging Face 均以 PyTorch 为主框架
- 配合 timm（视觉模型库）、transformers（NLP 模型库）使用

## 关联
- 前置知识：[[多层感知机MLP]] [[优化器 Optimizers]] [[损失函数 Loss Functions]]
- 相关：[[Backpropagation 反向传播]] [[正则化 Regularization]] [[卷积运算]] [[迁移学习]]
- 反例/误区：在评估阶段忘记 `torch.no_grad()`（浪费内存计算梯度）或忘记 `model.eval()`（Dropout/BN 行为错误）

## 来源
- AIEFS Vol.2 Deep Learning, Ch.14 "Introduction to PyTorch"
