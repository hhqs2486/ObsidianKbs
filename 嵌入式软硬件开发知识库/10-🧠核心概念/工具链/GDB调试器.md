---
类型: 概念
主题: 工具链
tags: [概念]
创建: 2026-07-23
复习: 
状态: 种子
---

# GDB调试器

## 一句话定义
> GDB（GNU Debugger）是 Linux 下最标准的 C/C++ 程序调试器，支持断点、单步执行、变量查看、堆栈回溯、core dump 分析，是嵌入式 Linux 开发和裸机调试（通过 gdbserver/JLink）的必备工具。

## 它解决什么问题 / 为什么存在
- `printf` 调试效率低、无法查看运行时上下文、无法分析崩溃现场。
- GDB 提供**可控的执行环境**：可以在任意位置暂停程序，检查所有变量和内存，修改变量值后继续运行。
- 对于嵌入式交叉编译环境，GDB + gdbserver 提供远程调试能力。

## 核心原理（大二能懂的水平）
- GDB 通过 `ptrace` 系统调用控制目标进程：可以读取/修改目标进程的内存和寄存器、捕获信号。
- **调试信息**：编译时加 `-g` 选项，GCC 在 ELF 文件中嵌入 DWARF 格式的调试信息（源代码行号、变量名、类型信息）。
- **远程调试**：`gdbserver` 在目标板上运行，GDB 在宿主机上通过 TCP/串口连接。
- 常用命令：`break main`（断点）、`run`（启动）、`next/step`（单步）、`print var`（查看）、`backtrace`（调用栈）、`continue`（继续）、`info registers`（寄存器）。

## 关键参数 / 易错点
- **编译优化**：`-O2` 优化会导致变量被优化掉、行号错位。调试阶段用 `-O0 -g`。
- **strip 去符号**：发布版本用 `strip` 去掉调试符号减小体积，保留 unstripped 版用于事后分析 core dump。
- **core dump 分析**：`gdb ./program core` 定位崩溃时的精确位置和变量值。需先 `ulimit -c unlimited` 开启。
- **嵌入式远程调试**：`arm-linux-gnueabihf-gdb ./app` → `target remote 192.168.1.100:2345`（连接目标板的 gdbserver）。

## 类比（帮助理解）
- GDB 就像给程序装了一个"时间暂停器" — 你可以随时暂停程序，查看里面所有"齿轮"（变量、寄存器）的当前状态，然后让它继续运行或一步步走。

## 设计时怎么用（反推思维）
> 做嵌入式 Linux 应用开发时，先在本机 X86 上用 GDB 调试逻辑（功能验证），再交叉编译到 ARM 板后用 gdbserver + GDB 远程调试定位平台相关问题（如对齐访问、字节序）。

## 典型应用 / 我在哪见过
- 段错误定位：`gdb ./app core` → `backtrace` 直接看到崩溃的调用栈和行号
- 树莓派交叉调试：宿主机 `arm-linux-gnueabihf-gdb` + 树莓派 `gdbserver :2345 ./app`
- 内核调试：KGDB（Kernel GDB）调试 Linux 内核
- IDE 集成：VSCode/Eclipse 的 GDB 前端，提供图形化断点和变量监视

## 关联
- 前置知识：[[C语言]]、[[编译工具链]]、[[Linux文件IO与系统调用]]
- 相关：[[下载器与调试器]]、[[回调函数]]、[[函数与栈]]、[[堆栈与内存布局]]
- 反例/误区：不能调试未加 `-g` 的 release 程序（无符号表）；多线程调试要熟练掌握 `thread apply all bt` 命令

## 来源
- Knowledge-Notes: GDB学习笔记、程序调试
- GDB 官方文档：https://sourceware.org/gdb/documentation/
