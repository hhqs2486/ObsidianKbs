---

类型: 概念
主题: functools
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# functools 模块

## 一句话定义
> functools 是「操作函数的工具箱」：`partial` 冻结部分参数造新函数，`reduce` 累积归约，`lru_cache` 自动缓存，以及 `wraps` 修装饰器元数据。

## 它解决什么问题 / 为什么存在
- 想基于旧函数造个「参数半填好」的新函数，不想重写；想给函数加记忆化缓存；想写装饰器不丢原函数名。
- functools 把这些函数式常见需求标准化。

## 核心原理（大二能懂的水平）
- **类比**：`partial` 像「预设好收件人地址的快递单」——你填好一部分，剩下交给别人补；`lru_cache` 像「聪明的小抄」，算过的题直接抄答案不重算；`wraps` 像给包装盒贴回原标签。
- `partial(pow, 2)` 造出「平方」函数；`@lru_cache()` 装饰斐波那契；`@wraps(func)` 在装饰器里保留原名。

## 关键参数 / 易错点
- `functools.partial(func, *args, **kw)` 返回可调用对象。
- `lru_cache(maxsize=128)` 缓存最近结果，递归/重复计算神器；`maxsize=None` 无限缓存（小心内存）。
- 写装饰器务必用 `@functools.wraps(func)`，否则被装饰函数 `__name__`/`__doc__` 变样。
- `reduce(func, seq)` 在 3.x 移入 functools，左到右累积（也可用 [[推导式]] 替代简单情形）。

## 设计时怎么用（反推思维）
> 做「带默认值回调/递归记忆化/通用装饰器」时，我会用 partial、lru_cache、wraps，减少样板代码。

## 典型应用 / 我在哪见过
- 把 `requests.get` 预设 base_url 成专用客户端。
- 动态规划递归加 `@lru_cache`。

## 关联
- 前置知识：[[函数式编程]] [[装饰器]] [[闭包]] [[函数基础]]
- 相关：[[itertools模块]] [[collections模块]] [[标准库]]
- 反例/误区：[[装饰器]]（不写 wraps 会丢元数据）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§10.2 functools — 对可调用对象的高阶函数和操作
