---

类型: 概念
主题: typing
创建: 2026-07-21
状态: 种子
tags: [Python, 标准库与工程, 概念]
---
---

# typing 模块

## 一句话定义
> typing 提供「类型注解的词汇表」：`List[int]`、`Dict[str,float]`、`Callable`、`Optional`、`Union` 等，让你给变量/函数标注更复杂的类型。

## 它解决什么问题 / 为什么存在
- 基础注解只能写 `int`/`str`；容器里装什么、可不可能为 None、是不是函数，基础语法说不清。
- typing 让注解表达「列表里是整数」「可能是 None」「入参是函数」，配合 mypy 做静态检查。

## 核心原理（大二能懂的水平）
- **类比**：基础注解像在盒子上写「水果」；typing 让你写「一箱苹果(List[Apple])」「可能是空箱(Optional[Apple])」「能装水果或蔬菜(Union)」。机器据此提前发现「把石头当苹果放进去」的错。
- 运行时 typing 标注不影响执行，只是「给类型检查器和人看的说明书」。

## 关键参数 / 易错点
- `from typing import List, Dict, Optional, Union, Callable, Tuple`。
- `Optional[int]` == `Union[int, None]`。
- 容器泛型用大写：`List[int]`（不是 `list[int]`，后者 3.9+ 才支持）。
- 函数注解：`def f(x: int) -> str:`。
- 易错：typing 只在静态检查（mypy）时生效，运行时不会强制；3.9+ 可用内置 `list[int]` 语法。

## 设计时怎么用（反推思维）
> 写「库/大型项目」时，我会用 typing 给函数签名加 `Optional`/`List`/`Callable`，配合 mypy 在出错前抓类型 bug。

## 典型应用 / 我在哪见过
- 公共 API 标注返回 `Optional[Config]`。
- 回调参数标注 `Callable[[str], None]`。

## 关联
- 前置知识：[[类型标注]] [[函数基础]] [[标准库]]
- 相关：dataclasses 模块（注：3.7+ 才有） [[抽象基类]]
- 反例/误区：[[类型标注]]（typing 是注解的扩展词汇，不是运行时约束）

## 来源
- Python 3.6.5 标准库文档（完整中文版）§26.1 typing — 支持类型提示
