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
  id: task-msab6o8kyepopz
decision-suggestions:
  - "28 篇笔记标签相似但未互链: 建议补充 [[10-🧠核心概念/深度学习与视觉/音频基础.md]] → [[10-🧠核心概念/深度学习与视觉/迁移学习.md]] (相似度: 100%)"
decision-generated: 2026-08-01T13:21:25.390Z
---

# ControlNet

## 一句话定义
> ControlNet 是给扩散模型"加可控条件"的旁路网络——冻结原 U-Net，克隆它的编码器去读边缘/姿态/深度图，再用零卷积连回主干，让生成图精确服从你给的结构。

## 它解决什么问题 / 为什么存在
- 一句提示词（"红裙女子牵狗逛街"）只能定下约 10% 的图像信息：狗在哪、什么姿势、什么视角，文字说不清。
- 为每种条件（姿态、深度、边缘）从零训新模型太贵。ControlNet 让 2.6B 的 SDXL 主干冻结，只挂一个小小的"侧网络"读条件、轻推主干中间特征——这就是可控生图的关键件。

## 核心原理（大二能懂的水平）
- 结构（Zhang et al., 2023）：克隆预训练 SD 的 U-Net 编码器一半，冻结原始；训练克隆体去接收额外条件输入（边缘/深度/姿态）。用**零卷积**（1×1 卷积、权重初始化为 0）把克隆体连回原始解码器。
  `decoder_features = orig_dec_features + zero_conv(controlnet_enc(condition))`
- 零卷积的妙处：初始化时 ControlNet 是恒等（无作用），训练从"零扰动"慢慢学出 Δ，不会一上来就砸坏冻结主干。
- 每个条件一个 ControlNet 小模型（SD 1.5 约 70MB，SDXL 约 360MB）。推理时可组合：
  `features += w_a·control_a(depth) + w_b·control_b(pose)`
- 常见类型：Canny（边缘）、Depth（深度）、OpenPose（姿态骨架）、Scribble（涂鸦）、Seg（分割）。与 [[LoRA Low-Rank Adaptation]]（管风格/主体）正交——一个管空间结构，一个管语义。

## 关键参数 / 易错点
- 权重（控制强度）：多个 ControlNet 权重都设 1.0 常"过冲"；经验上权重之和 ≈1.0 较稳。
- 零卷积初始化：务必从 0 开始，否则早期训练会剧烈漂移、破坏主干。
- 条件质量：Canny 阈值、深度图精度直接决定约束好坏；垃圾条件出垃圾结构。
- 易错：把 ControlNet 当"另一个完整模型"重训（贵且没必要）；或同时拉满多个条件权重导致结构打架。

## 类比（帮助理解）
- 像给画家（冻结的 SD）配一个"构图助理"（ControlNet）：助理只负责把骨架/边缘勾出来，画家在骨架内填色与风格，既听话又不重画整套绘画能力。
- 又像在自动驾驶里加车道线约束：主线模型不变，只多一路"必须沿车道走"的硬条件。

## 设计时怎么用（反推思维）
> 我要让生图"精确构图"（指定姿势/布局/深度）时，会在 [[Stable Diffusion]] 基座上叠 ControlNet，而不是靠提示词硬描述。反推：先确定要约束的是"空间结构"还是"风格/主体"——结构用 ControlNet（Pose/Depth/Canny），风格用 [[LoRA Low-Rank Adaptation]]，二者叠加。条件权重控制在 ~1.0 总和，避免过冲。多 ControlNet 并行会增加每步前向成本（每个约 +1.5× 步耗时），预算时要算进去。

## 典型应用 / 我在哪见过
- 指定姿态生图（OpenPose + SDXL）、深度感知构图（Depth + SD3）、精确布局（Canny/Scribble）、背景替换（Seg + 局部重绘）。
- 生产图生图 SaaS 常叠 1–3 个 ControlNet + 2–5 个 LoRA + IP-Adapter。
- 常配合 IP-Adapter（用 [[CLIP]] 图塔把参考图当条件）做"参考图风格+精确构图"。

## 关联
- 前置知识：[[Stable Diffusion]]
- 相关：[[CLIP]]（IP-Adapter 经 CLIP 图塔）、[[LoRA Low-Rank Adaptation]]（结构 vs 语义正交）
- 反例/误区：用提示词硬描述空间布局（文字说不清约 90% 的图像信息）；多 ControlNet 权重全拉满导致过冲

## 来源
- Zhang, Rao & Agrawala, 2023, "Adding Conditional Control to Text-to-Image Diffusion Models"（ControlNet）
- AIEFS Vol.4 LLMs, ch.11 ControlNet, LoRA & Conditioning
