---
类型: 组件参考
组件: Exporter
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Exporter

## 基本信息
- 类别（监控）：指标采集代理
- 核心用途：把"本身不暴露 Prometheus 格式指标"的系统（主机、数据库、中间件、硬件）的状态，转换成 Prometheus 可抓取的 `/metrics` HTTP 端点。是 Prometheus 拉取模型的"翻译层"。
- 官方文档链接：https://prometheus.io/docs/instrumenting/exporters/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 目标侧代理：被 Prometheus 抓取 | 一个 exporter 通常对应一类资源 |
| 数据模型 | 暴露标准文本格式指标（counter/gauge/histogram/summary） | 可带标签 |
| 扩展性 | 官方+社区海量 exporter 覆盖常见组件 | 也可自写客户端库 |
| 性能/规模 | 轻量 Go 二进制，常驻端口 | 如 node_exporter:9100、mysqld_exporter:9104 |

## 与其它组件的关系
- 依赖：被[[Prometheus]]抓取；自身连后端（如 MySQL 凭证）。
- 被依赖：[[Prometheus]]、[[node_exporter]]、[[Pushgateway]]（短任务场景）、Blackbox exporter（探针）。
- 替代/竞品：直接在应用内嵌客户端库（如[[指标Metric]]章节的 Ruby/Go 客户端）暴露 `/metrics`，可省去独立 exporter。

## 设计时必看的点
- 部署前提：exporter 需能访问被监控资源并有权限。
- 配置要点：常用 `--web.listen-address`、`--collector.*` 启停收集器；可用 `params: {collect[]: [...]}` 在 Prometheus 端过滤抓取哪些收集器。
- 常见坑：exporter 暴露指标过多会占存储，用 `metric_relabel_configs` 的 `drop` 在入库前丢弃无用时间序列；容器里跑需挂主机目录/提权（见[[Kubernetes]] DaemonSet 风险）。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
凡是"不能改代码、或第三方系统"要纳入监控，就上对应 exporter（最典型[[node_exporter]]）。能改代码的自研服务，优先用客户端库直接暴露指标，少一层进程。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]
- 同类替代：[[node_exporter]]、[[Pushgateway]]、[[Prometheus]]、[[指标Metric]]
- 部署模式：[[容器]]、[[DaemonSet]]（边车/守护进程）

## 来源
- 《Prometheus监控实战》第2章、第4章（`.cache/prometheus/ch04_第2章 Prometheus简介.txt`、`ch06_第4章 监控主机和容器.txt`）
