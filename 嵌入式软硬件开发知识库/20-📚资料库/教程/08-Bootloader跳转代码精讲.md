---
类型: 教程
来源: 原创精讲（综合 Cortex-M / STM32 Bootloader 跳转惯例 + 本项目 OTA 分区）
tags: [教程, Bootloader, OTA, STM32, 进阶]
创建: 2026-07-20
状态: 可复用
---

# 08-Bootloader 跳转代码逐行精讲

## 这条教程在解决什么
`2026-OTA智能控制终端` 里 Bootloader 要"把 CPU 交给 App 运行"，但**怎么交**、**为什么交之前要搬向量表**，是新手最易翻车的地方。本篇把 `jump_to_app()` 一个函数**逐行拆开**，并讲清 App 侧要配什么。直接复用本项目分区：BootLoader 8K@`0x08000000`，App1 28K@`0x08002000`，App2 28K@`0x08009000`，标志位 `0x0801FFFC`=`0xAAAAAAAA`。

## 关键内容（逐行精讲）

### Bootloader 侧：`jump_to_app()`
```c
typedef void (*pFunction)(void);

void jump_to_app(uint32_t app_addr)
{
    uint32_t msp_value = *(__IO uint32_t*)app_addr;                 // ①
    pFunction jump = (pFunction)(*(__IO uint32_t*)(app_addr + 4));  // ②

    if ((msp_value & 0x2FFE0000) != 0x20000000) return;             // ③

    __disable_irq();                                                 // ④
    HAL_RCC_DeInit();                                                // ⑤
    HAL_DeInit();                                                    // ⑥
    for (int i = 0; i < 8; i++) {                                    // ⑦
        NVIC->ICER[i] = 0xFFFFFFFF;
        NVIC->ICPR[i] = 0xFFFFFFFF;
    }
    SCB->VTOR = app_addr;                                           // ⑧
    __set_MSP(msp_value);                                           // ⑨
    jump();                                                         // ⑩
}
```

| 行 | 在干啥 | 不这么做会怎样 |
|----|--------|----------------|
|①|读出 App 区**第 0 个字**——Cortex-M 规定它是初始主栈指针 MSP|拿到错误栈顶，App 一用栈就崩|
|②|读出**第 1 个字**——复位向量，即 App 的 `Reset_Handler` 地址|跳错地方，直接跑飞|
|③|校验栈顶是否在 SRAM 范围(`0x20000000` 起)。空片全 `0xFF` 会被拦下|跳进未烧录/损坏的 App 死机|
|④|关全局中断|跳转瞬间来个中断，PC 跑到 Bootloader 的向量表→HardFault|
|⑤⑥|复位时钟与外设到初始状态|App 假设 HSI/默认外设，结果时钟/寄存器是 Bootloader 留下的→异常|
|⑦|清所有中断的"使能"和"挂起"位|残留挂起中断在 jump 后立刻触发|
|⑧|**搬向量表**到 App 区|最易漏！不搬则 App 的中断仍指向 Bootloader 地址→HardFault|
|⑨|把 MSP 切到 App 的初始栈顶|App 用错栈，变量互相踩|
|⑩|调用复位向量，相当于"软复位"进 App|——|

> OTA 里 Bootloader 读 `0x0801FFFC` 决定跳 `0x08002000`(App1) 还是 `0x08009000`(App2)，再调本函数。

### App 侧：必须重映射自己的向量表
App 编译时 `VECT_TAB_OFFSET` 要等于它的偏移，否则①步之后中断仍错：
```c
// system_stm32f1xx.c 的 SystemInit() 里，或 main() 开头：
SCB->VTOR = FLASH_BASE + 0x2000;   // App1 偏移 0x2000（App2 用 0x9000）
```
CubeMX 里：`Project Manager → 改 VECT_TAB_OFFSET = 0x2000`（或在 `system_stm32f1xx.c` 改宏）。

### 链接脚本：App 的 FLASH 起始要对上
App 的链接文件 FLASH 起点 = `0x08002000`，长度 `0x7000`(28K)；否则代码被链到 `0x08000000` 与 Bootloader 重叠。

## 我卡住/没懂的地方（高频坑）
- **跳过去一进中断就 HardFault** → 99% 是 ⑧ 没做，或 App 侧 `VECT_TAB_OFFSET` 没改。
- **跳过去时钟乱/外设不对** → 漏了 ⑤⑥，Bootloader 改过的时钟没复位。
- **App 烧错地址** → 链接脚本/下载工具没设偏移，App 实际在 `0x08000000` 覆盖了 Bootloader。
- **OTA 写入后要校验** → 本项目用 CRC32 分块校验（见 `2026-OTA智能控制终端`），校验过再置标志位跳转。

## 它背后的原理
Cortex-M 复位后从 `0x00000000`(映射自 `0x08000000`)取 MSP、取复位向量；`SCB->VTOR` 决定"向量表基址"。Bootloader 和 App 各有自己的向量表，所以跳转前后必须把 VTOR 和 MSP 都切到 App，CPU 才会按 App 的世界运行。

## 我能复用/改编的点
- `jump_to_app(addr)` 是通用模板，任何 STM32 双区/多区 Bootloader 直接抄。
- 校验逻辑（③）按芯片改 SRAM 基址掩码即可（F4/F7/H7 的 SRAM 范围不同）。
- 接 OTA：先 `flash_write(app_addr, data)` + CRC 校验 → 写标志位 → 软复位进 Bootloader → 由 Bootloader 跳对应 App。

## 关联
- 概念：[[Bootloader]] · [[OTA升级]] · [[2026-OTA智能控制终端]]
- 基础：[[CubeMX]] · [[HAL库结构]] · [[中断NVIC]] · [[时钟树]]
- 进阶：[[07-FreeRTOS进阶_通信与OTA重构]]

## 来源
原创精讲（综合 ARM Cortex-M 编程手册 + STM32 官方 Bootloader 示例；分区地址取自本项目 OTA 笔记）
