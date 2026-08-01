---
类型: 概念
tags: [概念,嵌入式Linux]
主题: Linux中断管理
创建: 2026-07-24
状态: 已完成
---
# Linux中断管理

## 一句话定义
Linux 中断管理是内核对硬件中断的统一管理机制，包括中断注册、上半部/下半部处理、中断共享、线程化中断等。

## 它解决什么问题 / 为什么存在
裸机里中断就是写 ISR 直接操作寄存器，Linux 中断涉及进程调度、并发安全、不能睡眠等约束。内核提供统一框架让驱动注册中断处理函数，并用下半部机制（软中断/tasklet/工作队列）把耗时工作延后执行。

## 核心原理（大二能懂的水平）
核心概念：
1. 注册中断：request_irq(irq, handler, flags, name, dev) 或 devm_request_irq()
2. 上半部（hardirq）：中断处理函数，执行快、不能睡眠
3. 下半部机制：
   - tasklet：软中断上下文，不能睡眠，原子操作
   - workqueue：进程上下文，可以睡眠，适合 I2C/文件操作
4. 设备树中断：interrupts = <GIC_SPI 88 IRQ_TYPE_LEVEL_HIGH>;
5. 线程化中断：request_threaded_irq() 把处理放内核线程，可睡眠

flags 常用：IRQF_SHARED(共享中断)、IRQF_TRIGGER_FALLING(下降沿)

## 关键参数 / 易错点
- 中断处理函数绝对不能睡眠（不能用 mutex、不能 kmalloc(GFP_KERNEL)）
- 需要睡眠的操作用 workqueue 或线程化中断
- devm_request_irq 自动释放，优先用
- 共享中断必须传 dev 参数区分
- 中断号从设备树获取：irq_of_parse_and_map(node, 0)

## 类比（帮助理解）
中断管理像医院急诊：上半部=分诊台（快速判断病情），下半部=诊室（详细检查治疗）。分诊台不能花太长时间，否则后面病人（其他中断）排队。

## 设计时怎么用（反推思维）
反推：驱动需要响应硬件事件 -> 设备树声明中断 -> request_irq 注册 -> 上半部快速处理 -> 耗时操作放 workqueue -> 工作队列中完成 I2C 读取等操作。

## 典型应用
按键中断驱动、网卡中断、USB 中断、任何需要异步响应硬件事件的 Linux 驱动。

## 关联
- 前置知识：[[Linux驱动与内核模块]]、[[设备树DeviceTree]]
- 相关：[[中断NVIC]]（MCU 级中断对比）、[[Input输入子系统]]、[[Linux内核并发控制]]
- 扩展阅读：项目中 ch03-06.驱动中断管理

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-06; Linux kernel interrupt docs
