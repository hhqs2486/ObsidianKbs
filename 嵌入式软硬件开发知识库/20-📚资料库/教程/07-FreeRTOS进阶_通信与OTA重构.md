---
类型: 教程
来源: 原创进阶（综合 FreeRTOS 通信原语 + OTA 终端重构实践）
tags: [教程, FreeRTOS, STM32, 进阶]
创建: 2026-07-20
状态: 可复用
---

# 07-FreeRTOS 进阶：任务间通信实战与 OTA 终端重构

## 这条教程在解决什么
上篇 `06-FreeRTOS_STM32_CubeMX实操` 让你把 FreeRTOS 跑起来了，但任务之间怎么"说话"、怎么把已有的裸机 OTA 终端代码重构成多任务，才是真功夫。本篇做两件事：**① 队列/信号量代码对碰（生产者↔消费者一起看）**；**② 用它们把 `2026-OTA智能控制终端` 的裸机骨架重构成任务架构**。

## 关键内容

### A. 任务间通信三件套（CMSIS-RTOS V2）

**① 队列 Queue —— 传数据**
```c
// 消费者任务：阻塞等命令
void StartCtrlTask(void *arg){
  uint8_t cmd;
  for(;;){
    if (osMessageQueueGet(ctrlQueueHandle, &cmd, NULL, osWaitForever) == osOK)
      Execute(cmd);            // 真正干活，不在中断里干
  }
}
// 生产者：串口收完一帧，在回调里塞队列（ISR 内 timeout 必须 0）
void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart){
  osMessageQueuePut(ctrlQueueHandle, &rxByte, 0, 0);
  HAL_UART_Receive_IT(huart, &rxByte, 1);   // 重新开启接收
}
```

**② 事件标志 / 二值信号量 —— 做同步通知**
```c
// 中断通知"有新数据/按键"
void HAL_GPIO_EXTI_Callback(uint16_t pin){
  osThreadFlagsSet(ctrlTaskHandle, 0x1);    // 代替裸机的全局 flag
}
// 任务里等
osThreadFlagsWait(0x1, osFlagsWaitAny, osWaitForever);
```

**③ 互斥量 Mutex —— 保护共享资源**
```c
osMutexId_t spiMutex = osMutexNew(NULL);
osMutexAcquire(spiMutex, osWaitForever);
// 操作共享 SPI Flash / OLED（一次只给一个任务）
osMutexRelease(spiMutex);
```

> **对碰口诀**：中断里只"发信号/塞队列"（且排队超时写 0），重活一律丢给任务；任务间传**数据**用队列，传**事件**用标志/信号量，护**共享资源**用互斥量。

### B. 重构 OTA 终端裸机代码

**裸机原貌（问题版）**
```c
// main.c：全挤在一个大循环 + 全局标志
while (1) {
  if (uart_rx_flag) { parse_cmd(); uart_rx_flag = 0; }  // 解析卡主循环
  if (timer_flag)   { sample();      timer_flag = 0; }   // 采集不定时
  if (ota_flag)     { do_ota(); }                         // 升级时通信全断
}
// 中断里塞 flag/全局变量，耦合严重、实时性差
```

**从需求反推 → 拆 3 个任务（CubeMX 里加 Task）**
| 任务 | 优先级 | 干啥 | 数据怎么来 |
|------|--------|------|------------|
| `CommTask` | High | 收 MQTT/串口命令、触发 OTA | 等 `ctrlQueue` / 线程标志 |
| `SensorTask` | Normal | 定时采集传感器 | `osDelay(采样周期)` |
| `CtrlTask` | Normal | 执行控制（继电器/LED） | 从 `ctrlQueue` 取命令 |

```c
void StartCommTask(void *arg){
  for (;;){
    uint8_t cmd;
    if (osMessageQueueGet(ctrlQueueHandle, &cmd, NULL, osWaitForever) == osOK){
      if (cmd == CMD_OTA) TriggerOta();   // 见 [[Bootloader]] 跳转流程
      else Execute(cmd);
    }
  }
}
// 共享 SPI Flash 读写统一走 spiMutex，避免 CtrlTask 与 OTA 写冲突
```

**重构收益**：采集不被通信卡住、OTA 期间传感器照采、共享外设不再竞态——这正是上 RTOS 的初衷。

## 我卡住/没懂的地方（进阶坑）
- **队列满丢数据** → `osMessageQueuePut` 用非 0 超时做流控，或增大队列/做应用层确认。
- **互斥量在中断里不可用** → ISR 只发标志，任务里再 `osMutexAcquire`。
- **优先级反转** → 高优先级等低优先级持有的锁时卡住；FreeRTOS 互斥量带优先级继承可缓解，但仍要避免持锁做阻塞调用。
- **HAL_UART_Receive_IT 不重开** → 只收一字节就停；回调末尾必须再次 `Receive_IT`。

## 它背后的原理
队列本质是**线程安全的环形缓冲**，内核保证多任务同时读写不撕裂；信号量/线程标志是"轻量事件"，只通知不搬数据；互斥量 = 锁 + 优先级继承。三者分工明确：数据走队列、事件走标志、资源走互斥。

## 我能复用/改编的点
- 这套"采集/通信/控制"三任务模板可直接套到任何物联网终端。
- 把裸机 `if(flag)` 逐条改成"任务 + 队列/标志"，是通用的重构套路。
- 共享外设统一加互斥量，比裸机加关中断更干净、不影响实时性。

## 关联
- 基础：[[06-FreeRTOS_STM32_CubeMX实操]] · [[FreeRTOS]] · [[任务与调度]] · [[互斥与信号量]] · [[栈与队列]]
- 落地：[[2026-OTA智能控制终端]] · [[Bootloader]] · [[UART]] · [[中断NVIC]]

## 来源
原创进阶笔记（综合 FreeRTOS 官方文档 + STM32 项目重构惯例）
