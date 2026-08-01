---
类型: 概念
主题: 
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# OLM

## 一句话定义
> OLM（Operator Lifecycle Manager，Operator 生命周期管理器）是 [[Kubernetes]] / [[OpenShift]] 上负责管理 Operator"安装、更新、依赖"的框架：你订阅一个 Operator，OLM 负责把它及其依赖正确部署并持续升级。

## 它解决什么问题 / 为什么存在
- Operator 本身也是跑在集群里的软件，需要被安装、版本升级、处理依赖（如 A Operator 依赖 B 的 CRD）。手工管这些很麻烦。
- OLM 把 Operator 的"生命周期"自动化：谁依赖谁、能不能安全升级、旧版本怎么停，都由 OLM 按声明式规则处理（通用知识补全；本书 v1.3 未涉及）。

## 核心原理（大二能懂的水平）
- 核心对象：CatalogSource（Operator 目录来源，如 OperatorHub）、Subscription（用户订阅某个 Operator + 频道）、CSV（ClusterServiceVersion，描述一个 Operator 版本及其依赖/权限/CRD）、InstallPlan（实际要创建的资源清单）。
- 工作流程：Subscription → OLM 从 CatalogSource 找到对应 CSV → 解析依赖 → 生成 InstallPlan → 创建 Operator 的 Deployment/CRD → 之后该 Operator 接管其应用的运维。
- 更新：订阅指向的频道有新版本 CSV 时，OLM 按批准策略自动或手动升级。

## 关键参数 / 易错点
- 易错：把 OLM 和 OperatorHub 混为一谈——OperatorHub 是"目录/前端"，OLM 是"后台安装与生命周期引擎"，两者配合（见 [[OperatorHub]]）。
- 易错：CSV 里声明的权限（RBAC）过大会带来安全风险，订阅时要审查。
- 升级审批：生产环境常用 Manual 批准，避免 Operator 自动升级引入不兼容。

## 类比（帮助理解）
- OLM 像手机商店的"后台更新服务"：你点了订阅（Subscription），它负责下载安装、处理依赖、后续推送更新；OperatorHub 是你能看到的"商店界面"。

## 设计时怎么用（反推思维）
> 做"平台要稳定提供一组中间件 Operator"时，我会用 OLM 管理订阅与更新策略（生产用 Manual 审批），既享受 Operator 的自动运维，又避免无预警的版本跳变。

## 典型应用 / 我在哪见过
- OpenShift 4.x 内置 OLM，作为 Operator 框架的底座；与 [[OperatorHub]]、[[CRD与Operator]] 共同构成"复杂应用自助运维"能力。

## 关联
- 前置知识：[[Kubernetes]] [[CRD与Operator]] [[自定义资源]] [[RBAC]]
- 相关：[[OpenShift]] [[OperatorHub]] [[Helm]] [[企业级Kubernetes]]
- 反例/误区：[[Helm]]（Helm 不管理运行期生命周期，OLM 管）

## 来源
- 通用知识补全（本书 OpenShift Origin v1.3 尚未引入 OLM；现代 OpenShift 4.x / Operator Framework 文档）。
- 关联本书：第14章 系统集成与定制（RESTful API、Template）是 OLM 之前 Operator 自定义集成的早期形态。
