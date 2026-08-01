---
类型: 概念
主题: 现代AI Agent与生态
tags:
  - AI智能体知识库
  - 现代AI Agent与生态
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6ouo18mbob
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:29.138Z
---

# Computer Use

## 一句话定义
> Computer Use（计算机使用）指让 Agent 像人一样"看屏幕、移动鼠标、敲键盘"来操作图形界面（桌面/网页/App），核心是基于视觉的 GUI grounding：看截图→输出动作→执行→观察新状态→循环。

## 它解决什么问题 / 为什么存在
- 很多软件没有 API，只有图形界面；让 Agent 直接操作 UI 就能自动化那些"没人写接口"的任务。
- 比"调 API"更通用：任何人类能在屏幕上做的，理论上 Agent 都能做。

## 核心原理（大二电子信息工程专业学生能懂）
- **GUI grounding（图界面定位）**：给截图+自然语言指令，模型输出要点的 (x, y) 坐标或动作。SeeClick（2024）首个大规模验证；CogAgent 加高分辨率编码；Ferret-UI 做移动端。
- **动作 schema（6-10 种）**：`click(x,y)`、`type(text)`、`scroll`、`drag`、`select`、`hover`、`navigate(url)`、`wait`、`done`。
- **两种输入模式**：
  - 仅截图：最通用，任何 App 都能用；
  - 无障碍树（accessibility tree）：结构化 DOM/UI 层级，定位更稳；
  - 混合（hybrid）：两者都用，生产首选。
- **长程记忆**：20 步任务产生 20 张截图，上下文会爆；用 summary-chain（每几步总结丢旧图）、跳过帧、或"工具记录日志"压缩（Claude computer-use 用日志模式）。
- **难点**：细粒度定位、长程规划漂移、错误恢复（点错按钮怎么救）、跨页面丢状态。

## 关键参数 / 易错点
- 错误会逐步累积：一步点错，后面全偏，必须做好恢复与 `done` 判定。
- 坐标漂移：截图间若元素移位，用 `element_desc` 语义提示重新定位。
- 基准仍难：2026 年 AgentVista 等最难基准上，前沿模型也只有约 27-40% 成功率。

## 类比（帮助理解）
- 像给模型"眼睛+手"：它看屏幕决定点哪，手去点，再看结果。

## 设计时怎么用（反推思维）
> 做要自动化无 API 的旧软件/网页时，我会用 Computer Use + 混合输入（截图+无障碍树），并加最大步数与错误恢复，而不是纯靠模型自由发挥。

## 典型应用 / 我在哪见过
- 自动填表、旧系统操作、跨 App 工作流；与 [[GUI Agent]]、[[Browser Agent]] 同源。

## 关联
- 前置知识：[[Agent]], 多模态（如相关）, [[工具 Tool]]
- 相关：[[GUI Agent]], [[Browser Agent]], [[函数调用 Function Calling]], [[Agent 安全门禁]]
- 反例/误区：认为 Computer Use 能稳定完成长任务——当前长程成功率仍有限，需人机协作/重试。

## 来源
- ai-engineering-from-scratch 仓库 `phases/12-multimodal-ai/25-multimodal-agents-computer-use/docs/en.md`
- Anthropic Computer Use 文档 / 通用认知
