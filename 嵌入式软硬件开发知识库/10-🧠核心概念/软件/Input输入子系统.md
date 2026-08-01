---
类型: 概念
tags: [概念,嵌入式Linux]
主题: Input输入子系统
创建: 2026-07-24
状态: 已完成
---
# Input输入子系统

## 一句话定义
Linux input 子系统是统一管理输入设备（键盘、鼠标、触摸屏、摇杆）的框架，屏蔽硬件差异，向上提供统一的 /dev/input/eventX 接口。

## 它解决什么问题 / 为什么存在
如果没有 input 子系统，每个输入设备驱动都要自己实现文件操作接口，应用层也要为每种设备写不同代码。input 子系统分层：设备驱动层（硬件交互）-> 核心层（事件分发）-> 事件处理层（evdev/keyboard/mouse），驱动只需上报事件。

## 核心原理（大二能懂的水平）
三层架构：
1. 事件处理层：evdev（通用）、keyboard（键盘）、mousedev（鼠标）
2. 核心层：input_register_device() 注册设备，input_event() 上报事件
3. 设备驱动层：硬件初始化 + 中断处理 + 上报 input_event

驱动开发步骤：
1. devm_input_allocate_device() 分配 input_dev
2. 设置支持的事件类型：set_bit(EV_KEY, input_dev->evbit)
3. 设置支持的键值：set_bit(KEY_POWER, input_dev->keybit)
4. input_register_device() 注册
5. 中断里 input_event(dev, EV_KEY, KEY_POWER, 1) 上报 + input_sync(dev) 同步

应用层：读 /dev/input/eventX 获取 struct input_event 结构

## 关键参数 / 易错点
- 上报事件后必须 input_sync()，否则事件不完整
- 触摸屏需上报 ABS_X/ABS_Y + BTN_TOUCH
- 设备树中 compatible = "gpio-keys" 可用内核自带 gpio-keys 驱动，不用自己写
- evtest 工具可查看 input 事件

## 类比（帮助理解）
input 子系统像快递分拣中心：各个快递员（驱动）把包裹（事件）送到分拣中心（核心层），分拣中心按类型分发到不同窗口（事件处理层），顾客（应用）在对应窗口取件。

## 设计时怎么用（反推思维）
反推：做按键/触摸/摇杆驱动 -> 分配 input_dev -> 设定事件类型和键值 -> 注册 -> 中断里上报事件。

## 典型应用
按键驱动、触摸屏驱动、遥控器、游戏手柄、任何 Linux 输入设备。

## 关联
- 前置知识：[[Linux驱动与内核模块]]、[[设备树DeviceTree]]
- 相关：[[Pinctrl与GPIO子系统]]、[[Linux中断管理]]
- 扩展阅读：项目中 ch03-05.input 输入子系统

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-05; Linux input subsystem docs
