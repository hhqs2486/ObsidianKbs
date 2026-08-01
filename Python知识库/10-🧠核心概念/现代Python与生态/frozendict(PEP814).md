---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# frozendict 内置不可变字典（PEP 814）

## 一句话定义
> Python 3.15 新增 `frozendict` 内置类型——不可变、可哈希的字典，类似 `tuple` 之于 `list` 的关系。

## 它解决什么问题 / 为什么存在
- 需要不可变映射作为 dict 键或 set 元素时，只能用 `tuple(sorted(d.items()))` 或 `MappingProxyType`
- 缓存键、配置常量、多线程安全共享都需要不可变字典
- 社区 `frozendict` 包已有百万级下载，证明需求真实

## 核心原理（大二能懂的水平）
- 继承 `object`（不是 `dict` 子类），创建后不可修改
- 所有键和值可哈希时，frozendict 本身也可哈希
- 保留插入顺序，但比较时不考虑顺序

```python
a = frozendict(x=1, y=2)
b = frozendict(y=2, x=1)
hash(a) == hash(b)  # True
a == b              # True
a["z"] = 3          # TypeError: 不支持修改

# 用作字典键
cache = {frozendict(method="GET", path="/api"): response}
```

## 关键参数 / 易错点
- 不是 `dict` 子类：`isinstance(d, dict)` 为 False，改为 `isinstance(d, (dict, frozendict))` 或 `isinstance(d, collections.abc.Mapping)`
- `json/pickle/copy/decimal` 等标准库模块已原生支持 frozendict
- `eval()` 和 `exec()` 的 globals 参数可接收 frozendict

## 类比（帮助理解）
- dict 是白板（随意擦写），frozendict 是石碑（刻完就不能改）。

## 设计时怎么用（反推思维）
> 配置常量、缓存键、多线程共享数据——用 frozendict 防止意外修改，获得可哈希能力。

## 关联
- 前置知识：[[字典dict]] [[不可变对象]]
- 相关：[[类型标注]] [[TypedDict额外项(PEP728)]]

## 来源
- Python 3.15 What's New (PEP 814)
