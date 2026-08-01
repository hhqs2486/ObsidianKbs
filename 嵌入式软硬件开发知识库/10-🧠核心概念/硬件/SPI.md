---
类型: 概念
主题: SPI
tags: [概念]
创建: 2026-07-20
状态: 种子
---
# SPI

## 一句话定义
SPI（Serial Peripheral Interface，串行外设接口）是高速"四线制"全双工同步总线：SCK 时钟、MOSI 主发、MISO 主收、NSS(片选) 选定从机。

## 它解决什么问题 / 为什么存在
I²C 慢且半双工。SPI 用独立时钟线达到十几 MHz，全双工、无地址仲裁，适合 Flash、屏幕、高速 ADC。

## 核心原理（大二能懂的水平）
主机发 SCK 驱动，主从同时移位交换数据：主机在 MOSI 上发 1 位，从机在 MISO 上回 1 位，一个时钟沿完成 1 位。NSS 拉低 = 选中某个从机（一主多从各占一根 NSS）。四要素 CPOL/CPHA 决定"时钟极性"和"采样边沿"，双方必须一致，共 4 种模式（如 0,0）。

## 关键参数 / 易错点
- 模式对齐：SPI Flash(W25Q32)常用 Mode0(CPOL=0,CPHA=0)，和传感器不一致就读错。
- NSS 可由硬件自动管理，也可 GPIO 软件拉低（教程用手动 NSS 控制 FLASH_CS）。
- 全双工：发 N 字节同时收 N 字节，想只收也得发哑元数据。

## 类比（帮助理解）
像击鼓传令：鼓点(SCK)一下，主从各递一张纸条(MOSI/MISO)同时交换；NSS 是"点名"哪个人接令。

## 设计时怎么用（反推思维）
- 需求反推：要高速存数据/刷屏/读高精度传感器 → SPI。
- CubeMX：选 SPIx → Full-Duplex Master，设 CPOL/CPHA、波特率（SPI1 在 APB2 可达 18M+）；NSS 用软件 GPIO。
- HAL：`HAL_SPI_Transmit(&hspi1, tx, len, HAL_MAX_DELAY);`、`HAL_SPI_Receive`、`HAL_SPI_TransmitReceive`（全双工）。

## 典型应用
W25Q32 外部 Flash、OLED/彩屏、SD 卡、高速 ADC、数字电位器。

## 关联
- 前置知识：[[GPIO]]、[[时钟树]]
- 相关：[[I²C]]、[[DMA]]
- 反例/误区：CPOL/CPHA 和从机不一致，数据整字节错位。

## 来源
04-STM32F103HAL库开发.pdf §16 SPI
