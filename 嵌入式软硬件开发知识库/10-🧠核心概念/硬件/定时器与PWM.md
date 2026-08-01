---
类型: 概念
主题: 定时器与PWM
tags: [概念]
创建: 2026-07-20
状态: 种子
---
# 定时器与PWM

## 一句话定义
定时器（TIM）是 MCU 内部靠时钟驱动、自动累加/递减的计数器；PWM（脉冲宽度调制）则利用定时器比较输出，用"高电平占周期比例"来等效模拟量（调亮度、调速）。

## 它解决什么问题 / 为什么存在
软件 `for` 延时不准又占 CPU；要产生精确周期、精确占空比的信号（呼吸灯、电机调速、舵机），必须由硬件定时器自动完成。

## 核心原理（大二能懂的水平）
F103 有 TIM1~TIM8（高级/通用/基本）。核心是三个寄存器：CNT 当前计数值、ARR 自动重装载值（决定周期 = (ARR+1)/计数频率）、CCRx 比较值（决定占空比）。CNT 从 0 累加到 ARR 溢出循环；当 CNT<CCRx 输出一种电平，否则另一种（PWM1/PWM2 模式决定极性）。占空比 = CCRx/(ARR+1)。SysTick 是内核 24 位定时器，HAL 用它做 `HAL_Delay` 的 1ms 时基。

## 关键参数 / 易错点
- 时钟来源：APB1(36M)/APB2(72M) 经预分频 PSC 得计数频率。例：72M/(71+1)=1MHz，ARR=99 → 10kHz。
- 改占空比用 `__HAL_TIM_SET_COMPARE`，不用重配通道。
- 忘了 `HAL_TIM_PWM_Start` 就改 CCR，引脚没波形。

## 类比（帮助理解）
像电风扇定时开关：ARR 是"一圈多久"，CCRx 是"转到哪停下换档"，占空比就是"开的时间占比"。

## 设计时怎么用（反推思维）
- 需求反推：精确延时/计时 → 定时器基础；调光调速 → PWM 输出。
- CubeMX：选 TIMx → Clock Source=Internal，Channel=x PWM Generation；配 PSC/ARR、Pulse(初值)、PWM Mode。
- HAL：`HAL_TIM_PWM_Start(&htim4, TIM_CHANNEL_3);` 然后 `__HAL_TIM_SET_COMPARE(&htim4, TIM_CHANNEL_3, 50);`

## 典型应用
LED 呼吸灯、舵机角度、直流电机调速、蜂鸣器频率。

## 关联
- 前置知识：[[时钟树]]、[[GPIO]]
- 相关：[[中断NVIC]]
- 反例/误区：忘了 `HAL_TIM_PWM_Start` 就改 CCR，引脚无输出。

## 来源
04-STM32F103HAL库开发.pdf §08 Timer / 8.3 PWM
