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
  id: task-msab6qta11a5t6
---

# vLLM 推理引擎

## 一句话定义
> vLLM 是一个高吞吐的开源 LLM 服务引擎，靠 PagedAttention（KV 缓存分页）、连续批处理、分块预填充三大默认把单卡吞吐从朴素 PyTorch 的 ~600 tok/s 拉到 ~2400 tok/s。

## 它解决什么问题 / 为什么存在
- 朴素 serve 循环一次只服务一个请求：tokenize→prefill→decode 到 EOS→返回。100 个用户就排长队。
- 静态批处理把每请求 pad 到最长，慢请求拖死整批，还白白浪费 padding 的算力。
- vLLM 让 GPU 永远满载真实工作，并几乎消除 KV 缓存碎片，是 2026 生产服务的参考引擎。

## 核心原理（大二能懂的水平）
- **PagedAttention（KV 缓存分页分配器）**：KV cache = 层数×2×头数×头维×序列长×字节数。70B 在 8192 token 下每条序列约 1.25 GB（BF16）。传统连续分配给每条都预留 8192 槽，平均只用 1500 就浪费 ~82% 显存。PagedAttention 借 OS 虚拟内存思想：KV 按固定块（默认 16 token）分配，每条序列有"块表"把逻辑位置映射到物理块；序列增长就加块，结束就回收。碎片从 60–80% 降到 <4%。它是 vLLM 唯一分配器，旋钮是 `--gpu-memory-utilization`（默认 0.9，给 KV 块预留多少 HBM）。
- **连续批处理（iteration 级）**：每步 decode 之间就决策——完成的序列移出 RUNNING，等待队列里有空闲 KV 块就放进新序列（prefill 或续跑），再融一次前向。批大小永不 pad 到定值。2026 叫 V1 调度器，不变量是"每个 decode 步调度一次，而非每个请求一次"。
- **分块预填充（Chunked Prefill）**：prefill 是计算瓶颈，32k prompt 在 H100 上约 800ms，其间同批所有 decode 都卡住。把它切成 ~512 token 的块，块间穿插推进 decode，用一点点 prefill 绝对延迟换大幅降低 decode 抖动。P99 ITL 在混合负载下从 ~50ms 降到 ~15ms。

## 关键参数 / 易错点
- **三件套默认全开**是 2026 生产默认；失败模式都在调度器，不在模型。
- **vLLM v0.18.0 互斥坑**：不能同时开 `--enable-chunked-prefill` + 草稿模型投机解码（`--speculative-model`）；唯一兼容的是 V1 的 N-gram GPU 投机解码。不看 release notes 会在启动时直接报错。
- **吞吐数字要记**：Llama 3.3 70B FP8、H100 SXM5、128 并发——三件套全开 2200–2400 tok/s；默认 vLLM（无 chunked prefill）~1800；朴素 PyTorch ~600；KV 碎片 <4%；P99 ITL 有 chunked prefill ~15ms、无则 ~50ms。
- **goodput 概念**：满足 SLO（TTFT+ITL）下的有效 tok/s，比裸吞吐更重要。

## 类比（帮助理解）
- PagedAttention 像操作系统分页：内存不按"整段连续"给进程，而是按需给 4KB 页，避免外部碎片；vLLM 给每条对话按需给 16-token 的 KV 页。
- 连续批处理像地铁：到站（完成）就下客、站台（等待队列）有人就上客，车（前向）不停，不等人齐才发。

## 设计时怎么用（反推思维）
> 选 LLM 服务栈时，我会先用它能解决"高并发下吞吐与尾延迟"——默认开 PagedAttention+连续批处理+分块预填充，把 `--gpu-memory-utilization` 留给 KV 块；若流量是前缀重（RAG/Agent 同系统提示），再叠加前缀缓存；要降首 token延迟再评估投机解码（见 [[投机解码]]）。开任何 flag 前先查版本兼容表，避免启动即崩。

## 典型应用 / 我在哪见过
- 数据中心生产服务的默认引擎；与 SGLang（前缀缓存见长）、TRT-LLM（NVIDIA 专用极致优化）并列三大。
- 支持 AWQ/GPTQ/FP8 等量化格式（见 [[模型量化 Quantization]]）和 EAGLE-3 投机解码。

## 关联
- 前置知识：[[PagedAttention与连续批处理]]
- 相关：[[投机解码]]（在 vLLM 里 opt-in 开启）、[[模型量化 Quantization]]（量化格式靠 vLLM 落地）、[[Agent 推理加速]]（Agent 负载靠这些机制提吞吐）
- 反例/误区：以为"开 vLLM 就够快"却把所有优化 flag 一股脑开导致不兼容；只看平均吞吐忽略 P99 ITL。

## 来源
- AIEFS Vol.6 Production, Ch.7 "Serving Engine Internals — PagedAttention, Continuous Batching, Chunked Prefill"
