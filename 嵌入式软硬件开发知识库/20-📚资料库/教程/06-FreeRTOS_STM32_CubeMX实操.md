---
类型: 教程
来源: 原创实操（综合 FreeRTOS + STM32 HAL 通用知识）
tags: [教程, FreeRTOS, STM32, CubeMX]
创建: 2026-07-20
状态: 可复用
---

# 06-FreeRTOS on STM32：CubeMX 配置实操

## 这条教程在解决什么
当你用 STM32 做"既要持续采集、又要后台通信、还要前台响应按键"的项目（比如 [[2026-OTA智能控制终端]]）时，裸机 `while(1)` + 中断会越来越难维护。**从需求反推**：先把功能拆成几个独立任务，再用 CubeMX 把 FreeRTOS 配起来，让调度器去管 CPU 分配。本篇就是"从零把 FreeRTOS 在 STM32 上跑起来"的实操步骤。

## 关键内容（实操步骤）

### 1. 建工程 & 配时钟
- CubeMX 新建工程，选芯片（例：STM32F103C8T6）。
- `Pinout` → `RCC`：HSE 选 `Crystal/Ceramic Resonator`。
- `Clock Configuration`：把系统时钟配到 72MHz（HSE→PLL→SYSCLK）。

### 2. 开启 FreeRTOS（关键）
- 左侧 `Middleware` → `FREERTOS` → `Interface` 选 **CMSIS_V1**（F1 固件常见默认）或 **CMSIS_V2**（新固件，API 更现代）。
- `Tasks and Queues` 选项卡：点 `Add` 新建任务，填：
  - Task Name：`LedTask` / `CommTask`
  - Priority：`osPriorityNormal`（数字越大优先级越高）
  - Stack Size：默认 128 字（512 字节）偏小，复杂任务给 256~512 字
  - Entry Function：`StartLedTask`（CubeMX 会自动生成函数骨架）

### 3. 改 Timebase Source（最容易踩的坑）
- `System Core` → `SYS` → `Timebase Source` 必须改成 **除 SysTick 外的定时器**（如 TIM1）。
- 原因：FreeRTOS 自己占用 SysTick 做心跳，HAL 的 `HAL_Delay` 也依赖 Timebase，两者抢同一个会 HardFault。

### 4. 配队列 / 信号量（按需）
- 同页 `Queues` 加一个队列（如 `ctrlQueue`，Size=10，Item Size=4 字节）用于任务间传数据。
- `Semaphores` 加二值/计数信号量；`Mutexes` 加互斥量保护共享资源。

### 5. 生成代码
- `Project Manager` → `Toolchain/IDE` 选你的工具链；勾 `Generate peripheral initialization as a pair of '.c/.h' files`。
- 点 `GENERATE CODE`。任务骨架会出现在 `freertos.c` 的 `StartXxxTask()` 函数里。

### 6. 写任务体（CMSIS-RTOS V2 示例）
```c
void StartLedTask(void *argument) {
  for (;;) {
    HAL_GPIO_TogglePin(LED_GPIO_Port, LED_Pin);
    osDelay(500);          // 阻塞 500ms，让出 CPU 给别的任务
  }
}
// 在另一个任务里往队列发数据：
uint32_t cmd = 1;
osMessageQueuePut(ctrlQueueHandle, &cmd, 0, 0);
// 接收端：
osMessageQueueGet(ctrlQueueHandle, &cmd, NULL, osWaitForever);
```
> 若用的是 CMSIS_V1，API 是 `xTaskCreate` / `xQueueSend` / `vTaskDelay`，概念一致。

## 我卡住/没懂的地方（初学者高频坑）
- **下载后直接 HardFault** → 99% 是 `SYS→Timebase Source` 没改成 TIMx。
- **任务不切换 / 卡死** → 任务体里没有 `osDelay`/`vTaskDelay` 之类阻塞调用，同优先级一直占 CPU。
- **printf 卡死** → 串口没重定向或半主机(semihosting)没关；用 `SWO` 或自己重定向 `._write`。
- **中断里调用普通 API 崩** → 中断里只能用 `...FromISR` 版本，或用 `osThreadFlags` 通知任务。
- **栈溢出** → 任务里开了大数组/调用深层函数，用 `uxTaskGetStackHighWaterMark` 查余量再调大。

## 它背后的原理
CubeMX 生成的 `MX_FREERTOS_Init()` 调用 `osKernelInitialize()` + `osThreadNew()` 把你在图形界面填的任务注册进调度器；`osKernelStart()` 启动后，SysTick 每 tick 触发一次调度判断，高优先级就绪任务抢占运行。任务"阻塞"时（等延时/队列/信号量）主动让出 CPU，这就是多任务能"并发"的根本。

## 我能复用/改编的点
- 把现有裸机代码搬进任务：原 `while(1)` 主循环 → 一个 `MainTask`；各中断回调里只发信号/写队列，重活放到任务里做。
- 通用任务框架可直接复制：建任务 → 在 Entry 函数写 `for(;;){ 干活; osDelay(); }`。
- 需求变了只改 CubeMX 里的任务/队列配置，重新生成即可，不用手写调度。

## 关联
- 概念：[[FreeRTOS]] · [[任务与调度]] · [[互斥与信号量]] · [[栈与队列]]
- 工具：[[CubeMX]] · [[HAL库结构]] · [[中断NVIC]] · [[时钟树]]
- 项目落地：[[2026-OTA智能控制终端]]

## 来源
原创实操笔记（综合 FreeRTOS 官方文档 + STM32CubeMX 使用惯例；非单一 PDF）
