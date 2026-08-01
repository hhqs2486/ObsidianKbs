---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Google ADK

## 一句话定义
> Google Agent Development Kit（ADK）是 Google 的 Agent 开发框架（Python / TypeScript），用来以"标准化组件"构建、评估、部署运行在 Google Cloud（如 Vertex AI Agent Engine）上的 Agent。

## 它解决什么问题 / 为什么存在
- Google 想给开发者一套"从本地开发到云端部署"一站式工具链，统一 Agent、工具、模型（Gemini 为主，也支持其他）、评估与上线。
- 强调与 Google 基础设施（Vertex AI、Cloud Run）的无缝衔接。

## 核心原理（大二电子信息工程专业学生能懂）
- **Agent 类型**：LLM Agent（标准循环）、Workflow Agent（顺序/并行/循环等确定性编排）、以及自定义 Agent。
- **Tool**：函数工具、Agent-as-Tool（把子 Agent 当工具）、Google 生态工具（Search、Code、Vertex 等）。
- **Session / State / Memory**：内建会话状态与会话存储，支持多轮与记忆。
- **Eval & Deploy**：配套评估工具与一键部署到 Vertex AI Agent Engine / Cloud Run。
- 与 MCP、A2A 等开放协议互操作。

## 关键参数 / 易错点
- 深度绑定 Google Cloud 时，本地与原生云行为要注意一致（如认证、区域）。
- Workflow Agent 适合确定性流程，不要把需要模型动态决策的步骤硬塞进确定性编排。

## 类比（帮助理解）
- 像 Google 给的"Agent 全套厨房"：锅碗（组件）、灶台（Vertex AI）、菜谱（eval/deploy）都配齐。

## 设计时怎么用（反推思维）
> 做要上 Google Cloud、且希望"开发-评估-部署"一体化、用 Gemini 为主的 Agent 时，我会用 ADK 而不是自己拼框架。

## 典型应用 / 我在哪见过
- 客服 Agent、Google 生态内的自动化、需要托管部署的企业 Agent。

## 关联
- 前置知识：[[Agent]], [[编排 Orchestration]], [[大语言模型 LLM]]
- 相关：[[LangGraph]], [[Claude Agent SDK]], [[OpenAI Agents SDK]], [[MCP]], [[Agent 部署与交付]]
- 反例/误区：认为 ADK 只能在 Google 模型上跑——它支持多模型，但云部署优势在 GCP。

## 来源
- Google ADK 官方文档 / 通用认知
