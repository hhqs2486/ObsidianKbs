---

类型: 教程
来源: Python 科学计算基础教程（Hemant Kumar Mehta 著，陶俊杰、陈小莉 译）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Python 科学计算基础教程 教程笔记

## 这条教程在解决什么
- 系统介绍用 Python 做**科学计算**的整套工具链与最佳实践：从数值计算（NumPy/SciPy）、符号计算（SymPy）、数据分析与可视化（pandas/matplotlib），到并行大规模计算（IPython 并行 / Hadoop / Spark）。
- 定位：面向科研/工程背景、想把「数学建模 + 数值分析」落到 Python 的读者；也适合作为科学计算生态的「地图」。

## 关键内容（按章节提纲）
- 第1章 科学计算概况与选择 Python 的理由：科学计算定义、误差/稳定性、[[浮点数精度]]、为何选 Python
- 第2章 科学工作流与结构：数学问题分类（方程/最优化/插值/积分/微分方程/随机数）、NumPy/SciPy/pandas/IPython/SymPy/画图库总览
- 第3章 制造与管理科学数据：数据格式、常见数据操作、随机数生成（含统计分布）
- 第4章 Python 科学计算 API：NumPy / SciPy / SymPy / pandas / matplotlib（SciPy、SymPy、matplotlib 等库无独立概念卡，正文用原名 Plain Text）
- 第5章 数值计算：NumPy 的 N 维数组与通用函数（ufunc）、SciPy 数学函数与高级模块（见 [[NumPy]]）
- 第6章 符号计算：SymPy 解方程/微积分/线性代数/物理模块（Plain Text）
- 第7章 数据分析与可视化：matplotlib 架构与画法、pandas 的 Series/DataFrame/Panel/缺失值/时间序列、CSV I/O → 见 [[Pandas]] [[数据可视化]] [[数据分析]]
- 第8章 并行与大规模科学计算：IPython 并行、魔法函数、Hadoop MapReduce、Spark（Plain Text）
- 第9章 真实案例：各领域 Python 科学计算应用
- 第10章 最佳实践：方案设计/实现/部署/性能/安全/测试各阶段建议

## 它背后的原理（别只记操作）
- 科学计算 = 数学建模 + 数值分析 + 计算机实现（见 [[数据科学]]）。[[NumPy]] 的向量化与广播让矩阵运算免去显式循环，是 SciPy/pandas 的共同地基。
- 误差与稳定性（前向/后向误差）是数值方法的第一课，呼应 [[浮点数精度]]。

## 我能复用/改编的点
- 做「读 CSV → 清洗 → 数值计算 → 出图」的科研数据处理管道时，直接套第 7 章 pandas+matplotlib 组合。
- 需要批量跑参数扫描时，参考第 8 章 IPython 并行 / 简单 MapReduce 思路。

## 关联
- 概念：[[Python]] [[标准库]] [[模块与包]] [[NumPy]] [[Pandas]] [[数据科学]] [[数据分析]] [[数据可视化]] [[浮点数精度]]
- 互补：与 tut23《数据馆员的 Python 简明手册》在 NumPy/pandas/可视化上重叠（本书更深更全）；想深入数据分析可看 [[数据分析]]/[[数据清洗]] 相关书；纯数值算法底层可对照《Python 数据结构与算法分析》。

## 来源
- Python 科学计算基础教程（Hemant Kumar Mehta 著，陶俊杰、陈小莉 译）；缓存 KEY `066b_scipy_basic`，tut 32（TEXT，全文本可读）
