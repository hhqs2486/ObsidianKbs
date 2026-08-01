---
类型: 教程
tags:
  - AI智能体知识库
  - 教程
来源: AIGC-Interview-Book
创建: 2026-07-23
状态: 种子
task:
  id: task-msab6ljeaz5mo5
---

# 模型部署与推理优化面试高频考点

## 这条教程在解决什么
- 14 篇模型部署面试笔记：ONNX/TensorRT/量化/剪枝/蒸馏/推理框架
- 库中已有 vLLM/Agent推理加速/模型蒸馏 等卡，本篇补充面试体系

## 关键内容

### 基础概念
- 模型部署全流程（训练→转换→优化→部署→监控）
- 推理 vs 训练的计算差异
- 延迟/吞吐/精度三角权衡

### 模型压缩技术
- 量化（INT8/INT4/混合精度/NF4）
- 剪枝（结构化/非结构化）
- 知识蒸馏（黑盒/白盒/特征蒸馏）
- 低秩分解（LoRA 用于部署）
- [[模型蒸馏]] | [[Agent 推理加速]]

### 推理框架与工具
- ONNX：开放模型交换格式
- TensorRT：NVIDIA 推理加速引擎
- vLLM：大模型高吞吐推理引擎
- llama.cpp/Ollama：本地部署方案

### 大模型部署专题
- KV Cache 优化
- PagedAttention
- Continuous Batching
- Speculative Decoding
- [[vLLM 推理引擎]] | [[投机解码]]

### 边云端部署
- 端侧部署约束（算力/内存/功耗）
- 云端推理服务架构
- [[GPU 自动扩缩容]]

## 面试高频 QA
- 量化为什么能加速推理？精度的代价是什么？
- TensorRT 和 ONNX Runtime 各自的优势场景？
- vLLM 的 PagedAttention 解决了什么问题？
- 剪枝和量化的组合策略？

## 关联
- 概念：[[vLLM 推理引擎]] | [[Agent 推理加速]] | [[模型蒸馏]] | [[投机解码]] | [[GPU 自动扩缩容]]
- 地图：[[现代AI Agent与生态地图]]

## 来源
- AIGC-Interview-Book 模型部署基础（9篇）+ 精华版（5篇）
