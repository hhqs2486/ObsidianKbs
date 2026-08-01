---

类型: 概念
主题: 数据科学与AI
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 数据科学与AI, 概念]
---
---

# Matplotlib

## 一句话定义
> Matplotlib 是 Python 用于创建出版质量图表的桌面绘图库（主要是 2D），提供 MATLAB 式的绘图接口，是 Python 数据可视化的底层基石（2002 年由 John Hunter 发起）。

## 它解决什么问题 / 为什么存在
- 需要把数据画成可保存、可自定义的静态图（PDF/SVG/PNG…）。seaborn、pandas 内置绘图都建立在它之上。
- 本章（Ch9.1）说：要自定义高级功能，必须学 Matplotlib API。

## 核心原理（大二能懂的水平）
- 引入约定：`import matplotlib.pyplot as plt`；Jupyter 里用 `%matplotlib notebook`（或 `%matplotlib`）开启交互绘图。
- **Figure 与 Subplot**：图像都在 `Figure` 里；`plt.figure()` 建空画布，必须 `add_subplot(2,2,1)` 或 `plt.subplots(2,3)` 才有子图区域；`AxesSubplot` 对象直接调方法画图。
- **画图类型**：`plot`（线）、`bar`/`barh`（柱）、`hist`（直方）、`scatter`（散点）；pandas 的 `Series/DataFrame.plot()` 底层就调它。
- **样式**：`plot(x,y,'g--')` 字符串指定颜色/线型/标记，或显式 `color=` `linestyle=` `marker=`。
- **装饰**：`xlim/ylim`、`set_xticks/set_xticklabels`、`set_title`、`set_xlabel`、图例 `legend(loc='best')`、`annotate` 注解、`text` 文本、patch 图形。
- **保存与配置**：`plt.savefig('fig.svg', dpi=400, bbox_inches='tight')`；`plt.rc` 改全局默认（图大小、配色、字体）。

## 关键参数 / 易错点
- 易错点1：空 `Figure` 不能直接画，必须先 `add_subplot` 或 `subplots` 建子图。
- 易错点2：Jupyter 每个小窗重跑会重置图形，复杂图要把绘图命令放同一小窗。
- 易错点3：画了线/散点不调 `legend()` 就不会出图例。
- 易错点4：matplotlib 不自动检查刻度标签重叠，需自己设位置。

## 类比（帮助理解）
- 像画画的"画布（Figure）+ 画格（Subplot）+ 画笔（plot/scatter）"：先支起画布、分出格子，再用不同画笔往格子里画。

## 设计时怎么用（反推思维）
> 做 **需要精细控制版式/多子图/出版级图**时，我会用它能解决 **"底层自定义绘图"**——日常统计图优先用 [[Seaborn]] 或 pandas 的 `.plot()`（更快更美），但要调子图网格、注解、保存高分辨率图时回到 Matplotlib；所有图最终服务 [[数据可视化]] 与 [[探索性数据分析EDA]]。

## 典型应用 / 我在哪见过
- Ch9.1 matplotlib API 入门：Figure/Subplot、颜色标记线型、刻度标签图例、注解、savefig、rc 配置。
- 日常：论文图、报表图、大屏静态图。

## 关联
- 前置知识：[[NumPy]]、[[Pandas]]
- 相关：[[Seaborn]]、[[数据可视化]]、[[探索性数据分析EDA]]
- 反例/误区：空 Figure 直接画；忘 legend；刻度标签重叠

## 来源
- 《利用Python进行数据分析（第二版）》Ch9.1 matplotlib API 入门（Figure/Subplot、plot、样式、图例、savefig、rc）。KEY=101_中文翻译版--利用Python进行数据分析(第二版).pdf。
