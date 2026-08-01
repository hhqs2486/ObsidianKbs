---
类型: 概念
主题: 推理部署与安全对齐
tags: [AI智能体知识库, 推理部署与安全对齐]
创建: 2026-07-30
复习: 
状态: 已完成
---

# FinOps for LLMs

## 一句话定义
> 传统 FinOps 在 LLM 支出上失效——成本是 token 交易而非资源占用，标签不映射。三个归因维度（按用户/任务/租户）+ 四个 token 层（prompt/tool/memory/response）+ 三层执行阶梯（速率限制→日预算上限→熔断开关）。

## 它解决什么问题 / 为什么存在
- 账单 $40,000——你不知道哪个租户花掉的、哪个功能驱使的、哪个人滥用的、是 prompt 膨胀还是工具调用还是记忆放大
- 传统 FinOps 的标签-聚合在 LLM API 调用上不起作用——你必须在调用处标记 user/task/tenant 并一路携带

## 核心原理
- **三个归因维度**：per-user（推动席位定价）、per-task + route（推动功能优先级排序）、per-tenant（推动续约定价）。从第一天就在调用处标记
- **四个 token 层**：prompt（40-60%）、tool（20-40% Agent 场景）、memory（10-30%）、response（10-30%）。全部放在一个桶里让优化变成盲人摸象
- **三层执行阶梯**：① 速率限制 per tenant（2-3 倍预期峰值，返回 429 + Retry-After）② 日预算上限（合同上限 1.5-3 倍，收紧速率 + 通知 CS）③ 熔断开关（spend z-score > 4 → 自动暂停 + 呼 on-call）
- 六种归因模式：标签-聚合（简单粗糙）→ 遥测联接（trace-ID + 计费，最高精度）→ 采样-外推 → 模型分配 → 事件溯源 → 实时流
- **单位指标**：成本/已解决工单、成本/生成文档——不是 $/M tokens
- 四重叠加节省：cache + batch + route + gateway = 原始基线的 ~5-10%

## 关键参数
- 叠加全部四条杠杆效果最大——大多数团队只用了 2-3 条
- 每个 LLM 调用发出包含 trace_id/user_id/tenant_id/task_id/route/四层 token 的归因日志
- 追溯标记总是遗漏边界情况——在创建请求时标记

## 类比
- FinOps for LLM = 公司电话账单——不是看谁占用办公室最多，而是看谁打了什么类别的电话（本地/国际/数据）并转成业务价值

## 设计时怎么用
> 第一天就标记 user_id/task_id/tenant_id。永远用"单位成本/业务产出"而非 $/M tokens 来评估效率。

## 关联
- 前置知识：[[AI网关]]、[[模型路由]]
- 相关：[[批处理API]]、[[托管LLM平台]]、[[推理指标]]
- 反例/误区：只用 $/M token——这是供应商的语言，不是产品的语言

## 来源
- AIEFS Vol.6 Production, Ch.30 "FinOps for LLMs — Unit Economics and Multi-Tenant Attribution"
