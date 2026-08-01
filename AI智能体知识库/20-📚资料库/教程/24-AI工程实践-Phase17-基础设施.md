---
类型: 教程
tags: [AI智能体知识库, 教程]
来源: ai-engineering-from-scratch Phase 17
创建: 2026-07-22
状态: 种子
---

# AI工程实践-Phase17-基础设施

## 摘要
模型训好了不意味着能用。Phase 17 覆盖 LLM 服务化的三个生产力默认项：PagedAttention（KV 缓存分页）、连续批处理（请求随时进入和离开批次）、分块预填充（长提示不阻塞短解码），以及 GPU 自动扩缩容的三层架构（Karpenter + KAI Scheduler + 应用级信号）和 EAGLE-3 投机解码的生产实践。

## 这条教程在解决什么
- 100 个用户同时调用 LLM 时，怎么避免让他们排队等待？vLLM 的三个默认项各自解决什么问题？
- GPU 集群怎么弹性扩缩容？为什么 Kubernetes 默认的 HPA 信号（``DCGM_FI_DEV_GPU_UTIL``）对 LLM 服务是错的？
- 推理速度怎么提升？投机解码的接受率（alpha）为什么是唯一需要关心的指标？
- 7 个 GPU 空闲等 1 个 GPU——为什么 gang scheduling 是 GPU 集群的必需品？

## 关键内容提纲
1. **PagedAttention** — 将 OS 虚拟内存思想搬到 KV 缓存：固定大小块（16 token/块）、块表映射逻辑→物理位置、碎片率从 60-80% 降到 <4%；Llama 3.3 70B 单序列 8192 token 的 KV 缓存约 1.25GB
2. **连续批处理** — 在每次解码迭代之间：完成序列退出、新请求加入、前向传播全批量运行；不需要等一个窗口填满，也不需要等最慢序列
3. **分块预填充** — 32k token 的提示被切成 ~512 token 块，块之间插播解码 token；保护的是 P99 TTFT 尾部而非平均吞吐量
4. **三项默认的协同** — Llama 3.3 70B FP8、H100 SXM5、128 并发：三项全开 = 2,200-2,400 tok/s，默认 vLLM = ~1,800 tok/s，朴素 PyTorch = ~600 tok/s
5. **GPU 扩缩容三层架构** — Karpenter 节点供应（45-60s，比 Cluster Autoscaler 快 40%）、KAI Scheduler gang 调度（全有或全无，防止 7 等 1）、应用级信号自动扩缩（队列深度 + KV 缓存利用率取代 GPU 利用率）
6. **HPA 陷阱** — ``DCGM_FI_DEV_GPU_UTIL`` 是占空比指标，100% 可以是 10 个请求也可以是 100 个；vLLM 预分配 KV 缓存使内存始终接近 90%，内存 HPA 永远不会缩容
7. **Karpenter 合并陷阱** — ``consolidationPolicy: WhenEmptyOrUnderutilized`` 会终止正在运行的 GPU 作业来迁移到更便宜实例；安全设置是 ``WhenEmpty + consolidateAfter: 1h``
8. **EAGLE-3 投机解码** — 在目标模型的隐藏状态上训练轻量草案头（而非独立小模型），接受率 alpha 从 0.4 提升到 0.6-0.8；alpha < 0.55 时高并发下投机解码净负收益

## 我卡住/没懂的地方
- vLLM v0.18.0 中 chunked prefill 与 draft-model spec decode 互斥——选择哪个对哪种流量形态更优？
- 解耦预填充/解码（disaggregated prefill/decode）下两组 Pod 的扩容信号应该不同，但实际工程中怎么协调两者的扩缩节奏？
- EAGLE-3 的草案头训练需要多少数据和多长时间？对多领域（代码+通用+医疗）的混合流量是训一个通用草案头还是多个专用草案头更优？

## 它背后的原理
- 解码是内存带宽瓶颈而非计算瓶颈——H100 上 Llama 3.3 70B 每次解码读 ~140 GB/s 权重但 GPU 算力几乎空闲；投机解码就是利用这个算力缺口
- PagedAttention 的核心洞察：KV 缓存不是连续的而是分页的——就像 OS 不需要给每个进程预留最大内存一样，推理引擎也不需要给每个序列预留最大 token 长度
- GPU 扩缩容的本质矛盾是"节点供应慢（分钟级）vs 请求到来快（秒级）"——冷启动 2-5 分钟意味着必须保持预热池

## 我能复用/改编的点
- vLLM 调度器模拟器（朴素/静态/连续/连续+分块四种模式对比）是团队培训神器
- GPU 扩缩容决策树（节点→Karpenter，调度→KAI，副本→Dynamo Planner/llm-d）可直接套用到 Kubernetes 部署
- EAGLE-3 的生产部署检查清单（测基线→启配置→测 alpha→门控 alpha≥0.55→观察 P99 ITL）是通用方法论

## 关联
- 概念：[[推理模型]]、[[大语言模型 LLM]]、[[Agent 安全]]、[[Agent 评测基准]]、[[Claude Agent SDK]]、[[OpenAI Agents SDK]]、[[LangGraph]]、[[AutoGen]]
- 项目：[[ ]]

## 来源
- ai-engineering-from-scratch Phase 17: Infrastructure & Production，子主题 03-05
- vLLM docs: PagedAttention, Continuous Batching, Chunked Prefill, Speculative Decoding
- Karpenter Disruption Controls; KAI Scheduler GitHub; NVIDIA Dynamo Planner
- EAGLE-3 paper; BentoML Speculative Decoding production checklist
