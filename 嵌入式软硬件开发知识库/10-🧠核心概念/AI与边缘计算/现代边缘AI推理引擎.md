---
类型: 概念
归属: AI与边缘计算
tags: [AI与边缘计算, 概念, 推理引擎, InferenceEngine, ONNXRuntime, TensorRT, OpenVINO, LiteRT, ExecuTorch]
来源: 互联网调研(2026-07) + 神书 ch3/5 背景
状态: 种子
---

# 现代边缘 AI 推理引擎 (Inference Engine)

## 一句话定义
推理引擎 = **模型编译器 + 运行时**，把训练好的浮点模型转成在特定目标硬件上最快/最省的整型可执行格式（做层融合、量化、硬件专属 kernel 选择）。神书(2019)只讲了算法层量化思想，没有这些工业级工具链。

## 主流引擎（2024-2026 现状）
| 引擎 | 厂商 | 目标硬件 | 关键点 |
|------|------|----------|--------|
| **ONNX Runtime** | Microsoft | 跨平台 CPU/GPU/NPU | Execution Provider 机制(CUDA/TensorRT/OpenVINO/CoreML)；原生 INT8/INT4；内存比原生框架低 10-20% |
| **TensorRT** | NVIDIA | NVIDIA GPU(Jetson/数据中心) | INT8 层/张量融合；生成的 `.engine` 与 GPU 架构/CUDA 版本绑定、不可移植；ResNet50 INT8 可达 300+ FPS |
| **OpenVINO** | Intel | Intel CPU/iGPU/dGPU/NPU | NNCF 做 QAT/PTQ/INT4/INT8；2025.1 起支持 LLM 4-bit(FQ_LORA/GPTQ/AWQ) |
| **LiteRT（原 TensorFlow Lite）** | Google | 移动/嵌入式 | Delegate 调 GPU/NNAPI/Hexagon/APU；2024 改名，现已支持 PyTorch/JAX；TFLite Micro 跑 MCU |
| **Core ML** | Apple | ANE/GPU/CPU | 仅 Apple；INT4；Swift 调用 |
| **ExecuTorch** | Meta | iOS/Android 边缘 | 1.0 GA(2025-10)，50KB 运行时，`.pte` 格式，12+ 后端；Instagram/WhatsApp 生产标准 |
| **TVM / MicroTVM** | Apache | FPGA/RISC-V/定制 | 自动调优(AutoTVM)，小众硬件极致优化 |

## 与神书的关系
- 神书的 fixed-point / clustered 量化是**算法思想**；现代引擎把它变成**可点按钮的 PTQ/QAT 流水线**（校准集 + 自动调优）。
- 选引擎先看硬件：NVIDIA→TensorRT，Intel→OpenVINO，跨平台→ONNX Runtime，Apple→Core ML/MLX，MCU→TFLM，生产移动端→ExecuTorch。

## 关联
- 上层：[[嵌入式深度神经网络]] 部署技术（软件工具层）
- 依赖：[[模型量化]]（提供 INT8/INT4），[[量化感知训练QAT]]（训练侧）
- 运行在：[[现代边缘AI加速器]]（NPU/TPU），[[TinyML与MCU部署]]（MCU 端）
- 教程：[[12-嵌入式深度学习(神书)]]

## 来源
- 互联网调研 2026-07（边缘 AI 推理框架对比、OpenVINO 2025.1 Release Notes、ExecuTorch 1.0 GA 公告、TinyML 技术报告）
