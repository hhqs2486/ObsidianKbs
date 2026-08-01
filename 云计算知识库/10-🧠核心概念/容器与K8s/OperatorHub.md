---
类型: 概念
主题: 
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# OperatorHub

## 一句话定义
> OperatorHub 是 [[OpenShift]]（及现代 [[Kubernetes]]）里的"应用商店 / 市场"：集中发布和浏览各种 Operator（对有状态/复杂应用的自动化运维脚本），让用户在控制台一键订阅、安装数据库、中间件、监控等复杂应用。

## 它解决什么问题 / 为什么存在
- 简单无状态应用用 [[Deployment]] 就能跑；但数据库、消息队列、缓存等有状态/复杂应用需要备份、升级、故障转移、扩缩容等运维逻辑，光靠 K8s 原语不够。
- [[CRD与Operator]] 模式把"人类运维专家的知识"写成代码跑在集群里。OperatorHub 则是这些 Operator 的集中分发渠道——相当于"复杂应用的应用商店"（通用知识补全；本书 v1.3 时代尚未有 OperatorHub，故此处为通用知识）。

## 核心原理（大二能懂的水平）
- OperatorHub 里的每个条目是一个 Operator：它定义自己的 CRD（自定义资源），并在控制器里实现该应用的运维逻辑（如 etcd 的备份、Prometheus 的伸缩）。
- 用户在 OpenShift 控制台或命令行订阅（Subscription）某个 Operator → 由 [[OLM]] 负责把 Operator 及其依赖下载、部署、做生命周期管理 → 之后用户就能像创建普通资源一样 apply 一个该应用的 CR，剩下的运维交给 Operator。
- 类比：OperatorHub 像手机应用商店，Operator 像 App，OLM 像商店的后台安装/更新服务。

## 关键参数 / 易错点
- 易错：把 OperatorHub 和 [[Helm]] 混为一谈——Helm 是"打包部署清单"的模板工具，Operator 是"带控制器的持续运维逻辑"，两者定位不同（Operator 能持续自愈、自动升级，Helm 主要管初次部署）。
- 易错：订阅频道（channel / update channel）决定装哪个版本/更新策略，生产要选稳定频道。
- 生态：社区版叫 OperatorHub.io，Red Hat 提供认证目录（Certified Operator）。

## 类比（帮助理解）
- OperatorHub 像 App Store；Operator 像里面的 App；你订阅后，App 会自动装好并随系统更新。

## 设计时怎么用（反推思维）
> 做"平台要给业务团队提供 MySQL/Redis/Kafka 等中间件自助服务"时，我会从 OperatorHub 订阅对应 Operator，让业务方用 CR 自助申请带备份和自动故障转移的中间件，而不是手敲一堆 Deployment/StatefulSet。

## 典型应用 / 我在哪见过
- 数据库（PostgreSQL/MySQL）、缓存（Redis）、消息（Kafka）、监控（Prometheus/ETCD）、服务网格等复杂应用多通过 OperatorHub 分发。
- 本书虽未覆盖，但属于 [[OpenShift]] 4.x 的核心能力，与 [[CRD与Operator]] / [[OLM]] 紧密配合。

## 关联
- 前置知识：[[Kubernetes]] [[CRD与Operator]] [[自定义资源]]
- 相关：[[OpenShift]] [[OLM]] [[Helm]] [[企业级Kubernetes]] [[高可用集群]]
- 反例/误区：[[Helm]]（只管部署模板，无持续运维逻辑）

## 来源
- 通用知识补全（本书 OpenShift Origin v1.3 尚未引入 OperatorHub；现代 OpenShift 4.x 文档与 Operator 框架）。
- 关联本书：第14章 Template 是早期"企业 App Store"思路，OperatorHub 是其演进形态。
