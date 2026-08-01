---

类型: 教程
来源: Python数据科学速查表 - Bokeh
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# 速查表：Bokeh（交互式可视化）

## 这条教程在解决什么
一张一页纸的 Bokeh 速查表（DataCamp / 呆鸟 译），覆盖「用 Bokeh 在浏览器里画交互式图形」的高频 API：建图、加图形符号（glyph）、布局、联动、输出与导出。

## 定位 / 适合谁
- 定位：随用随查的备忘录，不是教程。
- 适合谁：已会用[[Matplotlib]]做静态图、想补「网页交互/联动/悬停工具」的人。

## 关键内容（速查主题）
- **绘图模型**：`figure()` + `ColumnDataSource`，数据（Python 列表 / [[NumPy]] 数组 / [[Pandas]] 数据框）在后台转成列数据源。
- **渲染器/符号（glyph）**：`line`/`circle`/`square`/`multi_line`、散点标记、线型。
- **布局与联动**：`row`/`column`/`gridplot`、`Tabs`；链接坐标轴、链接刷选（linked brushing）。
- **颜色与图例**：`CategoricalColorMapper` 按字段着色、图例位置/方向/边框。
- **输出与导出**：`output_notebook`/`output_file`、`show`/`save`、导出 PNG/SVG、嵌入 HTML（`components`/`file_html`）。
- **交互组件**：`HoverTool`、Widgets。

## 与其他书的互补
- 静态出版图看[[Matplotlib]]与 `87-cheatsheet-matplotlib.md`；Bokeh 补「交互/网页」。
- 选图与呈现原则见[[数据可视化]]；数据准备见[[Pandas]]/[[NumPy]]。
- 库 **Bokeh** 在库中暂无独立概念卡，需要时可在`数据科学与AI`下补充。

## 关联
- 概念：[[数据可视化]] [[Matplotlib]] [[NumPy]] [[Pandas]]
- 项目：（暂无）

## 来源
- Python数据科学速查表 - Bokeh（DataCamp，呆鸟 译）；缓存 `.cache/043_Python数据科学速查表 - Bokeh.pdf/`（TEXT，full.txt 约 5KB）。
