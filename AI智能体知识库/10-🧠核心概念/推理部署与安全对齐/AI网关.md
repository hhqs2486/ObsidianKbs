---
类型: 概念
主题: 推理部署与安全对齐
tags: [AI智能体知识库, 推理部署与安全对齐]
创建: 2026-07-30
复习: 
状态: 已完成
---

# AI网关

## 一句话定义
> 网关位于应用和模型提供商之间，提供统一路由、故障转移、重试、速率限制、密钥管理、可观测性和护栏检测。2026 年主要选择：LiteLLM（OSS <500 RPS）、Portkey（控制平面 + 护栏）、Kong AI Gateway（高吞吐量）、Bifrost（自动重试）。

## 它解决什么问题 / 为什么存在
- 产品调用 OpenAI、Anthropic 和自部署 Llama，每个提供商的 SDK、错误模型、速率限制和认证方式都不同
- 需要故障转移（OpenAI 429 → Anthropic）、统一密钥管理、多租户速率限制
- 在应用层重新造轮子让每项服务与每个提供商耦合

## 核心原理
- 六大核心功能：① 提供商路由 ② 故障转移（429/5xx → 切换到备用）③ 指数退避重试 ④ 租户/密钥/模型级速率限制 ⑤ 密钥从 vault 引用 ⑥ OTel + GenAI 属性可观测性 ⑦ 护栏（PII 脱敏、越狱检测）
- **LiteLLM**：MIT OSS, Python, 100+ 提供商，约 2000 RPS 天花板（8 GB 内存时级联故障），适合 <500 RPS
- **Portkey**：Apache 2.0（2026 年 3 月起），护栏 + PII + 审计追踪，20-40ms 延迟开销，$49/月生产版
- **Kong AI Gateway**：基于 Kong Gateway（lua + OpenResty），Kong 自身 benchmark：比 Portkey 快 228%，比 LiteLLM 快 859%，$100/model/月（Plus 最多 5 个模型）
- **Bifrost (Maxim AI)**：自动重试 + 可配置退避，OpenAI 429 回退到 Anthropic
- **Cloudflare/Vercel AI Gateway**：边缘部署，1-3ms 开销，零运维，基础重试/可观测性

## 关键参数
- 网关延迟直接加到 TTFT 上。SLA TTFT P99 < 100ms → 选 Kong/Cloudflare；< 500ms → 都可以
- 自托管 vs 托管：数据驻留是决定因素。医疗/金融 → 自托管（LiteLLM/Portkey OSS/Kong），消费级产品 → Cloudflare 托管
- 速率限制语义：LiteLLM = token-bucket；Kong = 滑动窗口；Portkey = 分层限速

## 类比
- 网关 = 大厦前台——访客只认一个入口，前台根据需求分发到不同部门

## 设计时怎么用
> 如果 RPS > 1000 且已用 Kong → Kong AI Gateway；如果需要护栏 + 审计 → Portkey OSS；如果 RPS < 500 + Python 团队 → LiteLLM

## 关联
- 前置知识：[[托管LLM平台]]
- 相关：[[模型路由]]、[[批处理API]]、[[FinOps for LLMs]]、[[Agent 安全门禁]]

## 来源
- AIEFS Vol.6 Production, Ch.22 "AI Gateways — LiteLLM, Portkey, Kong AI Gateway, Bifrost"
