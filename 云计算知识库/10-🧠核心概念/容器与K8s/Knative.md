---
类型: 概念
tags: [云计算知识库, 容器与K8s]
主题: 容器与K8s
创建: 2026-07-22
状态: 种子
---

# Knative

> CNCF **Graduated** 项目（2025-09-11 毕业）。Kubernetes 原生的 Serverless/事件驱动应用层。

## 一句话定义
Knative 是跑在 K8s 上的三层 Serverless 框架——**Serving**（HTTP 自动扩缩容含缩到零）、**Eventing**（CloudEvents 异步路由）、**Functions**（开发者函数框架）——让你不用关心 Pod、Deployment、Ingress 等几十个 K8s 概念就能跑服务。

## 它解决什么问题
Serverless 长期是超大规模云厂商的专属服务（Lambda / Cloud Functions），用了就绑定。Knative 把同样的体验搬进你自己的 K8s 集群——代码缩到零不占资源、来请求自动拉起、事件驱动解耦——数据主权和成本效率全在自己手里。

## 核心原理
- **Serving**：基于 HTTP 的自动扩缩容运行时，支持缩容到零（idle → 0 副本）。请求到达时通过 Activator + Queue-Proxy 自动拉起。
- **Eventing**：CloudEvents-over-HTTP 异步路由层。Broker / Trigger 模型：事件源（Kafka/GitHub/S3）→ Broker → Trigger 过滤 → Sink（服务/函数）。
- **Functions**：开发者函数框架，基于 Buildpacks 自动构建容器镜像，部署到 Serving。

## 里程碑
| 时间 | 事件 |
|------|------|
| 2018 | Google 创建，IBM/Red Hat/VMware/SAP 早期贡献 |
| 2021 | v1.0 发布，信号生产就绪 |
| 2022-03 | 以 Incubating 级别加入 CNCF |
| 2025-09-11 | **CNCF Graduated**（最高成熟度，K8s/Prometheus/Envoy 同级） |

## Graduation 意味着什么
- 治理文档标准化（单一 Steering Committee，年度选举）
- OSTIF + Ada Logics 安全审计完成
- TAG Runtime & App Delivery 技术审查通过
- 与 CloudEvents、Buildpacks、Tekton、Gateway API 深度互操作
- 生产中已验证的大规模用户基础

## 关键组件
- **Activator**：idle 时缓冲请求，防止冷启动丢失
- **Queue-Proxy**：每个 Pod 的 Sidecar，限流 + 指标上报
- **Autoscaler**：基于并发/请求数的自动扩缩（KPA = Knative Pod Autoscaler）
- **Broker / Trigger**：Eventing 核心抽象——事件经纪人 + 触发规则

## 如何影响云原生格局
- Serverless on K8s 不再只是实验——Graduated 意味着有可靠基础
- 替代超大规模云厂商 Serverless 的自建选项，数据主权可控
- 天然适合 AI 推理（缩到零节省 GPU）、事件驱动 MCP、异步任务
- 与 [[Gateway API]] 整合简化网络栈，支持 OpenTelemetry 指标和追踪

## 关联
- 基础：[[Kubernetes]] [[云原生]] [[容器编排]] [[无状态应用]]
- 相关：Serverless、[[Gateway API]] [[Istio]] [[Service Mesh]] [[微服务]] 事件驱动架构
- 对比：[[ingress-nginx]]（已退役，Knative 是更高级抽象）
- 版本：[[Kubernetes v1.36]]

## 类比
Knative 像 K8s 上的"智能家居系统"——你对着 Siri 说"放音乐"（一个 HTTP 请求），系统自动打开音响、切到歌单、调好音量。没人听的时候彻底关机省电。HyperScaler Serverless 是"住酒店让别人打理"，Knative 是"自己家装全屋智能"。

## 来源
- CNCF Knative Graduation Announcement（PR Newswire, 2025-10-08）
- CNCF 项目页：cncf.io/projects/knative（Graduated Sept 11, 2025）
- Knative 官方文档
- DevOps Digest / CloudMagazin 分析报道（2026）
