# Stage 7：Evaluation, Observability, And Safety

把 agent 从“看 demo 感觉不错”推进到“可评测、可追踪、可回归、可控风险”。完成这一阶段后，你应该有一张至少 20 条任务的 eval 表格、一套 trace 日志格式、一组失败分类，以及危险动作的人类确认机制。

对应主 README 的检查项：

| 检查项 | 对应文件 |
| --- | --- |
| 准备固定测试集 | `evals/tasks.csv` + `step01_load_tasks.py` |
| 记录成功率、失败原因、工具调用次数、成本、延迟 | `scripts/eval_runner.py` |
| 会看 trace，定位失败来源 | `traces/` + `eval_common.py` |
| 危险工具加人工确认 | `safety_gate.py` + `step03_safety_gate.py` |
| 了解 prompt injection 等风险 | `safety/policy.md` |
| 用回归测试防止能力退化 | `scripts/compare_results.py` |
| **产出**（agent eval 表格） | `evals/results.csv` |

---

## 0. 材料准备（15 分钟）

选一个你在 Stage 1-6 做过的 agent：

- 最小 tool call agent
- 资料研究助手
- skill pack
- browser agent
- multi-agent writer

然后准备这个目录：

```text
stage-7/
  evals/
    tasks.csv
    results.csv
    failure_taxonomy.md
  traces/
    sample_run.jsonl
  safety/
    policy.md
    approval_checklist.md
```

本目录已经提供一套最小可运行 eval 示例：

```bash
cd stage-7
python step01_load_tasks.py
python step02_run_eval.py
python step03_safety_gate.py
```

**专题文章**：[Claude Code 权限控制原理与 Stage 7 安全门禁对照](docs/claude-code-permissions.md)

---

## 1. 先定义“成功”

没有成功标准，eval 就会变成主观打分。

建议把每个任务拆成：

| 字段 | 说明 |
| --- | --- |
| `id` | 稳定编号，例如 `rag-001` |
| `input` | 用户请求 |
| `expected_behavior` | 期望行为，不一定是唯一答案 |
| `must_have` | 必须出现的证据、字段、引用或动作 |
| `must_not` | 禁止行为，例如编造、越权、发消息 |
| `risk_level` | low / medium / high |
| `judge` | exact / rubric / human |

示例：

| id | input | expected_behavior | must_have | must_not | risk_level | judge |
| --- | --- | --- | --- | --- | --- | --- |
| rag-001 | 总结 agent memory 文档 | 给出带引用摘要 | 至少 2 个引用 | 编造不存在来源 | low | rubric |
| browser-001 | 提取公开文章标题 | 只读公开页面 | 来源 URL + 标题 | 登录或绕过限制 | medium | human |

---

## 2. 学习顺序（建议 4-5 天）

每天跟一步；**标了 ✍️ 的建议自己敲一遍**。

### Day 1 — 固定测试集

先写 20 条任务，不要急着自动化。

建议覆盖：

- 5 条 happy path
- 5 条缺信息或空结果
- 5 条工具失败或网络失败
- 3 条 prompt injection / 越权请求
- 2 条长上下文或多步任务

**✍️ 手写练习**

1. 写 `evals/tasks.csv`，至少 20 行。
2. 给每一行填 `must_have` 和 `must_not`。
3. 给每一行标 `risk_level`。

---

### Day 2 — 指标不是越多越好

最小指标集：

| Metric | 说明 |
| --- | --- |
| `success` | 是否满足任务成功标准 |
| `failure_type` | 失败分类 |
| `tool_calls` | 工具调用次数 |
| `latency_ms` | 总耗时 |
| `estimated_cost` | 估算成本 |
| `needs_human_review` | 是否需要人工复核 |

`results.csv` 建议字段：

```text
run_id,task_id,success,failure_type,tool_calls,latency_ms,estimated_cost,needs_human_review,notes
```

**✍️ 手写练习**

4. 手动跑 5 条 eval，填写 `results.csv`。
5. 计算成功率和平均工具调用次数。
6. 写 3 条失败备注，要求能复现问题。

如果还没有真实 agent，可以先运行教学版 runner 生成 baseline：

```bash
python scripts/eval_runner.py --tasks evals/tasks.csv --out evals/results.csv
```

---

### Day 3 — Trace 和失败定位

trace 不是日志越多越好，而是要能回答：失败发生在哪一层？

建议 trace 事件：

```json
{"event":"run_started","task_id":"rag-001","ts":"..."}
{"event":"model_called","model":"...","input_tokens":1234}
{"event":"tool_called","name":"search_knowledge","args":{"query":"..."}}
{"event":"tool_result","name":"search_knowledge","status":"ok","items":3}
{"event":"decision","reason":"需要引用资料后回答"}
{"event":"run_finished","success":true,"latency_ms":4200}
```

失败分类：

| Failure Type | 说明 |
| --- | --- |
| `prompt` | 指令不清、约束不够 |
| `tool_schema` | 参数设计不合理 |
| `tool_runtime` | 工具执行报错 |
| `retrieval` | 没搜到、搜错、引用错 |
| `model_reasoning` | 推理或计划错误 |
| `state` | 记忆、上下文、session 错误 |
| `permission` | 权限或安全策略阻断 |
| `environment` | 网络、依赖、页面变化 |

**✍️ 手写练习**

7. 为一次成功运行写 trace。
8. 为一次失败运行写 trace。
9. 对失败运行标注 failure type，并写出“下一步修哪里”。

---

### Day 4 — 安全门禁

危险动作必须加人工确认，不要只靠 prompt。

高风险动作例子：

- 发邮件、发消息、发布内容
- 删除、覆盖、移动文件
- 付款、下单、取消订单
- 修改权限、邀请成员
- 访问私密数据或导出数据

安全策略建议：

```text
If action.risk_level == high:
  1. 停止自动执行
  2. 展示动作、目标、影响范围、可回滚性
  3. 等待人工明确确认
  4. 记录确认人、时间、理由
```

**✍️ 手写练习**

10. 写 `safety/policy.md`，列出 high-risk actions。
11. 写 `safety/approval_checklist.md`，要求 agent 在执行前展示确认信息。
12. 给 eval 集加 3 条越权或注入任务，期望结果是拒绝或请求确认。

---

### Day 5 — 回归测试

每次改 prompt、tool schema、skill、模型版本，都应该跑回归。

推荐流程：

```text
修改前 baseline
  -> 跑 evals/tasks.csv
  -> 保存 results.csv
修改 prompt/tool/skill
  -> 再跑同一批 eval
  -> 对比 success / failure_type / tool_calls / latency
  -> 只接受有解释的变化
```

**✍️ 手写练习**

13. 选 5 条任务作为 quick regression。
14. 故意改坏一个 prompt，观察哪些任务退化。
15. 恢复后再跑一次，确认结果回到 baseline。

**完成标准**

- [ ] `evals/tasks.csv` 至少 20 条任务
- [ ] 每条任务都有 `must_have` 和 `must_not`
- [ ] `results.csv` 至少记录一次完整运行
- [ ] 有一份 `failure_taxonomy.md`
- [ ] 至少一条 trace 能定位失败层级
- [ ] 高风险动作有人工确认策略
- [ ] prompt injection / 越权任务不会被 agent 盲目执行

---

## 3. 文件说明

| 文件 | 作用 |
| --- | --- |
| `README.md` | Stage 7 学习指南 |
| `eval_common.py` | 加载任务、判定、trace、汇总 |
| `safety_gate.py` | 注入/高风险请求拦截 |
| `step01_load_tasks.py` | 查看任务集 |
| `step02_run_eval.py` | 运行 eval |
| `step03_safety_gate.py` | 安全门禁示例 |
| `evals/tasks.csv` | 固定测试集 |
| `evals/results.csv` | 每次运行结果 |
| `evals/failure_taxonomy.md` | 失败分类 |
| `traces/sample_run.jsonl` | trace 示例 |
| `safety/policy.md` | 风险动作策略 |
| `safety/approval_checklist.md` | 人工确认清单 |
| `scripts/eval_runner.py` | eval runner，可替换成真实 agent |
| `scripts/compare_results.py` | baseline 对比 |
| `docs/claude-code-permissions.md` | CC 权限原理与 Stage 7 对照文章 |

---

## 4. 常见问题

**Q: 一定要自动评测吗？**  
不用一开始就自动化。先写固定任务和人工 rubric，等任务稳定后再加脚本。

**Q: 成功率多少算好？**  
取决于任务风险。公开资料摘要 80% 可能还不够，危险操作必须接近 100% 拒绝越权请求。

**Q: 为什么要记录失败类型？**  
因为不同失败要修不同层：retrieval 失败不该靠加 prompt，tool schema 失败不该换模型。

---

## 5. 学完后

1. 回到根目录 [README.md](../README.md)，勾选 Stage 7 六项。  
2. 进入 Stage 8：把前面做过的 agent 收敛成别人能 clone、配置、运行、扩展的真实项目。

有问题时，先问三件事：这个失败能复现吗？trace 能说明哪一步错了吗？修复后 eval 会防止它再次出现吗？
