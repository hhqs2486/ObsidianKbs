---
类型: 概念
主题: HAL库结构
tags: [概念]
创建: 2026-07-20
状态: 种子
---
# HAL库结构

## 一句话定义
HAL（Hardware Abstraction Layer，硬件抽象层）是 ST 官方为 STM32 提供的统一外设驱动库，把"直接操作寄存器"封装成一套跨系列通用的 C 函数（如 `HAL_UART_Transmit`）。

## 它解决什么问题 / 为什么存在
早期标准外设库(SPL)换芯片要改很多代码。HAL 用统一 API 屏蔽硬件差异，换 F1/F4/H7 代码基本不动；配合 CubeMX 图形化生成初始化代码，大幅降低入门门槛。

## 核心原理（大二能懂的水平）
HAL 把每个外设抽象成"句柄(Handle)结构体 + 操作函数"：`UART_HandleTypeDef huart1` 装着该串口的配置和状态；`HAL_UART_Transmit(&huart1,...)` 内部按寄存器写操作。代码分三层：用户 `main.c` → HAL 驱动(`stm32f1xx_hal_xxx.c`) → CMSIS/寄存器。关键钩子是 `__weak` 弱函数：`HAL_UART_RxCpltCallback`、`HAL_GPIO_EXTI_Callback` 等，用户在自己文件里重写即可，不碰库源码。

## 关键参数 / 易错点
- 改硬件配置只在 CubeMX 里改并重新 Generate，别手改 `MX_xxx_Init` 里的结构体。
- 用户代码必须写在 `/* USER CODE BEGIN/END */` 注释之间，否则下次生成被覆盖。
- 弱回调同名函数别重复定义，否则链接冲突。

## 类比（帮助理解）
HAL 像汽车通用驾驶接口：方向盘/油门/刹车（统一 API）不管开丰田还是宝马都一样；`__weak` 回调像"自定义按键"，你按自己习惯重绑功能。

## 设计时怎么用（反推思维）
- 需求反推：想快速搭工程、跨芯片复用 → 用 HAL + CubeMX。
- 启动顺序：CubeMX 配引脚/时钟 → Generate 选 MDK → Keil 里在 USER CODE 区写逻辑。
- 中断类外设在 `stm32f1xx_it.c` 的 `XXX_IRQHandler` 里调 `HAL_XXX_IRQHandler`，真正业务写在弱回调里。

## 典型应用
所有 STM32 工程的外设驱动；教程里 LED/UART/I2C/SPI/ADC 全用 HAL 实现。

## 关联
- 前置知识：[[C语言]]、[[指针与内存]]
- 相关：[[CubeMX]]、[[时钟树]]
- 反例/误区：在 `USER CODE` 外写代码，重新生成后丢失。

## 来源
04-STM32F103HAL库开发.pdf §04.6 / §06.3
