---
类型: 组件参考
组件: Pushgateway
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Pushgateway

## 基本信息
- 类别（监控）：指标中转网关（推送）
- 核心用途：解决 Prometheus **拉不到**目标的场景——短生命周期批处理作业、防火墙/NAT 后的资源、没有 HTTP 端点的进程。它接收指标并作为普通目标被[[Prometheus]]抓取（与 Blackbox exporter 的"探测"方向相反：它是"接收"）。
- 官方文档链接：https://github.com/prometheus/pushgateway

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 推送代理（缓存，非聚合器） | 位于应用与 Prometheus 之间 |
| 数据模型 | 按 `job`/`instance` 分组的指标缓存 | 最后推送值生效 |
| 扩展性 | 不具 Prometheus 级扩展能力 | 可能成单点/瓶颈 |
| 性能/规模 | 默认内存存储 | `--persistence.file` 落盘 |

## 推送用法
- 路径：`/metrics/job/<jobname>{/<labelvalue>...}`，如 `echo "batchjob1_user_counter 2" | curl --data-binary @- http://pg:9091/metrics/job/batchjob1/instance/sidekiq_server`。
- 客户端库也支持推送（`Push.add/replace/delete`），适合代码中调用。
- 抓取时 Prometheus 作业需设 `honor_labels: true`，保留推送方原始 job/instance（否则被加 `exported_` 前缀）。

## 与其它组件的关系
- 依赖：被应用/作业推送；被[[Prometheus]]抓取；是[[Exporter]]体系的补充。
- 被依赖：短任务监控、[[告警规则]]（基于推送指标）。
- 替代/竞品：PushProx（抓 NAT 后目标）、StatsD（聚合型，非此模型）。

## 设计时必看的点
- 部署前提：应用能访问网关端口（默认 9091）。
- 配置要点：网关不是聚合器——同名指标多次推送取**最后一次**值，不会累加；`push_time_seconds` 可判断推送是否丢失。
- 常见坑：实例消失后指标仍留在网关（无 up 过期）；别把它当长期存储或万能推送监控，仅用于"短命/不可达"目标的短期监控。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
仅当"拉取不可行"才用，且聚焦批处理/临时任务。可访问的常驻服务仍应直接暴露 `/metrics` 给 Prometheus 抓。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]（批处理/Job 场景）
- 同类替代：[[Exporter]]、[[Prometheus]]、[[指标Metric]]

## 来源
- 《Prometheus监控实战》第11章（`.cache/prometheus/ch13_第11章 推送指标和Pushgateway.txt`）
