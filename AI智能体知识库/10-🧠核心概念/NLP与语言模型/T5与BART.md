---
类型: 概念
主题: NLP与语言模型
tags:
  - AI智能体知识库
  - NLP与语言模型
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6sxpjx8yki
---

# T5与BART（统一文本到文本框架 / 去噪自编码预训练）

## 一句话定义
> T5 与 BART 都是"编码器-解码器"模型：encoder 理解源文、decoder 带交叉注意力生成输出；区别在于预训练目标——T5 是"文本到文本"统一框架，BART 是"去噪自编码"。

## 它解决什么问题 / 为什么存在
- [[GPT模型]]（仅解码）与 [[BERT模型]]（仅编码）各砍掉一半架构；但翻译/摘要/改写/语音转写等天然是"输入→输出"，encoder-decoder 最贴合。

## 核心原理（大二能懂的水平）
- T5(2019)："Text-to-Text"——所有任务都变成"文本进、文本出"，单一架构/词表/损失。预训练用 span corruption：随机遮若干 span（均长 3、共 15%），换成哨兵符 <extra_id_0> 等，decoder 只生成被遮的 span。
- BART(2019)："去噪自编码"——对输入施多种噪声（掩码/删除/填充/句子重排/文档旋转），decoder 重建干净原文。
- 推理同 GPT 自回归；翻译/摘要常用 beam search（宽 4–5）。encoder 每输入只跑一次，decoder 每步交叉注意力看同一 encoder 输出。

## 关键参数 / 易错点
- 输入输出模态不同（如语音→文本）时 encoder-decoder 尤优。
- beam search 在翻译/摘要比对话更合适（输出分布更窄）。
- decoder-only 自 2022 起抢走许多原属 encoder-decoder 的任务（因指令微调/规模化/RLHF 更易）。

## 类比（帮助理解）
- encoder 像"读懂并记笔记"，decoder 像"看着笔记写出答案"；交叉注意力是笔记与答案间唯一的连线。

## 设计时怎么用（反推思维）
> 需求是"明确输入→输出"（翻译、摘要、结构化抽取成 JSON、语音转写）时，可考虑 encoder-decoder；T5 的"文本到文本"很干净（任务名写进输入）。但若已有强指令微调 decoder-only LLM，多数任务用提示即可，不必专门上 T5/BART。需要 beam search 质量时用之。相关 [[机器翻译]] [[文本摘要]] [[GPT模型]] [[BERT模型]] [[注意力机制]]。

## 典型应用 / 我在哪见过
- 翻译（Google 栈）、语音识别（Whisper）、Flan-T5 结构化推理、摘要（BART/PEGASUS）。

## 关联
- 前置知识：[[Transformer]] [[注意力机制]]
- 相关：[[GPT模型]] [[BERT模型]] [[机器翻译]] [[文本摘要]]
- 反例/误区：用 encoder-decoder 做开放对话（不如 decoder-only）。

## 来源
- AIEFS Vol.3 Language, ch.41 T5, BART — Encoder-Decoder Models；Raffel et al. 2019 (T5)；Lewis et al. 2019 (BART)。
