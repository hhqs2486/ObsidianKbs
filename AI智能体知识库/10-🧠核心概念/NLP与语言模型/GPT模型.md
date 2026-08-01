---
类型: 概念
主题: NLP与语言模型
tags: [AI智能体知识库, NLP与语言模型]
创建: 2026-07-30
复习: 
状态: 已完成
---

# GPT模型（GPT 自回归 decoder-only 语言模型系列）

## 一句话定义
> GPT 是一类"自回归、仅解码器(decoder-only)"的语言模型：它根据前面所有 token 预测下一个 token，靠反复生成来写出整段文本。

## 它解决什么问题 / 为什么存在
- 我们需要一个能"接着写"的模型——写代码、写文章、对话。
- 用因果掩码把"预测下一个词"变成：训练时并行、推理时串行的统一任务，于是可以大规模预训练再 [[微调]]。

## 核心原理（大二能懂的水平）
- 因果掩码(causal mask)：一个上三角 −inf 矩阵加到注意力分数上，使位置 i 只能看 ≤ i 的位置（softmax 后未来权重为 0）。实现上就是 `torch.tril()`。
- 训练：一次前向算 N 个 next-token 交叉熵损失（shift-by-one，输入 t₀..tᵢ₋₁ 预测 tᵢ）。
- 推理：自回归，喂 t₁..t 得 t₊₁，用 KV cache 避免重算历史；串行深度 = 输出长度（这是延迟瓶颈）。
- 解码策略：greedy（T→0）、temperature、top-p(nucleus)、min-p、投机解码。

## 关键参数 / 易错点
- 温度 T→0 即 greedy；T 大更发散。
- 训练用 teacher forcing（喂真实上文），与推理分布不同需警惕。
- 关键区别：GPT 预测 P(xₜ|x₍<t₎)，[[BERT模型]] 预测 P(x_masked|x_unmasked)——能否生成由损失形式决定。

## 类比（帮助理解）
- 像打字机写作文，每次只根据已写内容猜下一个字；不能偷看后面的答案。

## 设计时怎么用（反推思维）
> 当需求是"生成式"任务（写代码、对话、续写、Agent 回复）时，我选 decoder-only（如 GPT/Llama/Claude 架构），因为它无 encoder 开销、易规模化、易做 [[上下文工程]]。若需求是"理解/分类/检索嵌入"，则不该用 GPT 式，而用 [[BERT模型]] 类 encoder。需要稳定 JSON 输出时，叠加 [[受限解码]]。上下文上限受 [[上下文窗口]] 约束。

## 典型应用 / 我在哪见过
- ChatGPT/Claude/Llama 系列、代码补全、对话 Agent（[[Agent]]）、各类 [[大语言模型 LLM]]。

## 关联
- 前置知识：[[Transformer]] [[注意力机制]]
- 相关：[[BERT模型]] [[T5与BART]] [[位置编码]] [[受限解码]] [[上下文窗口]] [[微调]]
- 反例/误区：把 GPT 当嵌入模型（它单向，做检索嵌入不如 BERT）。

## 来源
- AIEFS Vol.3 Language, ch.40 GPT — Causal Language Modeling；Radford et al. 2018/2019；Brown et al. 2020 (GPT-3)。
