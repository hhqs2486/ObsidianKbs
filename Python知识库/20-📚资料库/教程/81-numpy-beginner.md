---

类型: 教程
来源: NumPy 1.5 Beginner's Guide（Ivan Idris）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# NumPy 1.5 Beginner's Guide

## 这条教程在解决什么
用大量可运行的小例子，把 NumPy 数组（ndarray）的「创建、索引、运算、广播、ufunc、矩阵、模块化」讲透，并演示它与 Matplotlib、SciPy 的衔接。是[[NumPy]]这张卡最贴近「动手练习」的配套教程。

## 定位 / 适合谁
- 定位：NumPy 入门练习册，1.5 版本偏老但核心 API 稳定，适合边读边敲。
- 适合谁：刚接触科学计算、想把「Python 列表循环」换成「向量化数组运算」的初学者；已熟悉的可直接看速查表类书。

## 关键内容（按章节脉络）
1. **NumPy 快速上手（Quick Start）**：安装、数组创建、`dtype`、基础运算。
2. ** fundamentals**：索引/切片、形状`shape`、重塑`reshape`、堆叠、拆分——数组即[[张量]]的最常见形态。
3. **常用函数**：数学/统计/排序/文件读写（`loadtxt`/`savetxt`）。
4. **便捷函数**：金融、多项式、线性代数小工具。
5. **矩阵与 ufunc（通用函数）**：`mat`/矩阵乘法、广播（broadcasting）机制、自定义 ufunc。
6. **NumPy 模块**：`linalg`、`random`、`fft` 等。
7. **特殊例程（Special Routines）**：排序、插值、窗口函数等。
8. **质量保证与测试**：用 NumPy 写测试，关联[[单元测试(unittest)]]。
9. **用 Matplotlib 绘图**：数组直接喂给[[Matplotlib]]做[[数据可视化]]。
10. **当 NumPy 不够时：SciPy 及更上层**：衔接 SciPy（稀疏矩阵、优化、积分等，本书仅串联）。

## 它背后的原理（别只记操作）
- NumPy 快，是因为底层是**连续内存的 C 数组 + 向量化（一次对整块数据操作）**，避免 Python 层逐元素循环。这正对应[[NumPy]]卡里「为什么数据分析都依赖它」。
- 广播让不同形状数组按规则对齐运算，是后续[[深度学习]]里[[张量]]运算的基础直觉。

## 我能复用/改编的点
> 把 `for` 循环里的逐元素计算改写成 `np.array` + 向量化；做[[数据分析]]前先用 `np.loadtxt`/`np.genfromtxt` 载入数据；出图直接用第 9 章的 Matplotlib 套路。

## 关联
- 概念：[[NumPy]] [[张量]] [[数据分析]] [[数据科学]] [[Matplotlib]] [[数据可视化]] [[单元测试(unittest)]]
- 项目：（暂无）

## 来源
- NumPy 1.5 Beginner's Guide（Ivan Idris），Chapter 1–10；缓存 `.cache/015_NumPy_1_5_Beginner__039_s_Guide.pdf/`（TEXT，full.txt 约 323KB）。
