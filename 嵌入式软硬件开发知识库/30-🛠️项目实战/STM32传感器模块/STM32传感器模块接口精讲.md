---
类型: 项目
tags: [项目, 传感器, STM32]
创建: 2026-07-21
状态: 已完成
---

# STM32 传感器模块接口精讲

> 信盈达《STM32 传感器模块合集》的实战提炼：5 个模块（光敏/酒精/雨滴/超声波/LED 闪烁）怎么接到 STM32、用什么外设读、代码长什么样。核心套路只有三类——**模拟量走 ADC、数字开关量走 GPIO、超声波走定时器输入捕获**。

## 0. 一个前置提醒（很重要）
本合集示例代码全部基于 **STM32F4xx 标准外设库（StdPeriph，"库函数版本"）**，与库里已有的 [[STM32F103]] / [[HAL库结构]] 在引脚和 API 上不同，但**接口思路完全通用**：
- 模拟传感 → ADC；数字阈值 → GPIO 读电平；超声波 → 定时器 PWM 触发 + 输入捕获回波。
- 换到 F103/HAL，只是改引脚号和 `HAL_ADC_Start()` 这类 API，逻辑不变。

## 1. 光敏电阻模块（模拟 + 数字）
**接口 4 脚**：VCC / GND / DO（比较器阈值输出）/ AO（分压模拟量）。
**接线**：AO → PA3（ADC1_CH3 模拟输入）；DO → 任意 GPIO 读高低。
**代码（取自示例 adc.c / main.c，F4 标准库）**：
```c
// adc.c：ADC1_CH3 = PA3，12 位，软件触发
GPIO_InitStructure.GPIO_Mode = GPIO_Mode_AN;   // 模拟输入
GPIO_InitStructure.GPIO_Pin  = GPIO_Pin_3;
RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);
ADC_InitStructure.ADC_Resolution = ADC_Resolution_12b;
// main.c：平均采样 → 电压换算
value = get_adc1_ch3_average_value();
printf("电压值为%.1f\r\n", (value*3.3/4096));   // 12 位满量程 4096 = 3.3V
```
**工程师思维**：要"亮不亮"用 DO（二值，最简单）；要"有多亮"用 AO 走 [[ADC]] 换算。阈值由板载电位器定，软件不用算。详见 [[光敏电阻传感器]]。

## 2. MQ-3 酒精传感器（模拟 + 数字，需预热）
**接口**：同光敏，AO/DO 两路。
**接线**：AO → ADC 任意通道；DO → GPIO。
**工程师思维**：上电**先延时 ~20s 预热**（加热丝升温），再读数，否则漂移。AO 读浓度趋势，DO 做超阈值报警。详见 [[MQ气体传感器]]。

## 3. 雨滴传感器（模拟 + 数字）
**接口**：同光敏，AO/DO 两路。
**接线**：AO → ADC；DO → GPIO。
**工程师思维**：和光敏/酒精是同一套读取代码（都是 LM393 + 分压），可写成通用 `read_analog_sensor()`。智能窗户场景里雨滴只是综合板一路，详见 [[雨滴传感器]]。

## 4. 超声波模块 HC-SR04（定时器 PWM + 输入捕获）
**接口**：VCC / GND / Trig（触发）/ Echo（回波）。
**接线（示例）**：Trig → PA6（TIM13_CH1 PWM）；Echo → PA7（TIM14_CH1 输入捕获）。
**代码（取自示例 pwm.c / tim14.c / main.c）**：
```c
// main.c
tim13_ch1_pwm(1000, 200);   // PA6 发触发脉冲
tim14_ch1_capture(1000);    // PA7 捕获回波高电平宽度
printf("距离是: %0.1f 厘米\r\n", (double)(high/58.0));  // 经典 HC-SR04 公式
// tim14.c：上升沿/下降沿捕获，IRQ 里累加 high 时间
TIM_ICInitStruct.TIM_ICPolarity = TIM_ICPolarity_Rising;
```
**工程师思维**：Trig 给 ≥10µs 高脉冲→模块发 8 个 40kHz 波→Echo 高电平宽度 = 声波往返时间；距离 = high/58 cm。模块要 **5V 供电**，Echo 可能超 3.3V→接 F1/3.3V MCU 前需 [[电平转换]]。详见 [[超声波测距]]。

## 5. LED 闪烁（GPIO 翻转最基础）
**说明**：源目录 `LED闪烁` 为空（无资料），但它是所有 STM32 入门第一步——`GPIO_Init` 设推挽输出，循环 `GPIO_SetBits/GPIO_ResetBits` 翻转即闪。对应库里 [[GPIO]] 卡。

## 6. 检查清单（接任何模拟/数字传感前自查）
- [ ] 供电电压对不对（3.3V 还是 5V？模块多标 3.3~5V，但超声波必须 5V）
- [ ] AO 接 ADC、DO 接 GPIO，别接反
- [ ] 5V 输出的 Echo/DO 进 3.3V MCU 前是否要 [[电平转换]]
- [ ] MQ 类上电预热够不够（~20s）
- [ ] 多路同形态传感器（光敏/酒精/雨滴）可共用一套 ADC 读取函数，注意各自电位器阈值独立

## 7. 复盘
这 5 个模块把"传感器 → MCU"的三条主干全涵盖了：ADC（连续量）、GPIO 电平（二值）、定时器捕获（时间量）。信盈达把它们做成统一 4 脚（VCC/GND/DO/AO）封装，正是为了让你**一套代码吃遍所有环境传感器**——这正是工程师"接口标准化"思维的体现。

关联笔记：[[光敏电阻传感器]] [[MQ气体传感器]] [[雨滴传感器]] [[超声波测距]] [[GPIO]] [[ADC]] [[比较器电路]] [[STM32传感器模块地图]] [[STM32传感器模块资料索引]]
