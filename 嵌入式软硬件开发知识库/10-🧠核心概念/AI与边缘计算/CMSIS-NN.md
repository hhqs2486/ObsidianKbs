---
类型: 概念
归属: AI与边缘计算
tags: [AI与边缘计算, 概念, CMSIS-NN, Arm, Cortex-M, 推理库]
来源: 互联网调研(2026-07)
状态: 种子
---

# CMSIS-NN

## 一句话定义
Arm 官方为 **Cortex-M** 系列优化的神经网络算子库（C + DSP/SIMD intrinsics），是 MCU 上跑 DL 推理的底层加速底座。配合 [[TinyML与MCU部署]] 的 TFLite Micro 使用。

## 关键点
- 利用 Cortex-M 的 SIMD 指令，一个周期完成多个 INT8 乘加。
- 实测加速：相比纯 C 实现，Cortex-M7 上 **3.2x**、Cortex-M4 上 **2.4x**。
- 不单独"建模型"，而是被 TFLM / MCUNet 的 TinyEngine 在底层调用。

## 与神书的关系
神书讲算法/加速器架构；CMSIS-NN 是把卷积/全连接在真实 MCU 上跑快的**现成库**，省去自己写汇编优化。

## 关联
- 上层：[[TinyML与MCU部署]]、[[模型量化]]（INT8 算子）
- 教程：[[12-嵌入式深度学习(神书)]]

## 来源
- 互联网调研 2026-07（TinyML 技术报告实测数据、Arm CMSIS-NN 仓库）
