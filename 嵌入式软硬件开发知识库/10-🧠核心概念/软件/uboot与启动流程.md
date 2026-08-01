---
类型: 概念
tags: [概念]
主题: uboot与启动流程
创建: 2026-07-21
状态: 已完成
---
# uboot与启动流程

## 一句话定义
嵌入式 Linux 的 **bootloader**（最常用 U-Boot）：芯片上电后跑的第一段程序，负责初始化硬件、把内核从存储读到内存、**启动内核并给它传参**。

## 它解决什么问题 / 为什么存在
内核自己不会"起来"——上电时 CPU 还不知道内存怎么用、串口在哪。uboot 先做好硬件初始化，再把内核请进来，并告诉内核"串口是哪个、根文件系统在哪"。另外它还提供 tftp 下载、环境变量配置、系统部署能力。

## 核心原理（大二能懂的水平）
uboot 生命周期：
1. 上电先从 Flash 搬自己到 DDR（自搬移/重定位），因为 Flash 不能直接跑快代码。
2. 初始化时钟、串口、DDR、网卡等。
3. 倒计时：若用户按键则进**命令行 shell**；否则自动执行 `bootcmd`。
4. `bootcmd` 通常 = tftp 下载内核(或读 nand) + `bootm`/`bootz` 启动内核，并把 `bootargs` 传给内核。

**环境变量（关键）**：
- `bootdelay` 自动启动倒计时秒数
- `ipaddr` / `serverip` 开发板 / TFTP 服务器 IP
- `bootcmd` 自动运行命令（真正"引导内核"的那条）
- `bootargs` 传给内核的参数，如 `console=ttySAC0,115200 root=/dev/mtdblock2 rootfstype=yaffs2`

**常用命令**：`printenv`/`setenv`/`saveenv`、`ping`、`tftp`、`movi`(SD/iNand)、`nand`、`md`/`mw`/`mm`(内存)。

## 关键参数 / 易错点
- `bootargs` 写错 → 内核起来但卡在"找不到根文件系统"或"无控制台输出"。
- 改了环境变量必须 `saveenv`，否则重启丢失。
- uboot 的"重定位/栈/BSS"概念与 [[Bootloader]]（MCU 双分区 OTA）同源但复杂得多：uboot 支持脚本、网络、多板适配。

## 类比（帮助理解）
uboot 像 PC 的 BIOS/UEFI：开机自检 → 找到启动盘 → 把 Windows/Linux 请进来，并告诉它"从哪块盘启动"。

## 设计时怎么用（反推思维）
- 移植新板 → 先搞定"串口能打印 + DDR 能识别 + 能从 tftp 起内核"三件事。
- 调试内核起不来 → 先怀疑 `bootargs`（根设备/控制台），再怀疑内核镜像格式(zImage/uImage)。

## 典型应用
所有 Cortex-A 跑 Linux 的板子（S3C2440/S5PV210/i.MX6/RK3399…）。

## 关联
- 前置知识：[[C语言]]、[[嵌入式Linux]]
- 相关：[[Bootloader]]（MCU 版区别）、[[交叉编译与根文件系统]]（bootargs 指定 root=）、[[设备树DeviceTree]]（uboot 把 dtb 一起传给内核）
- 反例/误区：把 uboot 当成"简单裸板程序"——它要管 DDR 分区、Flash 分区、网络、脚本，远比 MCU bootloader 复杂。
- 深度展开：[[U-Boot移植方法]]、[[Menuconfig与Kconfig]]、[[Kernel移植]]、[[根文件系统构建方法]]

## 来源
`大佬学习笔记/3.uboot和Linux内核移植.docx`（uboot 前传/命令/环境变量/Flash与DDR分区）。
- GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22)
