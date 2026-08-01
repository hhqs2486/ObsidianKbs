---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# TypedDict 额外项（PEP 728）

## 一句话定义
> Python 3.15 允许 TypedDict 声明 `extra_items`，表示除显式列出的键外还可包含额外的同类型键值对。

## 它解决什么问题 / 为什么存在
- 原有 TypedDict 只能精确指定键集合，无法表达「有已知键 + 任意额外键」
- JSON API 返回的字典常有固定字段 + 动态扩展字段
- 之前只能用 `Dict[str, Any]` 放弃类型安全，或 `TypedDict` 放弃灵活性

## 核心原理（大二能懂的水平）
- `extra_items` 声明未知键的类型约束
- 可以只用 `extra_items` 不声明具体键（替代 `Dict[str, X]`）

```python
from typing import TypedDict

class Config(TypedDict, extra_items=str):
    """配置字典：已知键 + 任意额外字符串键"""
    host: str
    port: int
    # 任何其他 str 键的值也必须是 str

# 合法
c: Config = {"host": "localhost", "port": 8080, "debug": "true"}
# host 和 port 类型正确（str/int），debug 也满足 extra_items(str)
```

## 关键参数 / 易错点
- `extra_items` 的值类型约束所有未声明的键
- 与 `total=False` 可组合使用
- 不能与关闭类型检查的 `# type: ignore` 混用——本就是为了类型安全

## 类比（帮助理解）
- 普通 TypedDict 像固定座位的会议室（N 个指定座），extra_items 像指定座位 + 可加板凳（同款凳子）。

## 设计时怎么用（反推思维）
> 处理有动态字段的 JSON API 响应时，用 TypedDict + extra_items 获得最大类型安全。

## 关联
- 前置知识：[[typing增强(Self与TypeIs)]] [[类型标注]]
- 相关：[[TypeForm(PEP747)]]

## 来源
- Python 3.15 What's New (PEP 728)
