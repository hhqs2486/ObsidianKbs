---
类型: 教程
主题: NLP与语言模型
tags:
  - AI智能体知识库
  - 教程
  - NLP与语言模型
  - AIEFS
来源: AIEFS Vol.3 Language
创建: 2026-07-30
状态: 已完成
task:
  id: task-msab6lm71przdb
---

# AIEFS Vol.3 — NLP与Transformer教程笔记

> 本教程笔记源自 *AI Engineering from Scratch, Volume 3: Language*，覆盖从经典文本处理到 Transformer 深度解析的 18 个核心章节。

---

## 一、文本处理基础

### 1. 文本处理与分词（Ch.04）

**核心三步**：分词（Tokenization）→ 词干提取（Stemming）→ 词形还原（Lemmatization）。

- 分词把字符串切成 Token：词级用于传统 NLP，子词用于 Transformer。
- Porter 词干器用规则砍后缀，快但粗暴（organization→organ）。
- 词形还原需要词性标注，准确但慢（ran→run, better→good）。
- **生产铁律**：训练时的预处理函数必须作为模型包的一部分部署，训练/推理不一致是最常见的 NLP 失败。

关联卡片：[[文本处理与分词]]

### 2. TF-IDF 与词袋模型（Ch.05）

**词袋模型**丢掉顺序只数词频。**TF-IDF** 给稀有词更高权重：`TF-IDF = TF × log(N/df)`。

- 2026 年在窄分类任务上仍打败 4 亿参数嵌入模型。
- 优势：快（微秒级）、可解释（看分类器权重）、低数据无预训练成本。
- 失败：语义盲区（"not good" vs "excellent"）、OOV 无法处理。
- 混合方案：TF-IDF 权重对词嵌入加权求和，兼顾语义和稀有词强调。

关联卡片：[[TF-IDF与词袋模型]]

---

## 二、词嵌入演进

### 3. Word2Vec（Ch.06）

**分布假设**："一个词由它周围的词决定。" 两层网络，隐藏层权重就是嵌入。

- Skip-gram（中心→上下文）比 CBOW 慢但稀有词更好，成为默认。
- **负采样**把 softmax 多分类变成二分类，解决 10 万词表的计算瓶颈。
- 类比运算：`king - man + woman ≈ queen`。
- **根本局限**：一词一向量，多义词无法区分（bank=河岸=银行）。

关联卡片：[[Word2Vec词嵌入]]

### 4. GloVe 与 FastText（Ch.07）

- **GloVe**：分解共现矩阵，`v_i · v_j ≈ log(X[i][j])`，加权防高频主导。
- **FastText**：词 = 字符 n-gram 之和。未见的词也能从已知 n-gram 组合出向量。
- **BPE**：反复合并最频繁的相邻字符对，3-10 万次合并后覆盖一切文本。
- 2026 选型：GloVe 300d 通用向量、FastText 处理新词/拼写错误、BPE/SentencePiece 用于 Transformer。

关联卡片：[[GloVe与FastText]]

---

## 三、NLP 核心任务

### 5. 命名实体识别 NER（Ch.09）

**BIO 标注**把实体抽取变成序列标注：B-TYPE（开始）、I-TYPE（内部）、O（外部）。

- 架构演进：规则+字典 → HMM → CRF → BiLSTM-CRF → BERT 微调。
- 2026 年 LLM 零样本 NER 在标注数据稀缺时大幅超越微调模型。
- 经典 NER 仍在 <50ms 延迟、98%+ F1、本地非生成式需求场景中获胜。

关联卡片：[[命名实体识别NER]]

### 6. 机器翻译（Ch.14）

管线：源文本 → SentencePiece 分词 → 编码器-解码器 → 束搜索 → 解分词。

- NLLB-200 支持 200 语言互译，mBART 支持 50 语言。
- 评估三层：BLEU+chrF（快速）、COMET（语义质量）、LLM-as-judge（无参考时）。
- 失败模式：幻觉、off-target 生成、术语漂移、语体不匹配。
- 2026 年 GPT-4/Claude 在习语和长上下文翻译上已超越专用 MT 模型。

关联卡片：[[机器翻译]]

### 7. 文本摘要（Ch.15）

- **抽取式（TextRank）**：句子相似度图 + PageRank，原文照搬永不幻觉。
- **生成式（BART/T5/Pegasus）**：编码器-解码器生成新文本，流畅但可能幻觉。
- 评估：ROUGE（n-gram 重叠）+ BERTScore（语义相似度）+ G-Eval（LLM 评判）。
- 事实性风险：实体替换、数字漂移、极性翻转、事实编造。合规场景优先抽取式。

关联卡片：[[文本摘要]]

### 8. 问答系统（Ch.16）

三种架构：抽取式（找 span）、检索增强（先检索再回答）、生成式（从权重回答）。

- RAG Prompt 模式"只用上下文回答，不知道就说不知道"降低幻觉 40-60%。
- 评估：Exact Match + Token F1（SQuAD），RAGAS 四维度（忠实度/相关性/上下文精确率/召回率）。
- 拒绝校准：答案不在检索段落中时能否正确说"我不知道"。

关联卡片：[[问答系统]]

### 9. 信息检索（Ch.17）

2026 年生产默认：BM25 + 稠密检索 + RRF 融合 + 交叉编码器重排。

- BM25：<10ms/查询，精确匹配强，语义盲。
- 稠密检索：50-200ms，语义相似强，漏精确关键词。
- RRF 融合：`score = Σ 1/(k+rank)`，只用排名不用分数。
- 交叉编码器重排：top-30 → top-5，最准但最慢。
- **80% 的 RAG 失败追溯到分块，不是模型。**

关联卡片：[[信息检索]]

---

## 四、Transformer 核心组件

### 10. 注意力机制（Ch.13）

Bahdanau（2014）的修复：保留编码器每步状态，解码时动态加权平均。

- Query（解码器状态）→ 对 Key（编码器状态）打分 → softmax → 加权 Value。
- Bahdanau 加性 vs Luong 乘性：乘法更简单，同样准确。
- QKV 是从经典注意力到 self-attention 的概念桥梁。
- **注意力权重 ≠ 解释**：替换权重可能不改变预测。

关联卡片：[[注意力机制]]

### 11. 位置编码（Ch.37）

注意力排列不变，必须注入位置信息。三种方案：

| 方案 | 外推能力 | 2026 使用者 |
|------|---------|------------|
| 绝对正弦 | 差 | 原始 Transformer |
| RoPE | 好（配合缩放） | Llama/Qwen/Mistral/DeepSeek |
| ALiBi | 优秀 | BLOOM/MPT |

- RoPE 旋转 Q/K，点积只依赖相对距离。base 参数是扩展上下文的旋钮。
- YaRN/LongRoPE/NTK-aware 是 RoPE 的长上下文扩展技术。

关联卡片：[[位置编码]]

### 12. BERT（Ch.39）

双向编码器 + 遮罩语言模型（MLM）。15% Token 中 80% [MASK]、10% 随机、10% 不变。

- 每个位置看到所有位置——双向是 BERT 相对 GPT 的核心优势。
- 2026 年仍是分类/检索/NER/重排器的最佳选择（比解码器快 5-10×）。
- ModernBERT（2024）：RoPE + RMSNorm + GeGLU + 8K 上下文 + Flash Attention。

关联卡片：[[BERT模型]]

### 13. GPT（Ch.40）

仅解码器 + 因果掩码（上三角 -inf 矩阵）。一行代码改变了整个 AI 领域。

- 训练并行（N 个位置一次前向传播），推理串行（逐 Token 生成）。
- 损失 = 移位交叉熵：输入 [t1,t2,t3]，目标 [t2,t3,t4]。
- 2026 解码默认：min-p + temperature 0.7。Speculative decoding 是生产标配。
- 核心架构自 GPT-2 以来变化不大，分离模型的是数据、规模和后训练。

关联卡片：[[GPT模型]]

### 14. T5 与 BART（Ch.41）

编码器+解码器 = 输入→输出任务的最佳架构。

- T5：span corruption 预训练 + "文本到文本"统一所有任务。
- BART：多噪声去噪预训练，解码器重建完整原始序列。
- 交叉注意力是编码器信息进入解码器的唯一管道。
- 2022 年后解码器仅模型蚕食大部分领地，编码器-解码器守住语音/翻译/束搜索质量。

关联卡片：[[T5与BART]]

---

## 五、生产 NLP 技术

### 15. 受限解码（Ch.23）

在每步生成时把无效 Token logit 设为 -inf，100% 保证输出格式合法。

- Outlines（FSM）、XGrammar/llguidance（CFG）、vLLM guided decoding、Instructor（重试）。
- 反直觉：受限解码经常比自由生成更快（缩小搜索空间+跳过强制 Token）。
- **字段顺序陷阱**：永远 reasoning 在前，answer 在后。

关联卡片：[[受限解码]]

### 16. 分块策略（Ch.26）

分块配置对检索质量的影响不亚于嵌入模型选择。

- 六种策略：固定、递归、语义、句子、父文档、晚期分块、上下文检索。
- 2026 发现：递归 512 击败语义分块 69%→54%；重叠通常无益。
- 块大小匹配查询类型：事实 256-512、分析 512-1024、全节 1024-2048。
- 上下文悬崖：约 2500 Token 处质量急剧下降。

关联卡片：[[分块策略]]

### 17. 嵌入模型 2026（Ch.25）

五轴选择：稠密/稀疏/多向量、语言、上下文长度、维度、开源/托管。

- BGE-M3 一个模型输出三种表示（稠密+稀疏+ColBERT）。
- Matryoshka 截断：1536→256 维只损失约 1%，存储省 6 倍。
- 三层模式：稠密初筛 → 稀疏+RRF 召回提升 → ColBERT/重排器精度。
- MTEB 排行榜必要但不充分——必须在你的领域上测。

关联卡片：[[嵌入模型2026]]

### 18. RAG 评估（Ch.30）

LLM-as-judge 替代精确匹配和人工审核。

- RAGAS 四维度：忠实度、答案相关性、上下文精确率、上下文召回率。
- G-Eval：自定义标准 + 思维链评估步骤。
- 校准：100 条人工标注算 Spearman ρ > 0.7 才信任。
- CI 门：DeepEval + pytest，faithfulness≥0.85 阈值拦截回归。
- 评判用不同模型族，避免自我评估膨胀 10-20%。

关联卡片：[[RAG评估方法]]

---

## 知识脉络图

```
文本处理与分词 → TF-IDF与词袋模型 → Word2Vec词嵌入 → GloVe与FastText
                                                              ↓
                                                    嵌入模型2026
                                                              ↓
                                                    分块策略 → 信息检索
                                                                   ↓
注意力机制 → Transformer → BERT模型 / GPT模型 / T5与BART        ↓
                 ↓               ↓           ↓              问答系统
              位置编码        命名实体识别   受限解码            ↓
                                                           RAG评估方法

机器翻译 ←←←←← T5与BART + 注意力机制
文本摘要 ←←←←← T5与BART
```

## 来源

- AIEFS Vol.3 Language, Ch.04-41（18 个核心章节）
- 原始课程：https://aiengineeringfromscratch.com
- 代码仓库：https://github.com/rohitg00/ai-engineering-from-scratch
