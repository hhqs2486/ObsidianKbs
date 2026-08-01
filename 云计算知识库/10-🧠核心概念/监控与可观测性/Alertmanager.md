---
类型: 组件参考
组件: Alertmanager
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Alertmanager

## 基本信息
- 类别（监控）：告警管理与路由
- 核心用途：接收[[Prometheus]]（或他处）发出的告警，做**去重、分组、路由**到不同接收器（邮件/Slack/PagerDuty/Webhook），并支持 silence（维护静音）。Prometheus 本身不含告警发送能力。
- 官方文档链接：https://prometheus.io/docs/alerting/alertmanager/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 告警中枢，独立于 Prometheus | 可集群化 |
| 数据模型 | 接收告警（带标签+注解） | 按标签路由 |
| 扩展性 | 集群（gossip/Memberlist） | 默认端口 9093，集群 9094 |
| 性能/规模 | 轻量 Go 二进制 | 多 Prometheus 可同发告警给它 |

## 配置核心（YAML）
- `global`：邮件/SMTP 等默认值。
- `route`：路由树。根路由匹配全部；`group_by`(按标签分组)、`group_wait`(30s 缓冲)、`group_interval`(5m)、`repeat_interval`(3h)、`match`/`match_re`、`continue`。
- `receivers`：email/Slack/PagerDuty/Webhook；`template` 目录自定义通知外观（Go 模板，变量 `$labels`/`$value`/`CommonAnnotations`）。
- `silence`：维护窗口静音，可用 Web 界面或 `amtool` 命令行。

## 与其它组件的关系
- 依赖：被[[Prometheus]]推送告警；告警由[[告警规则]]产生。
- 被依赖：邮件/IM/SaaS 接收器；上游去重靠它实现[[高可用]]。
- 替代/竞品：自研通知总线、VictorOps/Opsgenie 等 SaaS。

## 设计时必看的点
- 部署前提：Prometheus 在 `alerting` 块配置其地址（可静态或 DNS SRV 服务发现）。
- 配置要点：所有集群节点用**相同配置**才是真 HA；不要用负载均衡，Prometheus 自己会向所有 Alertmanager 发。
- 常见坑：告警疲劳——对"原因"而非"症状"告警、缺少上下文、优先级错配；`send_resolved` 谨慎开启（易循环）。

## 选型结论
> 适合我的哪个场景？为什么选它 / 为什么不？
用 Prometheus 就必然配 Alertmanager，它是官方唯一告警通道。需要更花哨的 on-call 编排可接 PagerDuty 等，但 Alertmanager 仍是入口。

## 关联
- 用到它的项目：[[监控Kubernetes集群]]
- 同类替代：[[告警规则]]、[[Prometheus]]、[[高可用]]
- 关联概念：[[指标Metric]]

## 来源
- 《Prometheus监控实战》第6章、第7章（`.cache/prometheus/ch08_第6章 警报管理.txt`、`ch09_第7章 可靠性和可扩展性.txt`）
