---
类型: 概念
tags: [概念,嵌入式Linux]
主题: Kernel移植
创建: 2026-07-24
状态: 已完成
---
# Kernel移植

## 一句话定义
Kernel 移植是指将 Linux 内核源码适配到特定硬件板卡的过程，核心是设备树修改、驱动配置和编译选项调整。

## 它解决什么问题 / 为什么存在
Linux 内核源码支持大量架构和板卡，但每块板的具体硬件（DDR 大小、外设、引脚分配）不同。移植就是告诉内核「这块板有什么硬件、怎么接的」，让内核能启动并驱动外设。

## 核心原理（大二能懂的水平）
移植步骤：
1. 获取源码：从 kernel.org 或芯片厂商 SDK 下载
2. 加载默认配置：make ARCH=arm imx_v7_defconfig
3. 修改设备树：在 arch/arm/boot/dts/ 下修改或新建 .dts 文件
4. menuconfig 配置：make ARCH=arm menuconfig 启用/禁用驱动
5. 编译：make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- zImage dtbs modules
6. 部署：将 zImage + dtb + 模块拷到板子，U-Boot 引导启动

内核启动流程：内核解压 -> start_kernel -> 初始化子系统 -> 解析设备树 -> 加载驱动 -> 挂载 rootfs -> 启动 init

## 关键参数 / 易错点
- 设备树是移植的核心——同一份内核代码，不同板只改 dts
- 内核版本差异大，换版本需重新适配驱动接口
- bootargs 里的 console= 和 root= 必须正确，否则内核起来但无法交互
- dts 编译后生成 dtb，U-Boot 把 dtb 传给内核

## 类比（帮助理解）
Kernel 移植像给通用操作系统装硬件驱动：内核=操作系统安装包，设备树=驱动配置文件，menuconfig=选装组件。

## 设计时怎么用（反推思维）
反推：新板需要跑 Linux -> 下载内核源码 -> 拷贝相近板的 dts 修改 -> menuconfig 开启外设驱动 -> 编译烧录 -> 串口看启动日志定位问题。

## 典型应用
所有嵌入式 Linux 板卡的首次启动和系统升级（I.MX6ULL、RK3568、全志 T113i 等）。

## 关联
- 前置知识：[[嵌入式Linux]]、[[uboot与启动流程]]、[[设备树DeviceTree]]
- 相关：[[Menuconfig与Kconfig]]、[[交叉编译与根文件系统]]、[[U-Boot移植方法]]、[[根文件系统构建方法]]
- 扩展阅读：项目中 ch02-06/ch02-07/ch02-x1~x3

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch02-06, ch02-07, ch02-x1~x3
