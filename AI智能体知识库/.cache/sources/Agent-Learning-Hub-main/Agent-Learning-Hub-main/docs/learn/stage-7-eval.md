# 为什么 Eval 先于更多 Agent

Stage 7 的核心判断：

> 没有 eval 的 agent 只能算 demo。先有固定测试集和失败分类，再加复杂度。

这篇笔记解释为什么"先 eval，再加更多 agent"不是官僚流程，而是防止退化的唯一抓手。

---

## 1. 先给结论

```text
正确顺序：
  eval（固定测试集） → trace（看失败在哪） → 安全门禁（控风险） → 才加更多 agent

错误顺序：
  堆更多 agent → 不知道为什么变差 → 无法回归 → 越改越糟
```

Eval 给你一个**可重复的信号**：这次改动后，成功率升了还是降了？

---

## 2. Eval 数据集长什么样

参考 `stage-7/evals/tasks.csv`：

| 字段 | 含义 |
| --- | --- |
| input | 给 agent 的任务 |
| must_have | 答案必须包含的关键点 |
| must_not | 答案绝不能出现的内容（如泄密、违禁操作） |
| risk_level | 风险等级，决定是否需要人工确认 |

跑完得到 `results.csv` + `trace`：成功率、失败原因、工具调用次数、成本、延迟。

---

## 3. 常见误区

- **只看 demo**：挑几个顺眼的例子就宣称"能用了"，真实分布下一塌糊涂。
- **没有 baseline**：改了 prompt 不知道和之前比怎样，无法判断是变好还是变差。
- **忽略失败分类**：只盯成功率，不区分"工具失败 / 检索失败 / 模型失败 / 状态管理失败"，无从下手修。
- **危险工具无门禁**：发邮件、删文件、付款直接放行，一旦 agent 抽风就出事。

---

## 4. 工程建议

- 起步就攒 **20 条**以上固定任务，覆盖正常与边界；
- 每次改 prompt / 工具后跑回归，对比 `baseline`（见 `scripts/compare_results.py`）；
- 给高风险工具加 `block / approval_required / allow` 三级门禁（`safety_gate.py`）；
- 把 trace 当 debug 主线：失败发生在 prompt、工具、检索、模型还是状态，trace 会告诉你。

对应代码见 `stage-7/`。与 Stage 3 的衔接：[claude-code-permissions.md](../../stage-7/docs/claude-code-permissions.md) 把 CC 权限链路与 `safety_gate.py` 对照。

---

## 5. 自测题

1. 如果没有 baseline，你怎么判断一次 prompt 改动是变好还是变差？
2. `must_not` 字段解决什么问题？举一个该写进去的内容。
3. 失败分类里"检索失败"和"模型失败"的修复方向有何不同？
4. 为什么"先 eval 再加更多 agent"能防止退化？
