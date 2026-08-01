# RAG 检索增强生成（教学样例）

## 基本流程

1. **Ingest**：上传 PDF/Markdown，解析成 chunk。
2. **Embed**：每个 chunk 变成向量。
3. **Retrieve**：用户提问时，检索最相关的 chunk。
4. **Generate**：把 chunk 作为 context，让 LLM 生成带引用的回答。

## 为什么用 RAGFlow

RAGFlow 是文档理解型 RAG 引擎，擅长：

- 复杂 PDF / 表格 / 论文的 chunk 策略
- Hybrid retrieval（向量 + 关键词）
- 带引用的 grounded answer

Stage 2 通过 `ragflow-sdk` 调用 retrieve API，把 chunk 喂给 agent。

## 常见失败模式

- 检索为空 → 应明确说「资料中未找到」，不要编造。
- chunk 不相关 → 调 similarity_threshold 或 rerank。
- 幻觉引用 → 要求模型只引用检索到的 `[1][2]` 编号。
