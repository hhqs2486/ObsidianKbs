---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: AIGC-Interview-Book
创建: 2026-07-23
状态: 种子
task:
  id: task-msab6m4p35j3s0
---

# AIGC 图像生成与绘画面试高频考点

## 这条教程在解决什么
- 来自 12 篇 SD/FLUX/ControlNet/LoRA/GAN 面试笔记，系统覆盖扩散模型、图像生成、可控生成、训练优化
- 面试中图像生成方向的必考知识点

## 关键内容

### 扩散模型基础
- Stable Diffusion：U-Net + VAE + CLIP Text Encoder 三件套
- 扩散过程（前向加噪/反向去噪）的数学直觉
- 与 GAN/VAE 的对比
- [[多模态]]

### 主流模型系列
- SD 系列（SD1.5/SDXL/SD3）：架构演进与关键改进
- FLUX 系列：DiT 架构、Flow Matching
- DALL-E 系列
- Midjourney 核心方法论

### 可控生成技术
- ControlNet：给扩散模型加上可训练的条件控制分支
- LoRA 技术原理与 AIGC 图像中的应用
- IP-Adapter：图像 Prompt 注入
- 各种 Control 方式（Canny/Depth/Pose/Scribble）

### 训练与优化
- AIGC 图像生成领域的训练技术（DreamBooth/Textual Inversion）
- 性能优化（蒸馏/LoRA 微调/推理加速）

### 视觉基础模型
- ViT / DINO / SAM / CLIP
- 图像生成评价指标（FID/CLIP Score/IS）

## 面试高频 QA
- SD 为什么用 U-Net 而非纯 Transformer？
- LoRA 为什么在扩散模型中如此有效？
- Flow Matching 相比 DDPM 有什么优势？
- ControlNet 是如何实现可控而不过拟合的？

## 我能复用/改编的点
> 面试回答从「模型架构 → 可控性 → 训练技巧 → 评价指标」四维展开

## 关联
- 概念：[[多模态]]
- 相关地图：[[多模态与实时地图]]

## 来源
- AIGC-Interview-Book AIGC图像创作&AI绘画基础（12篇）
