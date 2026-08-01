---
类型: 概念
主题: 推理部署与安全对齐
tags: [AI智能体知识库, 推理部署与安全对齐]
创建: 2026-07-30
复习: 
状态: 已完成
---

# 托管LLM平台

## 一句话定义
> AWS Bedrock、Azure OpenAI、Vertex AI 三大云平台以不同策略提供 LLM API——Bedrock 做模型集市、Azure 做 OpenAI 专属、Vertex 做 Gemini 优先。

## 它解决什么问题 / 为什么存在
- 避免自建 GPU 集群的运维负担
- 统一 API 管理多模型访问
- 提供企业级安全合规（BAA、VPC、IAM、HIPAA）

## 核心原理
- **Bedrock**：模型集市——Claude/Llama/Titan/Mistral/Cohere 一个 API 访问
- **Azure OpenAI**：OpenAI 专属 + PTU 独占 GPU 预留。TTFT 约 50ms（PTU）
- **Vertex AI**：Gemini 优先 + 1M token 长上下文 + Model Garden 第三方模型
- 双厂商最低策略：任何关键调用跨 ≥2 云厂商
- Bedrock 按需 TTFT 约 75ms

## 关键参数
- Application Inference Profile (Bedrock) 最清晰的原生成本归属
- PTU 盈亏平衡 40-60% 持续利用率
- 滥用监控默认读取流量内容（企业版可关闭）

## 类比
- Bedrock = 超市、Azure = 专卖店、Vertex = 自营商场

## 关联
- 前置知识：[[vLLM 推理引擎]]
- 相关：[[AI网关]]、[[模型路由]]、[[FinOps for LLMs]]

## 来源
- AIEFS Vol.6 Production, Ch.04 "Managed LLM Platforms"
