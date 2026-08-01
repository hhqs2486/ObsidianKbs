---
类型: 概念
tags: [概念,嵌入式Linux]
主题: Regmap框架
创建: 2026-07-24
状态: 已完成
---
# Regmap框架

## 一句话定义
regmap 是 Linux 内核提供的寄存器访问抽象层，统一了 I2C/SPI/MMIO 等不同总线的寄存器读写接口，并内置缓存机制。

## 它解决什么问题 / 为什么存在
同一个芯片可能有 I2C 和 SPI 两个版本，寄存器操作完全一样但总线接口不同。没有 regmap 时需要为每种总线写不同的读写代码。regmap 抽象掉总线差异，驱动只需声明寄存器表和位宽，用统一的 regmap_read/regmap_write 操作。

## 核心原理（大二能懂的水平）
使用流程：
1. 声明 regmap_config：指定 reg_bits（寄存器地址宽度）、val_bits（值宽度）、max_register、volatile_table
2. 初始化：devm_regmap_init_i2c() 或 devm_regmap_init_spi()
3. 读写：regmap_read(map, reg, &val) / regmap_write(map, reg, val)
4. 批量操作：regmap_multi_reg_write() 一次写多个寄存器
5. 字段操作：regmap_field 可以操作寄存器中某几位

缓存：regmap 可缓存寄存器值，减少总线访问。volatile_table 标记不缓存的寄存器（如状态寄存器）。

## 关键参数 / 易错点
- reg_bits 和 val_bits 必须正确，否则读写错位
- volatile 寄存器（如中断状态）必须加入 volatile_table
- 缓存类型默认 none，需要时设 cache_type = REGCACHE_RBTREE
- regmap 让 I2C/SPI 驱动代码几乎可以共用

## 类比（帮助理解）
regmap 像万能遥控器：不管电视是红外、蓝牙还是 Wi-Fi 连接，按「音量+」都是同一个按钮，遥控器内部翻译成对应协议。

## 设计时怎么用（反推思维）
反推：芯片有 I2C/SPI 版本 -> 用 regmap 抽象总线差异 -> 配置 regmap_config -> 统一用 regmap_read/write -> 驱动代码跨总线复用。

## 典型应用
RTC 芯片、音频 Codec、PMIC（电源管理 IC）、ADC/DAC、任何有寄存器的 I2C/SPI 设备。

## 关联
- 前置知识：[[I2C驱动框架]]、[[SPI驱动框架]]
- 相关：[[Linux驱动与内核模块]]
- 扩展阅读：项目中 ch03-10.regmap 驱动框架说明

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-10; Linux regmap docs
