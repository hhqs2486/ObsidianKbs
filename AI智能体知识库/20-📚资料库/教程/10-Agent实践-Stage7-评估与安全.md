---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: Agent-Learning-Hub Stage 7
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6mddkz0af2
---

# 10-Agent实践-Stage7-评估与安全

## 这条教程在解决什么
- 把 Agent 从"看 demo 感觉不错"推进到"可评测、可追踪、可回归、可控风险"：建立 20+ 条固定测试集、trace 日志格式、失败分类体系、危险动作人类确认机制。

## 关键内容（按 Stage 7 学习步骤提纲）
- **先定义"成功"**：每个任务拆成 id/input/expected_behavior/must_have/must_not/risk_level/judge 七个字段。没有成功标准，eval 就会变成主观打分。
- **固定测试集（Day 1）**：至少 20 条——5 happy path + 5 缺信息或空结果 + 5 工具/网络失败 + 3 prompt injection/越权 + 2 长上下文多步任务。
- **最小指标集（Day 2）**：success / failure_type / tool_calls / latency_ms / estimated_cost / needs_human_review。不是越多越好——先跑 5 条手动填 results.csv，算成功率和平均工具调用次数。
- **Trace 与失败定位（Day 3）**：trace 事件包括 run_started/model_called/tool_called/tool_result/decision/run_finished。失败分类 8 种：prompt / tool_schema / tool_runtime / retrieval / model_reasoning / state / permission / environment——不同失败修不同层。
- **安全门禁（Day 4）**：高风险动作（发邮件/删除文件/付款/修改权限/导出数据）必须人工确认。安全策略：stop → show 动作/目标/影响/可回滚性 → wait for human → log 确认人/时间/理由。`classify_request()` 三类决策：block/approval_required/allow。
- **Claude Code 权限对照**：CC 有 8 层 permission gate（全局模式→分层规则→工具级 check→Hooks→分类器→用户确认→持久化→拒绝追踪），Stage 7 的 `safety_gate.py` 是其极简教学版。
- **回归测试（Day 5）**：每次改 prompt/tool/skill 都跑同一批 eval，对比 success/failure_type/tool_calls/latency，只接受有解释的变化。

## 我卡住/没懂的地方
- LLM-as-Judge 在 rubric 评估中的一致性问题——同一任务多次评估可能结果不同。
- 企业级安全策略（远程下发、用户不可覆盖）的工程实现细节。

## 它背后的原理（别只记操作）
- 没有 eval 的 agent 只能算 demo。正确顺序是 eval（固定测试集）→ trace（看失败在哪）→ 安全门禁（控风险）→ 才加更多 agent。
- 不同失败修不同层：retrieval 失败不该靠加 prompt，tool schema 失败不该换模型。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何 Agent 产品上线前必须建立 eval 体系。ID/input/expected_behavior/must_have/must_not 七字段模板可直接套用。

## 关联
- 概念：[[评估]]、[[基准 Benchmark]]、[[Agent 追踪 Trace]]、[[Agent 安全门禁]]、[[LLM-as-Judge]]、[[轨迹评估]]、[[自动化评估]]、[[评估指标]]
- 概念：[[Agent 权限系统]]、[[经验回放与改进]]、[[Agent 部署与交付]]
- 教程：[[10-Agent实践-Stage6-Browser-Agent]]、[[10-Agent实践-Stage8-部署交付]]

## 来源
- Agent-Learning-Hub Stage 7 README + eval_common.py/safety_gate.py + evals/ + traces/ + safety/ + docs/claude-code-permissions.md
