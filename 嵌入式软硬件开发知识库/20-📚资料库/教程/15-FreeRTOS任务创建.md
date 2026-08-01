---
类型: 教程
tags: [嵌入式软硬件开发知识库, 教程]
来源: FreeRTOS Embedded Development Learning Library (GitHub: Despacito0o)
创建: 2026-07-22
状态: 种子
---

# FreeRTOS任务创建

## 这条教程在解决什么
- 掌握 FreeRTOS 两种任务创建方式：动态（xTaskCreate）和静态（xTaskCreateStatic）
- 理解 FreeRTOS 五种内存管理策略（heap_1~5），以及堆大小/栈深度的设置
- 完善 FreeRTOS 工程：添加串口（printf 调试输出）、规范化 FreeRTOSConfig.h
- 对应 `Despacito/003`、`Despacito/004`、`Despacito/005` 项目

## 关键步骤（我照着做的）

### Part 1：动态任务创建（003）

**xTaskCreate API 六个参数**：
```c
BaseType_t xTaskCreate(
    TaskFunction_t pvTaskCode,     // 任务函数指针
    const char * const pcName,     // 任务名（调试用，max 16 字节）
    configSTK_SIZE_TYPE usStackDepth, // 栈深度（以字为单位，不是字节！）
    void *pvParameters,            // 传递给任务的参数
    UBaseType_t uxPriority,        // 优先级（越大越高）
    TaskHandle_t *pxCreatedTask    // 任务句柄，用于后续操作
);
// 返回值：pdPASS 成功 / errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY 内存不足
```

**heap 方案选择**：
| 方案 | 特点 | 适用场景 |
|------|------|----------|
| heap_1.c | 只分配不释放，无碎片 | 创建后不删任务 |
| heap_2.c | 可释放但会碎片 | 不推荐 |
| heap_3.c | 包装 malloc/free | 需线程安全 malloc |
| heap_4.c | 相邻空闲块合并(碎片整理) | **最常用** |
| heap_5.c | 跨多块非连续内存 | 有外部 RAM |

**实战代码**：创建两个不同优先级的 LED 任务 + 结构体参数传递。

**任务控制 API**：`vTaskDelete()` / `vTaskSuspend()` / `vTaskResume()` / `vTaskPrioritySet()` / `uxTaskPriorityGet()`。

**内存排查**：
- 用 `xPortGetFreeHeapSize()` 监控剩余堆
- 用 `uxTaskGetStackHighWaterMark()` 查栈余量
- `configCHECK_FOR_STACK_OVERFLOW` 启用栈溢出检测

### Part 2：静态任务创建（004）

**与动态的核心区别**：栈和 TCB 由用户预先分配（`static` 数组），编译时确定内存占用。

```c
// 预分配
static StaticTask_t xTaskBuffer;
static StackType_t xStack[configMINIMAL_STACK_SIZE];

// 创建
TaskHandle_t xHandle = xTaskCreateStatic(
    vTaskFunction, "STATIC_TASK",
    configMINIMAL_STACK_SIZE, (void*)1, 1,
    xStack, &xTaskBuffer
);
```

**必须实现的回调**：
```c
void vApplicationGetIdleTaskMemory(...)  // 空闲任务
void vApplicationGetTimerTaskMemory(...) // 定时器任务（如果 configUSE_TIMERS=1）
```

必须在 `FreeRTOSConfig.h` 中设置 `configSUPPORT_STATIC_ALLOCATION = 1`。

**静态方式的优势**：固定内存占用（编译时可知）、无碎片、适合安全关键型应用。

### Part 3：工程完善（005）

5 个关键动作：
1. 复制 003 模板为新工程 `005`
2. 替换完整版 `FreeRTOSConfig.h`（规范注释版本）
3. 添加 `Driver/usart/` 目录，放入 `usart.c` / `usart.h`
4. 重定向 printf → `fputc()` → USART1（PA9 TX / PA10 RX, 115200）
5. 处理静态内存分配回调（从 004 复制 `vApplicationGetIdleTaskMemory`）

**FreeRTOSConfig.h 核心宏速查**：
- `configUSE_PREEMPTION` = 1 → 抢占式调度
- `configUSE_TICKLESS_IDLE` = 1 → 低功耗模式
- `configCPU_CLOCK_HZ` = SystemCoreClock → 72MHz
- `configTICK_RATE_HZ` = 1000 → 1ms tick
- `configMAX_PRIORITIES` = 32
- `configMINIMAL_STACK_SIZE` = 128 字
- `configTOTAL_HEAP_SIZE` = 20*1024

## 我卡住/没懂的地方
- **栈深度单位是"字"不是"字节"**：`128` 在 32 位系统 = 512 字节，这个容易搞错导致栈溢出
- heap_4 的碎片整理算法——目前当作黑盒，记住创建任务时 heap 一次分配 → 删除任务时释放合并
- 静态创建的 `StackType_t` 数组大小该怎么选？先用 `configMINIMAL_STACK_SIZE`（128字），不够用 `uxTaskGetStackHighWaterMark` 实测余量后调整

## 它背后的原理（别只记操作）
- `xTaskCreate` 内部分三步：①从堆分配 TCB ②从堆分配栈 ③初始化栈帧（压入初始寄存器值 / 返回地址 = 任务函数指针）→ 加入就绪链表
- 调度器 `vTaskStartScheduler()` 做的事：初始化 SysTick → 启动第一个任务（通过 PendSV 模拟"返回"到任务上下文）
- 栈关键：每个任务有独立栈，切换时现场（R4-R11）压入自己的栈，恢复时弹出

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- LED 任务模板 → 换成 ADC 采集任务 / 串口发送任务 / 传感器读取任务
- 结构体参数传递模式 → 一个通用任务函数 + 不同参数 = 多个行为不同的实例（工厂模式）
- 工程模板 005 → 后续所有实验的基础工程

## 关联
- 概念：[[动态任务创建]]、[[静态任务创建]]、[[FreeRTOS 内存管理]]、[[FreeRTOS]]、[[任务与调度]]
- 项目：[[15-FreeRTOS任务创建]]

## 来源
- Despacito/003（动态任务）、Despacito/004（静态任务）、Despacito/005（工程完善）
