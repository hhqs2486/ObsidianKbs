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
  id: task-msab6t146vy6vf
---

# GloVe与FastText（全局共现 / 子词 n-gram 嵌入）

## 一句话定义
> GloVe 通过对"全局词-词共现矩阵"做矩阵分解得到词向量；FastText 把词表示为"字符 n-gram 之和"，从而能为零样本未见词也算出合理向量。二者都是 Word2Vec 之后的静态词嵌入方案。

## 它解决什么问题 / 为什么存在
- Word2Vec 留下两问题：(1) 共现矩阵直接分解是否更好？(2) 未见词怎么办？GloVe 答前者，FastText 答后者；BPE 则把子词思想接到 transformer（见 [[文本处理与分词]]）。

## 核心原理（大二能懂的水平）
- GloVe：建共现矩阵 X[i][j]=词 j 在词 i 窗口内出现次数（按距离加权），训练使 v_i·v_j+b_i+b_j≈log X[i][j]，损失用 (x/x_max)^α 给高频对降权；最终向量取中心表与上下文表之和。
- FastText：词 = 其字符 n-gram（通常 3–6）向量之和，如 where→{<wh, whe, her, ere, re>, <where>}；训练同 Word2Vec。未见词（whereupon）由已知 n-gram 拼出向量。
- BPE：从字节/字符起反复合并最高频相邻对，得到覆盖一切的词表（见 [[文本处理与分词]]）。

## 关键参数 / 易错点
- GloVe 仍是静态（一词一向量，多义失效）。
- FastText 因子词对形态丰富语言（俄语/阿拉伯语）和拼写错误/新词更稳。
- BPE 的 merge 顺序在推理时按训练序应用。
- 三者都不懂上下文——上下文敏感要靠 transformer。

## 类比（帮助理解）
- GloVe 像"先统计全班谁和谁同桌，再给每个人定坐标"；FastText 像"没见过的人，看他名字由哪些常见偏旁拼成也能估个位置"。

## 设计时怎么用（反推思维）
> 需求是"通用词向量且要扛拼写错误/新词/形态丰富语言"时，选 FastText；要"通用、无 OOV 容忍"选 GloVe 300d；只要进 transformer 就直接用模型自带的分词器（BPE/WordPiece/SentencePiece），绝不另换（见 [[文本处理与分词]] [[Tokenizer]]）。2026 年这三者在多数场景被现代 [[嵌入 Embedding]]/[[嵌入模型2026]] 取代，但 FastText 的子词思想仍活在所有子词分词里。

## 典型应用 / 我在哪见过
- 早期语义相似、形态丰富语言处理、作为 NER/分类特征；BPE 是所有现代 LLM 分词基础。

## 关联
- 前置知识：[[Word2Vec词嵌入]]
- 相关：[[文本处理与分词]] [[嵌入 Embedding]] [[嵌入模型2026]] [[Tokenizer]]
- 反例/误区：用 GloVe 处理多义词（静态向量无法区分义项）。

## 来源
- AIEFS Vol.3 Language, ch.07 GloVe, FastText, and Subword Embeddings；Pennington et al. 2014 (GloVe)；Bojanowski et al. 2017 (FastText)。
