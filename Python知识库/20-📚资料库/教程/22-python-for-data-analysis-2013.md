---

类型: 教程
来源: Python For Data Analysis (2013).pdf
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Python For Data Analysis (2013)

## 这条教程在解决什么
- 用 Python 做数据分析的权威参考：以 pandas / NumPy 为主线，覆盖从环境、数据加载、清洗到可视化与时间序列的完整链路。

## 定位 / 适合谁
- 定位：pandas/NumPy 作者 Wes McKinney 亲著，数据分析“圣经”级教材（第1版，2013）。
- 适合：已有一定 Python 基础、想把 Python 用于真实数据分析的读者。
- 备注：本书与 tut 20（O'Reilly 同名书）为同一本书的不同扫描版本，内容结构一致，建议二选一精读。

## 关键内容（PDF 章节提纲）
- 1 Preliminaries（环境、[[Python]] 语言精要）
- 2 Introductory Examples
- 3 IPython（交互式计算环境）
- 4 NumPy Basics（数组与向量化计算） → [[NumPy]]
- 5 Getting Started with pandas → [[Pandas]] [[数据分析]]
- 6 Data Loading, Storage, and File Formats → [[文件IO]] [[序列化(json与pickle)]]
- 7 Data Wrangling（清洗、变形、合并、重塑） → [[数据清洗]] [[Pandas]]
- 8 Plotting and Visualization → [[数据可视化]]
- 9 Data Aggregation and Group Operations → [[Pandas]] [[数据分析]]
- 10 Time Series
- 11 Financial and Economic Data Applications
- 12 Advanced NumPy → [[NumPy]]
- Appendix Python Language Essentials

## 我卡住/没懂的地方
- 第1版基于较早的 pandas/NumPy API，部分接口（如 df.append、Panel）在现行版本已弃用，需对照新版文档。

## 它背后的原理（别只记操作）
- [[NumPy]] 用连续内存的 ndarray + 向量化运算替代 Python 循环，速度量级提升。
- [[Pandas]] 在 NumPy 之上提供带标签轴的 Series/DataFrame，自动对齐索引，避免“对不齐”的常见错误。

## 我能复用/改编的点
> 换需求时：第6–7章“读取任意格式 → 清洗/合并 → 分组聚合”是任何数据分析任务的通用流水线，可直接套到业务报表。

## 关联
- 概念：[[Python]] [[NumPy]] [[Pandas]] [[数据分析]] [[数据清洗]] [[数据可视化]] [[数据科学]] [[文件IO]] [[序列化(json与pickle)]]
- 项目：（无）

## 互补关系
- 与 tut 20（O'Reilly 版）高度重复，统一指向 [[数据分析]] [[Pandas]] [[NumPy]] 概念卡。
- 时间序列/金融应用衔接 [[数据科学]]；与「Python数据分析与数据化运营」等书形成应用层互补。

## 来源
- Python For Data Analysis (2013).pdf；缓存 full.txt 为真实可提取文本（470页，16章），本笔记据此整理，无图片版说明。
