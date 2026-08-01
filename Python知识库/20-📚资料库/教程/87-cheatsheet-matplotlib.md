---

类型: 教程
来源: Python数据科学速查表 - Matplotlib 绘图
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 速查表：Matplotlib 绘图

## 这条教程在解决什么
一张 Matplotlib 速查表（DataCamp / 呆鸟 译），覆盖「Figure/Axes 六步工作流」与各.plot 类型、自定义项、保存导出的高频 API。是 `83-matplotlib-practice.md` 的浓缩备忘录。

## 定位 / 适合谁
- 定位：随用随查的备忘录，不是教程。
- 适合谁：已装好 matplotlib、画图时总忘具体方法名的人。

## 关键内容（速查主题）
- **六步工作流**：准备数据（列表/[[NumPy]]）→ 建 Figure → 绘图 → 自定义 → 保存 → 显示（`plt.show`/`savefig`）。
- **对象模型**：Figure / Axes(Subplot) / X-Y 轴；`add_subplot`、`subplots`、`add_axes`。
- **一维数据**：`plot`（线/标记/线型）、`scatter`；`hist`（直方）、`boxplot`（箱线）、`violinplot`（小提琴）。
- **二维数据/图片**：`imshow`/`pcolor`/`pcolormesh`/`contour`/`contourf`；向量场 `quiver`/`streamplot`/`arrow`。
- **自定义**：颜色/色条/色彩表、标记、数学符号、文本与标注（`text`/`annotate`）、尺寸限制、图例、刻度、子图间距 `tight_layout`、坐标轴边线 `spines`。
- **清除/关闭**：`cla`/`clf`/`close`。

## 与其他书的互补
- 选图原则与理论见[[数据可视化]]；系统讲解见[[Matplotlib]]与 `83-matplotlib-practice.md`。
- 交互式/网页图看 `84-cheatsheet-bokeh.md`；数据准备见[[NumPy]]/[[Pandas]]。
- 直方图/箱线图也常用于[[探索性数据分析EDA]]与[[描述性统计]]。

## 关联
- 概念：[[Matplotlib]] [[数据可视化]] [[NumPy]] [[Pandas]] [[探索性数据分析EDA]] [[描述性统计]]
- 项目：（暂无）

## 来源
- Python数据科学速查表 - Matplotlib 绘图（DataCamp，呆鸟 译）；缓存 `.cache/046_Python数据科学速查表 - Matplotlib 绘图.pdf/`（TEXT，full.txt 约 6KB）。
