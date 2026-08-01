---
类型: 概念
主题: 推理部署与安全对齐
tags: [AI智能体知识库, 推理部署与安全对齐]
创建: 2026-07-30
复习: 
状态: 已完成
---

# TensorRT

## 一句话定义
> TensorRT 是 NVIDIA 的推理优化引擎与编译器：把模型图做层融合、精度校准（FP8/NVFP4）、内核自动调优，生成在该张 GPU 上最快的部署内核——代价是绑定 NVIDIA 硬件。

## 它解决什么问题 / 为什么存在
- 通用框架前向传播每个算子独立启动、中间结果反复读写显存，有大量冗余。推理要的是"在固定硬件上榨干延迟与吞吐"。
- 云端 LLM 的 2026 经济账：同模型在 Blackwell + TensorRT-LLM + Dynamo 上约 $0.012/百万 token，而 H100 + vLLM 约 $0.09/百万 token，差到 7x。TensorRT 是把"每美元 token 数"推到极致的工具。

## 核心原理（大二能懂的水平）
- **层融合（Layer Fusion / Kernel Fusion）**：把 Conv+BN+ReLU 等连续小算子融成一个 CUDA 内核，减少算子启动开销和显存往返。大二视角：把"多次小搬运"合并成"一次大搬运"。
- **精度校准（Quantization/Calibration）**：支持 FP8、NVFP4（Blackwell 4-bit microscaling，每块权重带独立缩放因子）。关键点——**KV cache 仍用 FP8**（注意力 K/V 动态范围大，压到 FP4 会塌方），权重/激活可用 NVFP4；注意力累加器用 FP32 保 softmax 稳定。Blackwell 还支持"Day-0 FP4 权重"：厂商直接发 FP4 权重，免去训练后转换。
- **内核自动调优（Kernel Auto-Tuning）**：对每种输入形状/精度，在 GPU 上实测择优内核（类似为这块卡专门编译）。模型需针对具体 GPU SKU 编译，因此不跨厂商。
- **TensorRT-LLM**：LLM 专用分支，吃 FP4 权重、集成 MTP（类 EAGLE 的投机草稿）、解聚合 prefill/decode、NVLink 5 的 MoE all-to-all（比 Hopper 快 3x）。TRT Edge-LLM（2026）把这套搬到 Jetson 边缘，支持 EAGLE-3 与 NVFP4。

## 关键参数 / 易错点
- **NVIDIA 锁定**：TRT-LLM 是 C++ + CUDA + NVIDIA 专用内核，编译绑定具体 GPU SKU；无 AMD/Intel/ARM。多厂商策略里它只能服务 NVIDIA 那一档。
- **FP4 有质量代价**：推理/数学/长 CoT 负载上 NVFP4 权重可见掉点（MATH 上能掉 3 分）。常用折中是 FP8 权重 + FP4 激活，或直接留在 H200 全 FP8。投产前必须在自家评测集验证质量。
- **与 vLLM 取舍**：vLLM 通用、迭代快、跨硬件；TRT-LLM 在 NVIDIA 上极致降本（7x）。年推理账单上亿美元时，迁移成本主导负载到 Blackwell+TRT-LLM 才划算，实验档留 H100+vLLM 保迭代速度。
- 常见链路：从 [[ONNX]] 导入再编译进 TensorRT 拿 NVIDIA 最优内核。

## 类比（帮助理解）
- 像给某款特定 CPU 做"手写汇编优化"：通用编译器（PyTorch）能跑，但懂这块芯片的人把热点手写汇编（TensorRT 融合内核）后快好几倍——只是这份汇编换芯片就废。
- 像工厂流水线重组：原本"每道工序单独打包运输"（逐算子），TensorRT 把相邻工序焊成一条线（层融合），并给每条线挑最快的工人排班（内核自动调优）。

## 设计时怎么用（反推思维）
> 部署一个成本敏感的大模型服务时，我会先用它能解决"每美元 token 数不够"——先算账单：若年推理费够大、且全栈 NVIDIA，就用 Blackwell + TensorRT-LLM + Dynamo 把 FP4 权重/MTP/解聚合叠满换 7x 降本；若还要多厂商或快速迭代，则留在 vLLM。无论哪条路，KV cache 保 FP8、推理负载先验证 FP4 质量再投产。端侧 Jetson 走 TRT Edge-LLM（接 [[边缘推理]]）。

## 典型应用 / 我在哪见过
- 数据中心 NVIDIA 极致降本：GB200 NVL72 + Dynamo 测到 $0.012/M token（HGX B200 约 $0.02/M）。
- 边缘：Jetson Thor/Orin 上 TRT Edge-LLM 跑 EAGLE-3 + NVFP4。
- 通用模型部署：从 ONNX 导入编译，拿融合内核与 INT8 优化。

## 关联
- 前置知识：[[ONNX]]（常作为进入 TensorRT 的输入格式）、[[模型量化 Quantization]]（FP8/NVFP4 校准即量化）
- 相关：[[边缘推理]]（TRT Edge-LLM 把优化搬到 Jetson）、[[vLLM 推理引擎]]（通用引擎，与 TRT-LLM 是取舍关系）
- 反例/误区：为降本盲目上 TRT-LLM 却忽略 NVIDIA 锁定；把 KV cache 也压到 FP4 导致注意力塌方；推理负载未验证 FP4 质量就投产。

## 来源
- AIEFS Vol.6 Production, Ch.10 "Hardware-Specialized Inference Compilation — FP8 and NVFP4 on Blackwell"；NVIDIA TensorRT / TensorRT-LLM 官方文档
