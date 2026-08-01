---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# 禁止退出 finally 块（PEP 765）

## 一句话定义
> Python 3.14 禁止在 `finally` 块内使用 `return`/`break`/`continue`，防止它们静默吞掉异常。

## 它解决什么问题 / 为什么存在
- `finally` 内 `return` 会吞掉 `try` 中抛出的异常，且不报警告
- `break`/`continue` 在 finally 中改变循环流程，行为难以预测
- 这是最常见的 Python 陷阱之一

## 核心原理（大二能懂的水平）
- 编译器在 finally 块中检测 `return`/`break`/`continue` 并报 SyntaxError
- 不影响 `finally` 中正常的清理逻辑
- 如需在 finally 中有条件退出，用标志变量 + 在外层判断

```python
# 3.14 禁止：SyntaxError
try:
    risky()
finally:
    return "safe"  # SyntaxError!

# 正确做法
result = None
try:
    result = risky()
finally:
    cleanup()
return result
```

## 关键参数 / 易错点
- 这是 **SyntaxError**（编译时），不是运行时警告
- 老代码中 finally 含 return 的需在升级前修改
- 不影响 try/except 块中的控制流

## 类比（帮助理解）
- 像消防通道规定不能锁死——finally 是逃生通道，堵上 return 等于锁门。

## 设计时怎么用（反推思维）
> 升级 3.14 前检查代码中 finally 块是否有 return/break/continue，迁移到标志变量模式。

## 关联
- 前置知识：[[异常处理]]
- 相关：[[异常组与except星]]

## 来源
- Python 3.14 What's New (PEP 765)
