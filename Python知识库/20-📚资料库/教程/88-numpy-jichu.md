---

类型: 教程
来源: Python数据科学速查表 - Numpy 基础.pdf（DataCamp 出品，呆鸟 译，天善智能）
创建: 2026-07-21
状态: 已读待消化
tags: [Python, 教程]
---
---

# NumPy 基础速查表

## 这条教程在解决什么
一张一页式速查表，把 [[NumPy]] 日常最高频的操作（建数组、算数、索引、聚合、变形、读写）浓缩成可粘贴的代码片段。适合在写 [[数据分析]] / [[机器学习]] 代码时随手查，而不是系统学习。

## 定位 / 适合谁
- 定位：NumPy 的"语法便签"，不讲解原理，只给命令。
- 适合谁：已经知道 NumPy 是什么、需要快速回忆 API 的人；不适合零基础入门。

## 关键内容（按速查表区块）
- **创建数组**：`np.zeros` / `np.ones` / `np.arange`(步进) / `np.linspace`(样本数) / `np.full` / `np.eye`(单位矩阵) / `np.random.random` / `np.empty`
- **数组计算**：逐元素 `+ - * /`、`np.add/subtract/multiply/divide`、`np.exp/sqrt/sin/cos/log`、矩阵点积 `e.dot(f)`
- **子集、切片、索引**：普通索引、切片、`axis` 维度、`条件索引`(`a[a<2]`)、`花式索引`(`b[[1,0,1,0],[0,1,2,0]]`)
- **聚合**：`sum/min/max/cumsum/mean/median/corrcoef/std`（支持 `axis=` 按轴）
- **比较**：`==`、`<`、`np.array_equal`
- **数组操作（变形与拼接）**：`np.transpose`/`.T`、`ravel`(拉平)、`reshape`/`resize`、`append`/`insert`/`delete`、`concatenate`/`vstack`/`hstack`/`column_stack`/`c_`/`r_`、`hsplit`/`vsplit`
- **输入/输出**：`np.loadtxt` / `np.genfromtxt`(CSV) / `np.savetxt`；二进制 `np.save` / `np.savez` / `np.load`
- **复制**：`view`(共享数据) vs `copy`(深拷贝)，这是易错点
- **数组信息**：`shape` / `len` / `ndim` / `size` / `dtype` / `astype`
- **排序**：`sort`(`axis=` 按轴)
- **数据类型**：`int64/float32/complex/bool/object/string_/unicode_`

## 它背后的原理（别只记操作）
NumPy 的核心价值是 **同质多维数组 `ndarray` + 向量化运算**：一次对整块内存做运算，比 Python 循环快得多。它也是 [[Pandas]]、[[scikit-learn]] 的底层数据结构（见 [[数据科学]] 总览）。

## 我能复用/改编的点
> 做数据处理系统时，凡是"对整列/整个矩阵算"的需求，先用 NumPy 向量化而不是 for 循环；`reshape`/`concatenate` 是把多个来源数据拼成模型输入矩阵的常用手段。

## 关联
- 概念：[[NumPy]] [[Pandas]] [[数据科学]] [[Matplotlib]]
- 互补：[[Pandas]]（在 NumPy 之上加了带标签的 Series/DataFrame）、[[数据可视化]]（结果常交给 Matplotlib 画）

## 来源
- Python数据科学速查表 - Numpy 基础.pdf（DataCamp，呆鸟 译，天善智能；TEXT 提取，内容真实）
