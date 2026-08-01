# Stage 9：Context Compaction And Memory

Stage 2 用 mem0 / Letta 体验了「记忆」与「压缩」。本阶段**从零实现**这两个机制的最小版本：不依赖外部服务，无 API key 也能跑通，重点是理解原理，再接进一个长任务 loop 看收益。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| context window 与 token 成本的关系 | `step01_window_basics.py` |
| 滑动窗口 / 摘要式压缩 | `compactor.py` + `step02` / `step03` |
| 不可丢弃锚点（系统约束、用户要求、工具 schema） | `compactor.py`（`anchor=True`） |
| 短期 / 会话 / 长期记忆区分 | `memory_store.py` + `step04` |
| 评估压缩质量（成功率、关键信息是否丢失） | `step05_loop_with_memory.py` |
| 裸 loop + compaction + memory 对比长任务表现 | `step05_loop_with_memory.py` |

---

## 0. 环境准备

```bash
cd stage-9
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # 不填 key 也能跑，摘要退化为确定性模板
```

---

## 1. 两个机制解决什么问题？

```text
长会话
  ├─ Context Compaction  →  控制「当前窗口」大小（滑动窗口 / 摘要）
  └─ Memory             →  把「跨会话事实」存下来，随时召回
```

| 机制 | 解决什么 | 类比 |
| --- | --- | --- |
| **Compaction** | 上下文无限增长撑爆 token | Claude Code 的 `/compact`、cc流程图 的 Reactive Compact |
| **Memory** | 用户事实 / 偏好跨任务丢失 | 用户档案；mem0 这类记忆层 |

对照 [Claude Code 架构流程图](../stage-3/cc流程图.jpg) 的 **Context Compact / Reactive Compact** 节点，可以理解压缩在真实 harness 里的触发时机：常规每轮压缩 + 413 紧急压缩。

---

## 2. 学习顺序（建议 2–3 天）

### Day 1 — 压缩

```bash
python step01_window_basics.py     # 看长会话如何推过 token 预算
python step02_sliding_window.py    # 滑动窗口：保留锚点 + 最近消息
python step03_summarize_compact.py # 摘要式：整段旧对话压成一条
```

**你要理解的概念**

- 主动压缩（每轮）vs 被动压缩（413 时紧急）
- 锚点（anchor）：系统约束、用户明确要求、工具 schema 永不丢弃
- 滑动窗口保留最近 N 轮；摘要式把旧内容压成一条系统消息

**✍️ 手写练习**

1. 在 `step02` 里把 `MAX_TOKENS` 调小，观察保留消息数如何变化。
2. 给一条普通消息手动加 `"anchor": True`，确认它不会被滑动窗口丢掉。

---

### Day 2 — 记忆

```bash
python step04_memory_read_write.py  # 写入用户事实并召回
```

**你要理解的概念**

| 概念 | 说明 |
| --- | --- |
| `add_memory(fact, user_id)` | 把一条事实写入 JSON 持久化 |
| `search_memory(query, user_id)` | 关键词召回相关记忆（可扩展为语义） |
| Memory vs RAG | RAG 查文档；Memory 记用户 |

**✍️ 手写练习**

3. 用自己的 `user_id` 存两条偏好，再 search 验证跨会话可用。
4. （进阶）在 `memory_store.py` 里接入 OpenAI embeddings，把关键词召回换成语义召回。

---

### Day 3 — 接进 loop

```bash
python step05_loop_with_memory.py   # 60 轮 loop：每 10 轮压缩 + 随时召回偏好
```

**单轮数据流**

```text
user turn
  → 写入 history
  → 每 10 轮 sliding_window_compact(history)
  → 任意时刻 search_memory("用户偏好")
  → assistant turn
```

**✍️ 手写练习**

5. 把 `WINDOW_BUDGET` 调到很小，对比「最终 token」与「无压缩累计 token」的差距。
6. 故意在对话里加一条「用户要求：所有输出用中文」，给它加 `anchor=True`，确认压缩后仍被保留。

**完成标准**

- [ ] 能口头解释 compaction 与 memory 的区别
- [ ] `step02` 压缩后锚点未被丢弃
- [ ] `step04` 能召回之前写入的用户事实
- [ ] `step05` 跑完能打印出 token 节省量

---

## 3. 文件说明

| 文件 | 作用 |
| --- | --- |
| `common.py` | 配置开关 + token 估算 |
| `compactor.py` | 滑动窗口 + 摘要式压缩 + 锚点保护 |
| `memory_store.py` | 长期记忆 JSON 存储与召回 |
| `step01` … `step05` | 递增难度 |
| `.env.example` | 可选 OPENAI 配置 |

---

## 4. 常见问题

**Q: 没填 OPENAI_API_KEY 能学吗？**  
能。摘要函数会自动退化为确定性模板，演示压缩结构与锚点保护逻辑。

**Q: 和 Stage 2 的 mem0 / Letta 什么关系？**  
Stage 2 是「用现成库」；Stage 9 是「自己实现一遍」，搞懂机制后更容易调参与排查。

**Q: 真实项目里怎么做？**  
生产可用 [mem0](https://github.com/mem0ai/mem0)（记忆）与 harness 自带 compaction（如 Claude Code 的 `/compact`）。本阶段代码是教学最小实现。

---

## 5. 学完后

1. 回到根目录 [README.md](../README.md)，勾选 Stage 9 各项。
2. 进入 Stage 8：把 compaction + memory 接进你自己的可部署 CLI Agent。
