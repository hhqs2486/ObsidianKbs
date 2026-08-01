---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# 模板字符串 t-strings（PEP 750）

## 一句话定义
> Python 3.14 引入 `t"..."` 语法，像 f-string 但产生可自定义处理的模板对象，而非直接求值为字符串。

## 它解决什么问题 / 为什么存在
- f-string 直接拼接字符串，无法做 SQL 参数化/HTML 转义/国际化等安全处理
- 现有方案（如 SQLAlchemy text()、Jinja2）各自发明语法，不统一

## 核心原理（大二能懂的水平）
- `t"Hello {name}"` 产生 Template 对象，包含原始字符串片段和插值表达式
- 你定义处理函数（如 `html()`、`sql()`）接收 Template 并安全处理
- 本质：把「模板」和「如何渲染」分离，框架/库自定义渲染逻辑

```python
from string.templatelib import Template

def sql(t: Template) -> tuple[str, list]:
    """安全的参数化 SQL"""
    parts = []
    params = []
    for chunk in t:
        if isinstance(chunk, str):
            parts.append(chunk)
        else:
            parts.append("?")
            params.append(chunk.value)
    return "".join(parts), params

query, args = sql(t"SELECT * FROM users WHERE id = {user_id}")
```

## 关键参数 / 易错点
- 需要实现自定义渲染函数，不像 f-string 开箱即用
- 每个 DSL 需要自己写处理器（但社区会提供常用库）
- 与 f-string 语法类似但有本质区别（不自动转字符串）

## 类比（帮助理解）
- f-string 是「即食快餐」，t-string 是「食材包」——你可以按自己的食谱做菜（SQL/HTML/Markdown）。

## 设计时怎么用（反推思维）
> 做需要参数化字符串的场景（SQL、HTML模板、Shell命令）时，用 t-string 替代 f-string 防注入。

## 关联
- 前置知识：[[f-string改进(PEP701)]] [[字符串处理]]
- 相关：[[FastAPI现代Web]]

## 来源
- Python 3.14 What's New (PEP 750)
