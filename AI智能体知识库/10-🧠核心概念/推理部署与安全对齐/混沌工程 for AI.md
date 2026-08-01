---
类型: 概念
主题: 推理部署与安全对齐
tags: [AI智能体知识库, 推理部署与安全对齐]
创建: 2026-07-30
复习: 
状态: 已完成
---

# 混沌工程 for AI

## 一句话定义
> LLM 混沌工程是一门独立学科——LLM 栈增加了新的故障模式：tokenizer 炸弹停滞、provider 429 级联放大、KV cache 驱逐风暴导致重填预填充饱和。前提条件：SLI/SLO + 可观测性 + 自动回滚 + runbook + on-call。

## 它解决什么问题 / 为什么存在
- 4K token prompt 中一个毒害字符让 tokenizer 卡住 12 秒
- 上游 OpenAI 429 了——网关重试——你的服务在重试放大并发下 OOM
- KV cache 驱逐风暴下重填预填充级联饱和——这些都不会出现在单元测试中

## 核心原理
- **四层平面 + 反馈**：控制平面（实验调度器）、目标平面（服务/基础设施）、安全平面（熔断开关 + 爆炸半径限制 + 错误预算门控）、可观测平面（指标/追踪/日志 + trace-ID 区分混沌故障和自然故障）
- **五项 LLM 特有实验**：① 内存过载——长上下文+高并发强制 KV cache 抢占风暴 ② 网络故障——切断网关与 provider 的连通性 ③ Provider 中断模拟——100% 429 from OpenAI ④ 畸形 prompt——注入 Unicode 深度嵌套/tokenizer 炸弹 ⑤ KV 驱逐风暴——饱和 vLLM 块预算
- **安全护栏必须启用**：燃耗率警报（日常错误预算燃耗 >2 倍预期 → 暂停实验）+ 抑制窗口 + trace-ID 关联
- 节奏：每周小规模 canary + SLO 审查 → 每月计划演练 + 复盘 → 每季度跨团队韧性审计

## 关键参数
- 首发实验：杀死一个解码副本，观察重路由和恢复
- 首发 LLM 特有实验：注入 5 分钟 100% provider 429，观察故障转移——大多数团队发现他们的故障转移根本没测过
- 工具：Harness CE（商业 + AI 推荐 + MCP 工具）、LitmusChaos（CNCF 已毕业）、Chaos Mesh（CNCF sandbox K8s 原生）

## 类比
- 混沌工程 = 消防演习——不是在真的火灾里练习，但你得知道着火时系统怎么反应

## 设计时怎么用
> 没有定义 SLI/SLO 绝对不要在生产环境跑混沌。从 canary（5% 生产流量）开始，逐步提高爆炸半径。永远先跑 pod-kill，再跑 provider 故障模拟。

## 关联
- 前置知识：[[SRE for AI]]、[[Agent 追踪 Trace]]
- 相关：[[推理指标]]、[[多区域LLM服务]]、[[AI网关]]
- 反例/误区：把传统的网络混沌工具直接套用在 LLM 栈上——tokenizer 炸弹和 KV 风暴是 LLM 特有的

## 来源
- AIEFS Vol.6 Production, Ch.27 "Chaos Engineering for LLM Production"
