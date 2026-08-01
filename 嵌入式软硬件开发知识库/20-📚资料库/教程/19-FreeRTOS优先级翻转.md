---
类型: 教程
tags: [嵌入式软硬件开发知识库, 教程]
来源: FreeRTOS Embedded Development Learning Library (GitHub: Despacito0o)
创建: 2026-07-22
状态: 种子
---

# FreeRTOS优先级翻转

## 这条教程在解决什么
- 理解优先级翻转（Priority Inversion）的发生条件和危害
- 通过三任务实战，亲眼观察高优先级任务被中优先级任务"插队"的现象
- 了解三种解决方案：优先级继承、优先级天花板、关中断
- 对应 `Despacito/012` 项目

## 关键步骤（我照着做的）

### 场景设计

三个任务 + 一个共享二值信号量：
```
Task1（优先级2，低） → 持有信号量 3 秒
Task2（优先级3，中） → 不使用信号量，单纯跑 1.5 秒
Task3（优先级4，高） → 需要信号量，持有 1 秒
```

### 执行流程推演

```
时间轴↓

① 系统启动：Task3 优先运行，Take 信号量(成立)，跑 1s → Give → Delay 1s
② Task2 开始，跑 1.5s；跑到 1s 时 Task3 再次 Take → Give → Delay 1s
③ Task2 继续剩余 0.5s → Delay → Task1 获得 CPU
④ Task1 Take 信号量 → 开始 3s 长操作
⑤ 0.5s 后 Task3 Delay 结束，尝试 Take → 失败！（Task1 占着）
   → Task3 阻塞等待 Task1 Give
⑥ 此时 Task2 就绪 → 抢占 Task1（Task2 优先级 3 > Task1 优先级 2）
   → **优先级翻转发生**：中优先级的 Task2 在跑，高优先级的 Task3 在等低优先级的 Task1！
⑦ Task2 跑完一轮 → Task1 继续剩余工作 → Give 信号量
⑧ Task3 终于拿到信号量 → 继续运行
```

### 代码实现（012 工程）

**公用延时**（非阻塞方式，模拟 CPU 忙碌）：
```c
// delay.c —— 用 SysTick 做微秒延时
void Delay_us(uint32_t xus) {
    SysTick->LOAD = 72 * xus;
    SysTick->VAL = 0x00;
    SysTick->CTRL = 0x00000005;  // HCLK + enable
    while(!(SysTick->CTRL & 0x00010000));  // 等待计数完成
    SysTick->CTRL = 0x00000004;  // 关闭
}
void Delay_ms(uint32_t xms) { while(xms--) Delay_us(1000); }
void Delay_s(uint32_t xs)   { while(xs--) Delay_ms(1000); }
```

**Task1（低优先级，拿信号量干 3s 活）**：
```c
xSemaphoreTake(sem, portMAX_DELAY);   // 拿到锁
printf("Task1 executing...\r\n");
Delay_ms(3000);                        // 模拟长操作
xSemaphoreGive(sem);                   // 释放
vTaskDelay(1000);                      // 休息 1s
```

**Task2（中优先级，无关任务）**：
```c
printf("Task2 executing...\r\n");
Delay_ms(1500);                        // 无信号量操作
vTaskDelay(1000);
```

**Task3（高优先级，需要信号量）**：
```c
xSemaphoreTake(sem, portMAX_DELAY);   // 等信号量
printf("Task3 executing...\r\n");
Delay_ms(1000);                        // 短操作
xSemaphoreGive(sem);
vTaskDelay(1000);
```

### 三种解决方案

| 方案 | 原理 | 优缺点 |
|------|------|--------|
| **优先级继承** | 高优先级等锁时，临时把持锁者的优先级抬到高优先级→中等任务无法抢占 | FreeRTOS Mutex 自带 |
| **优先级天花板** | 凡可能访问共享资源的任务，统一设成最高优先级 | 简单，但牺牲调度灵活性 |
| **关中断** | 临界区关中断保证原子性 | 只适合极短操作，耗时长会丢中断 |

## 我卡住/没懂的地方
- 优先级继承是**临时**的：持锁者释放锁后优先级恢复原值
- 为什么 FreeRTOS 的 binary semaphore 不带优先级继承？因为信号量没有"所有者"概念，内核不知道该把谁的优先级抬上去——这就是为什么做互斥必须用 Mutex
- 优先级翻转在实际产品的后果：如果用 SPI Flash 的读写任务优先级低、UI 刷新优先级高但也要读 Flash → UI 卡死在等低优先级任务

## 它背后的原理（别只记操作）
- 翻转的本质：**三段依赖链**（高→低共享资源，中→无依赖）让调度器做出了"反直觉"的决策
- 这不是 bug，是**优先级调度 + 资源共享**的固有矛盾：调度器只看优先级、不看依赖关系
- 互斥量的优先级继承：`xQueueSemaphoreTake` 检测到锁被低优先级持有 → 把持有者的优先级提到与等待者相同 → 中优先级无法抢占 → 持有者尽快释放

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 延时函数 `Delay_ms/us`（无阻塞版）→ 用于任何需要精确短延时的场景（I2C 时序、DS18B20 单总线）
- 三任务翻转模型 → 面试/考试经典题，画出时序图就能拿分
- 诊断工具：如果系统出现"高优先级任务延迟异常大"的现象，排查是否是优先级翻转

## 关联
- 概念：[[优先级翻转]]、[[互斥锁 Mutex]]、[[互斥与信号量]]、[[二值信号量]]、[[任务与调度]]、[[FreeRTOS]]
- 项目：[[19-FreeRTOS优先级翻转]]

## 来源
- Despacito/012（优先级翻转详解与实战）
