---
类型: 教程
tags: [嵌入式软硬件开发知识库, 教程]
来源: FreeRTOS Embedded Development Learning Library (GitHub: Despacito0o)
创建: 2026-07-22
状态: 种子
---

# FreeRTOS队列通信

## 这条教程在解决什么
- 掌握 FreeRTOS 队列（Queue）用于任务间数据传递的完整用法
- 实现"生产者-消费者"模式：生产任务写队列、消费任务读队列
- 学会通过队列传输字符串和结构体，实现任务功能分离
- 对应 `Despacito/008` 项目（009 篇内容待补充）

## 关键步骤（我照着做的）

### 队列创建
```c
// 创建一个队列：2 个槽位，每槽 20 字节
QueueHandle_t myPrintfQueueHandler;
myPrintfQueueHandler = xQueueCreate(2, 20);
```

队列本质上是一个**环形缓冲区**：
- `uxLength` = 槽位数（队列深度）
- `uxItemSize` = 每个槽的字节数
- 写满时阻塞（或立即返回，取决于超时参数）
- 读空时阻塞（同理）

### 队列发送 API
| 函数 | 位置 | 说明 |
|------|------|------|
| `xQueueSend()` | 尾部 | 写入队尾，FIFO |
| `xQueueSendToFront()` | 头部 | 写入队头（插队） |
| `xQueueSendToBack()` | 尾部 | 同 xQueueSend |
| `xQueueSendFromISR()` | 尾部 | 中断中使用 |

### 队列接收 API
| 函数 | 说明 |
|------|------|
| `xQueueReceive()` | 读取并移除 |
| `xQueuePeek()` | 读取但保留（偷看一眼） |
| `uxQueueMessagesWaiting()` | 查看当前队列中有几条消息 |

### 实战：两个生产者 + 一个消费者
```
myTask1(优先级2) ──→ xQueueSend(data, 0) ──┐
myTask2(优先级2) ──→ xQueueSend(data, 0) ──┤ 
                                            ├──→ Queue(2,20)
myTask3(优先级2) ──→ xQueueReceive(..., portMAX_DELAY) ← 消费者
```

**字符串传输**：
```c
// 发送方
char data[20] = "myTask1 running";
xQueueSend(queue, data, 0);

// 接收方
char data[20];
xQueueReceive(queue, &data, portMAX_DELAY);
printf("%s\n", data);
```

**结构体传输**（更强）：
```c
struct print {
    char data[20];
    int cnt;
};

// 创建队列时用 sizeof(struct print)
Queue = xQueueCreate(2, sizeof(struct print));

// 发送
struct print msg = {.data = "myTask1 running"};
msg.cnt++;
xQueueSend(Queue, &msg, 0);

// 接收
struct print msg;
xQueueReceive(Queue, &msg, portMAX_DELAY);
printf("%s:%d\n", msg.data, msg.cnt);
```

### 阻塞超时参数的含义
| 超时值 | 行为 |
|--------|------|
| `0` | 不等待，立即返回。成功→pdPASS，失败→errQUEUE_FULL/EMPTY |
| `portMAX_DELAY` | 无限等待，直到写入/读取出成功 |
| `100` | 等 100ms，超时则返回失败 |

## 我卡住/没懂的地方
- 队列里的数据是**按值复制**，不是传引用——所以发送后可以立即修改局部变量不影响队列中的副本
- 队列满了怎么处理？有几种策略：①阻塞等（portMAX_DELAY）②丢弃旧数据写新（需自己实现覆盖逻辑）③加队列长度
- 中断里 send 必须用 `FromISR`，而且不会真的阻塞——如果队列满了 ISR 版会立刻返回失败

## 它背后的原理（别只记操作）
- 队列底层是 ring buffer + 两个链表（等待发送的任务链表 + 等待接收的任务链表）
- 写入时：数据 memcpy 到环形缓冲区 → 如果有任务在等接收，直接复制给它（**不经过队列缓冲**，这叫"队列直接传递"优化）
- 读取时：如果有任务在等发送（说明队列空了），直接把发送任务的数据 memcpy 给接收方——0 拷贝
- `portMAX_DELAY` 本质：任务阻塞并把自己挂到队列的等待链表上，直到另一任务 send/receive 唤醒

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 生产者-消费者模式 → ADC 采集任务写队列，LCD 显示任务读队列
- 多对一汇聚 → 多个传感器任务把数据汇总到一个处理任务
- 结构体传递 → 命令队列（任务发指令 + 参数给执行任务）
- 队列作为数据缓冲 → UART 接收中断 push 字节到队列，解析任务 pull 整帧

## 关联
- 概念：[[队列通信]]、[[栈与队列]]、[[FreeRTOS]]、[[任务与调度]]、[[互斥与信号量]]
- 项目：[[17-FreeRTOS队列通信]]

## 来源
- Despacito/008（队列通信详解）
