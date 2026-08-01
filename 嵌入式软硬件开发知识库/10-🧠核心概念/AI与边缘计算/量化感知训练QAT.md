---
类型: 概念
归属: AI与边缘计算
tags: [AI与边缘计算, 概念, QAT, PTQ, 量化感知训练, NeuralCompressor, NNCF]
来源: 互联网调研(2026-07) + 神书 ch3
状态: 种子
---

# 量化感知训练 QAT (Quantization-Aware Training)

## 一句话定义
在**训练/微调阶段就插入"伪量化"节点**模拟低精度误差，让模型权重适应 INT8/INT4，从而比训练后量化精度更高。神书(2019)只提 test-time fixed-point（即 PTQ 思想），未提 QAT 这套现代训练侧流程。

## PTQ vs QAT（现代标准对照）
| | PTQ 训练后量化 | QAT 量化感知训练 |
|--|--|--|
| 是否需要重训 | 否，只需校准集(100-500 样本) | 是，插入 fake-quant 后微调几轮(lr~1e-5) |
| 精度损失 | 典型 2-3% | 通常 <0.5-1% |
| 适用 | 精度够用、无训练预算 | 对量化敏感(如 Group Conv)、极致受限设备 |

## 工具链（2024-2026）
- **PyTorch 原生量化**：dynamic / static / QAT 三档（`torch.quantization`）。
- **Intel Neural Compressor (INC)**：精度驱动自动调优，支持 PTQ/QAT/剪枝/蒸馏；`accuracy_criterion` 设容差自动搜最佳配置。
- **OpenVINO / NNCF**：`nncf.quantize` 做 QAT；2025.1 新增 **QAT+LoRA**(`FQ_LORA`) 做更准的 LLM 4-bit、并支持 GPTQ/AWQ。
- **Hugging Face optimum-intel**：`INCQuantizer` 把 QAT 状态转成最终 INT8 模型。
- **TorchAO**：PyTorch 原生量化/稀疏。

## LLM 量化（端侧大模型专属）
- 权重量化：GPTQ、AWQ、GGUF(Q2_K~Q8_0 + IQ 重要性量化)、HQQ。
- 4-bit 已成为端侧 LLM 主流（见 [[端侧大语言模型]]）。

## 工程最佳实践
- 校准集要有代表性（边界案例），否则量化误差拉胯。
- TinyML 实证：**先量化后剪枝**顺序比反过来精度高 ~0.8%。
- 混合精度：敏感层保留更高精度。

## 关联
- 是 [[模型量化]] 的"训练侧实现"；与 [[模型压缩与稀疏]]、[[知识蒸馏]]（TinyML 用 ResNet-50 教 MCUNet）配合
- 产出喂给：[[现代边缘AI推理引擎]]、[[现代边缘AI加速器]]
- 教程：[[12-嵌入式深度学习(神书)]]

## 来源
- 互联网调研 2026-07（PyTorch QAT 文档、Intel Neural Compressor、OpenVINO 2025.1 Release Notes、Hugging Face optimum 实践）
