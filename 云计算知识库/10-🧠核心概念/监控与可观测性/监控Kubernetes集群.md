---
类型: 概念
主题: 监控Kubernetes集群
tags: [概念, 实践]
创建: 2026-07-21
状态: 种子
---

# 监控Kubernetes集群

## 一句话定义
> 用 Prometheus 体系对 K8s 集群做**指标监控**的完整做法：采节点、采组件、采工作负载、告警、可视化。

## 它解决什么问题 / 为什么存在
K8s 动态性极强——Pod 随时生灭、IP 常变、副本数波动。传统"写死 IP 的静态监控"跟不上，必须**自动服务发现**。

## 核心原理（大二能懂的水平）
- **node_exporter** 以 [[DaemonSet]] 跑在每个节点，采集主机 CPU/内存/磁盘/网络指标。
- **kube-state-metrics** 把 K8s 对象（Deployment/Pod 状态）翻译成指标。
- **Prometheus** 用 `kubernetes_sd_configs` 自动发现 Pod/Service/Endpoints，按 annotations(`prometheus.io/scrape`) 决定抓谁。
- **Blackbox Exporter** 做探针监控（HTTP/TCP 探测）。
- **Alertmanager** 收告警、去重、分组、路由；**Grafana** 出可视化面板。

## 关键参数 / 易错点
- 忘给 Pod 加 `annotations` 让 Prometheus 抓取 → 采不到业务指标。
- RBAC 不足 → kube-state-metrics / kubelet 拉不到，指标缺失。
- 指标基数(cardinality)爆炸（如每个请求带随机 label）→ Prometheus 内存撑爆。

## 类比（帮助理解）
给集群装了一整套**体温计+心电图**，而且能自动识别"刚出生的小容器"并马上开始量，不用你手动登记。

## 设计时怎么用（反推思维）
搭生产 K8s，我会默认部署 node_exporter + Prometheus Operator + kube-state-metrics + Alertmanager，作为可观测性底座，而非等出了事故再补。

## 典型应用 / 我在哪见过
见 [[05-Prometheus监控实战]] 第12章「监控 Kubernetes」；任何生产级 K8s 集群的标配。

## 关联
- 前置：[[Prometheus]] [[node_exporter]] [[Exporter]] [[服务发现]]
- 相关：[[PromQL]] [[Alertmanager]] [[Grafana]] [[Pod]] [[DaemonSet]] [[Kubernetes]] [[可观测性]]
- 反例：只用 `kubectl get pods` 肉眼盯（不可持续）

## 来源
05-Prometheus监控实战 第12章 监控 Kubernetes（PDF 文本已抽取，据此整理）
