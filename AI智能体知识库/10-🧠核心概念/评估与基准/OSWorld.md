---
类型: 概念
主题: 评估与基准
tags:
  - AI智能体知识库
  - 评估与基准
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6mvccxr281
---

# OSWorld

## 一句话定义
> OSWorld 是跨应用桌面 GUI Agent 基准（Xie et al., NeurIPS 2024）：在真实 Ubuntu/Windows/macOS 上给 369 个任务，Agent 只能用键盘鼠标 + 1920×1080 截图来操作真实应用。

## 它解决什么问题 / 为什么存在
- 网页之外，Agent 还得会操作整个操作系统：配置 Linux、用 Office、改系统设置。这类"跨应用桌面自动化"能力需要独立基准。
- 它刻意用**真实 OS 截图**而非无障碍 API，逼 Agent 面对"看屏幕猜点哪"的真实难题。

## 核心原理（大二能懂的水平）
- 369 个真实电脑任务，横跨 Ubuntu、Windows、macOS。
- 自由形式的键鼠控制真实应用，观察就是 1920×1080 截图（像素级）。
- 发布时最佳模型 12.24%，人类 72.36%——差距比 WebArena 还大。
- 两大**失败模式**（设计者点名的）：
  1. GUI grounding：像素→元素的定位，模型在 1080p 下难稳定找 UI 元素。
  2. 操作知识（operational knowledge）：哪个菜单有这设置、哪个快捷键、哪个偏好面板——人类多年积累的长尾知识。

## 关键参数 / 易错点
- 跟随集：OSWorld-G（564 个 grounding 样本 + Jedi 训练集，把 grounding 与 planning 拆开单独测）；OSWorld-Human（人工 gold 动作轨迹，显示顶尖 Agent 用 1.4–2.7 倍于必要的步数——**轨迹效率差**）。
- 评测陷阱：只在 OSWorld（截图驱动）上评用 DOM/无障碍 API 的 Agent，会漏掉 grounding 挑战；只报成功率会漏掉 1.4–2.7x 的步数浪费。
- 自托管/固定环境版本重要，升级应用会破坏可比性。

## 类比（帮助理解）
- 像让一个从没用过这电脑的人，只给你屏幕截图和鼠标键盘，要他独立完成"装软件+改设置+导出文件"——难点一半在"看清按钮在哪"，一半在"知道该去哪找"。

## 设计时怎么用（反推思维）
> 做"桌面 GUI Agent（自动配环境、批处理办公软件）"时，我会用 OSWorld 式 VM 集群做评测，并把失败拆成 grounding 失败 vs planning 失败分别度量（用 OSWorld-G 思路）；同时报成功率**和**轨迹效率（步数/gold），因为光看成功率会掩盖"绕远路"。

## 典型应用 / 我在哪见过
- 作为 [[GUI Agent]] 的训练/评测靶场；Claude computer use、OpenAI CUA、Gemini 2.5 Computer Use 均受这类负载塑造。

## 关联
- 前置知识：[[GUI Agent]] [[Agent 评测基准]]
- 相关：[[WebArena]] [[AgentBench]] [[Computer Use]] [[基准 Benchmark]]
- 反例/误区：只报 OSWorld 成功率（忽略轨迹效率差）；用无障碍 API 的 Agent 却在截图基准上比（不公平也漏 grounding）。

## 来源
- AIEFS Vol.5 Agents, Ch.73 "Benchmarks: WebArena and OSWorld"（369 任务、GUI grounding/操作知识两失败模式、OSWorld-G/H）
- Xie et al., OSWorld (arXiv:2404.07972, NeurIPS 2024)
