---
类型: 概念
主题: UART
tags: [概念]
创建: 2026-07-20
状态: 种子
---
# UART

## 一句话定义
UART（Universal Asynchronous Receiver/Transmitter，通用异步收发器）是最常用的"串口"，用两根线（TX 发、RX 收）按约定波特率逐位收发数据；STM32 里带同步时钟的版本叫 USART。

## 它解决什么问题 / 为什么存在
芯片之间要"对话"（连电脑打印日志、连 ESP8266、连传感器）。UART 硬件简单、协议直白，是调试和通信的标配。

## 核心原理（大二能懂的水平）
异步 = 没有时钟线，双方靠"提前约好波特率"对齐。一帧 = 起始位(0)+8 位数据+可选校验+停止位(1)。F103 的 USART1 在 APB2(72M)、USART2/3 在 APB1(36M)。HAL 提供阻塞 `HAL_UART_Transmit`、中断 `HAL_UART_Receive_IT`、DMA `HAL_UART_Receive_DMA`。

## 关键参数 / 易错点
- 波特率常见 115200；"TX 接对方 RX，交叉连接"，接反就没数据。
- 想用 `printf`：勾 MicroLIB，重定义 `fputc` 调 `HAL_UART_Transmit`。
- 接收不定长数据：开 UART 空闲中断(IDLE)+DMA，IDLE 标志表示"一帧发完"。
- 注意 overrun 错误：收得太慢会丢字节。

## 类比（帮助理解）
像两人用对讲机约定好语速（波特率），说完一句"over"（停止位）再等下一句；没时钟线就像全靠默契对表。

## 设计时怎么用（反推思维）
- 需求反推：调试打印、模块通信、接 GPS/蓝牙 → UART。
- CubeMX：选 USARTx → Asynchronous，设波特率/8N1；NVIC 勾中断（用中断/DMA 时）。
- HAL：`HAL_UART_Transmit(&huart1, buf, len, HAL_MAX_DELAY);`；接收在 `HAL_UART_RxCpltCallback` 回调里处理并再次启动接收。

## 典型应用
串口调试、ESP8266 WiFi、RS485 转串口、GPS 模块。

## 关联
- 前置知识：[[C语言]]、[[GPIO]]
- 相关：[[中断NVIC]]、[[看门狗]]
- 反例/误区：printf 不勾 MicroLIB 会进半主机(hardfault)卡死。

## 来源
04-STM32F103HAL库开发.pdf §09 USART
