# Stage 2：Tool Use, RAG, And Memory

在 Stage 1 最小 Agent loop 之上，学习 **RAG（RAGFlow）**、**长期记忆（mem0）**、**上下文压缩（Letta）**，最终产出一个带引用的资料研究助手。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| chunk / embed / retrieve / answer with citations | `step02`–`step04` + `ragflow_helper.py` |
| 把检索、记忆接成工具 | `tools.py` + `step07` |
| 区分短期 / 会话 / 长期记忆 | `step01_memory_layers.py` |
| 工具失败、空结果、幻觉引用 | `agent.py` system prompt |
| 回答带来源或证据 | `step04` + `agent.py` |
| **产出**（资料研究助手） | `agent.py` |

---

## 0. 环境准备（15–30 分钟）

```bash
cd stage-2
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env：至少填 OPENAI_API_KEY
```

**最低配置（只跑 Step 1、3–5、7、agent）**

- `OPENAI_API_KEY` — LLM 回答 + mem0 默认后端

**完整配置（推荐）**

| 变量 | 用途 |
| --- | --- |
| `RAGFLOW_BASE_URL` + `RAGFLOW_API_KEY` | 真实 RAG 引擎 |
| `MEM0_USER_ID` | 区分不同用户的长期记忆 |
| `LETTA_API_KEY` 或 `LETTA_BASE_URL` | Step 6 上下文压缩实验 |

未配置 RAGFlow 时，`step03+` 会自动 fallback 到 `sample_docs/` 本地关键词检索，方便先跑通流程。

验证：

```bash
python step01_memory_layers.py
python step03_ragflow_retrieve.py "RAG 流程"
```

---

## 1. 三个组件怎么分工？

```text
用户提问
  ├─ search_knowledge (RAGFlow)  →  「资料里写了什么」→ 带 [1][2] 引用
  ├─ recall_user_memory (mem0)   →  「这个用户是谁/偏好什么」
  └─ messages 窗口 (OpenAI)      →  当前对话短期上下文

对话太长时（Letta）
  └─ compaction：旧消息 summarize → 腾出 token，历史仍存数据库
```

| 组件 | 解决什么问题 | 类比 |
| --- | --- | --- |
| **RAGFlow** | 外部文档检索 + grounded answer | 图书馆索引 |
| **mem0** | 跨会话用户事实记忆 | 用户档案 |
| **Letta** | 无限长对话的上下文管理 | Claude Code 的 `/compact` |

---

## 2. 第一次接触 Letta？

Letta（[github.com/letta-ai/letta](https://github.com/letta-ai/letta)）来自 **MemGPT** 论文思路：把 LLM 当作有「操作系统」的进程，由系统负责 **内存换入换出**。

### 为什么需要 Letta？

Stage 1 的 `messages` 列表会无限变长。Coding agent（如 Claude Code）聊几百轮后，要么截断（丢信息），要么爆 token。Letta 的做法是：

1. **全部消息持久化** — 数据库里永远可查
2. **只有一部分进 context window** — 当前推理可见
3. **Compaction** — 把最旧的消息用便宜模型 summarize 成一条「摘要消息」，替换掉原文

### 核心概念（5 个）

| 概念 | 说明 |
| --- | --- |
| **Agent** | 有 system prompt + memory blocks + tools 的有状态实体 |
| **Memory Block** | 钉在 prompt 里的可编辑字符串（如 `persona`、`human`） |
| **Message** | 用户 / 助手 / 工具消息；分 in-context 与 out-of-context |
| **Compaction** | 上下文压缩；默认 `sliding_window` 保留最近 ~70% 消息 |
| **Run / Step** | 一次用户输入可能触发多步 LLM 推理（工具循环） |

### Compaction 模式

- `sliding_window`（默认）：压缩较旧消息，保留最近对话
- `all`：整段历史压成一条摘要（最省 token）
- `self_compact_sliding_window`：压缩时带上 agent system prompt，利于 **prompt cache**

Step 6 会调用 `client.agents.summarize()` 手动触发压缩，并打印压缩前后消息数。

进一步阅读：[Letta Compaction 官方指南](https://docs.letta.com/guides/core-concepts/messages/compaction/)

---

## 3. 学习顺序（建议 3–5 天）

每天跟一步；**标了 ✍️ 的建议自己敲一遍**。

### Day 1 — 记忆概念 + RAG 检索

```bash
python step01_memory_layers.py
python step02_ragflow_ingest.py      # 需 RAGFlow；否则跳过
python step03_ragflow_retrieve.py "agent 记忆"
```

**你要理解的概念**

- 短期上下文 ≠ 长期记忆 ≠ 外部知识库
- RAG 链路：ingest → chunk/embed → retrieve → generate with citations

**✍️ 手写练习**

1. 在 `step01` 里加一条你自己的 `LONG_TERM_MEMORY`。
2. 运行 `step03`，手动写出 `format_chunks_for_prompt` 返回的字符串结构。

---

### Day 2 — 带引用回答

```bash
python step04_ragflow_answer.py "mem0 和 RAG 区别"
```

**单轮 RAG 数据流**

```text
question
  → retrieve(chunks)
  → 拼进 user message
  → LLM 生成 + [1][2] 引用
```

**✍️ 手写练习**

3. 改 system prompt，强制「每个 bullet 至少一个引用」。
4. 故意问知识库没有的问题，确认模型会说「未找到」。

---

### Day 3 — mem0 长期记忆

```bash
python step05_mem0_memory.py
```

**你要理解的概念**

| 概念 | 说明 |
| --- | --- |
| `m.add(messages, user_id=...)` | 从对话中抽取事实写入向量库 |
| `m.search(query, filters=...)` | 语义检索相关记忆 |
| RAG vs mem0 | RAG 查文档；mem0 记用户 |

**✍️ 手写练习**

5. 用你自己的 `user_id` 存两条偏好，再 search 验证。

---

### Day 4 — Letta 上下文压缩

```bash
python step06_letta_compaction.py
```

未配置 Letta 时会打印概念说明；配置后会创建 demo agent 并手动 compact。

**✍️ 手写练习**

6. 阅读 `step06` 顶部 Letta 介绍，用自己的话解释 compaction 和 mem0 的区别。
7. （可选）把 `sliding_window_percentage` 改成 `0.5`，观察 summary 变化。

---

### Day 5 — 工具化 + 最终 Agent

```bash
python step07_rag_as_tool.py "Agent 记忆分几层"
python agent.py "解释 context compaction 并引用资料"
```

**✍️ 手写练习**

8. 在 `tools.py` 里加一个 `list_sources` 工具，返回 `sample_docs` 文件名列表。
9. 对照 `agent.py` 自己实现 `my_research_agent.py`，加上「空检索重试一次」逻辑。

**完成标准**

- [ ] 能画出自 Stage 1 loop + RAG + mem0 的数据流
- [ ] 能口头解释 Letta compaction 解决什么问题
- [ ] `agent.py` 在知识库问题上有引用，在无资料问题上不编造
- [ ] `step05` 能搜到之前 add 的用户事实

---

## 4. 文件说明

| 文件 | 作用 |
| --- | --- |
| `common.py` | LLM 客户端 + 功能开关 |
| `ragflow_helper.py` | RAGFlow retrieve / ingest + 本地 fallback |
| `mem0_helper.py` | mem0 add / search |
| `letta_helper.py` | Letta agent + compaction |
| `tools.py` | Agent 工具 schema + 执行 |
| `sample_docs/` | 教学用 Markdown 知识库 |
| `step01` … `step07` | 递增难度 |
| `agent.py` | Stage 2 最终产出 |

---

## 5. 外部服务快速启动

### RAGFlow

```bash
# 官方 Docker 部署见 https://github.com/infiniflow/ragflow
# 默认 API: http://127.0.0.1:9380
# 在控制台创建 API Key，填入 .env
```

### mem0

默认本地 Qdrant + SQLite，只需 `OPENAI_API_KEY`。数据目录：`~/.mem0`、`/tmp/qdrant`。

### Letta

- 云端：[app.letta.com](https://app.letta.com/) 注册获取 `LETTA_API_KEY`
- 自托管：`docker run` 见 [Letta Docker 文档](https://docs.letta.com/guides/docker)，设置 `LETTA_BASE_URL`

---

## 6. 常见问题

**Q: 没装 RAGFlow，能学吗？**  
能。Step 3+ 会用 `sample_docs` 关键词 fallback。建议有精力再补 Docker 部署，体验真实 hybrid retrieval。

**Q: mem0 search 为空？**  
先跑 `step05` 写入记忆；确认 `MEM0_USER_ID` 与 search 时一致。

**Q: Letta 和 mem0 都要装吗？**  
Stage 2 设计为可渐进：mem0 + 本地 RAG fallback 即可跑通主路径；Letta 是 Day 4 专题。

**Q: 和 Stage 1 什么关系？**  
Stage 2 的 `step07` / `agent.py` 沿用 Stage 1 的 tool call loop，只是把 `calculator` 换成 `search_knowledge` / `recall_user_memory`。

---

## 7. 学完后

1. 回到根目录 [README.md](../README.md)，勾选 Stage 2 五项。  
2. 进入 Stage 3：选一个现代 agent harness（Claude Code / OpenClaw / learn-claude-code）读源码。

有问题时，优先对照 **Step 4 的 RAG 单轮流程** 和 **Step 6 的 Letta 概念表**。
