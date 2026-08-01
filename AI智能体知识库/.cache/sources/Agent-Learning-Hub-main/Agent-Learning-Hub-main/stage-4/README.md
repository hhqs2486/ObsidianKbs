# Stage 4：Multi-Agent Is Coordination, Not Magic

在 Stage 1/2 的单 agent loop 之上，学习如何把多个专用 agent 组织成一个**可控的协调系统**。

重点不是“让多个角色聊天”，而是：

- 明确每个角色的职责边界、输入输出 schema、停止条件；
- 用 pipeline / supervisor / graph 控制下一步；
- 记录 trace，知道每一步为什么发生；
- 判断什么时候单 agent 更简单、更可靠。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| 理解 planner / executor / reviewer / critic / router | `roles.py` + `step01_roles_contracts.py` |
| 用 supervisor 或 graph 管理多 agent | `coordinator.py` + `step03_supervisor_router.py` |
| 定义职责边界、输入输出 schema、停止条件 | `roles.py` + `step04_stop_conditions.py` |
| 处理循环、争论、任务漂移、上下文膨胀 | `step04_stop_conditions.py` |
| 判断什么时候单 agent 更好 | `step05_single_vs_multi.py` |
| 理解 A2A 与共享状态的边界 | [../docs/learn/a2a-vs-shared-state.md](../docs/learn/a2a-vs-shared-state.md) |
| **产出**（小型多 agent 系统） | `agent.py` |

---

## 0. 环境准备

```bash
cd stage-4
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 可选：填 OPENAI_API_KEY
```

未配置 `OPENAI_API_KEY` 时，脚本会自动使用 mock 输出，方便先理解协调流程。

验证：

```bash
python step01_roles_contracts.py
python step02_fixed_pipeline.py
python agent.py
```

延伸阅读：

- [多 Agent 交互：A2A 还是共享状态？](../docs/learn/a2a-vs-shared-state.md)

---

## 1. 为什么多 agent 不是“角色聊天”

错误方式：

```text
planner: 我觉得先查资料
writer: 我可以写
reviewer: 我来看看
planner: 那你怎么看？
...
```

这种模式很容易出现：

- 角色互相寒暄、争论；
- 没有明确 owner；
- 任务漂移；
- 上下文不断膨胀；
- 不知道什么时候结束。

正确方式：

```text
coordinator
  ├─ researcher(input: task) -> notes
  ├─ writer(input: task + notes) -> draft
  ├─ reviewer(input: task + draft) -> issues/verdict
  └─ reviser(input: draft + issues) -> final
```

**agent 只负责自己的输出，coordinator 负责路由和停止。**

---

## 2. 两种最小协调模式

### 固定 Pipeline

适合流程稳定的任务，例如研究写作：

```text
research -> write -> review -> revise
```

对应文件：

```bash
python step02_fixed_pipeline.py "写一段介绍多 agent 协调的短文"
```

优点：简单、可复现、容易测试。  
缺点：不灵活，每次都跑完整流程。

### Supervisor Router

适合下一步依赖当前状态的任务：

```text
supervisor(state) -> next role
```

对应文件：

```bash
python step03_supervisor_router.py "写一篇多 agent 最佳实践"
```

优点：可根据状态跳过、重试或结束。  
缺点：必须严格限制 `next` 的取值和最大步数。

---

## 3. 学习顺序（建议 2–3 天）

### Day 1 — 角色与契约

```bash
python step01_roles_contracts.py
```

你要理解：

- `RoleSpec` 不只是 prompt，而是职责、输入、输出、停止条件；
- reviewer 不应该改稿，reviser 不应该重新研究；
- 多 agent 的第一步是定义边界。

**✍️ 手写练习**

1. 新增一个 `fact_checker` 角色，只负责事实核对。
2. 给 `reviewer` 的 output contract 加上 `verdict: pass|revise`。

---

### Day 2 — Pipeline 与 Supervisor

```bash
python step02_fixed_pipeline.py
python step03_supervisor_router.py
```

你要理解：

- pipeline 是确定性 workflow；
- supervisor 是受限 router；
- trace 是多 agent 调试的核心证据。

**✍️ 手写练习**

3. 把 pipeline 改成 `research -> write -> fact_check -> review -> revise`。
4. 在 `supervisor` 中限制最多只能 review 两次。

---

### Day 3 — 停止条件与取舍

```bash
python step04_stop_conditions.py
python step05_single_vs_multi.py "把 hello 翻译成中文"
python agent.py "写一段解释 supervisor 模式的短文"
```

你要理解：

- 多 agent 的失败常来自停止条件不清；
- 简单任务不要上多 agent；
- 生产系统需要 trace、schema validation、max steps、fallback。

### Day 4 — A2A 还是 Shared State

阅读：[多 Agent 交互：A2A 还是共享状态？](../docs/learn/a2a-vs-shared-state.md)

你要理解：

- 同一个应用内部的多 agent，主流是 coordinator + shared state；
- A2A 更适合跨系统、跨组织、跨 runtime 的 agent 通信；
- MCP 解决 agent 调工具，A2A 解决 agent 调 agent，shared state 解决内部中间产物流转。

---

## 4. 文件说明

| 文件 | 作用 |
| --- | --- |
| `common.py` | LLM 调用 + mock 输出 |
| `roles.py` | 角色职责、输入输出契约、停止条件 |
| `agents.py` | 角色执行器 |
| `coordinator.py` | pipeline / supervisor / trace |
| `step01` … `step05` | 递增教学脚本 |
| [a2a-vs-shared-state.md](../docs/learn/a2a-vs-shared-state.md) | A2A 与共享状态的工程边界 |
| `agent.py` | Stage 4 最终产出 |

---

## 5. 完成标准

- [ ] 能解释“多 agent 是 coordination，不是群聊”
- [ ] 能给每个角色写清 input / output / stop condition
- [ ] 能跑通固定 pipeline
- [ ] 能跑通 supervisor router
- [ ] 能根据 trace 解释每一步为什么发生
- [ ] 能说出一个任务为什么不该用多 agent
- [ ] 能解释什么时候用 shared state，什么时候才需要 A2A

---

## 6. 学完后

回到根目录 `README.md`，勾选 Stage 4。  
下一步进入 Stage 5：把能力封装成可复用 Skill / Protocol / Capability Pack。
