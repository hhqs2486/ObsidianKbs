---

类型: 教程
来源: Python数据科学速查表 - Pandas 基础.pdf（DataCamp 出品，呆鸟 译，天善智能）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# Pandas 基础速查表

## 这条教程在解决什么
一页式速查表，覆盖 [[Pandas]] 最常用数据结构与操作：Series/DataFrame 的创建、选择、过滤、汇总、对齐、排序与读写。和 [[NumPy]] 一样是"便签"性质。

## 定位 / 适合谁
- 定位：Pandas 入门必会操作的速查；承接 [[NumPy]] 数组。
- 适合谁：做过一点数据处理、记不住 `loc/iloc` 区别或 `read_sql` 写法的人。

## 关键内容（按速查表区块）
- **数据结构**：`Series`(一维带索引) 与 `DataFrame`(二维异质)；都构建在 [[NumPy]] 之上
- **选择**：
  - 标签：`df.loc[行, 列]`、`df.at[...]`；位置：`df.iloc` / `df.iat`
  - 布尔索引：`s[s>1]`、`df[df['Population']>...]`（最常用）
- **设置值**：`s['a']=6` 按标签改值
- **应用函数**：`df.apply`(按列/行)、`df.applymap`(逐单元格)
- **基本信息**：`shape` / `index` / `columns` / `info()` / `count()`
- **汇总统计**：`sum/cumsum/min/max/idxmin/idxmax/describe/mean/median`
- **删除**：`s.drop(...)`(按索引) / `df.drop('列', axis=1)`
- **数据对齐**：Series 运算时按 **索引自动对齐**，缺失处填 `NaN`（易错：不同索引相加不会报错，会出 NaN）
- **排序与排名**：`sort_index` / `sort_values(by=...)` / `rank()`
- **输入/输出**：
  - CSV：`pd.read_csv` / `df.to_csv`
  - Excel：`pd.read_excel` / `pd.to_excel` / `pd.ExcelFile`
  - SQL：`pd.read_sql` / `read_sql_table` / `read_sql_query` / `df.to_sql`（配合 `sqlalchemy.create_engine`）

## 它背后的原理（别只记操作）
Pandas 给 NumPy 数组加上了 **行/列标签（index/columns）**，让"按名字取数"和"索引自动对齐"成为可能——这正是 [[数据清洗]] 与 [[数据聚合]] 高效的来源。更深入的分组/透视见 [[分组GroupBy]] 与 [[透视表]]。

## 我能复用/改编的点
> 做报表或特征工程时，先用 `read_sql`/`read_csv` 把数据拉成 DataFrame，再用布尔索引 + `apply` 做清洗，最后 `to_csv`/`to_sql` 落地。注意对齐产生的 NaN，要及时用 [[缺失值处理]] 兜住。

## 关联
- 概念：[[Pandas]] [[NumPy]] [[数据清洗]] [[缺失值处理]] [[数据可视化]] [[Matplotlib]]
- 进阶：[[分组GroupBy]] [[透视表]] [[数据聚合]]（基础之后的高频操作，见 90-pandas-jinjie）
- 互补：[[数据可视化]]（DataFrame 自带 `.plot()`，底层是 Matplotlib）

## 来源
- Python数据科学速查表 - Pandas 基础.pdf（DataCamp，呆鸟 译，天善智能；TEXT 提取，内容真实）
