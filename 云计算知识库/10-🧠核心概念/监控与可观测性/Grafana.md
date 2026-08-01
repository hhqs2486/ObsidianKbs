---
类型: 组件参考
组件: Grafana
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Grafana

## 基本信息
- 类别（监控）：可视化/仪表板
- 核心用途：从多种数据源（[[Prometheus]]、Graphite、Elasticsearch 等）读取数据，构建[[可视化面板]]与仪表板。Prometheus 自带的图仅适合单图临时查看，正式看板靠 Grafana。
- 官方文档链接：https://grafana.com/ 、https://prometheus.io/docs/visualization/grafana/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 可视化层，独立于存储 | 只查不存 |
| 数据模型 | 面板绑定数据源+查询 | 支持变量/模板 |
| 扩展性 | 多数据源、大量预建仪表板 | grafana.com/dashboards |
| 性能/规模 | 轻量 Web 应用（Go） | 默认 3000（Win 常改 8080） |

## 与其它组件的关系
- 依赖：[[Prometheus]]（数据源，Access 设为 proxy）；底层靠[[PromQL]]取数。
- 被依赖：运维/开发看板；监控体系对外展示面。
- 替代/竞品：Prometheus 自带 UI、Kibana、Datadog。

## 设计时必看的点
- 部署前提：Prometheus 在运行且可达。
- 配置要点：加 Data Source（类型 Prometheus、URL、Access=proxy）；从预建 JSON 导入仪表板省事。
- 常见坑：Prometheus 默认只留 15 天数据，Grafana 不适合做"长期趋势大屏"，应聚焦实时/近期；过度堆仪表板不如建好告警。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
Prometheus 生态默认可视化搭档，必用。需要长期归档看板时，数据应走远程存储，Grafana 再读。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]
- 同类替代：[[可视化面板]]、[[Prometheus]]、[[PromQL]]

## 来源
- 《Prometheus监控实战》第4章（`.cache/prometheus/ch06_第4章 监控主机和容器.txt`）
