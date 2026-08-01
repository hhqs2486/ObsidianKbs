---
类型: 概念
tags: [概念,嵌入式Linux]
主题: Pinctrl与GPIO子系统
创建: 2026-07-24
状态: 已完成
---
# Pinctrl与GPIO子系统

## 一句话定义
pinctrl 框架管理 SoC 引脚的复用功能配置，gpio 子系统提供驱动中控制引脚电平的接口，两者配合完成 Linux 下 I/O 引脚管理。

## 它解决什么问题 / 为什么存在
SoC 引脚有限但功能多，每个引脚可复用为 GPIO/SPI/I2C/UART/LCD 等。裸机直接写寄存器选复用功能，Linux 中引脚数量大、板间差异大，需要统一框架管理复用和电平控制，避免驱动里硬编码寄存器地址。

## 核心原理（大二能懂的水平）
pinctrl（引脚复用）：
- 在设备树中声明引脚分组和复用功能
- 内核解析设备树时自动配置引脚复用寄存器
- 驱动通过 devm_pinctrl_get_select() 获取并选择引脚状态

gpio（电平控制）：
- 设备树中声明 gpio = <&gpio1 3 GPIO_ACTIVE_LOW>
- 驱动中：devm_gpio_request() -> gpio_direction_input/output() -> gpio_get_value()/gpio_set_value()
- sysfs 接口：/sys/class/gpio/ 用户空间操作

设备树示例：
led { compatible = "my-led"; pinctrl-0 = <&pinctrl_led>; gpio = <&gpio1 3 GPIO_ACTIVE_LOW>; };

## 关键参数 / 易错点
- pinctrl 在设备树中配置，驱动一般不用直接调 pinctrl API（除非需要状态切换如 default/sleep）
- gpio 编号因平台而异，不要硬编码，用设备树 + of_get_gpio()
- devm_ 前缀的接口自动管理资源释放，优先使用
- I.MX 用 iomuxc 节点，RK 用 pinctrl 节点，全志不同

## 类比（帮助理解）
pinctrl 像物业分配房间用途（这间当卧室/书房/厨房），gpio 像房间里的灯开关控制。

## 设计时怎么用（反推思维）
反推：驱动需要操作某个引脚 -> 设备树里声明 pinctrl 复用 + gpio 编号 -> 驱动用 devm_gpio_request 获取 -> 设置方向 -> 读写电平。

## 典型应用
LED 驱动、按键驱动、任何需要 GPIO 控制的 Linux 驱动开发。

## 关联
- 前置知识：[[设备树DeviceTree]]、[[Linux驱动与内核模块]]
- 相关：[[GPIO]]（MCU 级 GPIO 概念）、[[Input输入子系统]]、[[Linux中断管理]]
- 扩展阅读：项目中 ch03-04.pinctrl 和 gpio 子系统

## 来源
GitHub: zc110747/build_embed_linux_system (108章, 2026-07-22) ch03-04; Linux kernel pinctrl docs
