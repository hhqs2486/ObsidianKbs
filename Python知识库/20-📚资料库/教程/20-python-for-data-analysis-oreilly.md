---

类型: 教程
来源: OReilly.-.Python for Data Analysis.pdf
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Python for Data Analysis（O'Reilly 版）

## 这条教程在解决什么
- 与 tut 22 为同一本书（Wes McKinney《Python for Data Analysis》第1版，2013）的另一扫描版本，数据分析权威参考。

## 定位 / 适合谁
- 定位：pandas/NumPy 作者亲著的 pandas/NumPy 主线教材。
- 适合：已有一定 Python 基础、想把 Python 用于真实数据分析的读者。
- 备注：本书与 tut 22（Python For Data Analysis 2013）内容结构完全一致，属同一本书的不同扫描版，建议二选一精读即可。

## 关键内容（PDF 章节提纲，与 tut 22 一致）
- 1 Preliminaries → [[Python]]
- 2 Introductory Examples
- 3 IPython
- 4 NumPy Basics → [[NumPy]]
- 5 Getting Started with pandas → [[Pandas]] [[数据分析]]
- 6 Data Loading, Storage, and File Formats → [[文件IO]] [[序列化(json与pickle)]]
- 7 Data Wrangling → [[数据清洗]] [[Pandas]]
- 8 Plotting and Visualization → [[数据可视化]]
- 9 Data Aggregation and Group Operations → [[Pandas]] [[数据分析]]
- 10 Time Series
- 11 Financial and Economic Data Applications
- 12 Advanced NumPy → [[NumPy]]
- Appendix Python Language Essentials

## 我卡住/没懂的地方
- 第1版 API 较旧，部分接口在现行 pandas/NumPy 已弃用，需对照新版文档。

## 它背后的原理（别只记操作）
- [[NumPy]] 数组 + 向量化避免 Python 层循环；[[Pandas]] 的 Series/DataFrame 带标签轴、自动对齐，减少对齐错误。

## 我能复用/改编的点
> 换需求时：第6–7章“加载 → 清洗/合并 → 分组聚合”是通用数据分析流水线，可直接套到任意报表任务。

## 关联
- 概念：[[Python]] [[NumPy]] [[Pandas]] [[数据分析]] [[数据清洗]] [[数据可视化]] [[数据科学]] [[文件IO]] [[序列化(json与pickle)]]
- 项目：（无）

## 互补关系
- 与 tut 22 为同一本书的不同扫描版，内容重叠；统一指向 [[数据分析]] [[Pandas]] [[NumPy]] 概念卡。
- 时间序列/金融应用衔接 [[数据科学]]；与「Python数据分析与数据化运营」等书形成应用层互补。

## 来源
- OReilly.-.Python for Data Analysis.pdf；缓存 full.txt 为真实可提取文本（468页，16章），本笔记据此整理，无图片版说明。
