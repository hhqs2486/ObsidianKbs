---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# UTF-8 默认编码（PEP 686）

## 一句话定义
> Python 3.15 起，默认文本编码从「依赖系统 locale」改为 UTF-8，终结跨平台编码乱码问题。

## 它解决什么问题 / 为什么存在
- Windows 默认编码是 GBK/cp1252，Linux 是 UTF-8——同一代码不同平台行为不一致
- `open("file.txt")` 在不同系统可能用不同编码读取，导致 UnicodeDecodeError
- 全球 Web/API/文件生态已 98%+ 使用 UTF-8
- PEP 540（3.7）已用 UTF-8 模式铺垫，PEP 686 彻底落实为默认

## 核心原理（大二能懂的水平）
- `encoding="utf-8"` 成为 `open()`、`io`、`sys.std*` 等的默认值
- 不再依赖 `locale.getpreferredencoding()`
- Python 内部始终用 UTF-8 处理文本，与操作系统解耦

```python
# 3.15：跨平台一致
with open("data.txt") as f:
    content = f.read()  # 永远是 UTF-8

# 之前 Windows 上可能是 GBK
```

## 关键参数 / 易错点
- Windows 上的老脚本如果依赖系统默认编码（GBK），读取本地文件可能乱码
- 仍需显式指定其他编码的场景：`open("legacy.txt", encoding="gbk")`
- `subprocess` 输出管道也默认 UTF-8
- 可通过 `PYTHONUTF8=0` 环境变量回退旧行为（不推荐）

## 类比（帮助理解）
- 像全国统一用普通话——以前各省方言（locale 编码），现在统一标准，沟通无障碍。

## 设计时怎么用（反推思维）
> 写跨平台代码时不再担心 open() 的编码参数，天然 UTF-8 安全。

## 关联
- 前置知识：[[文件IO]] [[字符编码]]
- 相关：[[tomllib读TOML]]

## 来源
- Python 3.15 What's New (PEP 686)
