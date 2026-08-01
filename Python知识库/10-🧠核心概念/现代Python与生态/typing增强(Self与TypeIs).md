---
类型: 概念
主题: typing 增强（Self / TypeIs / 类型默认值）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# typing 增强（Self / TypeIs / 类型默认值）

## 一句话定义
> 3.11 的 `typing.Self`、3.13 的 `typing.TypeIs`、类型参数默认值、只读 TypedDict、弃用标注等让类型系统更强。

## 它解决什么问题 / 为什么存在
- 链式返回自身、类型收窄、标注弃用等以前要各种 hack。

## 核心原理（大二能懂的水平）
- `def clone(self) -> Self:`；`TypeIs[T]` 做类型收窄(isinstance 的 typing 版)；`@warnings.deprecated` 标注。

## 关键参数 / 易错点
- 这些是「类型检查期」工具，运行时不强制；需 mypy/pyright。

## 类比（帮助理解）
- 像给类型系统打补丁，让检查器更懂你的意图。

## 设计时怎么用（反推思维）
> 写链式 API 用 Self；做类型守卫用 TypeIs。

## 关联
- 前置知识：[[类型标注]]
- 相关：[[装饰器]]

## 来源
- PEP 673 (Self,3.11) / PEP 742 (TypeIs,3.13)
