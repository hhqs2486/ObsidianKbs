---
类型: 教程
来源: Knowledge-Notes
tags: [嵌入式软硬件开发知识库, 教程]
创建: 2026-07-23
状态: 种子
---

# 23-Linux驱动与系统编程

## 这条教程在解决什么
- 覆盖 Linux 驱动开发的完整流程：从内核模块编写、Makefile/Kbuild 构建系统、设备树配置、uboot 启动流程、GDB 调试，到同步互斥、中断上下文处理。
- 学习资源基于韦东山驱动课程（I.MX6ULL 平台）和 ALPHA I.MX 开发板的实战记录。

## 关键步骤（我照着做的）

### 1. Linux 驱动框架入门
参考 [[Linux驱动与内核模块]]：
- **内核模块**：Linux 驱动最基础的形式
  ```c
  #include <linux/module.h>
  #include <linux/kernel.h>
  static int __init my_init(void) { printk("hello\n"); return 0; }
  static void __exit my_exit(void) { printk("bye\n"); }
  module_init(my_init);
  module_exit(my_exit);
  MODULE_LICENSE("GPL");
  ```
- `insmod` 加载 → `lsmod` 查看 → `rmmod` 卸载 → `dmesg | tail` 查看内核日志
- **字符设备驱动**：实现 `file_operations` 结构体中的 `open/read/write/ioctl/release`，应用层通过 `open("/dev/mychrdev")` 交互

### 2. Makefile 与 Kbuild 构建系统
参考 [[编译工具链]]：
```makefile
# 单文件模块 Makefile
obj-m += hello.o
KDIR := /lib/modules/$(shell uname -r)/build
PWD := $(shell pwd)
all:
    make -C $(KDIR) M=$(PWD) modules
clean:
    make -C $(KDIR) M=$(PWD) clean
```
- `-C $(KDIR)` 进入内核源码目录，读取顶层 Makefile
- `M=$(PWD)` 让内核构建系统回到当前目录编译模块
- **cmake**：更高级的跨平台构建工具，`CMakeLists.txt` → `cmake .` → `make`
- 内核模块不能用 cmake（必须用内核 Kbuild 系统），应用层和库可以用 cmake

### 3. I.MX6ULL 系统移植与驱动开发
参考 [[uboot与启动流程]] 和 [[设备树DeviceTree]]：
- **系统移植**：uboot 移植 → Linux 内核移植 → 根文件系统构建（BusyBox）
- **设备树**（Device Tree）：`.dts` 源文件描述硬件资源（GPIO、I²C、SPI 等），编译为 `.dtb` 由 uboot 传递给内核
- 驱动与设备树的匹配：驱动的 `compatible` 属性必须与设备树节点的 `compatible` 字符串一致
- **pinctrl 子系统**：在设备树中配置引脚的电气属性和复用功能

### 4. GDB 调试
参考 [[GDB调试器]]：
- **本机调试**：`gcc -g -O0 program.c -o program` → `gdb ./program` → `break main` → `run`
- **远程调试**（嵌入式必备）：目标板运行 `gdbserver :2345 ./app`，宿主机 `arm-linux-gnueabihf-gdb ./app` → `target remote 192.168.1.100:2345`
- **Core Dump 分析**：程序崩溃后生成 core 文件 → `gdb ./program core` → `backtrace` 查看崩溃栈
- 开启 core dump：`ulimit -c unlimited` + 配置 `/proc/sys/kernel/core_pattern`

### 5. Shell 脚本自动化
```bash
#!/bin/bash
# 编译脚本模板
set -e  # 任何命令失败立即退出
echo "Building..."
make -j4
echo "Deploying to target..."
scp ./program root@192.168.1.100:/home/root/
echo "Done!"
```
- `set -e` 防止出错后继续执行造成更大问题
- `$1 $2 $@` 命令行参数扩展

### 6. 同步与互斥
参考 [[互斥与信号量]]：
- Linux 内核中的同步机制：自旋锁（spin_lock，适用于短临界区、不能睡眠）、互斥锁（mutex_lock，可睡眠）、信号量（semaphore）
- **中断上下文 vs 进程上下文**：中断上下文不能睡眠、不能用 mutex，只能用 spin_lock。这和在 FreeRTOS 中 ISR 不能用 delay 是同一个原则。[[中断NVIC]]
- **并发风险**：中断可能在任何时候打断进程上下文的代码，所以共享数据必须加锁

### 7. Uboot 到内核的启动流程
参考 [[uboot与启动流程]]：
- CPU 上电 → BootROM（芯片固化程序）→ uboot（SPL → 完整 uboot）
- uboot 加载内核镜像（zImage/uImage）和设备树（dtb）到 DDR 内存
- uboot 设置启动参数（bootargs）→ 跳转到内核入口 `start_kernel()`
- 内核初始化：setup_arch → 解析设备树 → 初始化驱动 → 挂载根文件系统 → 启动 init 进程

### 8. Linux 开源项目参考
- 阅读开源驱动代码是提升驱动开发能力的最佳方式
- 学习方法：选一个熟悉的硬件（如 I²C 设备驱动）→ 在内核源码 `drivers/` 下找对应驱动 → 从 `module_init` 开始逐函数阅读

## 我卡住/没懂的地方
- Kbuild 系统和普通 Makefile 的区别很大。关键理解：内核模块的 Makefile 只是一个"跳板"，真正编译规则在内核顶层 `Makefile` 和 `scripts/Makefile.build` 中。
- 设备树的 `compatible` 属性匹配驱动是 kernel 的设备模型核心，但初次接触时很难理解驱动的 probe 函数是怎么被自动调用的（答案是内核在解析设备树时匹配 `of_match_table` 然后调用 probe）。
- 自旋锁 vs 互斥锁的区别：记住"中断上下文不能睡眠"这个铁律就够了。

## 它背后的原理（别只记操作）
- Linux 驱动分离了**机制（mechanism）和策略（policy）**：内核提供访问硬件的机制（驱动），用户态程序决定使用策略。例如，内核驱动暴露 `/dev/gpio` 接口，应用程序决定 LED 的闪烁模式。
- 内核模块不能直接调用 C 库函数（如 `printf`）。内核空间只能调用内核 API（如 `printk`），因为内核模块运行在内核态，而 glibc 是用户态库。

## 我能复用/改编的点
> 字符设备驱动的 `file_operations` 模板可以从简单 LED 驱动改造成 SPI 设备驱动、I²C 传感器驱动，核心框架不变。
> 设备树中 pinctrl 配置的模式可以套用到任何开发板的 GPIO 外设。

## 关联
- 概念：[[Linux驱动与内核模块]] [[设备树DeviceTree]] [[uboot与启动流程]] [[GDB调试器]] [[编译工具链]] [[互斥与信号量]] [[中断NVIC]] [[Linux文件IO与系统调用]]
- 教程：[[20-树莓派系统搭建与内核编译]] [[22-Linux基础与开发工具实战]]

## 来源
- Knowledge-Notes: Linux驱动知识整理、ALPHA I.MX系统移植/应用开发/驱动学习、韦东山驱动大全/驱动基础、Linux开源项目、GDB学习笔记、Makefile/cmake学习笔记、Shell脚本模板、同步与互斥笔记、进程与中断上下文、Uboot到内核启动流程
