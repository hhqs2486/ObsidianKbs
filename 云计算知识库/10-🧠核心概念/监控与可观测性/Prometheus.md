---
类型: 组件参考
组件: Prometheus
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Prometheus

## 基本信息
- 类别（监控）：时序监控系统（拉取模型）
- 核心用途：定时从目标拉取 `/metrics` 暴露的指标，写入本地[[时序数据库TSDB]]，用[[PromQL]]查询聚合，按[[告警规则]]触发告警并推给[[Alertmanager]]，并接[[Grafana]]可视化。
- 官方文档链接：https://prometheus.io/docs/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 中心服务器：抓取、存储、查询、评估规则 | 设计为自治、单服即可跑数千主机 |
| 数据模型 | 多维时间序列（指标名+标签） | 时间序列由"名称+标签"唯一标识 |
| 扩展性 | 分片、federation、远程存储 | 见[[高可用]]与可靠性章节思路 |
| 性能/规模 | 默认保留 15 天；建议内存充足+SSD | 默认保留期 `--storage.tsdb.retention=15d` |

## 与其它组件的关系
- 依赖：被监控目标需暴露 `/metrics`（通常由[[Exporter]]或应用客户端库提供）；短任务经[[Pushgateway]]中转。
- 被依赖：[[Alertmanager]]（收告警）、[[Grafana]]（读数据做[[可视化面板]]）、[[PromQL]]（其查询引擎）。
- 替代/竞品：InfluxDB+Telegraf、VictoriaMetrics、Thanos/Cortex（长期存储增强）。

## 设计时必看的点
- 部署前提：目标能暴露 HTTP `/metrics`；若拉不到（NAT/防火墙/批处理）则用[[Pushgateway]]。
- 配置要点：`prometheus.yml` 四块——`global`(scrape_interval/evaluation_interval)、`alerting`、`rule_files`、`scrape_configs`。`scrape_interval` 应全局一致以保证颗粒度可比。
- 常见坑：默认无鉴权/加密；改标签会产生新时间序列（历史断点）；默认只存 15 天，长期趋势需远程存储或[[可视化面板]]外的方案。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
适合动态云原生/[[Kubernetes]]/容器环境的近实时监控与告警，生态成熟、查询强大。不适合作为长期数据仓库（默认 15 天）或需要强一致集群的场景（官方推荐"双活+上游去重"而非共享存储集群）。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]
- 同类替代：[[时序数据库TSDB]]（存储层）、[[Exporter]]、[[Alertmanager]]、[[Grafana]]、[[PromQL]]
- 生态背景：[[云原生]]

## 来源
- 《Prometheus监控实战》第2章、第3章（`.cache/prometheus/ch04_第2章 Prometheus简介.txt`、`ch05_第3章 安装和启动Prometheus.txt`）
