---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: Agent-Learning-Hub Stage 8
创建: 2026-07-22
状态: 种子
---

# 10-Agent实践-Stage8-部署交付

## 这条教程在解决什么
- 把前面 Stage 做过的 Agent 收敛成一个可 clone、可配置、可观测、可扩展的真实 CLI 产品，整合 agent loop、安全门禁、trace 日志、超时/步数上限/成本上限。

## 关键内容（按 Stage 8 增量交付步骤提纲）
- **用户与任务定义**：会一点 Python 的开发者；用自然语言下任务，Agent 在权限边界内选工具执行；30 秒跑起 CLI、高风险操作触发人工确认、每次运行有 trace、超步数/超时/成本可预期失败。
- **增量交付工作流（8+1 步 MR）**：README（定义用户/任务/成功标准）→ .env.example → requirements.txt → common.py（日志/trace/成本）→ tools.py → safety.py（block/approval_required/allow 三级门禁）→ agent.py（带重试/超时/步数上限的 loop）→ cli.py（CLI 入口）→ step01_smoke.py（无 API key 也能跑的 dry-run test）。每步一个 MR merge 到 main。
- **CLI 产品化关键设计**：`python cli.py "任务描述"` 直接运行；`--approve` 参数可预先批准高危操作；`AGENT_DRY_RUN=true` 可离线验证。
- **工程约束（v1）**：仅 CLI（无 Web/Bot/GitHub Action）；工具集：读文件+计算器；需要 OpenAI 兼容 API。
- **扩展工具**：在 tools.py 中添加 TOOL_SCHEMAS 条目 → 实现对应函数 → 在 run_tool() 中分发。

## 我卡住/没懂的地方
- 实际生产级 CLI Agent（如 Claude Code）的 TUI 渲染（Ink/React）和 CLI 参数解析的复杂度远高于教学版。
- 成本上限的实现——不同模型的 pricing 差异大，需要更精细的 token 预算模型。

## 它背后的原理（别只记操作）
- "Ship"的本质不是代码量，而是让另一个开发者能 clone、配置、运行、扩展。增量交付（每步 MR merge）确保每一步都是可用的。
- 产品化至少要回答四个问题：用户是谁、任务是什么、成功标准是什么、限制是什么。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 任何内部工具（数据查询 CLI、运维诊断 CLI、自动化脚本执行器）都可以用相同的增量交付模式产品化。

## 关联
- 概念：[[Agent 部署与交付]]、[[Agent 安全门禁]]、[[Agent 追踪 Trace]]、[[Agent 运行时 Runtime]]、[[Agent 权限系统]]
- 概念：[[Claude Agent SDK]]、[[Coding Agent]]、[[Token 预算管理]]
- 教程：[[10-Agent实践-Stage1-最小Agent循环]]、[[10-Agent实践-Stage7-评估与安全]]

## 来源
- Agent-Learning-Hub Stage 8 README + SHIP_WORKFLOW.md + agent.py/cli.py/safety.py/tools.py/common.py
