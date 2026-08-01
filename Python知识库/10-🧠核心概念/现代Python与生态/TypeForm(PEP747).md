---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# TypeForm 类型形式注解（PEP 747）

## 一句话定义
> Python 3.15 引入 `TypeForm` 类型，用于注解「类型本身的形式」，区分「类型对象」（如 `type[int]`）和「类型形式」（如 `int | str` 这种还没实例化的类型表达式）。

## 它解决什么问题 / 为什么存在
- 运行时 `isinstance(x, str | int)` 合法，但 `isinstance(x, list[str])` 不行——泛型在运行时是「类型形式」(TypeForm)，不是「类型对象」(type)
- 类型检查器中需要标注「这个参数接收一个类型表达式」的场景
- `Type[X]` 只能描述具体类型对象，无法描述联合/泛型等复合类型

## 核心原理（大二能懂的水平）
- `TypeForm[T]`：T 是类型表达式，而非运行时类型
- 用于函数参数标注，表示「传入一个 TypeForm 而非具体 type」

```python
from typing import TypeForm

def check_type(x: object, t: TypeForm) -> bool:
    """
    检查 x 是否符合类型形式 t
    示例：check_type(42, int) -> True
          check_type("hello", str | None) -> True
    """
    ...

# 类型检查器验证参数是否为有效类型表达式
```

## 关键参数 / 易错点
- 这是一个静态类型系统概念（编译时），运行时 TypeForm 就是 typing 内部表示
- 主要面向库作者（如 pydantic、SQLModel）和类型体操
- 与 `Type[T]` 的区别：TypeForm 接受 `str | None`、`list[int]` 等复合形式

## 类比（帮助理解）
- `Type[int]` 是「一个整数本身」，`TypeForm[int | str]` 是「一张写有"整数或字符串"的纸条」——纸条和整数是不同东西。

## 设计时怎么用（反推思维）
> 写类型工具库/pydantic 类校验框架时，用 TypeForm 精确表达参数的类型形式语义。

## 关联
- 前置知识：[[类型标注]] [[typing增强(Self与TypeIs)]]
- 相关：[[TypedDict额外项(PEP728)]] [[pydantic数据校验]]

## 来源
- Python 3.15 What's New (PEP 747)
