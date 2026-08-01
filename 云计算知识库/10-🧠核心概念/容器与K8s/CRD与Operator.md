---
类型: 概念
主题: Kubernetes扩展机制
tags: [概念, Kubernetes, 扩展, Operator, CRD]
创建: 2026-07-21
复习: 
状态: 种子
---

# CRD与Operator

## 一句话定义
> CRD（自定义资源定义）让你往 K8s 里"加新类型的对象"，Operator 则是"盯着这些自定义对象、按你的运维逻辑自动调谐的控制器"——二者合起来把领域知识编码进集群。

## 它解决什么问题 / 为什么存在
- K8s 原生只懂 Pod/Service 等；但你想管"数据库实例""定时备份策略"这类自己的东西。CRD 让你扩展 API，Operator 让集群自动按你的规则维护它们，实现"声明式运维"。

## 核心原理（大二能懂的水平）
- **CRD**：一段 YAML 声明新资源类型（group/version/kind、字段 schema），提交后 APIServer 立刻支持对该类型的 List/Get/Watch/增删改，并存入 [[Etcd]]——无需改 K8s 源码。
- **自定义控制器 / Operator**：用 client-go 的 informer 或 controller-runtime 写循环：Watch 你的 CR → 对比 spec/status → 调底层（创建 Pod/StatefulSet、调外部 API）→ 更新 status。这就是"声明式运维"。
- **Operator 模式**：把"人肉 SRE 知识"写成代码（如 etcd Operator 自动扩缩容、备份），让有状态应用也能自愈。
- **API 聚合层（aggregation）**：可做更复杂的"真正自带存储"的扩展 API（与 CRD 的"用 etcd 存储"相对）。
- 生态：Operator Framework、kubebuilder（用 Go 生成脚手架）。

## 关键参数 / 易错点
- CRD 的 `validation` 用 OpenAPI v3 schema 限制字段，写错会导致整类资源不可创建。
- `status` 子资源要单独声明，控制器写 status 走 `/status` 子资源（绕过某些变更型 webhook）。
- 升级 CRD 改字段要考虑已有对象兼容（已有对象不会自动重新校验）。
- Operator 必须处理"最终一致"和"重入"——随时可能被杀掉重启，逻辑要幂等。

## 类比（帮助理解）
- 像给公司 ERP 系统"新增一种业务单据类型"（CRD），再招一个专属办事员按规则自动处理这类单据（Operator）；系统原本只认采购单/报销单，现在也能认"数据库实例单"了。

## 设计时怎么用（反推思维）
> 做"要把一类中间件/有状态服务托管进 K8s 并自动化运维"需求时，我用 CRD 定义它的期望状态，用 Operator 写调谐逻辑，把运维经验沉淀成代码。

## 典型应用 / 我在哪见过
- etcd Operator、Prometheus Operator、数据库集群托管、自定义平台 CR（如「租户」CR）。

## 关联
- 前置知识：[[自定义资源]] [[声明式API]] [[APIServer]]
- 相关：[[ControllerManager]] [[准入控制]]
- 反例/误区：把本该用 CRD 的逻辑写成一次性脚本（失去自愈与声明式，重启即丢状态）。

## 来源
- 本书第 9 章 Kubernetes 开发指南（CRD、API 聚合、Operator/自定义控制器）。
- 本书第 12 章 Kubernetes 开发中的新功能（CRD/聚合 API 演进）。
