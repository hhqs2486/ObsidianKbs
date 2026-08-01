---

类型: 概念
主题: 数据科学与AI
创建: 2026-07-21
复习: 
状态: 种子
tags: [Python, 数据科学与AI, 概念]
---
---

# Pandas

## 一句话定义
> Pandas 是 Python 的数据分析库，核心是提供二维表格型数据结构 DataFrame，让你像操作数据库表/Excel 一样对结构化数据做切片、聚合、清洗与变换。

## 它解决什么问题 / 为什么存在
- 原生 Python 列表/字典处理表格数据很麻烦（按列运算、按条件筛选、分组聚合都要手写循环）。
- Pandas 把“表格”变成一等公民：一行代码完成筛选、分组、透视、合并，让 [[数据分析]] 从体力活变成表达意图。
- 书中定义：Pandas（Python Data Analysis Library）用于结构化数据分析，类似 R 的 data.frame，支持切片、切块、聚合、选择子集，并提供时间序列功能（Ch1 1.2.3）。

## 核心原理（大二能懂的水平）
- DataFrame = 带列名的二维表（行是记录、列是字段）；Series = 单列。底层数据常以 [[NumPy]] 的 ndarray 存储，所以快。
- 关键能力：
  - 读取：read_csv / read_table / read_clipboard / from_dict / from_records。
  - 清洗：isnull() 找缺失、dropna() 丢缺失行、fillna() 补缺失、replace() 替换、drop_duplicates() 去重。
  - 变换：df['col'].mean() 统计、groupby() 分组聚合、merge()/concat() 合并、pivot_table() 透视。
  - 索引：用标签或条件筛选（df[df.age>18]）。
- Ch3 实操：用 pd.DataFrame 造含 NaN 的数据，再用 isnull().any() 找缺失列、dropna 丢弃、fillna(mean) 以均值补全——这就是数据清洗主流程。

## 关键参数 / 易错点
- fillna 的 method：pad/ffill 用前面的值、backfill/bfill 用后面的值；value 可直接指定固定值（如 0）。易错：用 0 填空可能污染分布，要先想清楚。
- 缺失值在数据库是 Null、Python 是 None、Pandas/NumPy 是 NaN——空字符串 "" 不是缺失值（有实体，是字符串），别混。
- axis=0 按列算、axis=1 按行算，方向别搞反。
- 真值转换：性别(男/女/未知) 可拆成 3 个 0/1 列再参与建模，而不是硬补。
- 注意链式赋值告警（SettingWithCopyWarning）：筛选后改值最好用 .loc[]。

## 类比（帮助理解）
- DataFrame 像 Excel 工作表或数据库表；groupby 像“按某列先把数据分堆再分别统计”；merge 像 SQL 的 JOIN。
- 如果说 [[NumPy]] 是“带计算的 Excel 单元格矩阵”，Pandas 就是“带公式的整张表 + 标签索引”。

## 设计时怎么用（反推思维）
> 做 **数据接入与预处理服务时**，我会用它能解决 **“把多源异构的原始表变成干净、可分析的 DataFrame”**——读取数据库/CSV 后用 isnull/fillna 处理缺失、drop_duplicates 去重、groupby 做指标聚合，再交给 [[数据可视化]] 或 [[机器学习]] 阶段，避免让上游业务的脏数据污染模型。

## 典型应用 / 我在哪见过
- Ch3 数据清洗全部代码基于 Pandas；会员 RFM 计算（Ch5）要从订单表 groupby 出 R/F/M；流量渠道对比（Ch7）做分组统计。
- 日常：读 CSV 做报表、日志分析、特征工程前的数据整形。

## 关联
- 前置知识：[[Python]]、[[NumPy]]
- 相关：[[数据分析]]、[[数据清洗]]、[[数据可视化]]
- 反例/误区：用列表循环硬算而不用向量化；把空字符串当缺失值；dropna 不小心丢太多行

## 来源
- 《Python数据分析与数据化运营》（宋天龙）Ch1 1.2.3（Pandas 介绍）、Ch3 3.1.4（代码实操）。KEY=数据分析运营。
