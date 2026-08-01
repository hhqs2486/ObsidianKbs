---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: AIEFS Vol.2 Deep Learning
创建: 2026-07-30
状态: 已完成
task:
  id: task-msab6lob33oha5
---

# AIEFS Vol.2 — 深度学习与计算机视觉

## 这条教程在解决什么
- 系统梳理深度学习核心（感知机→MLP→损失函数→优化器→正则化→初始化→学习率→PyTorch）到计算机视觉（卷积→检测→分割→ViT→自监督→3D→GAN）再到语音音频基础（波形→Whisper→编解码器）的完整知识链
- 每个概念都从"为什么存在"出发，用大二能懂的语言解释核心原理，辅以关键参数、易错点和设计反推思维
- 20 张概念卡片覆盖 AIEFS Vol.2 的 20 个核心章节，构成从理论到实践的深度学习知识图谱

## 关键内容

### 深度学习核心
- [[感知机 Perceptron]] — 最简单的线性分类器，理解"学习"的本质
- [[多层感知机MLP]] — 堆叠层获得非线性，通用近似定理
- [[损失函数 Loss Functions]] — MSE/交叉熵/对比损失/Focal Loss 的选择逻辑
- [[优化器 Optimizers]] — SGD→Momentum→Adam→AdamW 的演进与原理
- [[正则化 Regularization]] — Dropout/权重衰减/BatchNorm/LayerNorm/RMSNorm
- [[权重初始化]] — Xavier 与 Kaiming 的方差分析，深层网络训练的前提
- [[学习率调度]] — Warmup + Cosine Decay 为何是现代默认
- [[PyTorch框架]] — Tensor/Autograd/nn.Module/标准训练循环

### 计算机视觉
- [[卷积运算]] — 滑动窗口、参数共享、平移等变性
- [[目标检测YOLO]] — 网格预测、锚框、IoU、NMS、三部分损失
- [[语义分割U-Net]] — 编码器-解码器 + 跳跃连接 + Dice 损失
- [[实例分割Mask R-CNN]] — Faster R-CNN + 掩码头 + RoIAlign
- [[迁移学习]] — 特征提取 vs 微调、判别式学习率、BatchNorm 陷阱
- [[视觉Transformer ViT]] — Patch embedding + CLS token + 自注意力
- [[自监督视觉]] — SimCLR 对比学习 / DINO 师生蒸馏 / MAE 掩码重建
- [[3D视觉与NeRF]] — PointNet 对称函数 / NeRF 体渲染 / 位置编码
- [[生成对抗网络GAN]] — 生成器-判别器博弈 / DCGAN 规则 / 模式崩溃

### 语音与音频
- [[音频基础]] — 波形/采样率/Nyquist 定理/FFT/STFT
- [[Whisper语音模型]] — 30 秒窗口编码器-解码器 / 多任务 token / LoRA 微调
- [[神经音频编解码器]] — RVQ / 语义-声学分离 / EnCodec/DAC/SNAC/Mimi

## 核心知识链路

```
感知机 → MLP → [损失函数 + 优化器 + 正则化 + 初始化 + 学习率] → PyTorch
    ↓
卷积运算 → CNN → [检测(YOLO) + 分割(U-Net/Mask R-CNN) + 迁移学习]
    ↓
ViT → 自监督视觉(SimCLR/DINO/MAE) → 3D视觉(NeRF) + 生成(GAN)
    ↓
音频基础 → Whisper(ASR) + 神经编解码器(EnCodec/Mimi)
```

## 面试/实践高频 QA
- 为什么 Adam 比 SGD 快？什么时候 SGD 泛化更好？
- BatchNorm 和 LayerNorm 的区别？Transformer 为什么用 LayerNorm？
- Xavier 和 Kaiming 初始化分别适用于什么激活函数？为什么？
- YOLO 的 NMS 是做什么的？IoU 阈值如何选择？
- U-Net 的跳跃连接为什么必要？Dice 损失解决什么问题？
- ViT 在小数据上为什么不如 CNN？DeiT 和 MAE 如何解决？
- MAE 的 75% 掩码率为什么不是 15%（如 BERT）？
- Whisper 为什么固定 30 秒窗口？长音频如何处理？
- 神经音频编解码器的语义/声学分离为什么重要？

## 我能复用/改编的点
> 学习路径公式：「为什么存在 → 核心原理（大二能懂）→ 关键参数/易错点 → 类比 → 设计反推」
> 每个概念都从 PDF 章节中提取真实内容 grounding，不做泛泛而谈的科普。

## 关联
- 概念：[[Transformer]] [[CNN 卷积神经网络]] [[Backpropagation 反向传播]] [[激活函数 Activation Function]] [[CLIP]] [[Stable Diffusion]] [[扩散模型 Diffusion Model]] [[LoRA Low-Rank Adaptation]] [[语音识别 ASR]] [[文本转语音 TTS]] [[多模态]] [[视觉理解]]
- 教程：[[30-AIGC面试-深度学习面试基础]] [[28-AIGC面试-多模态AI面试基础]] [[41-AIGC面试-经典CV模型面试基础]]

## 来源
- AIEFS Vol.2 Deep Learning（AI Engineering From Scratch, Vol.2），涵盖 Ch.04-59 共 20 个核心章节
