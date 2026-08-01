---
类型: 概念
主题: ADC
tags: [概念]
创建: 2026-07-20
状态: 种子
---
# ADC

## 一句话定义
ADC（Analog-to-Digital Converter，模数转换器）把引脚上的连续电压（0~3.3V）变成离散数字量，让 MCU 能"读懂"模拟世界（温度、电位器、电池电压）。

## 它解决什么问题 / 为什么存在
MCU 只认 0/1 数字。现实世界的传感器大多是模拟量，必须 ADC 采样才能进芯片计算。

## 核心原理（大二能懂的水平）
F103 有 ADC1/ADC2，12 位精度（0~4095 对应 0~3.3V）。流程：选通道 → 采样(Sampling Time) → 比较 → 数字码。一次转换时间 = 采样时间 + 12.5 个 ADCLK 周期。结果换算：`电压 = 3.3 * 数值 / 4095`。支持规则组（常规扫描多通道）、注入组（抢占）、模拟看门狗（越限报警）。

## 关键参数 / 易错点
- 参考电压 VREF 通常接 3.3V，决定满量程。
- 开启前务必 `HAL_ADCEx_Calibration_Start` 校准，消除偏移误差。
- 读取前 `HAL_ADC_Start` 再用 `HAL_ADC_PollForConversion` 等完成，最后 `HAL_ADC_GetValue`。
- 多通道要开 Scan + Continuous 模式，或用 DMA 搬运不占 CPU。

## 类比（帮助理解）
像用刻度尺量水位：12 位 = 尺子有 4096 格，水位落在第几格就记哪个数；采样时间 = 盯多久才读准。

## 设计时怎么用（反推思维）
- 需求反推：读电位器/电压/温度 → ADC 模拟输入（CubeMX 引脚设 Analog）。
- CubeMX：选 ADCx → 通道、Data Alignment=Right、Sampling Time；可开 DMA。
- HAL：`HAL_ADC_Start(&hadc1);` `if(HAL_ADC_PollForConversion(&hadc1,100)==HAL_OK) val=HAL_ADC_GetValue(&hadc1);` `float v = val*3.3f/4095;`

## 典型应用
电位器调参、电池电量监测、温度/光照采集、AHT20 内部温湿感。

## 关联
- 前置知识：[[GPIO]]、[[时钟树]]
- 相关：[[DMA]]、[[定时器与PWM]]
- 反例/误区：没校准、引脚设成数字模式而非 Analog，读数为 0 或乱跳。

## 来源
04-STM32F103HAL库开发.pdf §15 ADC
