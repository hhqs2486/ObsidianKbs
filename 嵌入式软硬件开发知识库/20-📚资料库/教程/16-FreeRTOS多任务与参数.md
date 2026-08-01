---
类型: 教程
tags: [嵌入式软硬件开发知识库, 教程]
来源: FreeRTOS Embedded Development Learning Library (GitHub: Despacito0o)
创建: 2026-07-22
状态: 种子
---

# FreeRTOS多任务与参数

## 这条教程在解决什么
- 掌握 FreeRTOS 中多任务的动态创建与删除：父子任务链、自删除、跨任务删除
- 深入理解 Task 参数 (`pvParameters`)：同一个任务函数 + 不同参数 = 不同行为
- 学习临界区保护 (`taskENTER_CRITICAL` / `taskEXIT_CRITICAL`) 在处理共享资源时的用法
- 对应 `Despacito/006` 和 `Despacito/007` 项目

## 关键步骤（我照着做的）

### Part 1：多任务创建与删除（006）

**任务五种状态**：
- 运行态(Running) → 正在用 CPU
- 就绪态(Ready) → 排着队等 CPU
- 阻塞态(Blocked) → 等延时/信号量/队列，让出 CPU
- 挂起态(Suspended) → 被人为暂停，不参与调度
- 删除态(Deleted) → 已销毁，资源回收

**实战演示三个任务的创建/删除链**：
```
Task1(优先级1) 创建 Task2(优先级2) → 计数5后创建 Task3(优先级3)
Task2(优先级2) 计数10后 → vTaskDelete(NULL) 自删除
Task3(优先级3) 计数5后 → vTaskDelete(Task1_Handle) 删别人
```

**关键 API**：
```c
// 动态创建（006 重点）
xTaskCreate(TaskFunction, "Name", StackSize, Params, Priority, &Handle);

// 删除任务
vTaskDelete(NULL);           // 自删除
vTaskDelete(Task1_Handle);   // 删除其他任务
```

**预期行为观察**：
- 高优先级任务创建后立即抢占 CPU
- Task2 自删除后调度器切给最高就绪优先级
- Task3 删 Task1 后，Task1 消失不再输出

### Part 2：任务参数详解（007）

**`void*` 类型参数的灵活性**：
- 传递字符串（`char str[]`）
- 传递结构体（GPIO 引脚 + 延时时间 + 消息内容）
- 传递整数（`(void*)10`，需类型转换）
- 传递函数指针（回调模式）

**核心技巧——单函数多实例**：
```c
// 通用任务函数
void myPrintf(void* arg) {
    char *str = (char*)arg;   // void* → 实际类型
    while(1) {
        taskENTER_CRITICAL();
        printf("%s\n", str);
        taskEXIT_CRITICAL();
        vTaskDelay(500);
    }
}

// 三个任务用同一个函数，不同参数
char str1[] = "myTask1 running!";
char str2[] = "myTask2 running!";
char str3[] = "myTask3 running!";
xTaskCreate(myPrintf, "Task1", 128, str1, 2, &h1);
xTaskCreate(myPrintf, "Task2", 128, str2, 2, &h2);
xTaskCreate(myPrintf, "Task3", 128, str3, 2, &h3);
```

**临界区保护**的用法：`taskENTER_CRITICAL()` 关中断 → 保护共享资源操作（如 printf 发送不被打断）→ `taskEXIT_CRITICAL()` 恢复中断。

## 我卡住/没懂的地方
- **临界区不能太长**：关中断期间系统停摆（SysTick 不计数、调度停止），只包最关键的几行代码
- 任务删除后的"幽灵引用"：如果 A 删了 B，但 C 还拿着 B 的 TaskHandle_t 用 → 硬错（HardFault）
- 同优先级任务执行顺序：按时间片轮流，tick 中断触发切换——如果没写 `vTaskDelay` 就一直占着 CPU

## 它背后的原理（别只记操作）
- `vTaskDelete(NULL)` 不是"秒删"：先把任务标记为 deleted，下次调度时才真正回收 TCB 和栈（由 Idle Task 执行清理）
- 优先级抢占是**即时**的：`xTaskCreate` 创建更高优先级任务 → 立刻触发 PendSV 切换
- 临界区 = 关闭所有可屏蔽中断（`configMAX_SYSCALL_INTERRUPT_PRIORITY` 以下的中断被屏蔽），不是关全局中断

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 多任务删除链 → 做任务生命周期管理（如"开启所有任务"→"关闭所有任务"的一键启停）
- 单函数多实例 → 通用传感器读取任务，参数传不同传感器的地址/引脚
- 临界区保护 → 任何多个任务共享资源的场景（串口、I2C 总线、全局变量）

## 关联
- 概念：[[任务与调度]]、[[动态任务创建]]、[[FreeRTOS]]、[[指针与内存]]
- 项目：[[16-FreeRTOS多任务与参数]]

## 来源
- Despacito/006（多任务创建与删除）、Despacito/007（任务参数详解）
