---

类型: 教程
来源: Python数据科学速查表 - Pandas 进阶.pdf（DataCamp 出品，呆鸟 译，天善智能）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Pandas 进阶速查表

## 这条教程在解决什么
承接 [[Pandas]] 基础，覆盖真实项目中更高频的"脏活"：重塑、缺失值、合并、分组聚合、时间序列。仍然是一页速查表。

## 定位 / 适合谁
- 定位：Pandas 进阶操作便签。
- 适合谁：已经会用 DataFrame 做基础读写，正在做 [[数据清洗]] / [[特征工程]] 的人。

## 关键内容（按速查表区块）
- **数据重塑**：`reindex`(`ffill` 前向/`bfill` 后向填充)、`melt`(列转行)、`stack`/`unstack`、`pivot`、`MultiIndex`(多层索引)
- **缺失值**：`dropna`(去 NaN) / `fillna`(用均值等填充) / `replace`(值替换)——对应 [[缺失值处理]]
- **高级选择**：按条件选列 `(df>1).any()/.all()`、含 NaN 列 `isnull()`、不含 `notnull()`、`isin`、`filter`、`where`、`query('second > first')`
- **透视表**：`pd.pivot_table`（行变列的汇总，见 [[透视表]]）
- **合并数据**：
  - `pd.merge`(`how=left/right/outer/inner`, `on=`)
  - `data1.join`(按索引)
  - `pd.concat`(`axis`/ `keys` / `join`)
- **迭代**：`iteritems`(列)、`iterrows`(行)
- **重复数据**：`unique` / `duplicated` / `drop_duplicates(keep=)`
- **分组（核心）**：`groupby(by=...).mean()/.sum()`、`.agg({...})`、`.transform(...)` ——见 [[分组GroupBy]] 与 [[数据聚合]]
- **设置/取消索引**：`set_index` / `reset_index` / `rename`
- **日期**：`pd.to_datetime` / `pd.date_range` / `pd.DatetimeIndex` ——见 [[时间序列分析]]
- **可视化**：`s.plot()` / `df.plot()`（底层 [[Matplotlib]]）

## 它背后的原理（别只记操作）
`groupby` 是"拆分—应用—合并"（split-apply-combine）范式：`agg` 返回标量汇总，`transform` 返回与原数据等长的列（常用于标准化）。`merge` 按"键"对齐，是关系型数据拼接的基础——和 [[NumPy]] 的索引自动对齐思路一致，但更显式可控。

## 我能复用/改编的点
> 做特征工程时，常用 `groupby.agg` 求分组统计量、`pivot_table` 把长表转成宽表喂给模型、`merge` 把多张维表拼回事实表。缺失值在合并前后都要用 `fillna`/`dropna` 处理。

## 关联
- 概念：[[Pandas]] [[分组GroupBy]] [[透视表]] [[数据聚合]] [[缺失值处理]] [[数据清洗]] [[时间序列分析]] [[Matplotlib]]
- 前置：[[NumPy]] [[Pandas]](89-pandas-jichu)
- 互补：[[特征工程]]（这些操作大多是特征工程的具体手法）

## 来源
- Python数据科学速查表 - Pandas 进阶.pdf（DataCamp，呆鸟 译，天善智能；TEXT 提取，内容真实）
