---
类型: 教程
tags: [嵌入式软硬件开发知识库, 教程]
来源: FreeRTOS Embedded Development Learning Library (GitHub: Despacito0o)
创建: 2026-07-22
状态: 种子
---

# FreeRTOS环境搭建与移植

## 这条教程在解决什么
- 从零搭建 STM32F103 标准库（StdPeriph）Keil 开发环境
- 将 FreeRTOS V10.0.1 内核移植到 STM32F103 平台，跑通第一个 LED 闪烁任务
- 对应 `Despacito/001` 和 `Despacito/002` 项目

## 关键步骤（我照着做的）

### Part 1：STM32 标准库环境搭建（001）
1. 安装 Keil MDK V5.38+、STM32F1 标准库
2. 创建 Keil 工程，添加标准库源文件（stm32f10x_gpio.c / rcc.c / misc.c 等）
3. 配置时钟（HSE 8MHz → PLL → 72MHz SysClk）
4. 点灯验证：GPIO PC13 推挽输出、LED 闪烁

### Part 2：FreeRTOS 移植（002）
1. 创建 `FreeRTOS/` 文件夹，建立 inc/src/port 三个子目录
2. 复制内核文件：
   - inc/: FreeRTOS/Source/include/*.h
   - src/: tasks.c / queue.c / list.c / croutine.c / timers.c / event_groups.c / stream_buffer.c
   - port/: port.c / portmacro.h (RVDS/ARM_CM3) + heap_4.c (MemMang)
3. 编写 `FreeRTOSConfig.h`，关键配置：
   - `configCPU_CLOCK_HZ` = 72MHz
   - `configTICK_RATE_HZ` = 1000（1ms 节拍）
   - `configMAX_PRIORITIES` = 32
   - `configTOTAL_HEAP_SIZE` = 20KB
   - `configUSE_PREEMPTION` = 1（抢占式）
   - 中断映射：SVC_Handler / PendSV_Handler / SysTick_Handler
4. 修改 `stm32f10x_it.c`：SysTick_Handler 中调用 `xPortSysTickHandler()`
5. 在 Keil 工程添加 FreeRTOS 文件、配置 Include Paths
6. main.c 中创建 LED 任务 → `vTaskStartScheduler()`

### 测试代码（移植验证）
```c
void led_task(void *pvParameters) {
    while(1) {
        GPIO_SetBits(GPIOC, GPIO_Pin_13);
        vTaskDelay(500);
        GPIO_ResetBits(GPIOC, GPIO_Pin_13);
        vTaskDelay(500);
    }
}
```

## 我卡住/没懂的地方
- FreeRTOSConfig.h 里的 `configKERNEL_INTERRUPT_PRIORITY` 移位操作（PRIO_BITS=4，左移 4 位填充高 nibble）需要回顾 [[中断NVIC]] 的优先级分组概念
- heap_4.c 碎片整理的具体算法细节——目前先当作黑盒用，后续看 [[FreeRTOS 内存管理]]

## 它背后的原理（别只记操作）
- 移植的核心是**平台抽象层**（port.c + portmacro.h）：任务切换靠 PendSV 中断（最低优先级中断），SysTick 提供心跳节拍
- FreeRTOSConfig.h = RTOS 行为的"总开关"：所有 `config*` 宏在编译时决定功能裁剪，不用的关掉省资源
- SysTick 中断里要判断调度器是否已启动（`xTaskGetSchedulerState()`），否则启动前 tick 不归 FreeRTOS 管

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 移植到其他 Cortex-M 系列（M0/M4/M7）：只需换 port 文件夹（对应 Arch + 编译器）和芯片头文件
- Keil → CubeIDE/GCC：port 换 GCC 版本（ARM_CM3/GCC），Makefile 替代 Keil 工程配置

## 关联
- 概念：[[FreeRTOS]]、[[FreeRTOS 移植]]、[[任务与调度]]、[[中断NVIC]]
- 项目：[[14-FreeRTOS环境搭建与移植]]

## 来源
- FreeRTOS 源码包 V10.0.1 + STM32F1 标准库
- Despacito/001（环境搭建）、Despacito/002（移植）
