---
类型: 教程
tags: [教程,嵌入式Linux]
主题: 嵌入式Linux系统构建完整教程
创建: 2026-07-24
状态: 已完成
---
# 嵌入式Linux系统构建完整教程

> 来源：GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22)
> 规模：108 章 Markdown + 配图，覆盖 SDK 平台 -> 系统启动 -> 驱动开发 -> 应用开发全链路
> 涉及平台：I.MX6ULL、RK3568、全志 T113i/H618、STM32

## 项目定位

按照「如何构建一个完整嵌入式 Linux 产品应用」的开发流程组织，而非按难易度排序。

## 章节地图

### ch01. 构建 Linux 开发平台环境
- ch01-01 Shell 命令
- ch01-02 Linux 软件安装
- ch01-03 Shell 脚本语法
- ch01-04 Linux 交叉编译方法 -> [[交叉编译与根文件系统]]
- ch01-05 快速部署和 SDK 构建

### ch02. Linux 系统启动实现
- ch02-01 Makefile 脚本语法 -> [[Makefile构建系统]]
- ch02-02 menuconfig 界面管理 -> [[Menuconfig与Kconfig]]
- ch02-03 U-Boot 移植 -> [[U-Boot移植方法]]
- ch02-04 U-Boot 环境和命令 -> [[uboot与启动流程]]
- ch02-05 U-Boot 执行流程分析 -> [[uboot与启动流程]]
- ch02-06 Linux Kernel 移植 -> [[Kernel移植]]
- ch02-07 内核执行流程分析 -> [[Kernel移植]]
- ch02-08 文件系统构建综述 -> [[根文件系统构建方法]]
- ch02-09 BusyBox 构建 rootfs -> [[根文件系统构建方法]]
- ch02-10 Buildroot 构建 rootfs -> [[根文件系统构建方法]]
- ch02-11 Debian 构建 rootfs -> [[根文件系统构建方法]]
- ch02-12 Ubuntu 构建 rootfs -> [[根文件系统构建方法]]
- ch02-17 U-Boot SPL 和 TF-A -> [[U-Boot移植方法]]
- ch02-19 虚拟机和沙箱启动 -> [[QEMU虚拟机模拟]]
- ch02-x1 I.MX6ULL 平台编译 -> [[交叉编译与根文件系统]]
- ch02-x2 RK3568 平台编译 -> [[交叉编译与根文件系统]]
- ch02-x3 全志 T113i 平台编译 -> [[交叉编译与根文件系统]]

### ch03. Linux 驱动开发
- ch03-00 驱动设计概述 -> [[Linux驱动与内核模块]]
- ch03-01 设备树说明 -> [[设备树DeviceTree]]
- ch03-03 字符设备驱动 -> [[Linux驱动与内核模块]]
- ch03-04 pinctrl 和 gpio 子系统 -> [[Pinctrl与GPIO子系统]]
- ch03-05 input 输入子系统 -> [[Input输入子系统]]
- ch03-06 驱动中断管理 -> [[Linux中断管理]]
- ch03-07 I2C 设备和驱动框架 -> [[I2C驱动框架]]
- ch03-08 SPI 设备和驱动框架 -> [[SPI驱动框架]]
- ch03-09 IIO 子系统和 ADC 驱动
- ch03-10 regmap 驱动框架 -> [[Regmap框架]]
- ch03-22 CAN 网络管理框架 -> [[CAN]]
- ch03-24 FrameBuffer 和 DRM 框架 -> [[FrameBuffer与DRM]]
- ch03-x1 驱动基础接口 -> [[Linux驱动与内核模块]]
- ch03-x5 驱动并发接口 -> [[Linux内核并发控制]]
- ch03-x9 驱动并发控制 -> [[Linux内核并发控制]]
- ch03-x6 I.MX6ULL 设备树分析 -> [[设备树DeviceTree]]

### ch04. Linux 应用开发设计
- ch04-01 C++ 语法 -> [[C++与C语言的关系]]
- ch04-02 GDB 调试 -> [[GDB调试器]]
- ch04-04 Socket 接口 -> [[网络Socket编程]]
- ch04-05 进程间通讯 -> [[进程与线程(Linux)]]
- ch04-12 MQTT 客户端 -> [[通信协议设计]]
- ch04-13 Modbus 开发 -> [[通信协议设计]]
- ch04-x3 CMake 构建 -> [[CMake构建系统]]

### 附录
- 附录一 Linux 技术网站和资源
- 附录二 基础面试问题
- 附录三 驱动面试问题
- 附录四 应用面试问题

## 学习路线（5 阶段 + 扩展）

1. Step 1：安装和熟悉 Linux 平台
2. Step 2：构建嵌入式 Linux 平台（U-Boot/Kernel/rootfs/设备树/字符驱动）
3. Step 3：应用初步开发（API/Makefile/交叉编译库/C++）
4. Step 4：驱动开发（内核接口/中断/SOC/I2C/SPI/IIO/RTC）
5. Step 5：应用方案构建（Qt/Web/部署/调试）
6. 扩展：芯片 bringup（块设备/网络设备/DRM/QEMU）

## 与知识库的关系

本教程是知识库嵌入式 Linux 知识集群的核心源项目，覆盖 [[嵌入式Linux]]、[[uboot与启动流程]]、[[设备树DeviceTree]]、[[Linux驱动与内核模块]]、[[Linux文件IO与系统调用]]、[[交叉编译与根文件系统]] 等概念卡的深度展开。参见 [[嵌入式Linux地图]]。
