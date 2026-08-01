---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# lazy imports 显式延迟导入（PEP 810）

## 一句话定义
> Python 3.15 支持 `lazy import` 语法，模块在被实际使用前不加载，显著加速启动时间。

## 它解决什么问题 / 为什么存在
- CLI 工具/大型应用导入重型库（numpy/pandas/torch）拖慢启动，即使某些分支不需要它们
- 之前用 `importlib.util.LazyLoader` 或 `import` 放函数内，语法丑陋
- Go/Rust/JS 等语言已有原生 lazy import 机制

## 核心原理（大二能懂的水平）
- `lazy import numpy` 声明后，numpy 仅在首次访问其属性时才真正导入
- 未访问则完全不加载，零开销
- 支持过滤函数：`sys.set_lazy_imports("all")` 全局懒加载 + `set_lazy_imports_filter()` 排除关键模块

```python
lazy import numpy  # 声明但不加载
lazy import pandas as pd

def analyze():
    # 真正导入发生在这里
    return pd.DataFrame(numpy.random.rand(3, 3))

# analyze() 不调用，numpy/pandas 永远不加载
```

## 关键参数 / 易错点
- 只能在模块级作用域使用 `lazy`，函数/类体内报 SyntaxError
- `lazy from module import *` 不允许
- `lazy from __future__ import ...` 不允许
- 延迟模块的导入错误延迟到第一次使用时才抛出
- 可通过 `lazy_modules` 列表声明兼容旧版本代码

## 类比（帮助理解）
- 像图书馆「闭架借阅」：书（模块）先登记，真要看时才去取，不看的书不搬。

## 设计时怎么用（反推思维）
> CLI 工具和大型应用用 lazy import 把重型依赖延迟到需要时才加载，冷启动可快 2-5×。

## 关联
- 前置知识：[[模块与导入]]
- 相关：[[性能优化]]

## 来源
- Python 3.15 What's New (PEP 810)
