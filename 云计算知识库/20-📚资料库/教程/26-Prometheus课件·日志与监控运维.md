---
类型: 教程
资料: Prometheus课件笔记（云原生大礼包#9）
tags: [教程]
创建: 2026-07-21
---

# Prometheus 课件·日志与监控运维（Prometheus 在 K8s 落地）

> 源：V2.0 `chap06 日志收集和监控`（6.1.docx + 第六章日志及监控.ppt）。标题叫"日志收集和监控"，实际是**一份 Prometheus 在 Kubernetes 里落地的综合实操清单**。

## 概述
这一章把 Prometheus 监控体系在 K8s 中的关键拼图都给了一遍：日志栈（EFK/ELK）、Prometheus-operator/kube-prometheus 安装、PromQL 函数精讲、各类 Exporter、白盒/黑盒监控、Alertmanager 配置、基于 ingress 的自动发现、JVM 监控。适合作为"生产落地 checklist"。

## 核心要点（按课件结构）
- **日志栈线索**：EFK（ElasticSearch + Fluentd + Kibana）、ELK（ES + Filebeat + Logstash + Kibana + Zookeeper + Kafka）。详见 [[日志收集与监控]]。
- **Prometheus 安装**：`kube-prometheus`（coreos）一键部署 operator + Prometheus + Alertmanager + Grafana；`prometheus-operator` 用 CRD 管理。
- **PromQL 函数再强化**：聚合 `sum(...) by (statuscode, handler)`、`topk/bottomk`、`quantile`、预测 `predict_linear`（磁盘空间预警）、`label_join/label_replace`、`irate`（瞬时速率，不适合告警）、`rate`（区间平均）。
- **Exporter 生态**：
  - `node_exporter`（主机）、`kafka-exporter`（Topic 指标）。
  - **黑盒监控** `blackbox_exporter`：探测 http/tcp/icmp/ssh，站在用户视角看"网站打不开/慢"；对应**白盒监控**（内部指标如 Redis key 大小）。
  - **自动发现** `kubernetes_sd_configs`：用 ingress 注解 `prometheus.io/http-probe` 自动加黑盒探测目标。
- **Alertmanager 配置**：`route`（按 namespace 分组、group_wait/group_interval）、`inhibit_rules`（critical 抑制 warning/info）、`email_configs` / `wechat_configs`（企业微信）；Secret 热更新 `kubectl create secret ... --dry-run -o yaml | kubectl replace -f -`。
- **JVM 监控**：Spring Boot + Micrometer `micrometer-registry-prometheus`，暴露 `/actuator/prometheus`，用 `jvm-prometheus` job 抓取；`consul_sd_configs` 对接 Eureka 服务发现。

## 关联概念卡
- 指标支柱：[[Prometheus]] [[PromQL]] [[Exporter]] [[node_exporter]] [[Pushgateway]] [[指标Metric]] [[告警规则]] [[服务发现]]
- 报警/可视化：[[Alertmanager]] [[Grafana]] [[可视化面板]]
- 日志支柱：[[日志收集与监控]]
- 场景：[[监控Kubernetes集群]]

## 来源
- V2 章06：`.cache/V2章06日志/full.txt`
