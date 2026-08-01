---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Browser Agent

## 一句话定义
> Browser Agent 是操作"公开网页浏览器"的 Agent：用 Playwright 等驱动观察页面（标题/DOM/截图）、选动作（点击/填表/滚动/提取）、执行并记录证据，是 [[Computer Use]] 在 Web 上的具体形态。

## 它解决什么问题 / 为什么存在
- 很多信息在网页上、且网站没好用的 API；Browser Agent 让 Agent 像人一样逛网页、取信息、做简单操作。
- 它比"API 工具"更通用，但比"纯聊天"更可控——有明确的观察/动作/失败证据。

## 核心原理（大二电子信息工程专业学生能懂）
- **最小观察-动作循环**：
  `用户目标 → navigate(url) → observe(标题/文本/截图) → decide(动作) → act(click/fill/wait/extract) → log(步骤)`
- **与 API Tool 的区别**：API Tool 吃结构化参数、返回 JSON；Browser Agent 吃视觉/DOM、动作是点击输入、失败是元素消失/弹窗/遮挡。
- **安全边界（学习阶段只做公开网页）**：
  - 允许：访问公开网页、提取可见信息、点普通导航/筛选、记录截图与日志。
  - 禁止：登录账号、绕验证码/付费墙、删除/购买/发消息/提交表单、批量爬取、违反 robots。
- **失败恢复**：加载慢→短等+重取 DOM；定位失败→换稳定 locator；结构变→重新观察；进登录页→停止报告 blocker。
- **工程要点**：每次运行存 action_log（含截图路径），设 `MAX_STEPS` 防循环，模型输出先过 allowlist 再执行。

## 关键参数 / 易错点
- 不要假设旧 selector 永远有效：失败后要重新观察，以当前 DOM/截图为新证据。
- 容易碰账号/隐私/平台规则：学习阶段把动作空间收窄到公开网页。
- bug 常藏在"观察到了什么"和"为什么选这动作"之间——action log 是首要排错入口。

## 类比（帮助理解）
- 像派一个"只能看公开网页、不能登录、不能下单"的实习生去查资料并交截图笔记。

## 设计时怎么用（反推思维）
> 做网页信息抽取 Agent 时，我会先用 Playwright 写确定性脚本打通观察/等待/日志，再让模型做动作选择，并配 allowlist + 最大步数 + 登录页 blocker。

## 典型应用 / 我在哪见过
- 公开网页摘要助手、竞品信息收集、表单前的半自动调研；与 [[GUI Agent]]、[[Computer Use]] 同源。

## 关联
- 前置知识：[[Computer Use]], [[GUI Agent]], [[Agent]], [[工具 Tool]]
- 相关：[[Agent 安全门禁]], [[Agent 追踪 Trace]], [[MCP]]
- 反例/误区：直接上 browser-use 而没理解 locator/等待/日志——容易把"页面问题"误判成"模型问题"。

## 来源
- Agent-Learning-Hub 仓库 `stage-6/README.md`、`stage-6/browser-agent/`
