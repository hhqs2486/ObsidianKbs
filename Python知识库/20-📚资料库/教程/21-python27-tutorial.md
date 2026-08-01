---

类型: 教程
来源: Python 2.7 Tutorial 中文版（官方 tutorial 翻译）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Python 2.7 Tutorial 中文版 教程笔记

## 这条教程在解决什么
- 这是官方 **The Python Tutorial** 的 Python 2.7 中文翻译版，按解释器、流程控制、数据结构、模块、输入输出、异常、类、标准库的顺序系统讲解语言本身。
- 定位：官方「标准入门文档」，权威、严谨，适合想**按官方体系**学 Python 的读者。
- ⚠️ 注意：本书基于 **Python 2.7**（已停止维护），部分语法（print 语句、除号语义、字符串编码）与今天主流的 Python 3 不同，需对照 [[Python]] 总览卡的版本说明使用。

## 关键内容（按章节提纲）
- Whetting Your Appetite：Python 能做什么（开胃菜）
- Using the Python Interpreter：[[Python]] 解释器、交互模式、命令行运行
- An Informal Introduction to Python：[[数据类型]]、[[字符串]]、数字、[[列表]] 快速上手
- More Control Flow Tools：[[控制流]]（if / for / while、[[推导式]]）
- Data Structures：[[列表]] [[元组]] [[字典]] [[集合]]、切片、常用方法
- Modules：[[模块与包]]、[[导入系统]]、标准库模块
- Input and Output：[[文件IO]]、格式化输出
- Errors and Exceptions：[[异常处理]] [[自定义异常]]
- Classes：[[类与对象]] [[继承]]、方法、特殊方法
- Brief Tour of the Standard Library (I/II)：[[标准库]] 概览（os / sys / 正则 / 日期时间 / 序列化 等）
- Floating Point Arithmetic：[[浮点数精度]] 问题与局限（官方专章，讲解为何 0.1+0.2≠0.3）

## 它背后的原理（别只记操作）
- 解释器循环（REPL）是学语言最快的反馈回路；先交互试，再写脚本。
- [[浮点数精度]]：二进制浮点无法精确表示多数十进制小数，比较浮点要用容差而非 `==`。

## 我能复用/改编的点
- 作为「官方语法字典」查漏补缺；Standard Library 两章可直接当 [[标准库]] 的索引清单。
- 教学时若遇到仍运行 Python 2 的旧系统/旧脚本，可据此定位 2/3 差异。

## 关联
- 概念：[[Python]] [[数据类型]] [[控制流]] [[函数基础]] [[类与对象]] [[模块与包]] [[文件IO]] [[异常处理]] [[标准库]] [[迭代器与生成器]] [[推导式]] [[浮点数精度]]
- 互补：与 tut28《Python入门指南》（同一官方教程的 **Python 3** 版）内容一一对应，二者差异即 2→3 的主要迁移点；零基础先读《A Byte of Python》更友好。

## 来源
- Python 2.7 Tutorial 中文版（官方 tutorial 翻译）；缓存 KEY `020_Python 2.7 Tutorial 中文版.pdf`，tut 21（TEXT，全文本可读）
