---
类型: 概念
tags: [Python知识库, 现代Python与生态]
主题: 现代Python与生态
创建: 2026-07-22
状态: 种子
---

# sentinel 内置哨兵类型（PEP 661）

## 一句话定义
> Python 3.15 新增 `sentinel` 内置工厂函数，创建独一无二的哨兵对象，替代 `None`/`object()`/自定义类的「魔法值」模式。

## 它解决什么问题 / 为什么存在
- 用 `None` 作哨兵有歧义（None 可能是合法值）
- 用 `_MISSING = object()` 丢失有意义的名字
- 用自定义类太啰嗦
- sentinel 提供简洁、可 pickle、可类型标注的官方方案

## 核心原理（大二能懂的水平）
- `MISSING = sentinel("MISSING")` 创建唯一对象，repr 显示名字
- 同一模块同一名字多次调用返回不同对象（类似 `object()`）
- 支持 pickle（通过模块名+变量名导入）
- 支持类型表达式：`int | type(MISSING)` 表示 int 或 MISSING

```python
MISSING = sentinel("MISSING")

def get(key, default=MISSING):
    if default is not MISSING:
        return cache.get(key, default)
    # 可以区分"用户传了 None"和"没传"
    ...
```

## 关键参数 / 易错点
- 需要模块级定义并赋值给变量才能 pickle
- 类型检查用 `is` 而非 `==`
- 不同于 `enum.Enum`：sentinel 是单值，enum 是一组值

## 类比（帮助理解）
- 像工厂出货时给每个包裹贴唯一标签——看标签就知道是哪个，不会和包裹内容混淆。

## 设计时怎么用（反推思维）
> 函数参数需要「没传值」的标记时，用 sentinel 替代 None，消除语义歧义。

## 关联
- 前置知识：[[函数(参数与返回值)]]
- 相关：[[frozendict(PEP814)]]

## 来源
- Python 3.15 What's New (PEP 661)
