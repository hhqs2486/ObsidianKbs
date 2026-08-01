# Stage 1：Build A Minimal Agent Loop

用 Python + OpenAI 兼容 API，从零搭出「能选工具、能执行、能循环」的最小 Agent。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| LLM 普通对话 | `step01_chat.py` |
| 结构化 JSON | `step02_json.py` |
| 定义工具函数 | `tools.py` + `step03_tools_def.py` |
| 解析 tool call | `step04_one_round_tool.py` |
| 执行工具并喂回模型 | `step04` → `step05` |
| 最大步数 / 超时 / 错误处理 | `agent.py` |
| **产出**（50–150 行最小 agent） | `agent.py` |

---

## 0. 环境准备（5 分钟）

```bash
cd stage-1
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY
```

验证：

```bash
python step01_chat.py
```

---

## 1. 学习顺序（建议 2–4 天）

每天跟一步；**标了 ✍️ 的段落建议关掉参考文件，自己敲一遍**。

### Day 1 — Step 1 & 2：会调 API

```bash
python step01_chat.py
python step02_json.py
```

**你要理解的概念**

- `messages` 是对话历史（system / user / assistant / tool）
- `chat.completions.create` 是一次「模型读历史 → 生成下一条」
- `response_format={"type": "json_object"}` 约束输出为 JSON 字符串，仍需 `json.loads` 解析

**✍️ 手写练习**

1. 改 `step01_chat.py` 里的 `messages`，问一个你自己的问题。
2. 改 `step02_json.py` 的 JSON schema，让模型多返回一个字段，例如 `estimated_lines`。

---

### Day 2 — Step 3 & 4：工具从哪来、怎么接回模型

```bash
python step03_tools_def.py
python step04_one_round_tool.py
```

**你要理解的概念**

| 概念 | 说明 |
| --- | --- |
| `TOOL_SCHEMAS` | 告诉模型「有哪些工具、参数长什么样」 |
| `run_tool` | **你**写的真实逻辑，模型不会自动执行 |
| `tool_calls` | 模型说「我想调用 calculator」 |
| `role: tool` | 你把执行结果还给模型，它才能继续推理 |

**单轮数据流（务必能默画）**

```text
user 提问
  → API（带 tools）
  → assistant 返回 tool_calls
  → 你执行 run_tool
  → messages 追加 assistant + tool
  → 再调 API
  → assistant 返回最终文字
```

**✍️ 手写练习（最重要）**

3. 在空白文件里只写 `run_tool` 的两个分支（calculator / read_file），不复制粘贴。
4. 在 `step04_one_round_tool.py` 里**遮住下半部分**，自己写：
   - `messages.append(assistant 带 tool_calls)`
   - `for tc in ...: messages.append(role=tool)`
5. 把 user 问题改成：`读取 notes.txt 并总结`，确认模型会选 `read_file`。

---

### Day 3 — Step 5：Agent Loop

```bash
python step05_agent_loop.py "先读 notes.txt，再算 (10+5)*2"
```

**你要理解的概念**

- Agent loop = `while` 模型还想调工具 → 执行 → 再观察
- `MAX_STEPS` 防止死循环（模型反复调同一工具）
- 没有 tool_calls 时 = 任务结束

**✍️ 手写练习**

6. 新建 `my_loop.py`，只包含：
   - `messages` 初始化
   - `for step in range(MAX_STEPS)`
   - 一次 `create` + 判断 `tool_calls` + 追加 tool 结果  
   能跑通后再对照 `step05_agent_loop.py`。

---

### Day 4 — 最终 Agent + 自检

```bash
python agent.py "用工具计算 (100-25)/5"
```

**✍️ 手写练习**

7. 对照 `agent.py`，在 `my_agent.py` 里自己实现：
   - `try/except` 包住 API 调用
   - `timeout=60`
   - 工具执行异常时写入 tool 消息，而不是让整个程序崩溃

**完成标准（对照主 README 打勾）**

- [ ] 能解释 chatbot 与 agent 的差别（Stage 0）+ 亲手跑通过 loop
- [ ] 五个 step 脚本都能运行
- [ ] `agent.py` 在「需要工具」的问题上会调用工具，在「纯聊天」问题上可以不调用
- [ ] 你能口头说出：如果去掉 `role: tool` 那一段会发生什么？（模型看不到执行结果，会胡编）

---

## 2. 文件说明

| 文件 | 作用 |
| --- | --- |
| `common.py` | API Key、模型名、客户端 |
| `tools.py` | 工具 schema + `run_tool` |
| `notes.txt` | 给 `read_file` 演示用 |
| `step01` … `step05` | 递增难度，每步可独立运行 |
| `agent.py` | Stage 1 最终产出 |

---

## 3. 常见问题

**Q: 模型不调工具，直接编答案？**  
加强 system prompt：「需要计算/读文件时必须调用工具」；或换更强模型。

**Q: 兼容 Claude / Gemini？**  
本教程用 OpenAI `tools` 格式；原理相同，只是 SDK 字段名不同。读完 Step 4 后可看主 README 的 Claude Tool Use / Gemini Function Calling 链接做对比。

**Q: `eval` 不安全？**  
教学用。生产环境请换成 `ast.literal_eval` 或专用数学解析库。

---

## 4. 学完后

1. 回到根目录 `README.md`，把 Stage 1 六项勾上。  
2. 进入 [Stage 2](../stage-2/)：RAGFlow 检索、mem0 长期记忆、Letta 上下文压缩，做「带引用的资料研究助手」。

有问题时，优先对照 **Step 4 的单轮流程图**；90% 的 bug 是 `tool_call_id` 不匹配或漏追加 `role: tool` 消息。
