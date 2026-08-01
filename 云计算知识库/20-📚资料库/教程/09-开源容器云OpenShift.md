---
类型: 教程
来源: 开源容器云 OpenShift 构建基于 Kubernetes 的企业应用云平台
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 开源容器云 OpenShift 构建基于 Kubernetes 的企业应用云平台

## 这条教程在解决什么
- 回答一个"工程师思维"的问题：企业要在生产里跑容器，光有 [[Kubernetes]] 这种容器编排引擎远远不够——还需要构建流水线、对外路由、安全约束、复杂应用（数据库/中间件）的一键部署与生命周期管理。[[OpenShift]] 就是 Red Hat 在 Docker + Kubernetes 之上打包出来的"企业级 Kubernetes 发行版 / PaaS"，把这些都做成开箱即用的能力。
- 主线（全书的魂）：**OpenShift = 企业级 K8s 发行版——用 [[Source-to-Image]] 自动化构建、用 [[Route]] 代替 [[Ingress入门]] 暴露服务、用 [[OperatorHub]] / [[OLM]] 管理复杂应用、用 [[SCC安全上下文约束]] 做安全约束**。

## 关键内容（按 PDF 章节提纲）
- 第1章 开源容器云概述：容器填补"IaaS 资源"到"业务应用"之间的鸿沟；OpenShift 基于 Docker（容器引擎）+ Kubernetes（编排）构建，是 Red Hat 主导的开源 PaaS；分社区版 Origin 与企业版 Container Platform（第1章）。
- 第2章 初探 OpenShift：本地用二进制包 / `oc cluster up` 快速起一个 All-in-One 集群，跑通第一个 PHP+MySQL 应用（第2章）。
- 第3章 架构探秘：技术栈分五层——基础架构层 / 容器引擎层(Docker) / 容器编排层(Kubernetes) / PaaS 服务层 / 界面及工具层；核心对象 Project(即 Namespace)、Pod、Service、Router 与 Route、PV/PVC、内部 Registry、S2I；并给出"源码 → S2I 构建 → 推送镜像 → Image Stream → 部署 → Route 对外"的全流程（第3章）。
- 第4章 企业部署：最小化单节点到"多 Master + 多 Node + 外部 etcd"的生产架构；多环境单集群 vs 多环境多集群 vs 跨数据中心；高级安装用 Ansible 自动化（第4章）。
- 第5章 构建与部署自动化：手工容器化的痛点 → S2I 把"源码 → 镜像 → 部署"自动化；后台对象 Build Config / Build、Deployment Config / Deploy、Service、Route；镜像更新走 Rolling（滚动更新，默认）或 Recreate；用 GitHub / Generic WebHook 触发构建（第5章）。
- 第6章 持续集成与部署：OpenShift 提供集成插件的 Jenkins 镜像（jenkins-ephemeral / jenkins-persistent 模板），把 Jenkins 流水线与 oc 命令、S2I 串起来，落地 [[CI-CD]]（第6章）。
- 第7章 应用的微服务化：微服务与容器"相辅相成"而非强绑定；OpenShift 的 Service 发现、滚动更新、弹性伸缩天然适合 [[微服务]] 落地（第7章）。
- 第8章 应用数据持久化：Pod 非持久化，用 PV/PVC 模型对接 NFS、iSCSI、Ceph、云硬盘等后端（第8章）。
- 第9章 容器云上的应用开发：开发者视角，Builder 镜像、Template、Web 控制台、IDE 集成（第9章）。
- 第10章 软件定义网络：基于 Open vSwitch(OVS) 实现容器虚拟网络与多租户隔离；Router 组件用 Host 网络模式监听 80/443（第10章）。
- 第11章 度量与日志管理：Kubelet 内置 cAdvisor 采集指标，平台提供开箱度量与日志聚合，对接 [[可观测性]]（第11章）。
- 第12章 安全与限制：OAuth 认证、基于 [[RBAC]] 的授权、Service Account、[[SCC安全上下文约束]]（限制容器内运行用户 UID 范围等）、Secret 管敏感信息、ResourceQuota 与 LimitRange 做额度与资源限制（第12章）。
- 第13章 集群运维管理：运维规范（硬件/软件介质/部署/配置/升级/备份规范），扩容缩容、升级、健康检查（第13章）。
- 第14章 系统集成与定制：WebHook、oc/oadm 命令行、RESTful API、定制 S2I Builder 镜像、Template（企业 App Store）、组件/插件定制（第14章）。
- 附录A 排错指南：防患于未然 + 排查思路（观察 → 收集信息 → 复现 → 收缩范围）（附录A）。

## 我卡住/没懂的地方
- 本书基于 OpenShift Origin v1.3（2016 年），那时还没有 [[OperatorHub]] / [[OLM]]，也没有现代 Route 的 TLS 高级玩法。这两个概念书里几乎没讲，我是用通用知识补全的（见对应卡）。
- 书里写"Replication Controller"，对应今天 Kubernetes 的 ReplicaSet；理解时按现代语义映射即可。

## 它背后的原理（别只记操作）
- OpenShift 与 Kubernetes 的层次关系：K8s 解决"把 N 个容器调度到 M 台机器并维持期望状态"（容器编排），但不解决"代码怎么变成镜像、外部流量怎么进来、复杂应用怎么装"。OpenShift 在 K8s 之上叠加 PaaS 能力层。
- S2I 的本质：把构建逻辑从 Dockerfile 抽出来，变成 Builder 镜像里的脚本（assemble/run），从而"给源码+编程语言"就能产出标准镜像，且与具体构建系统解耦。
- Route 与 Ingress 的本质区别：Route 是 OpenShift 自己的资源，由内置 Router（定制 HAProxy）消费；Ingress 是 K8s 原生资源，由 Ingress Controller 消费。Route 在 OpenShift 里是一等公民，配置更贴合企业场景。
- SCC 的本质：给容器"能做什么"设白名单——默认 restricted 策略强制非 root、限定 UID 范围、限定可用卷类型，从运行时层面堵住 Docker Hub 上大量 root 镜像的安全隐患。

## 我能复用/改编的点
> 换个需求，这套做法还能怎么用？
- 做"企业内部应用一键部署平台"时：用 Template 思路沉淀成"企业 App Store"；用 S2I 让各语言团队只交源码；用 Route 给每个应用自动发域名；用 [[SCC安全上下文约束]] 强制镜像非 root 运行。
- 做"多团队共享集群"时：用 Project 做多租户隔离，用 ResourceQuota / LimitRange 防止某团队吃光资源，用 [[RBAC]] 管权限。
- 接既有 [[CI-CD]] 体系（Jenkins/GitLab）：用 Generic WebHook 把"提交代码 → 触发 S2I → 自动滚动更新"串成流水线，不必把构建搬进 OpenShift。

## 关联
- 概念：[[OpenShift]] [[企业级Kubernetes]] [[Source-to-Image]] [[Route]] [[SCC安全上下文约束]] [[OperatorHub]] [[OLM]] [[Kubernetes]] [[CRD与Operator]] [[安全与认证]] [[Helm]] [[镜像仓库]] [[Ingress入门]] [[Service]] [[Deployment]] [[微服务]] [[CI-CD]] [[高可用集群]] [[可观测性]]
- 项目：[[ ]]

## 来源
- 主文本：开源容器云 OpenShift 构建基于 Kubernetes 的企业应用云平台（.cache/openshift/full.txt，约 305KB；OpenShift Origin v1.3 社区版）
- 章节引用：第1/2/3/4/5/6/7/8/9/10/11/12/13/14 章、附录A
