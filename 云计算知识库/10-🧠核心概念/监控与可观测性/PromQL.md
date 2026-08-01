---
类型: 组件参考
组件: PromQL
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# PromQL

## 基本信息
- 类别（监控）：查询/表达式语言
- 核心用途：Prometheus 内置的查询语言，用于即时查询、聚合、计算变化率、构建记录规则与[[告警规则]]。表达式浏览器与[[Grafana]]都通过它取数。
- 官方文档链接：https://prometheus.io/docs/prometheus/latest/querying/basics/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | Prometheus 的查询引擎 | 嵌入 Prometheus 服务器 |
| 数据模型 | 操作多维时间序列 | 基于标签匹配与聚合 |
| 扩展性 | 函数/运算符丰富 | rate/irate/histogram_quantile/predict_linear 等 |
| 性能/规模 | 查询成本取决于返回序列数 | 重查询可预计算成记录规则 |

## 四种数据类型
- **即时向量**：一组时间序列，每个含同一时间戳的单个样本（最常见）。
- **范围向量**：一组时间序列，每个含一段时间内的多个样本，如 `metric[5m]`。
- **标量**：浮点数值。**字符串**：暂未使用。

## 真实示例（来自本书）
- 求和：`sum(promhttp_metric_handler_requests_total)`
- 按标签聚合：`sum by (code) (promhttp_metric_handler_requests_total)`
- 增长率（仅 counter）：`rate(promhttp_metric_handler_requests_total[5m])`
- 瞬时增长率：`irate(node_cpu_seconds_total[5m])`
- CPU 使用率：`100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`
- 内存使用率：`(1 - (node_memory_MemFree_bytes + node_memory_Cached_bytes + node_memory_Buffers_bytes)/node_memory_MemTotal_bytes) * 100`
- 磁盘耗尽预测：`predict_linear(node_filesystem_free_bytes{mountpoint="/"}[1h], 4*3600) < 0`
- p99 延迟：`histogram_quantile(0.99, rate(apiserver_request_latencies_bucket[5m])) / 1e+06`
- 可用性：`up == 0`；目标消失：`absent(up{job="node"})`

## 与其它组件的关系
- 依赖：[[指标Metric]]（操作对象）、[[时序数据库TSDB]]（数据源）。
- 被依赖：[[告警规则]]、[[Prometheus]]、[[Grafana]]、记录规则。
- 替代/竞品：Graphite 函数、InfluxQL。

## 设计时必看的点
- 部署前提：无（随 Prometheus 自带）。
- 配置要点：聚合用 `by`/`without`；标签匹配支持 `=`、`=~`(正则)、`!=`、`!~`；向量匹配用 `on`/`ignoring`/`group_left`。
- 常见坑：`rate` 只能用于 counter；改标签会产生新时间序列导致查询断点；`histogram_quantile` 必须配 `*_bucket` 直方图指标。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
只要用 Prometheus 做监控，PromQL 就是唯一查询语言，必学。关键是把"常用/重"的查询固化成记录规则，避免每次实时算。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]
- 同类替代：[[指标Metric]]、[[时序数据库TSDB]]、[[Prometheus]]、[[告警规则]]、[[可视化面板]]

## 来源
- 《Prometheus监控实战》第3章、第4章、第12章（`.cache/prometheus/ch05_*.txt`、`ch06_*.txt`、`ch14_第12章 监控Kubernetes.txt`）
