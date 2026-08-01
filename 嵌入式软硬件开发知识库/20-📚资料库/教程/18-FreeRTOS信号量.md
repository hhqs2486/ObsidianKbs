---
类型: 教程
tags: [嵌入式软硬件开发知识库, 教程]
来源: FreeRTOS Embedded Development Learning Library (GitHub: Despacito0o)
创建: 2026-07-22
状态: 种子
---

# FreeRTOS信号量

## 这条教程在解决什么
- 掌握二值信号量（Binary Semaphore）的创建、获取、释放及三大应用场景
- 理解计数型信号量（Counting Semaphore）的底层实现与资源管理用法
- 从源码层面理解信号量本质（均基于队列实现）
- 对应 `Despacito/010` 和 `Despacito/011` 项目

## 关键步骤（我照着做的）

### Part 1：二值信号量（010）

**两种创建方式及区别**：

| 函数 | 初始值 | 适用场景 |
|------|--------|----------|
| `vSemaphoreCreateBinary(xSemaphore)` | 1（可用） | 直接开始用的同步 |
| `xSemaphoreCreateBinary()` | 0（不可用） | 等待别人先 Give |

**源码揭秘**——都是以长度为 1 的队列实现：
```c
// vSemaphoreCreateBinary：创建队列 + 自动 Give 一次
#define vSemaphoreCreateBinary(xSemaphore) \
{ \
    (xSemaphore) = xQueueGenericCreate(1, 0, queueQUEUE_TYPE_BINARY_SEMAPHORE); \
    if((xSemaphore) != NULL) { xSemaphoreGive((xSemaphore)); } \
}

// xSemaphoreCreateBinary：仅创建队列，不 Give
#define xSemaphoreCreateBinary() \
    xQueueGenericCreate(1, 0, queueQUEUE_TYPE_BINARY_SEMAPHORE)
```

**API 速查**：
```c
xSemaphoreTake(xSemaphore, portMAX_DELAY);   // 任务中获取
xSemaphoreGive(xSemaphore);                   // 任务中释放
xSemaphoreTakeFromISR(xSemaphore, &xHigher); // 中断中获取
xSemaphoreGiveFromISR(xSemaphore, &xHigher); // 中断中释放
```

**三大应用场景**：
1. **资源互斥访问**：Task A Take → 用资源 → Give；Task B Take → 阻塞等待
2. **任务同步**：Task A 完成工作后 Give → Task B Take 到后才开始
3. **中断通知任务**：ISR GiveFromISR → Task Take（事件驱动的经典模式）

**实战**：Task1 每 500ms Give 一次；Task2 永久阻塞 Take，拿到后打印。

### Part 2：计数型信号量（011）

**与二值的核心区别**：二值只有 0/1，计数型有 0~MaxCount 范围。

**创建**：
```c
// Max=100, Initial=0
SemaphoreHandle_t sem = xSemaphoreCreateCounting(100, 0);
```

**源码解析**——底层是队列，但队列项大小为 0（仅计数）：
```c
QueueHandle_t xQueueCreateCountingSemaphore(UBaseType_t uxMaxCount,
                                             UBaseType_t uxInitialCount)
{
    // 创建长度为 uxMaxCount 的队列，每项大小为 0
    xHandle = xQueueGenericCreate(uxMaxCount, 0, queueQUEUE_TYPE_COUNTING_SEMAPHORE);
    // 手动设置初始计数值
    ((Queue_t *)xHandle)->uxMessagesWaiting = uxInitialCount;
}
```

**操作语义**：
- `xSemaphoreGive()` → 计数值 +1（"资源回来一个"）
- `xSemaphoreTake()` → 计数值 -1（"拿走一个资源"）
- `uxSemaphoreGetCount()` → 查看当前计数值

**实战**：Task1 每次运行 Give 一次；Task2 每秒 Take 一次并打印当前计数值。

**类比**：停车场计数牌——进来一辆车 -1，出去一辆车 +1，数字就是剩余车位数。

## 我卡住/没懂的地方
- **二值信号量 ≠ 互斥量**：信号量没有"所有权"概念——任何任务都可以 Give 任何信号量；互斥量有优先级继承机制。所以做资源互斥访问应该用互斥量（[[互斥锁 Mutex]]）
- 二值信号量 once-Give 后队列已满，再 Give 无效（不会变成 2），需要 Take 后才能再次 Give
- 计数型信号量的 Give 超过 MaxCount 会失败

## 它背后的原理（别只记操作）
- 信号量的 Task/ISR 唤醒机制：Give 时检查等待接收的任务链表，有则直接唤醒最高优先级的那个
- 为什么 ISR 必须用 FromISR？因为 ISR 中不能阻塞，FromISR 版本不做阻塞操作且返回值暗示是否需要触发上下文切换

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 二值信号量 → GPIO 按键中断通知按键处理任务
- 二值信号量 → DMA 传输完成中断通知数据处理任务
- 计数型信号量 → 管理 N 个网络连接池 / N 个内存块池
- 计数型信号量 → 流量控制（令牌桶算法，MaxCount=速率，每秒 Give 一次）

## 关联
- 概念：[[二值信号量]]、[[计数型信号量]]、[[互斥与信号量]]、[[互斥锁 Mutex]]、[[FreeRTOS]]、[[任务与调度]]
- 项目：[[18-FreeRTOS信号量]]

## 来源
- Despacito/010（二值信号量）、Despacito/011（计数型信号量）
