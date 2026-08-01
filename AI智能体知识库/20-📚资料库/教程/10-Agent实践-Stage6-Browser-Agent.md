---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: Agent-Learning-Hub Stage 6
创建: 2026-07-22
状态: 种子
---

# 10-Agent实践-Stage6-Browser-Agent

## 这条教程在解决什么
- 学习让 Agent 操作公开网页：用 Playwright 做页面观察→动作选择→执行点击/输入→失败恢复→每一步记录证据（截图/DOM/action log），并建立安全边界（只做公开网页，禁止登录/绕过/批量抓取）。

## 关键内容（按 Stage 6 学习步骤提纲）
- **先立安全边界**：只做公开网页——不登录账号、不绕过验证码/付费墙、不删除/购买/发消息/提交表单、不批量爬取。Allowlist/denylist 写入 agent system prompt。
- **Browser Agent 与 API Tool 的本质区别**：输入是页面视觉/DOM/文本而非结构化参数；动作是点击/输入/滚动/等待而非调接口；失败是元素消失/页面变更/弹窗而非 HTTP 错误；证据是 screenshot/DOM 而非响应 JSON；风险是账号/隐私/误点击而非 API 权限越界。
- **最小观察-动作循环（Day 2）**：`navigate(url) → observe(title, url, visible text, screenshot path) → decide(action) → act(click/fill/wait/extract) → log(step)`。action log 用 JSONL 格式追加每一步。
- **失败恢复（Day 3）**：页面加载慢→短等待+重取 DOM；元素定位失败→换更稳定 locator 或先搜索文本；页面结构变化→重新观察不复用旧引用；弹窗→明确识别后关闭/停止；登录页→停止并报告 blocker。
- **提取公开信息（Day 4）**：公开网页摘要助手——只接收 http/https URL、不自动登录、不点击破坏性按钮、输出必须包含来源 URL、找不到信息输出"未在页面可见区域找到"不编造。
- **Agent 决策层（Day 5）**：在前四天确定性脚本上再加 LLM 动作选择。动作 schema 限制为 `{action, target, value, reason}` 的 JSON。连续两次失败强制 stop。

## 我卡住/没懂的地方
- 商业级 browser agent（如 browser-use）的视觉模型与 DOM 模型联合决策机制需要进一步学习。
- headless 浏览器中的反爬虫检测与 fingerprints 屏蔽。

## 它背后的原理（别只记操作）
- Browser Agent 的核心挑战不是"能点击"，而是"点不到时知道怎么停"和"换什么证据"。确定性脚本先行（Playwright）→ 再加 LLM 决策层，避免把 locator/等待/弹窗这些基础问题误判成模型问题。
- 安全边界先行不是保守——浏览器操作天然接触账号/隐私/平台规则，学习阶段收窄动作空间才能看清观察、决策和恢复机制。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 公开数据监控（价格/公告/新闻）、自动化测试（UI 回归）、表单填写辅助（有安全边界的公开场景）。

## 关联
- 概念：[[Browser Agent]]、[[GUI Agent]]、[[Computer Use]]、[[工具 Tool]]、[[Agent 安全门禁]]、[[Agent 权限系统]]、[[Agent 追踪 Trace]]
- 概念：[[WebArena]]、[[OSWorld]]、[[多模态]]、[[视觉理解]]
- 教程：[[10-Agent实践-Stage7-评估与安全]]

## 来源
- Agent-Learning-Hub Stage 6 README + step01-step03 + browser-agent/agent.py/policies.md
