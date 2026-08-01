---
类型: 概念
tags: [概念,嵌入式Linux]
主题: QEMU虚拟机模拟
创建: 2026-07-24
状态: 已完成
---
# QEMU虚拟机模拟

## 一句话定义
QEMU 是开源的硬件模拟器，可以在 PC 上模拟 ARM/MIPS/RISC-V 等架构运行嵌入式 Linux 系统，无需真实硬件即可开发调试。

## 它解决什么问题 / 为什么存在
嵌入式开发依赖硬件板卡，但板卡不便携、数量有限、烧录慢。QEMU 在 PC 上模拟出虚拟的 ARM 板，可以快速验证 U-Boot、内核、rootfs，不依赖物理设备。

## 核心原理（大二能懂的水平）
使用流程：
1. 模拟 U-Boot：qemu-system-arm -M vexpress-a9 -kernel u-boot -nographic
2. 模拟内核：qemu-system-arm -M vexpress-a9 -kernel zImage -dtb vexpress.dtb -append "root=/dev/mmcblk0 console=ttyAMA0" -sd rootfs.ext3 -nographic
3. 网络支持：-netdev user,id=net0 -device virtio-net-device,netdev=net0
4. 图形界面：去掉 -nographic 显示 LCD 窗口

常用架构：-M vexpress-a9(ARM Cortex-A9)、-M virt(通用 ARM 虚拟机)、-M raspi3b(树莓派 3B)

## 关键参数 / 易错点
- QEMU 模拟的性能比真机慢，适合功能验证不适合性能测试
- 设备树必须匹配 QEMU 的虚拟硬件型号
- -nographic 把串口重定向到终端，方便交互
- 真机有的外设 QEMU 不一定模拟（如特定传感器）
- GDB + QEMU：-S -gdb tcp::1234 可远程调试内核

## 类比（帮助理解）
QEMU 像飞行模拟器：不用真飞就能练习飞行，但终究和真飞有区别（感觉不同、风景假），到点还得真飞验证。

## 设计时怎么用（反推思维）
反推：没有硬件但想学嵌入式 Linux -> QEMU 模拟 ARM 板 -> 跑 U-Boot + 内核 + rootfs -> 验证功能 -> 有硬件后再上真机调试。

## 典型应用
无硬件学习嵌入式 Linux、内核开发调试、CI/CD 自动化测试、U-Boot/rootfs 验证。

## 关联
- 前置知识：[[嵌入式Linux]]、[[uboot与启动流程]]、[[Kernel移植]]
- 相关：[[根文件系统构建方法]]、[[GDB调试器]]
- 扩展阅读：项目中 ch02-19.虚拟机和沙箱启动

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch02-19; QEMU official docs
