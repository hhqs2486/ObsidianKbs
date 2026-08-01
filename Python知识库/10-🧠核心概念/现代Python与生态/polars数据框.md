---
类型: 概念
主题: polars（高性能 DataFrame）
tags: [Python, 现代Python与生态, 概念]
创建: 2026-07-21
复习:
状态: 种子
---

# polars（高性能 DataFrame）

## 一句话定义
> Rust 写的 DataFrame 库，比 Pandas 更快更省内存，主打惰性求值+并行。

## 它解决什么问题 / 为什么存在
- Pandas 在大数/多核下慢且吃内存。

## 核心原理（大二能懂的水平）
- `pl.DataFrame`；`.lazy()` 惰性、自动优化执行计划；`group_by`/`with_columns` 链式；多线程。

## 关键参数 / 易错点
- API 与 Pandas 不同(别直接搬)；惰性需 `.collect()` 触发；小数据未必更快。

## 类比（帮助理解）
- 像 DataFrame 的「赛车版」(Pandas 是家用版)。

## 设计时怎么用（反推思维）
> 处理较大数据集时用 polars 替代 pandas。

## 关联
- 前置知识：[[Pandas]]
- 相关：[[NumPy]]

## 来源
- polars 官方文档
