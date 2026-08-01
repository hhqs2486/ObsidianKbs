---

类型: 概念
主题: contextlib
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# contextlib 模块

## 一句话定义
> contextlib 帮你更轻松地写「`with` 上下文管理器」：用 `@contextmanager` 把普通函数变成管理器，还有 `closing`、`suppress` 等便捷工具。

## 它解决什么问题 / 为什么存在
- 手写上下文管理器要实现 `__enter__`/`__exit__` 类，啰嗦。
- 很多场景只是「做前准备、做后清理」，用 `yield` 一句话表达最自然。

## 核心原理（大二能懂的水平）
- **类比**：`with` 像「自动门」——进（enter）开门，出（exit）关门。contextlib 让你不用造整扇门，只要写「开门→yield→关门」三步走。
- `@contextmanager` + `yield`：yield 前是 `__enter__`，yield 后是 `__exit__`。

## 关键参数 / 易错点
- `@contextmanager` 装饰的生成器：`yield resource` 把资源交给 `as`；yield 后写清理，且要用 `try/finally` 保证清理执行。
- `contextlib.suppress(FileNotFoundError)` 静默忽略指定异常，比 `try/except pass` 优雅。
- `contextlib.closing(obj)` 确保退出时调用 `obj.close()`。
- `redirect_stdout/stderr` 临时重定向输出，常用于测试。
- 易错：yield 必须恰好一次；清理代码没包 try/finally 会在异常时跳过。

## 设计时怎么用（反推思维）
> 做「临时改配置/开关资源/忽略特定异常」时，我会用 `@contextmanager` 或 `suppress`，让 `with` 块自动收尾。

## 典型应用 / 我在哪见过
- 测试里临时 mock 环境变量。
- 自动关闭非标准资源。

## 关联
- 前置知识：[[上下文管理器]] [[迭代器与生成器]] [[异常处理]] [[标准库]]
- 相关：[[标准库]] [[文件IO]]
- 反例/误区：[[上下文管理器]]（简单场景别再手搓 __enter__/__exit__ 类）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§29.6 contextlib — 为 with 语句的实用工具
