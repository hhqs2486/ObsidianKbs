---
类型: 概念
tags: [概念,嵌入式Linux]
主题: SPI驱动框架
创建: 2026-07-24
状态: 已完成
---
# SPI驱动框架

## 一句话定义
Linux SPI 驱动框架与 I2C 类似，分层管理 SPI 控制器和 SPI 设备，通过设备树匹配，支持全双工传输。

## 它解决什么问题 / 为什么存在
SPI 常用于高速外设（Flash、显示屏、ADC），和 I2C 一样需要将控制器驱动与设备驱动解耦。SPI 是全双工、多线制，传输速度比 I2C 快，但引脚多（SCK/MOSI/MISO/CS）。

## 核心原理（大二能懂的水平）
分层结构：
1. SPI 核心：spi.c，提供注册接口
2. 主机驱动：SoC 的 SPI 控制器驱动，注册 spi_master + transfer_one
3. 设备驱动：注册 spi_driver，probe 里初始化

设备树：&ecspi1 { flash@0 { compatible = "my,spi-flash"; reg = <0>; spi-max-frequency = <50000000>; }; };

设备驱动核心：
- spi_sync() / spi_async()：同步/异步传输
- spi_write() / spi_read()：简化读写
- 结构体 spi_transfer + spi_message 管理传输序列

## 关键参数 / 易错点
- SPI 片选(CS)在设备树中用 reg 指定片选编号
- spi_max_frequency 必须设，防止超频
- 每次传输用 spi_message 组装多个 spi_transfer
- SPI Flash 有专门的 mtd 子系统，OLED 屏可能有 fbdev 驱动
- 设备树 compatible 匹配 of_match_table

## 类比（帮助理解）
SPI 框架和 I2C 框架是兄弟关系，区别：I2C 两线半双工地址寻址，SPI 四线全双工片选寻址。

## 设计时怎么用（反推思维）
反推：SPI 设备驱动 -> 设备树声明 ecspi 节点 + 片选 + 频率 -> 写 spi_driver -> probe 里 spi_write/read 操作设备 -> 注册对应子系统。

## 典型应用
SPI Flash（W25Q128）、SPI OLED 屏、SPI ADC、SD 卡（SPI 模式）、CAN 控制器（MCP2515）。

## 关联
- 前置知识：[[SPI]]（协议层）、[[Linux驱动与内核模块]]、[[设备树DeviceTree]]
- 相关：[[I2C驱动框架]]、[[Regmap框架]]
- 扩展阅读：项目中 ch03-08.spi 设备和驱动管理框架

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-08; Linux SPI subsystem docs
