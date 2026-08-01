---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: AIGC-Interview-Book
创建: 2026-07-23
状态: 种子
task:
  id: task-msab6m34luqvez
---

# 大模型（LLM）面试高频考点

## 这条教程在解决什么
- 8 篇大模型面试笔记：从基础概念、架构、预训练、后训练到 Prompt 工程和评估
- 库中基础与入门 / 模型后训练已有大量卡片，本篇聚焦面试角度的体系和查漏补缺

## 关键内容

### 基础概念
- LLM 核心特征（大规模/Transformer/自监督/后训练对齐/上下文学习）
- Token/Tokenization（BPE/WordPiece/Unigram）
- 涌现能力 / 缩放定律 / 幻觉
- [[大语言模型 LLM]] | [[Tokenizer]] | [[Transformer]] | [[幻觉 Hallucination]]

### 模型架构
- GPT 系列演进（GPT-1→GPT-4）
- BERT 双向编码
- LLaMA 开源生态
- Qwen / DeepSeek / 百川 等国产生态

### 预训练与数据处理
- 数据清洗/去重/配比策略
- 预训练目标（AR/MLM/span corruption）
- 分布式训练（DP/TP/PP/ZeRO）
- [[预训练]]

### 后训练与对齐
- SFT → RLHF → DPO 的演化
- Constitutional AI / RLAIF
- [[SFT]] | [[RLHF]] | [[DPO]] | [[PPO]] | [[奖励模型]]

### Prompt 工程
- Few-shot / Chain-of-Thought / Self-Consistency
- 结构化 Prompt 设计模式
- [[Prompt]] | [[Few-shot]] | [[推理 Reasoning]]

### 模型评估
- 评估维度（知识/推理/安全/对齐）
- 主流 Benchmark（MMLU/HumanEval/GSM8K/MT-Bench）
- [[评估]] | [[评估指标]] | [[基准 Benchmark]]

## 面试高频 QA
- GPT 系列的核心技术演进是什么？
- RLHF 和 DPO 的本质区别？
- 怎么解释大模型的"涌现"能力？

## 关联
- 概念：[[大语言模型 LLM]] | [[Transformer]] | [[SFT]] | [[RLHF]] | [[预训练]]
- 教程：[[01-AI Agent 入门与范式]] | [[06-Agent 评估与模型后训练]]

## 来源
- AIGC-Interview-Book 大模型基础精华版（8篇）
