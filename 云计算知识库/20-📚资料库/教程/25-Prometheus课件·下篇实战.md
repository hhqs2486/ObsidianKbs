---
类型: 教程
资料: Prometheus课件笔记（云原生大礼包#9）
tags: [教程]
创建: 2026-07-21
---

# Prometheus 课件·下篇实战（PromQL 数学基础与命令行）

> 源：V1.0 `promethues下篇PDF.pdf`（文字版，141 页）。上篇建立世界观，下篇进入**PromQL 实战**，用 CPU 使用率公式把"increase / sum / by(instance)"串讲透。

## 概述
下篇核心是**用 PromQL 反推指标含义**。最经典的一课：从 Linux CPU 八种状态累积时间出发，推导"CPU 使用率"的 PromQL 公式，并借此讲清 Counter、increase()、sum()、by(instance) 的配合。还扩展到 rate / topk / count、gauge vs counter、用 Pushgateway 自定义指标。

## 核心要点（按课件结构）
- **CPU 使用率公式推导**（全下篇最值得吃透）：
  `(1 - (sum(increase(node_cpu{mode="idle"}[1m])) by (instance)) / (sum(increase(node_cpu[1m])) by (instance))) * 100`
  - `node_cpu` 是 Counter（CPU 时间持续累积），用 `increase(...,[1m])` 取 1 分钟增量。
  - 外层 `sum()` 把所有核加合；`by (instance)` 再按机器拆开（否则会变成集群总平均）。
  - 举一反三：`mode="user"/"system"/"iowait"` 可得各状态占比。
- **命令行扩展**：`rate`（区间平均速率）、`increase`（增量）、`sum`、`topk(n,)`、`count()`；`gauge` 随机变（如 TCP wait 连接数，直接出图），`counter` 需 increase/rate 才有意义。
- **自定义指标 + Pushgateway**：课件用 bash 脚本算 `count_netstat_wait_connections` 再经 [[Pushgateway]] 推给 Prometheus，说明非 exporter 数据也能采。
- **标签过滤**：精确 `{}`、模糊 `=~` 正则（如 `exported_instance=~"web.*"`）。

## 关联概念卡
- 查询引擎：[[PromQL]] [[指标Metric]]
- 数据采集：[[node_exporter]] [[Pushgateway]]
- 数据底座：[[时序数据库TSDB]] [[Prometheus]]

## 来源
- V1.0 下篇：`.cache/V1下篇/full.txt`
