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
  id: task-msab6olosonrhi
decision-suggestions:
  - "39 篇笔记标签相似但未互链: 建议补充 [[20-📚资料库/教程/49-AIEFS Vol5-智能体.md]] → [[10-🧠核心概念/现代AI Agent与生态/进化式编码.md]] (相似度: 50%)"
decision-generated: 2026-08-01T13:21:28.365Z
---

# Pydantic AI

## 一句话定义
> Pydantic AI 是一个 Python Agent 框架，把"类型安全"和"结构化输出"放在第一位：用 Pydantic 模型定义 Agent 的输入/输出/工具 schema，自动对接多家模型（OpenAI、Anthropic、Gemini 等）。

## 它解决什么问题 / 为什么存在
- 很多 Agent 代码里 JSON schema 与 Python 类型各写一遍，容易不一致、易错。
- Pydantic AI 让你用熟悉的 Pydantic 模型声明"期望输出长什么样"，框架负责生成对应 provider 的 strict schema 并做校验。

## 核心原理（大二电子信息工程专业学生能懂）
- **output_type**：给 Agent 一个 Pydantic 模型（如 `Invoice`），模型输出被约束并校验成该类型的实例——这就是 [[结构化输出约束]] 的工程落地。
- **依赖注入 / 工具**：工具用普通 Python 函数 + 类型提示定义，支持依赖容器。
- **多 provider 适配**：同一份代码换 model 后端（GPT / Claude / Gemini）基本不改。
- 内建 `logfire` 追踪集成，便于观测（见 [[Agent 追踪 Trace]]）。
- 强调"贴近标准 Python"，不像某些框架那样造很多新概念。

## 关键参数 / 易错点
- 输出 schema 要能被 strict mode 表达：`additionalProperties:false`、所有字段进 `required`（见 [[结构化输出约束]]）。
- 模型拒绝（refusal）要当一等结果处理，不能当异常甩掉。

## 类比（帮助理解）
- 像给 Agent 套上"类型检查器"：模型说什么都先过 Pydantic 这道关。

## 设计时怎么用（反推思维）
> 做需要强类型、可校验结构化产出的 Agent（如抽取表单、分类、生成对象）时，我会用 Pydantic AI 的 output_type，少写一遍 JSON schema。

## 典型应用 / 我在哪见过
- 信息抽取流水线、需要结构化返回的 RAG、带强类型工具的 Agent 服务。

## 关联
- 前置知识：[[Agent]], [[大语言模型 LLM]], [[结构化输出约束]]
- 相关：[[工具接口设计]], [[函数调用 Function Calling]], [[LangGraph]], Pydantic（通用认知）
- 反例/误区：把 Pydantic AI 当"纯聊天框架"——它的强项在类型化/结构化，而非自由对话编排。

## 来源
- Pydantic AI 官方文档 / 通用认知
