---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: Agent-Learning-Hub Stage 5
创建: 2026-07-22
状态: 种子
task:
  id: task-msab6mf0dzcci8
---

# 10-Agent实践-Stage5-Skill与能力封装

## 这条教程在解决什么
- 把一类 Agent 能力从"临时 prompt"升级成可复用、可测试、可分发的 Skill，理解 Prompt / Tool / Skill / MCP / A2A / ACP 的分层关系，写出结构清晰的 `SKILL.md`。

## 关键内容（按 Stage 5 学习步骤提纲）
- **三个边界先分清**：Prompt 是一次性指令/语气/格式约束；Tool 是可执行接口（搜索、读文件、发请求）；Skill 是可复用流程知识+模板+脚本+验收标准。四字判断：操作手册+资源包 = Skill。
- **Skill ≠ 越详细越好**：要写"稳定复用的流程"，不要把一次任务的所有背景都塞进去。触发条件要具体，避免上下文污染。
- **从 prompt 改写成 Skill（Day 1）**：拆成四段——何时使用、步骤、输出格式、验收标准。还要写一个反例：不该在什么场景使用。
- **协议和能力包的分层（Day 2）**：User task → Skill（任务流程/策略/模板/验收标准）→ Tool/MCP（连接真实工具和数据源）→ A2A（agent 间发现和协作）→ ACP（宿主应用和 agent 的交互接口）。
- **写最小 SKILL.md（Day 3）**：骨架——name/description（frontmatter）+ When To Use + Inputs + Steps + Output + Verification + When Not To Use。搭配 `templates/output.md` 约束产物，`scripts/smoke_check.py` 自动化校验。
- **Smoke Test（Day 4）**：happy path / missing info / out of scope 三个 case，验证 skill 不会变成"看起来很完整的 prompt 噪声"。
- **MCP 子模块**：从 step01_setup 到 step04_add_resources，学习 MCP server 的工具注册和资源暴露。transports.md 解释 stdio/SSE 两种传输方式。

## 我卡住/没懂的地方
- ACP（Agent Client Protocol）的具体规范细节和与 A2A 的精确分工边界。
- MCP 的 resource 与 tool 在实际工程中如何做出清晰的职责划分。

## 它背后的原理（别只记操作）
- Skill 的价值在于降低重复解释成本 + 提供验收标准 + 资源组织——不是"堆更多规则"，而是"让 Agent 只在需要时加载必要资源"。
- 协议分层本质是关注点分离：Skill 管流程知识，MCP 管工具连接，A2A 管 Agent 互操作。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 工程团队的 code review checklist、发布流程 check list、数据库迁移手册——凡是有"稳定流程+验收标准"的任务都可以封装成 Skill。

## 关联
- 概念：[[Skill 封装]]、[[工具 Tool]]、[[MCP]]、[[Prompt]]、[[A2A 协议]]、[[Agent 运行时 Runtime]]、[[Agent 安全门禁]]
- 概念：[[函数调用 Function Calling]]、[[工具描述]]、[[工具选择]]
- 教程：[[10-Agent实践-Stage4-多Agent协调]]

## 来源
- Agent-Learning-Hub Stage 5 README + step01-step04 + my-skill/SKILL.md + mcp/ + skills/teach/SKILL.md
