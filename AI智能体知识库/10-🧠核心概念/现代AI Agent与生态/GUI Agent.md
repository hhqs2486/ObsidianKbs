---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# GUI Agent

## 一句话定义
> GUI Agent 是专门操作"图形用户界面"的 Agent：通过截图/无障碍树感知界面，输出点击、输入、滚动等动作，完成多步 UI 任务（区别于只调 API 的 Agent）。

## 它解决什么问题 / 为什么存在
- 大量生产力藏在 GUI 里（ERP、旧 Web 后台、设计软件），没有干净 API。
- GUI Agent 把"人盯屏幕点按钮"变成"模型盯屏幕点按钮"，自动化面更广。

## 核心原理（大二电子信息工程专业学生能懂）
- 与 [[Computer Use]] 同根：感知→推理→动作→观察→重复。
- **感知两种方式**：纯视觉（截图）或结构化（accessibility tree / DOM），生产多用 hybrid。
- **动作空间**：click / type / scroll / drag / select / hover / navigate / done（与 Computer Use 动作 schema 一致）。
- ** grounding 模型**：VLM 输出坐标或元素引用；前沿如 Qwen2.5-VL-72B 在 ScreenSpot-Pro 约 85%。
- **评测**：ScreenSpot-Pro（ grounding）、VisualWebArena（端到端网页）、AgentVista（12 域最难真实工作流，前沿仅 ~27-40%）。

## 关键参数 / 易错点
- 长任务易"漂移"：10 步后偏离目标，需要显式重规划与记忆压缩。
- 错误恢复弱：点错按钮后缺乏训练数据来自我纠正，要显式加恢复钩子。
- 移动端小元素（"点小 X"）定位失败率高。

## 类比（帮助理解）
- 像一个"蒙眼被摘掉、改戴眼镜的实习生"：靠看屏幕学会操作软件。

## 设计时怎么用（反推思维）
> 做要自动化"只有界面没有接口"的软件时，我会用 GUI Agent + 无障碍树做主定位、截图做语义补充，并为长任务加 summary-chain 记忆与最大步数。

## 典型应用 / 我在哪见过
- RPA 替代、旧系统自动化、跨应用工作流；与 [[Computer Use]]、[[Browser Agent]] 是同一技术族。

## 关联
- 前置知识：[[Computer Use]], [[Agent]], 多模态（如相关）
- 相关：[[Browser Agent]], [[工具 Tool]], [[Agent 安全门禁]]
- 反例/误区：把 GUI Agent 当精确 API——它定位有误差，关键操作要校验+门禁。

## 来源
- ai-engineering-from-scratch 仓库 `phases/12-multimodal-ai/25-multimodal-agents-computer-use/docs/en.md`
- 通用认知
