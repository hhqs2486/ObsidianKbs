---
类型: 概念
tags: [概念,嵌入式Linux]
主题: I2C驱动框架
创建: 2026-07-24
状态: 已完成
---
# I2C驱动框架

## 一句话定义
Linux I2C 驱动框架是内核管理 I2C 总线和设备的分层架构，将总线控制器驱动、设备驱动和设备描述分离，通过设备树匹配。

## 它解决什么问题 / 为什么存在
裸机 I2C 是直接操作寄存器发 START/STOP/ACK，Linux 中 I2C 控制器（SoC 端）和 I2C 设备（传感器等）可能来自不同厂商，需要解耦。框架让控制器驱动提供传输能力，设备驱动只关心读写什么寄存器，设备树描述「哪个设备挂在哪条总线什么地址」。

## 核心原理（大二能懂的水平）
分层结构：
1. I2C 核心：i2c-core.c，提供注册/注销接口
2. 适配器驱动：SoC 的 I2C 控制器驱动，注册 i2c_adapter + i2c_algorithm（master_xfer）
3. 设备驱动：注册 i2c_driver，probe 里初始化设备

设备树：&i2c1 { sensor@48 { compatible = "my,sensor"; reg = <0x48>; }; };

设备驱动核心：
- i2c_driver.probe：设备树匹配后调用
- i2c_transfer() / i2c_smbus_read_byte_data()：读写寄存器
- i2c_set_clientdata()：保存私有数据

## 关键参数 / 易错点
- I2C 设备地址 7bit，设备树 reg 写的就是这个地址
- i2c_smbus_* 接口比 i2c_transfer 简单，优先用
- 一条总线可挂多个设备，每个有不同地址
- 用 i2cdetect 工具扫描总线上的设备
- 设备树 compatible 必须和驱动 of_match_table 匹配

## 类比（帮助理解）
I2C 框架像快递网络：适配器驱动=快递公司的分拨中心（运输能力），设备驱动=发件人/收件人（寄什么收什么），设备树=地址标签（谁在哪里）。

## 设计时怎么用（反推思维）
反推：I2C 传感器驱动 -> 设备树声明 i2c 节点 + 设备地址 + compatible -> 写 i2c_driver -> probe 里用 i2c_smbus 读芯片 ID 验证 -> 注册 input/hwmon 等子系统。

## 典型应用
MPU6050 加速度计、ADS1115 ADC、各种 I2C 传感器、OLED 屏、EEPROM。

## 关联
- 前置知识：[[I²C]]（协议层）、[[Linux驱动与内核模块]]、[[设备树DeviceTree]]
- 相关：[[SPI驱动框架]]、[[Regmap框架]]、[[Input输入子系统]]
- 扩展阅读：项目中 ch03-07.i2c 设备和驱动管理框架

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-07; Linux I2C subsystem docs
