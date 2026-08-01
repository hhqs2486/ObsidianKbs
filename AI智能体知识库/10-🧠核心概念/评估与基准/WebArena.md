---
类型: 概念
主题: 评估与基准
tags: [AI智能体知识库, 评估与基准]
创建: 2026-07-30
复习: 
状态: 已完成
---

# WebArena

## 一句话定义
> WebArena 是一个网页自动化 Agent 基准（Zhou et al., ICLR 2024）：在 4 个自托管的网站应用上给 812 个长程任务，用"执行结果"判定 Agent 是否真的把事办成了。

## 它解决什么问题 / 为什么存在
- 通用 Agent 会调工具，但它能不能连点 20 次完成一次购物车结账？能不能在论坛里发帖、在 GitLab 里关 issue？这类"跨多步操作网页"的能力需要专门基准。
- 它强调**基于执行的评测（execution-based）**：不看 Agent 说了什么，而看目标状态是否达成（订单下了没、issue 关了没、CMS 页更新没）。

## 核心原理（大二能懂的水平）
- 4 个自托管 Web 应用：购物站、论坛、类 GitLab 开发工具、企业 CMS；外加地图、计算器、便签等工具。
- 812 个长程任务，需要多步点击/填表/导航才能完成。
- 评测用 gym API 做状态检查（state check）——这是"执行即真相"的思路，比只看最终文本可靠。
- 发布时最佳 GPT-4 Agent 成功率仅 14.41%，人类 78.24%，差距巨大（在收窄，但失败模式没变）。
- 自托管很关键：目标应用版本被钉死、可复现，基准不飘。

## 关键参数 / 易错点
- 扩展集：VisualWebArena（把截图当一等观察，任务依赖看图理解）；TheAgentCompany（加终端+编码，更像真实远程办公）。
- 它测"网页长程操作"，**不测**：真实成本、对抗安全、你的业务流；只用截图式 Agent 评它会漏掉 DOM/无障碍 API 的 grounding 挑战。
- 评测别只看成功率，要同时看**轨迹效率**（步数 vs 人工最优）。

## 类比（帮助理解）
- 像让新人上公司内部系统完成"下单→发帖→关工单"一连串操作，主管不看他嘴上怎么说，只核对系统里订单/帖子/工单的最终状态。

## 设计时怎么用（反推思维）
> 做"网页操作 Agent（如自动下单、自动填表）"时，我会用 WebArena 式自托管环境做持续评测：把目标应用钉版本，用执行结果（状态检查）+ 轨迹效率双指标衡量；并针对我的 Top20 业务流录 gold 轨迹每周跑回归。

## 典型应用 / 我在哪见过
- 作为 Browser Agent（见 [[Browser Agent]]）的训练/评测靶场；Claude computer use、OpenAI CUA、Gemini Computer Use 都受这类负载塑造。

## 关联
- 前置知识：[[Browser Agent]] [[Agent 评测基准]]
- 相关：[[OSWorld]] [[AgentBench]] [[基准 Benchmark]] [[评估指标]]
- 反例/误区：用截图式 Agent 在 WebArena 上评却忽略 DOM/无障碍路径的 grounding 差异；只报成功率不看步数浪费。

## 来源
- AIEFS Vol.5 Agents, Ch.73 "Benchmarks: WebArena and OSWorld"（4 应用、812 任务、执行评测、VisualWebArena）
- Zhou et al., WebArena (arXiv:2307.13854, ICLR 2024)
