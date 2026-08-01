---
类型: 概念
主题: 现代AI Agent与生态
tags: [AI智能体知识库, 现代AI Agent与生态]
创建: 2026-07-30
复习: 
状态: 已完成
---

# Agent 追踪 Trace

## 一句话定义
> Agent 追踪（Trace）是把一次 Agent 运行的全过程（模型调用、工具调用、检索、中间件、延迟、token 成本）记录成"可回放的时间线"，是调试、评估与合规审计的主线。

## 它解决什么问题 / 为什么存在
- Agent 是黑盒循环：失败发生在哪一步？是 prompt 错、工具错、检索错、还是模型错？没有 trace 只能瞎猜。
- 生产环境要"可观测"：成本归因、漂移监控、越狱信号、PII 泄漏告警都依赖统一 trace。

## 核心原理（大二电子信息工程专业学生能懂）
- **OpenTelemetry + GenAI 语义约定（semconv）**：行业标准 ingest 格式。每个 LLM 调用是一个 `span`，带属性：`gen_ai.system`、`gen_ai.request.model`、`gen_ai.usage.input_tokens`、`llm.prompts`、`llm.completions` 等。
- **采集链路**：各 SDK（OpenAI / Anthropic / Google / LangChain / LlamaIndex / vLLM）经 OTel SDK 生成 span → OTLP 发到 Collector → 落库（ClickHouse 存 span、Postgres 存元数据、S3 归档原始事件）。
- **评估回写**：采样 trace 上跑 DeepEval / RAGAS / 自写 LLM-judge，把评分作为"eval span"挂回原 trace。
- **漂移检测**：对提示词 Embedding 分布算 PSI / KL 散度，超阈值告警。
- **LangGraph 视角**：检查点（checkpoint）本身就是可重放的 trace；`get_state_history` 可时间旅行回放（见 [[LangGraph]]）。

## 关键参数 / 易错点
- 尾采样（tail sampling）：保留 100% 出错 trace + 部分成功采样，控成本。
- 隐私：trace 里可能含用户原文/工具返回，要脱敏后再存。
- 没有 trace 时，一次失败你最多猜到"大概哪类问题"，定位不到根因。

## 类比（帮助理解）
- 像给 Agent 装了"行车记录仪"：事后能逐帧看它哪一步踩了刹车、哪一步走错路。

## 设计时怎么用（反推思维）
> 做 Agent 系统时，我会从第一天就接 OTel GenAI span，把每次运行的模型/工具/延迟/成本都记录下来，否则出问题只能靠猜。

## 典型应用 / 我在哪见过
- Langfuse、Arize Phoenix、Helicone、Braintrust、OpenLLMetry 等观测平台；配合 [[Agent 回归测试]] 做回归看板。

## 关联
- 前置知识：[[Agent]], [[评估]], [[大语言模型 LLM]]
- 相关：[[Agent 部署与交付]], [[Agent 回归测试]], [[LangGraph]], [[上下文工程]]
- 反例/误区：只记"最终答案"不记过程——没有分步 trace 就无法定位失败根因。

## 来源
- ai-engineering-from-scratch 仓库 `phases/19-capstone-projects/11-llm-observability-dashboard/docs/en.md`
- OpenTelemetry GenAI semantic conventions / 通用认知
