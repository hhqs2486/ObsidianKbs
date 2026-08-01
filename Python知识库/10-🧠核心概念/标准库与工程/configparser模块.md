---

类型: 概念
主题: configparser
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# configparser 模块

## 一句话定义
> configparser 读写「INI 风格配置文件」：用 `[段]` + `键=值` 组织设置，像 Windows 经典的 ini。

## 它解决什么问题 / 为什么存在
- 程序设置不想写死在代码里，也不想用 JSON（INI 对人类更友好、支持分段和注释）。
- configparser 解析 `[section]` 结构，按段取键值。

## 核心原理（大二能懂的水平）
- **类比**：INI 文件像「带抽屉的文件柜」，每个抽屉(section)装一类设置；configparser 是「按抽屉+标签取东西」的助手。比 [[序列化(json与pickle)]] 更像给人看的便利贴。
- `config['db']['host']` 取；`config.read('app.ini')` 载入。

## 关键参数 / 易错点
- 值默认都是**字符串**，数字要用 `getint/getfloat/getboolean`。
- `config.read()` 找不到文件不报错，返回空列表——要自己判断。
- `config['section'] = {'k':'v'}` 写回用 `config.write(f)`。
- 易错：直接当字符串用数字导致类型错；多段同名会被覆盖。

## 设计时怎么用（反推思维）
> 做「小工具/服务的配置」时，我会用 configparser 存 INI，把环境相关参数（路径、开关）外置，不硬编码。

## 典型应用 / 我在哪见过
- 数据库连接/日志级别配置。
- 脚本的多环境切换。

## 关联
- 前置知识：[[标准库]] [[文件IO]] [[字典]]
- 相关：[[csv模块]] [[序列化(json与pickle)]]（序列化）
- 反例/误区：[[序列化(json与pickle)]]（复杂嵌套配置才用 json/yaml）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§14.2 configparser — 配置文件解析器
