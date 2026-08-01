---
类型: 概念
主题: 深度学习与视觉
tags: [AI智能体知识库, 深度学习与视觉]
创建: 2026-07-30
复习: 
状态: 已完成
---

# CLIP

## 一句话定义
> CLIP 用"对比学习"把图像和文字塞进同一个向量空间——配对的(图,文)挨得近、不配对的拉远，于是用文字就能直接检索/分类图像，无需为每类单独标注。

## 它解决什么问题 / 为什么存在
- 传统分类器是"封闭词表"：在 1000 类 ImageNet 上训的模型只能吐那 1000 个标签，每加一类就要新标注、重训头。
- CLIP（Radford 2021）在 4 亿(图,文)对上训，得到"开放词表"能力：推理时你用一句话描述新类，它就能分类——这就是零样本（zero-shot）迁移，是现代多模态系统的基石。

## 核心原理（大二能懂的水平）
- 双塔结构：图像编码器（ViT 或 CNN）和文本编码器（Transformer）各自把输入投影到同一维度（CLIP-B/32 为 512，L/14 为 1024），再做 L2 归一化、算余弦相似度。
- 对比损失：一个 batch 内 N 个(图,文)对，算 N×N 相似度矩阵，让对角线（真配对）相似度高、非对角（错配）低。对称训练：
  `loss = (CE(sim, 行目标) + CE(sim.T, 列目标)) / 2`，温度 τ 通常初始化 0.07（可学习）。
- 零样本分类：对每个类写提示 `"a photo of a {class}"`，用文本塔编码；测试图用图像塔编码；相似度取 argmax 即预测类。提示工程有效——OpenAI 用 80 个模板取平均再 +1~3% 精度。
- 改进版 SigLIP（2023）把 softmax 换成逐对 sigmoid 损失，去掉了对大 batch 的依赖，小数据也能训好。

## 关键参数 / 易错点
- 温度 τ（logit_scale）：缩放相似度矩阵，过大会让 softmax 过尖、训练不稳。
- 提示模板：单模板太弱，多模板取平均更稳（工程常见做法）。
- 评估：零样本靠"文字描述类"，若文字描述不清，分类就差——CLIP 不真正"理解"，只是在共享空间里比距离。
- 易错：以为 CLIP 能像检测/分割那样定位物体。它给的是全局对齐，精细定位要靠 Grounding DINO、SAM、CLIPSeg 等下游。

## 类比（帮助理解）
- 像把"照片"和"它的说明文字"翻译成同一种语言后放进同一本词典：查词（文字）就能翻到对应的图，无需事先规定词典里有哪些词。
- 又像双语对齐：图像塔和文本塔是两个翻译官，把图和文都译到"语义通用语"，之后任意(图文)配对都能比远近。

## 设计时怎么用（反推思维）
> 我要做"按文字搜图/零样本分类/给生图模型当文本编码器"时，会直接用 CLIP 系检查点（OpenCLIP/SigLIP）。反推：先把任务落成"图像向量 vs 文本向量比距离"——检索就编码全库图建索引、查询时编码文字；分类就编码各类提示取 argmax。这也是 [[Stable Diffusion]] 的文本条件来源、[[多模态]] VLM 的视觉塔来源。我不会为每个新类重训分类头，而是写一句话。

## 典型应用 / 我在哪见过
- 零样本分类、图文检索（FAISS 索引）、文本条件检测（Grounding DINO/OWL-ViT）、分割（CLIPSeg、SAM）。
- VLM（LLaVA、Qwen-VL）把 CLIP 视觉塔接进 LLM；文生图（SD、DALL·E 3）用 CLIP 文本塔做条件。
- IP-Adapter 用 CLIP 图像塔把参考图当条件注入扩散。

## 关联
- 前置知识：[[多模态]]
- 相关：[[Stable Diffusion]]（文本编码器）、[[ControlNet]]（常配 IP-Adapter 用 CLIP 图塔）
- 反例/误区：以为 CLIP 能做目标定位（它只有全局对齐，定位靠下游模型）

## 来源
- Radford et al., 2021, "Learning Transferable Visual Models from Natural Language Supervision"（CLIP）
- Zhai et al., 2023, "SigLIP: Sigmoid Loss for Language-Image Pre-Training"
- AIEFS Vol.2 Deep Learning, ch.35 Open-Vocabulary Vision — CLIP；Vol.5 Agents ch.05 CLIP and Contrastive VL Pretraining
