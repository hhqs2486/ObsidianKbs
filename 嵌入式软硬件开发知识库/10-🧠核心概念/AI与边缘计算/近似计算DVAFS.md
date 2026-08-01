---
类型: 概念
归属: AI与边缘计算
tags: [AI与边缘计算, 概念, 近似计算, DVAFS, ApproximateComputing]
来源: 桌面/嵌入式深度学习神书.pdf（英文原版，文字版，无需OCR）ch4
状态: 种子
---

# 近似计算与 DVAFS (Approximate Computing)

## 一句话定义
**有意接受可控的精度/计算误差**，换取大幅能效提升的设计范式；DVAFS 是其中一种电路级技术。

## 为什么可行（书 ch4）
- 神经网络对噪声计算有一定容忍度："a network's accuracy does not necessarily degrade under noisy computations"。
- 多媒体等场景中微小偏差常被人/系统感知不到。

## DVAFS（书 ch4.3，作者核心贡献）
- 全称：**Dynamic-Voltage-Accuracy-Frequency-Scaling**（动态电压-精度-频率缩放）。
- 本质：在恒定吞吐下**动态调节数字乘法器等单元的供电电压/精度/频率**，以此连续伸缩功耗。
- 地位：被书称为"reported widest energy-accuracy trade-off（报道中最宽的能耗-精度权衡）"的电路级技术，且对架构层有影响（需特定电压域组织 SoC）。

## 设计含义
- 理想加速器应能**按当前网络/应用需求动态改变所用比特数**（书 ch4.2 结论）。
- 是 [[硬件算法协同优化]] 在电路层的体现，与 [[模型量化]] / [[二值神经网络]] 共用"精度换能效"思想。

## 关联
- 属于：[[嵌入式深度神经网络]] 部署技术（电路层）
- 同族：[[硬件算法协同优化]]、[[模型量化]]、[[二值神经网络]]
- 芯片实例：[[神经网络加速器]]（ENVISION V2 兼容 DVAFS）
- 教程：[[12-嵌入式深度学习(神书)]]（ch4 Circuit Techniques for Approximate Computing）

## 来源
- [[12-嵌入式深度学习(神书)]]（ch4.1 范式；ch4.3 DVAFS）
