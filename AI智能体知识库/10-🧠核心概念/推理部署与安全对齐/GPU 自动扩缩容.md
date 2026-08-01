---
类型: 概念
主题: 推理部署与安全对齐
tags:
  - AI智能体知识库
  - 推理部署与安全对齐
创建: 2026-07-30
复习:
状态: 已完成
task:
  id: task-msab6qyen6ztk6
---

# GPU 自动扩缩容

## 一句话定义
> 按流量自动增减 GPU 副本数：节点层用 Karpenter 配机器、调度层用 KAI 做 gang 调度、应用层用队列深度/KV 利用率等推理专属信号扩副本，而不是瞎用 GPU 利用率。

## 它解决什么问题 / 为什么存在
- 直接开 HPA + `DCGM_FI_DEV_GPU_UTIL` 当信号会翻车：GPU 利用率是"占空比"，100% 可能是 10 个请求也可能是 100 个，HPA 以为满了就不扩；而 vLLM 预分配 KV 显存常驻 ~90%，内存信号又永不触发缩容。信号在骗你。
- 多 GPU 部署还会踩"7 of 8 部分分配陷阱"：8 卡任务只凑齐 7 卡，7 台机器干等烧钱。
- GPU 冷启动慢（节点 45–60s + 模型加载 + 引擎初始化 = 2–5 分钟），扩缩容不当直接把延迟暴露给用户。

## 核心原理（大二能懂的水平）
- **三层，不是一层**：
  1. **节点供给（Karpenter）**：看 pending pod，~45–60s 配出 GPU 节点（Cluster Autoscaler 要 90–120s）。关键坑：默认 `consolidationPolicy: WhenEmptyOrUnderutilized` 会为了省钱驱逐正在跑的 GPU 任务去换更小实例——推理负载会丢请求、重加载模型、损失分钟级容量。**安全设法是 `WhenEmpty` + `consolidateAfter: 1h`**：只合并真正空载节点，绝不驱逐在跑的任务。
  2. **gang 调度（KAI Scheduler）**：多 GPU 任务"全有或全无"原子调度，避免 7-of-8 部分分配；还做拓扑感知（哪些 GPU 同 NVLink 域）、分层队列（多团队按优先级抢池）。DeepSeek-V3 67B 张量并行必须待在同一 NVLink 域，KAI 会尊重这点。
  3. **应用层信号**：用队列深度（等 prefill 的请求数）、KV cache 利用率（活跃序列占了多少块）、每副本 P99 TTFT、goodput 来扩副本。NVIDIA Dynamo Planner、llm-d WVA 直接吃这些信号，替掉 HPA。
- **解聚合 prefill/decode 时更复杂**：prefill pod 按队列深度扩、decode pod 按 KV 压力扩，llm-d 把它们暴露成独立 Service + 按角色 HPA，绝不在前面套一个 HPA。

## 关键参数 / 易错点
- **DCGM_FI_DEV_GPU_UTIL 不是扩缩容信号**：占空比指标，盲扩。改用队列深度 / KV 利用率。
- **Karpenter 默认 consolidation 会杀在跑的推理任务**：GPU 池务必 `WhenEmpty`+`consolidateAfter: 1h`。
- **冷启动成本**：从零请求 = Karpenter 45–60s + 20GB 模型加载 + 引擎初始化 ≈ 2–5 分钟。SLO 关键路径留 `min_workers=1` 热池，或用 Modal 式应用层 checkpoint。
- **gang 调度缺失 = 7-of-8 烧钱**：多节点多卡部署必须有 KAI 之类的全或无调度。

## 类比（帮助理解）
- 像餐厅排班：节点供给=招兼职（Karpenter 快招快裁但有"误裁在岗员工"风险）；gang 调度=一桌 8 人必须同时到齐才开桌，否则 7 人干坐；应用层信号=看"门口排队人数+上菜进度"决定加桌，而不是看"厨房灯亮没亮"（GPU 占空比永远亮）。

## 设计时怎么用（反推思维）
> 给 LLM 服务做弹性时，我会先用它能解决"流量峰谷下的成本与 SLO"——先按流量画像分三层：用 Karpenter 配节点（GPU 池设 WhenEmpty+1h 防误杀），用 KAI 做多卡 gang 调度防部分分配，用队列深度/KV 利用率（非 GPU 占空比）扩副本；对 SLO 关键路径留热副本对抗 2–5 分钟冷启动；若上 [[冷启动缓解]] 与 [[多区域LLM服务]] 则把冷启动与就近时延一起纳入扩缩容决策。

## 典型应用 / 我在哪见过
- Kubernetes 上跑 vLLM/SGLang/TRT-LLM 的生产服务标配三层扩缩容。
- 解聚合 prefill/decode（Dynamo/llm-d）下 prefill 与 decode 各自按不同信号扩。

## 关联
- 前置知识：[[冷启动缓解]]、[[多区域LLM服务]]
- 相关：[[vLLM 推理引擎]]（vLLM 预分配 KV 显存导致内存信号失效）、[[Agent 推理加速]]（Agent 流量突发，扩缩容与批处理协同）
- 反例/误区：把 GPU 占空比当 HPA 信号（永不扩）；用默认 Karpenter consolidation 驱逐在跑推理（丢请求）；多卡任务不设 gang 调度（7-of-8 烧钱）。

## 来源
- AIEFS Vol.6 Production, Ch.6 "GPU Autoscaling on Kubernetes — Karpenter, KAI Scheduler, Gang Scheduling"
