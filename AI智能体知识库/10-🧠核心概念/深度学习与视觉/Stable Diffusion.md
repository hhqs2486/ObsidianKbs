---
类型: 概念
主题: 深度学习与视觉
tags: [AI智能体知识库, 深度学习与视觉]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Stable Diffusion

## 一句话定义
> Stable Diffusion 是"在 VAE 潜空间里跑的潜在扩散模型"：用 CLIP 把文字编码成条件，用 U-Net 一步步去噪，再用 VAE 解码回图片——开源文生图的事实模板。

## 它解决什么问题 / 为什么存在
- 直接在 512×512 像素上训 DDPM 太贵（U-Net 要看 3×512×512≈78 万输入，单图采样几十秒，训练要数百 GPU·月）。
- 潜在扩散（Rombach 2022）先让 VAE 把图压到 4×64×64 潜空间，扩散只在这小空间跑，算力降约 48×，采样从几十秒降到两秒内——这才让开源文生图真正可行。

## 核心原理（大二能懂的水平）
- 三件套（外加调度器、可选安全过滤器）：
  - VAE：冻结自编码器。编码器把图压成潜变量（图生图/训练用），解码器把潜变量还原成图。潜空间是"语义流形"，不是压缩图。
  - 文本编码器：把提示词变成 token 嵌入序列（SD 1.x/2.x 用 [[CLIP]] 文本塔；SDXL 加 CLIP-G；SD3/FLUX 用 T5-XXL）。
  - U-Net（去噪器）：SD 1.5 约 8.6 亿参数，含自注意力 + 对文本嵌入的交叉注意力，在每分辨率都把提示"注"进潜特征；SDXL 约 26 亿、FLUX 约 120 亿。
  - 调度器：决定怎么由噪声+预测推出去噪轨迹（DDIM、Euler、DPM-Solver++；默认 DPM-Solver++ 2M Karras，20–30 步）。
- 无分类器引导（CFG）：训练时 10% 概率把条件 c 丢掉，使一个网络同时会"有条件"和"无条件"去噪。推理时 `ε = ε_uncond + w·(ε_cond − ε_uncond)`。w 是引导强度（SD 默认 7.5）：w 越大越听提示的话，但多样性下降、过大出伪影。
- 衍生能力：图生图（编码后加部分噪再去噪）、局部重绘（只更新掩码区）。
- LoRA 微调：全微调要 20+GB 显存、改 8.6 亿参数；LoRA 冻结主干、只训注意力里的低秩矩阵，适配器 10–50MB，单卡几十分钟，见 [[LoRA Low-Rank Adaptation]]。

## 关键参数 / 易错点
- VAE 缩放因子 0.18215：硬编码在所有 SD 管线里，把原始潜变量归一到约单位方差。
- 引导强度 w：1≈弱条件，7.5 默认，>10 易出伪影；别一味调大。
- 调度器可热换（一行代码），有时不重训就能修采样问题。
- 易错：在像素空间训/跑扩散（太慢太贵）；或把 CFG 当成"越多越好"的旋钮（过大损质量）。

## 类比（帮助理解）
- 像"先在草图上反复涂改（潜空间去噪），定稿后再上色放大（VAE 解码）"——在草图阶段改布局便宜得多。
- 又像带字幕的雕塑：文本编码器是"解说词"，U-Net 是"按解说雕琢的工匠"，VAE 是把泥坯和成品互转的模具。

## 设计时怎么用（反推思维）
> 我要落地一个文生图功能时，会直接以 SD 模板为底座：SD 1.5（社区 LoRA 多）/SDXL（质量高）/SD3·FLUX（最新且注意 license）。用 DPM-Solver++ 跑 20–30 步，精度 float16/bf16。需要风格/角色就挂 [[LoRA Low-Rank Adaptation]]，需要精确构图就叠 [[ControlNet]]，引导强度 w 设在 7.5 左右。我绝不会从零训扩散，而是站在潜在扩散的 48× 算力红利上。

## 典型应用 / 我在哪见过
- 开源文生图（SD 1.5/SDXL/SD3/FLUX）、ComfyUI/AUTO1111 生态、各类 SaaS 出图。
- 图生图、局部重绘、LCM-LoRA 做 1–4 步实时生图。
- 几乎所有现代生图模型（含视频 DiT）都是潜在扩散的变体。

## 关联
- 前置知识：[[扩散模型 Diffusion Model]]、[[CLIP]]、[[ControlNet]]
- 相关：[[LoRA Low-Rank Adaptation]]、[[多模态]]
- 反例/误区：在像素空间直接跑扩散（贵且慢）；CFG 越大越好（过引导出伪影）

## 来源
- Rombach et al., 2022, "High-Resolution Image Synthesis with Latent Diffusion"（Stable Diffusion 论文）
- Ho & Salimans, 2022, "Classifier-Free Diffusion Guidance"（CFG）
- AIEFS Vol.2 Deep Learning, ch.28 Stable Diffusion；Vol.4 ch.10 Latent Diffusion & Stable Diffusion
