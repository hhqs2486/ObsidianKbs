---
类型: 概念
归属: AI与边缘计算
tags: [AI与边缘计算, 概念, TinyML, MCU, TensorFlowLiteMicro, CMSIS-NN, MCUNet, MLPerfTiny]
来源: 互联网调研(2026-07) + 神书背景
状态: 种子
---

# TinyML 与 MCU 部署 (TinyML on MCU)

## 一句话定义
TinyML = 在**毫瓦级功耗**的微控制器(MCU)上跑 ML 推理（Warden & Situnayake, O'Reilly 2020）。把 AI 推到传感器旁边，无需联网。神书(2019)聚焦算法/加速器，几乎未提 MCU 端的工业现实。

## 为什么难：内存墙
- 典型 Cortex-M4：256KB Flash / 64KB SRAM，80-168MHz；Cortex-M7 约 320KB SRAM / 1MB Flash。
- ResNet-50 需 97MB 存储 + 3.8 GFLOPS → 超 MCU 限制 100 倍；int8 MobileNetV2 仍超 5.3 倍。
- 内存结论：**Flash 存权重，SRAM 存激活值**，二者都要精打细算（[[模型量化]] 是破墙关键）。

## 关键项目与工具（2020-2026）
- **MCUNet**（MIT Han Lab, NeurIPS 2020）：TinyNAS(硬件感知 NAS) + TinyEngine(内存高效推理引擎) 协同设计；在 512KB SRAM/2MB Flash 的 STM32H743 上做到 >70% ImageNet top1；比 TFLM/CMSIS-NN 快 1.5-3x、峰值内存少 2.7-4.8x。MCUNetV2(2021) 用 patch-based 推理进一步省内存。
- **TensorFlow Lite Micro (TFLM)**：MCU 事实标准，无动态内存分配、不用标准 C 库、配合 [[CMSIS-NN]] 加速。
- **CMSIS-NN**：Arm 官方 Cortex-M 优化核（SIMD），相比纯 C 在 M7 上 3.2x、M4 上 2.4x。
- **MLPerf Tiny**（Banbury et al., NeurIPS 2021）：TinyML 标准化基准。

## 部署流水线
`PyTorch → ONNX → TensorFlow → TFLite → TFLM`，每步做逐层数值校验（FP32 相对误差 <1e-5，INT8 <1 个量化级）。

## 工程最佳实践
- **先量化后剪枝**（比反过来精度高 ~0.8%）；校准集要有代表性（边界案例）。
- **混合精度**：第一层/最后一层敏感，保留 INT16，中间层 INT8。
- **设备端训练**：NeurIPS 2022 实现 256KB 内存下的增量微调（终身/个性化学习）。

## 关联
- 依赖：[[模型量化]]、[[模型压缩与稀疏]]、[[二值神经网络]]
- 运行在：[[现代边缘AI加速器]] 的 MCU 级（如 ARM Ethos-U）
- 上层：[[嵌入式深度神经网络]] 的最受限端
- 教程：[[12-嵌入式深度学习(神书)]]

## 来源
- 互联网调研 2026-07（MCUNet 论文/官方库、TinyML 技术报告、MLPerf Tiny 基准）
