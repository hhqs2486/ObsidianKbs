---
类型: 概念
归属: AI与边缘计算
tags: [AI与边缘计算, 概念, 加速器, NPU, EdgeTPU, Jetson, Ethos-U, Hailo, NeuralEngine]
来源: 互联网调研(2026-07)
状态: 种子
---

# 现代边缘 AI 加速器 (Edge AI Accelerator, 2024-2026)

## 一句话定义
边缘 AI 加速器 = 为**本地推理**定制的处理器，含专用矩阵乘单元、量化流水线、为神经网络访存模式调优的片上存储。核心是 **NPU**（神经网络处理单元）。神书(2019)的 ENVISION/BINAREYE 是学术 ASIC 标杆；下面是 2024-2026 已量产的商业 NPU/模组。

## 计算三件套：CPU / GPU / NPU
- **CPU**：保底，可调试，慢。先在这里验证模型。
- **GPU**：并行强，OpenCL/Metal/Vulkan 通用。NPU 不支持时的次选。
- **NPU**：生产推理该落这里，每瓦性能比 CPU 高一个数量级；但**挑剔量化格式/算子支持/内存布局**，任一不支持就静默回退 CPU。

## 主流硬件（2025 在售）
| 硬件 | 算力 | 功耗/定位 | 生态 |
|------|------|-----------|------|
| **NVIDIA Jetson Orin** | 最高 275 TOPS | 15-60W，机器人/工业 | CUDA/TensorRT/DeepStream；AGX Orin 64GB LPDDR5 + 64 Tensor Cores |
| **Google Coral Edge TPU** | 4 TOPS(int8) | ~2W（2 TOPS/W） | TFLite；MobileNet v2 ~400 FPS；USB/M.2 |
| **ARM Ethos-U**（microNPU） | U85: 4 TOPS@1GHz | MCU 级，Cortex-M 配套 | TF Lite/PyTorch；U85 支持 Transformer+CNN，性能较上代 4x |
| **Apple Neural Engine** | A/M 系列 | 手机/PC | Core ML，INT4 |
| **Qualcomm Hexagon NPU** | 多位数 TOPS | Snapdragon 安卓 | Android NNAPI |
| **Hailo-8** | 26 TOPS | 2.5W，无风扇工业 | CNN/Transformer/LLM/VLM；M.2/PCIe；车规 AEC-Q100 |
| **Intel NCS2**（Movidius） | ~1 TOPS | USB 调试棒 | OpenVINO |
| **Rockchip RK3588** | 内置 NPU | 开源友好 | Linux |

## 与神书的关系
神书证明了"定制数据流 + 低比特 + 稀疏"能榨干能效；今天这些商业 NPU 把同一思想做成**可买的芯片**，且普遍要求 INT8（部分 INT4/混合精度）输入。

## 关联
- 喂数据：[[模型量化]]（INT8/INT4）、[[二值神经网络]]（1-bit，少数 NPU 支持）
- 配套：[[硬件算法协同优化]]、[[神经网络加速器]]（神书学术版）
- 上层工具：[[现代边缘AI推理引擎]]
- 教程：[[12-嵌入式深度学习(神书)]]

## 来源
- 互联网调研 2026-07（Edge AI Chips 2025、Top 10 Edge AI Hardware 2025、Arm Ethos-U85 发布、Hailo-8 规格）
