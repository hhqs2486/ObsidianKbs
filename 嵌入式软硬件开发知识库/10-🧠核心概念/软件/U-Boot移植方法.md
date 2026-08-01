---
类型: 概念
tags: [概念,嵌入式Linux]
主题: U-Boot移植方法
创建: 2026-07-24
状态: 已完成
---
# U-Boot移植方法

## 一句话定义
U-Boot 移植是将 U-Boot 源码适配到特定板卡的过程，核心是板级配置文件、设备树和驱动适配。

## 它解决什么问题 / 为什么存在
U-Boot 官方支持很多板卡，但新板或自研板需要自己适配。移植的目标是让 U-Boot 能在板卡上启动、串口能打印、能下载内核、能引导内核。

## 核心原理（大二能懂的水平）
移植步骤：
1. 获取源码：git clone https://github.com/u-boot/u-boot.git
2. 选参考板：找架构相近的 defconfig（如 mx6ull_14x14_evk_defconfig）
3. 创建板级目录：board/myboard/，参考已有板修改
4. 修改设备树：arch/arm/dts/myboard.dts，适配 DDR/时钟/引脚
5. 创建 defconfig：configs/myboard_defconfig
6. menuconfig 配置：make ARCH=arm menuconfig
7. 编译：make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf-
8. 烧录测试：烧到 SD/eMMC，串口看启动日志

U-Boot 目录关键路径：arch/(架构) board/(板级) configs/(配置) drivers/(驱动) include/(头文件)

SPL 和 TF-A：
- SPL(Secondary Program Loader)：U-Boot 的精简版，初始化 DDR 后加载主 U-Boot
- TF-A(Trusted Firmware-A)：ARM 安全启动固件，在 SPL 之前运行

## 关键参数 / 易错点
- 先搞定串口打印，否则看不到任何信息无法调试
- DDR 初始化错误会导致随机崩溃，最难定位
- 设备树的内存地址和实际 DDR 配置必须一致
- U-Boot 2022+ 推荐用设备树驱动模型(DM)，旧版的板级头文件方式已废弃
- SPL 的大小有限制（通常 32KB~64KB），取决于 BootROM

## 类比（帮助理解）
U-Boot 移植像给新房子装门禁系统：先通电（DDR 初始化）、再装对讲机（串口）、然后联网（网卡）、最后配开门规则（bootcmd）。

## 设计时怎么用（反推思维）
反推：新板需要跑 Linux -> 移植 U-Boot -> 参考相近板修改 -> 先搞定串口和 DDR -> 再配网卡和启动命令 -> 验证能 tftp 下载并 bootm 内核。

## 典型应用
所有新嵌入式 Linux 板卡的首次启动（I.MX6ULL、RK3568、全志 T113i 等）。

## 关联
- 前置知识：[[uboot与启动流程]]、[[嵌入式Linux]]、[[设备树DeviceTree]]
- 相关：[[Kernel移植]]、[[根文件系统构建方法]]、[[交叉编译与根文件系统]]、[[Menuconfig与Kconfig]]
- 扩展阅读：项目中 ch02-03.uboot 移植、ch02-17.SPL 和 TF-A、ch02-x5.stm32 移植 uboot

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch02-03, ch02-17, ch02-x5; U-Boot official docs
