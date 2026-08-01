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
  id: task-msab6qwfb3txhe
---

# PagedAttention与连续批处理

## 一句话定义
> vLLM 三大核心技术：PagedAttention 解决 KV cache 内存碎片（<4%）、连续批处理让请求进出自如、分块预填充保护首 token 延迟尾端（P99 ITL 从 ~50ms→~15ms）。

## 核心原理
- **PagedAttention = KV cache 虚拟内存**：16 token 固定块分配，碎片率从 60-80% 降到 <4%
- **连续批处理**：每次解码迭代移除完成/超长请求 + 注入等候队列中新请求，批大小从不固定
- **分块预填充**：长 prompt 切成 ~512 token 片，每片穿插一轮解码
- 三者全开：Llama 3.3 70B FP8 + H100 SXM5 + 128 并发 → 2200-2400 tok/s

## 关键参数
- vLLM v0.18.0 中分块预填充与投机解码互斥（N-gram GPU 例外）
- `--gpu-memory-utilization` 默认 0.9
- KV cache 与权重量化分离（AWQ INT4 权重 ~35 GB + KV cache ~20 GB）

## 关联
- 前置知识：[[vLLM 推理引擎]]、[[GPU 自动扩缩容]]
- 相关：[[推理指标]]、[[投机解码]]、[[Prompt 缓存]]
- 反例/误区：只开前两项约 1800 tok/s，开分块预填充才到 2400

## 来源
- AIEFS Vol.6 Production, Ch.07 "Serving Engine Internals"
