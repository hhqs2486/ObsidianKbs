---

类型: 教程
来源: Python数据科学速查表 - Seaborn.pdf（DataCamp 出品，呆鸟 译，天善智能）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Seaborn 速查表

## 这条教程在解决什么
一页式速查表，覆盖 [[Seaborn]] 的统计绘图：画布外观设置 + 各类统计图形的调用方式。Seaborn 是基于 [[Matplotlib]] 的高阶封装，主题是"用更少的代码画出更美观的统计图"。

## 定位 / 适合谁
- 定位：Seaborn 绘图便签。
- 适合谁：做完 [[数据分析]] / [[探索性数据分析EDA]]，想快速出统计图表的人。

## 关键内容（按速查表区块）
- **基本步骤**：准备数据 → `sns.set_style`/`set_context` 设外观 → 调用绘图函数 → 自定义 → `plt.show()`/`savefig`
- **内置数据集**：`sns.load_dataset("tips"/"titanic"/"iris")`，方便练手
- **画布外观**：`sns.set()`、`sns.set_style("whitegrid"/"ticks")`、`sns.axes_style`(临时样式)、`sns.set_context("talk"/"notebook", font_scale=)`、`sns.set_palette`/`color_palette`
- **各类图形**：
  - 回归：`regplot` / `lmplot`(带回归线)
  - 分类散点：`stripplot` / `swarmplot`(不重叠)
  - 估计值+置信区间：`barplot` / `countplot` / `pointplot`
  - 分布：`boxplot` / `violinplot` / `distplot`(单变量)
  - 矩阵关系：`pairplot` / `pairgrid` / `jointplot` / `heatmap`(热力图)
  - 分面栅格：`FacetGrid` / `factorplot`
- **坐标轴与保存**：`plt.title/xlabel/ylabel/xlim/ylim`、`despine`、`tight_layout`、`savefig`(可 `transparent=True`)

## 它背后的原理（别只记操作）
Seaborn 在 [[Matplotlib]] 之上做了两件事：① 默认统计映射（如 `barplot` 自动算均值+置信区间）；② 主题/调色板系统（一句 `set_style` 统一全图风格）。数据来自 [[Pandas]] DataFrame，按"列名"指定 x/y/hue，天然契合 [[描述性统计]] 的探索。

## 我能复用/改编的点
> 做 EDA 报告时，用 `pairplot` 看变量两两关系、`heatmap` 看相关系数、`boxplot/violinplot` 看分组分布；最后用 `sns.set_style("whitegrid")` 统一风格再 `savefig` 入库。

## 关联
- 概念：[[Seaborn]] [[Matplotlib]] [[数据可视化]] [[Pandas]] [[NumPy]] [[描述性统计]] [[探索性数据分析EDA]]
- 互补：[[Matplotlib]]（底层，Seaborn 画不了的细节用 plt 兜底）、[[数据分析]]

## 来源
- Python数据科学速查表 - Seaborn.pdf（DataCamp，呆鸟 译，天善智能；TEXT 提取，内容真实）
