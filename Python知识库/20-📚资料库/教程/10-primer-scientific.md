---

类型: 教程
来源: 《A Primer on Scientific Programming with Python》(Langtangen, 2012)
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# A Primer on Scientific Programming with Python（科学计算 Python 入门）

## 这条教程在解决什么
- 给理工科学生/科研工作者一条「从数学公式到可运行 Python 程序」的最短路径：用贴近数学的写法做数值计算、绘图、文件处理、类与对象、随机数与微分方程，而不是泛泛讲语言语法。

## 关键内容（按 PDF 章节提纲）
- 1 Computing with Formulas：变量、算术、整数除法陷阱、浮点近似与舍入误差（[[浮点数精度]]）。
- 2 Loops and Lists：for/while、列表、列表推导（[[迭代器与生成器]]）。
- 3 Functions and Branching：函数定义、if 分支、`lambda` 快速定义匿名函数（[[函数式编程]]）。
- 4 Input Data and Error Handling：输入、异常与错误处理（[[异常处理]]）。
- 5 Array Computing and Curve Plotting：用 NumPy 数组做向量化计算与绘图。
- 6 Files, Strings, and Dictionaries：`enumerate` 同时取序号与元素（[[枚举]]）、字典、字符串、文件（[[文件IO]]）。
- 7 Introduction to Classes / 9 Object-Oriented Programming：类与对象、OOP（[[类与对象]]）。
- 8 Random Numbers and Simple Games：随机数（random 模块）、简单模拟。
- A–E Sequences & Difference Equations / Discrete & Differential Calculus / ODE 项目：用序列与差分方程建模、离散/连续微积分、常微分方程完整项目。
- F Debugging / G Migrating to Compiled Code / H Technical Topics：调试、迁移到 Fortran/C、进阶主题（含迭代与生成器用法，见 [[迭代器与生成器]]、[[上下文管理器]]）。

## 我卡住/没懂的地方
- 原书以 Python 2 示例为主（`print` 语句、`9/5` 整数除法），与 Python 3 有差异，需注意除法语义与 `print()` 函数化。
- `yield/send` 协程在原书着墨有限，本库另立 [[协程]] 卡作 语言核心 补充。

## 它背后的原理（别只记操作）
- 数值结果天然带舍入误差（[[浮点数精度]]）；向量化（NumPy）比 Python 级循环快，因为把运算下推到 C 层。
- 迭代是科学计算的主旋律：列表推导、`for`、生成器（[[迭代器与生成器]]）把「对序列做变换」表达得贴近数学。

## 我能复用/改编的点
> 把「公式 → 向量化数组运算 → 绘图验证 → 文件/字典存结果」这套流水线直接套到课程实验、数据处理作业；需要逐元素带序号时用 [[枚举]]，需要双向交互的计算用 [[协程]]。

## 关联
- 概念：[[浮点数精度]] [[函数式编程]] [[枚举]] [[迭代器与生成器]] [[上下文管理器]] [[协程]] [[异常处理]] [[文件IO]] [[类与对象]] [[数据类型]]
- 项目：

## 来源
- 《A Primer on Scientific Programming with Python》, H.P. Langtangen, Texts in Computational Science and Engineering 6, Springer 2012.（英文原著，科学计算入门）
