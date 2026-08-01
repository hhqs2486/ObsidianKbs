---
类型: 概念
主题: 推理部署与安全对齐
tags: [AI智能体知识库, 推理部署与安全对齐]
创建: 2026-07-30
复习: 
状态: 已完成
---

# SRE for AI

## 一句话定义
> AI SRE 使用 LLM 通过 RAG 接入基础设施数据（日志/runbook/服务拓扑）来自动化故障调查、文档记录和协调阶段。2026 架构模式是多 Agent 编排——专业 Agent（日志/指标/runbook）由监督者协调，AI 提出假设和人批准判断。

## 它解决什么问题 / 为什么存在
- 凌晨 3 点值班工程师被叫醒——查 Datadog、Loki、3 本 runbook、部署记录，30 分钟后发现根因是 vLLM OOM（KV cache 尖峰）
- 前 20 分钟调查可自动化：按服务分组日志 → 关联最近部署 → 匹配 runbook → 都是 RAG + 工具调用

## 核心原理
- **多 Agent 架构**：监督者分解故障为子查询 → Log Agent（日志搜索）/ Metric Agent（PromQL）/ Runbook Agent（文档检索）→ 监督者综合 → 输出假设 + 证据 → 人类批准 → 执行
- **安全自动修复范围**：窄操作（重启 Pod、回滚特定部署、在预定范围内扩展池、启用预批准特性开关）——不是重架构系统
- **对抗评估**（NeuBird Hawkeye）：两个模型独立分析同一故障。一致 = 高置信度，不一致 = 升级给人类（过滤幻觉根因）
- **运维记忆**：事故复盘 + runbook 存入向量数据库，新工程师入职时 AI 已有完整历史
- **预故障预测**：MIT 2025——LLM 在历史日志+GPU 温度+API 错误模式上训练，预测了 89% 的宕机（提前 10-15 分钟）

## 关键参数
- 预测没有执行措施只是仪表板——预测后的策略是什么？预排空？呼机？自动扩容？
- Runbook 从 Confluence 页面演进为版本化 Markdown（症状/假设/验证/执行结构化章节）
- 2026 产品：Datadog Bits AI、Azure SRE Agent、NeuBird Hawkeye、PagerDuty AIOps、Incident.io Autopilot

## 类比
- AI SRE = 老医生带实习医生——AI 助理先判断病因，但主治医师（人类）最后签字

## 设计时怎么用
> 从结构化现有 runbook 开始（Markdown + 标准化章节），这是 AI SRE 的食粮。首发试点：限制自动修复为"重启 Pod"——风险最低、ROI 最高。

## 关联
- 前置知识：[[Agent 部署与交付]]、[[Agent 追踪 Trace]]
- 相关：[[混沌工程 for AI]]、[[推理指标]]、[[Knative 与 Agent 部署]]
- 反例/误区："设置后就不用管"——任何卖这个说法的人都在过度承诺

## 来源
- AIEFS Vol.6 Production, Ch.26 "SRE for AI — Multi-Agent Incident Response, Runbooks, Predictive Detection"
