---
类型: 概念
主题: 硬件
tags: [概念]
创建: 2026-07-23
复习: 
状态: 种子
---

# wiringPi

## 一句话定义
> wiringPi 是树莓派上的 GPIO 控制 C 库，提供类似 Arduino 风格的引脚操作 API，让开发者用 C/C++ 直接控制树莓派 40pin 扩展口的数字 IO、PWM、I²C、SPI 和串口。

## 它解决什么问题 / 为什么存在
- 树莓派运行 Linux，用户态进程没有直接访问物理地址的权限，无法直接用指针写寄存器控制 GPIO。
- wiringPi 封装了 BCM2835/BCM2711 SoC 的 GPIO 寄存器映射，通过 `/dev/mem` 或 `/dev/gpiomem` 让用户态程序安全地操作引脚。
- 提供 Arduino 程序员熟悉的 `pinMode/digitalWrite/digitalRead` 风格 API，降低上手门槛。

## 核心原理（大二能懂的水平）
- 树莓派 SoC 的 GPIO 功能由一组内存映射寄存器（MMIO）控制。wiringPi 的底层 BCM2835 库通过 `mmap()` 将物理寄存器地址映射到用户态虚拟地址空间。
- 上层暴露 wiringPi 自己的引脚编号方案（wPi 编号），与 BCM GPIO 号、物理排针号做映射表。
- 支持：数字输入/输出、PWM（硬件 + 软件模拟）、I²C/SPI/UART 初始化、中断（wiringPiISR）。

## 关键参数 / 易错点
- **引脚编号方案**：wiringPi 有三套编号 — wPi 编号（库内部）、BCM GPIO 号、物理排针号（board）。`gpio readall` 命令可查看映射表。用错编号是最常见的坑。
- **必须 root 权限或 gpio 用户组**：操作 GPIO 需要访问 `/dev/mem` 或 `/dev/gpiomem`。
- **PWM**：硬件 PWM 仅 GPIO18（PWM0）和 GPIO13/19（PWM1）；软件 PWM 任意引脚但精度低。
- **版本差异**：wiringPi 原作者已停止维护，现由社区 fork 维护（如 WiringPi/WiringPi）。Raspberry Pi OS Bullseye+ 已移除 wiringPi，需手动安装。

## 类比（帮助理解）
- 就像 STM32 的 HAL 库把寄存器操作封装成 `HAL_GPIO_WritePin()`，wiringPi 把树莓派的 BCM SoC 寄存器封装成 `digitalWrite()`，让 Linux 应用层也能像裸机一样控制引脚。

## 设计时怎么用（反推思维）
> 做树莓派 GPIO 控制项目时，用 wiringPi 快速原型验证硬件接线和逻辑，后续需要高性能或内核级控制时再考虑直接写内核驱动。

## 典型应用 / 我在哪见过
- 树莓派智能家居 — 用 wiringPi 控制继电器、读取传感器
- 机器人控制 — 通过 PWM 驱动舵机、编码电机
- 学习嵌入式 Linux — 从裸机 GPIO 思维过渡到 Linux 用户态硬件控制

## 关联
- 前置知识：[[交叉编译与根文件系统]]、[[GPIO]]
- 相关：[[嵌入式Linux]]、[[交叉编译与根文件系统]]、[[定时器与PWM]]
- 反例/误区：wiringPi 不是内核驱动，实时性不如裸机 STM32；大量 GPIO 操作应走内核驱动而非用户态轮询。

## 来源
- Knowledge-Notes: 树莓派wiringPi库开发
- 官方仓库：https://github.com/WiringPi/WiringPi
