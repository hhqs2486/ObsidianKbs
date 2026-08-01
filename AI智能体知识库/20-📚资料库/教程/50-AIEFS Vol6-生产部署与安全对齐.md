---
类型: 教程
主题: 推理部署与安全对齐
tags:
  - AI智能体知识库
  - 教程
  - AIEFS
创建: 2026-07-30
task:
  id: task-msab6lil3zderv
---

# AIEFS Vol.6 — 生产部署与安全对齐

## 概述
AI Engineering From Scratch Volume 6: Production 覆盖 LLM 推理部署基础设施和安全对齐两个核心领域。本教程梳理 Vol.6 中的关键概念。

## Part I — 基础设施与生产部署

### 托管平台与引擎
- [[托管LLM平台]] — AWS Bedrock、Azure OpenAI、Vertex AI 三大云平台策略对比
- [[PagedAttention与连续批处理]] — vLLM 调度器三大核心技术
- [[推理指标]] — TTFT、TPOT、ITL、Goodput、P99

### 模型量化与优化
- [[生产量化]] — AWQ、GPTQ、GGUF、FP8、MXFP4/NVFP4 六种格式选型
- [[冷启动缓解]] — 五层缓解手段从数分钟压到数秒
- [[多区域LLM服务]] — 缓存感知路由+数据驻留+灾难恢复

### 边缘部署
- [[边缘推理]] — Apple ANE、Qualcomm Hexagon、WebGPU/WebLLM、NVIDIA Jetson

### 成本与运维
- [[AI网关]] — LiteLLM、Portkey、Kong AI Gateway、Bifrost
- [[模型路由]] — 级联路由降低 20-60% 成本
- [[批处理API]] — 50% 折扣叠加缓存降至原始 10% 成本
- [[SRE for AI]] — 多 Agent 故障响应+运维记忆+预故障预���
- [[FinOps for LLMs]] — 按用户/任务/租户三维归因+四层 token 分离
- [[混沌工程 for AI]] — LLM 特有故障模式注入测试

## Part II — 安全、伦理与对齐

### 对齐失败模式
- [[奖励黑客]] — Goodhart 定律精化+过优化曲线+四种伪装
- [[谄媚问题]] — RLHF 放大的数学必然+反向缩放+49% 确认偏差
- [[Mesa优化]] — 学习到的内部优化器+欺骗性对齐理论框架
- [[沉睡代理]] — 后门在 SFT/RLHF/对抗训练后存活的实证
- [[对齐伪装]] — 生产模型在监控感知下自发伪装对齐
- [[AI控制]] — 在不信任强模型的前提下安全使用的协议设计

### 攻击与防御
- [[红队测试]] — PAIR 自动化黑盒越狱+JailbreakBench/HarmBench
- [[越狱攻击]] — 多轮上下文窗口利用+幂律攻击成功率
- [[间接提示注入]] — 外部内容注入+信息流控制范式

### 隐私与溯源
- [[水印技术]] — SynthID+Stable Signature+C2PA 三重溯源
- [[差分隐私]] — DP-SGD+LoRA 适配+置信度泄漏风险

### 治理
- [[AI监管框架]] — EU AI Act/US CAISI/UK AISI/韩国 AI 框架法

## 关联知识库卡片
- [[vLLM 推理引擎]]
- [[模型量化 Quantization]]
- [[投机解码]]
- [[Prompt 缓存]]
- [[Agent 安全]]
- [[GPU 自动扩缩容]]
- [[Knative 与 Agent 部署]]
- [[Agent 部署与交付]]
- [[Agent 追踪 Trace]]
- [[Agent 安全门禁]]
- [[结构化输出约束]]
- [[RLHF]]
- [[DPO]]
- [[Constitutional AI]]
- [[奖励模型]]
- [[偏好数据]]

## 来源
- AIEFS Vol.6 Production — AI Engineering From Scratch Volume 6: Production
- 25 个概念卡片基于 Vol.6 第 4-56 章提取生成
