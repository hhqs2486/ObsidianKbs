---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# except/except* 省略括号（PEP 758）

## 一句话定义
> Python 3.14 允许 `except` 和 `except*` 后面省略括号，写 `except ValueError` 而非 `except (ValueError,)`。

## 它解决什么问题 / 为什么存在
- 以前单异常 `except ValueError:` 正常，但多异常必须 `except (ValueError, TypeError):`
- PEP 758 统一语法：多异常直接 `except ValueError, TypeError:`（无需括号）
- 减少无意义的括号，写起来更自然

## 核心原理（大二能懂的水平）
- 解析器直接识别逗号分隔的异常列表
- 旧代码 `except (ValueError, TypeError):` 仍可用（向后兼容）

```python
# 3.14 新写法
try:
    ...
except ValueError, TypeError, KeyError:
    ...

# 旧写法仍然有效
try:
    ...
except (ValueError, TypeError, KeyError):
    ...
```

## 关键参数 / 易错点
- 仅省略括号，异常类的逗号分隔语意不变
- `except*`（异常组）同样支持

## 类比（帮助理解）
- 像超市结账：以前多件商品必须放篮子里（括号），现在可以直接放台面上。

## 设计时怎么用（反推思维）
> 写多异常捕获时省掉括号，代码更简洁。

## 关联
- 前置知识：[[异常处理]]
- 相关：[[异常组与except星]]

## 来源
- Python 3.14 What's New (PEP 758)
