---
类型: 组件参考
主题: 
tags: [组件参考]
创建: 2026-07-21
复习: 
状态: 种子
---

# OpenShift

## 基本信息
- 定位：Red Hat 主导的开源容器云平台（PaaS），基于 Docker（容器引擎）+ [[Kubernetes]]（编排）构建，是"企业级 Kubernetes 发行版"的代表（第1章）。
- 版本：社区版 OpenShift Origin（后改名 OKD）+ 企业版 OpenShift Container Platform（第1章）。本书以 Origin v1.3 讲解。
- 命令行：oc（面向用户）/ oadm（面向集群管理员），思路源自 kubectl（第14章）。

## 关键能力
- 自动化构建：[[Source-to-Image]]（S2I）把源码变成标准镜像（第3/5章）。
- 对外路由：[[Route]] + 内置 Router（定制 HAProxy）替代原生 [[Ingress入门]]（第3/10章）。
- 应用目录与服务目录：Template（参数化部署模板，企业 App Store）+ Builder 镜像（第3/14章）。
- 安全合规：[[SCC安全上下文约束]] 限制容器运行时权限、[[安全与认证]]（OAuth + [[RBAC]]）、Secret 管敏感信息、ResourceQuota / LimitRange 限额（第12章）。
- 持久化：PV/PVC 对接 NFS / iSCSI / Ceph / 云硬盘（第8章）。
- 网络：基于 Open vSwitch 的 SDN 与多租户隔离（第10章）。
- 度量日志：cAdvisor 指标 + 日志聚合，对接 [[可观测性]]（第11章）。
- 集成：WebHook、oc/oadm、RESTful API、定制组件（第14章）。
- 现代演化：[[OperatorHub]] + [[OLM]] 管理复杂应用生命周期（通用知识补全，4.x 能力）。

## 与其它组件关系
- 叠在 [[Kubernetes]] 之上：Master/Node、API Server、etcd、Scheduler、Replication Controller 都沿用 K8s；OpenShift 自增 Project、Route、S2I、Image Stream、Template 等对象（第3章）。
- 容器引擎用 [[容器]] / Docker，镜像存于 [[镜像仓库]]（内部 Registry）（第3章）。
- 与 [[Helm]] 互补：Helm 管部署模板，OpenShift 另有 Template；S2I / Operator 与 Helm 定位不同（第14章）。
- 与 [[CRD与Operator]]：现代 OpenShift 通过 Operator 框架扩展复杂应用（通用知识补全）。

## 设计时必看
- 主线记牢：OpenShift = 企业级 K8s——S2I 自动化构建、Route 代替 Ingress、OperatorHub/OLM 管复杂应用、SCC 做安全约束。
- 默认安全更严：Docker Hub 的 root 镜像可能起不来，要适配 SCC（用非 root 或加 anyuid）（第12章）。
- 多租户用 Project 隔离 + ResourceQuota 防资源被吃光（第12章）。
- 接既有 [[CI-CD]]（Jenkins 等）用 Generic WebHook，不必把构建搬进平台（第5/6/14章）。

## 选型结论
- 选 OpenShift 当：企业需要"开箱即用的 Kubernetes 平台"而非自己拼装；看重安全合规（SCC / RBAC / 多租户）、构建自动化（S2I）、企业支持（Red Hat）。
- 不选 / 谨慎：轻量场景或只想用纯上游 K8s 时，OpenShift 的额外抽象（Route / SCC 严格）可能增加学习成本；此时裸 K8s + Ingress + CI 脚本更轻。

## 关联
- 前置知识：[[Kubernetes]] [[容器编排]] [[容器]]
- 相关：[[企业级Kubernetes]] [[Source-to-Image]] [[Route]] [[SCC安全上下文约束]] [[OperatorHub]] [[OLM]] [[CRD与Operator]] [[安全与认证]] [[Helm]] [[镜像仓库]] [[Ingress入门]] [[Service]] [[Deployment]] [[微服务]] [[CI-CD]] [[高可用集群]] [[可观测性]] [[多租户]]
- 反例/误区：[[Ingress入门]]（原生入口，OpenShift 用 Route 替代）

## 来源
- 开源容器云 OpenShift（第1章 概述、第3章 架构探秘、第4章 企业部署、第5章 构建部署、第12章 安全、第14章 集成定制等全书主体）。
- 通用知识补全：OperatorHub / OLM 为 OpenShift 4.x 能力，本书 v1.3 未覆盖。
