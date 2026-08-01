---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# ReplicaSet

## 一句话定义
> ReplicaSet 是 K8s 中"保证指定数量 Pod 副本一直在线"的控制器：少了就新建，多了就回收，从而实现高可用。

## 它解决什么问题 / 为什么存在
- 单 Pod 会挂、会被删，需要有人持续"维持副本数"。
- 它是 Replication Controller 的继任者，支持集合式标签选择器（RC 只支持等式选择器）。

## 核心原理（大二能懂的水平）
- 你声明 `replicas: N` + 选择器，ReplicaSet 不断比对"实际 Pod 数"和"期望 N"，自动补齐或删减。
- 通常你不直接操作它：[[Deployment]] 会创建并掌管 ReplicaSet，名字以 Deployment 名为前缀（如 nginx-deployment-3954615459）。
- ReplicaSet 自身不支持滚动更新；滚动更新是 Deployment 通过"新建 RS、逐步切换"实现的。

## 关键参数 / 易错点
- `spec.replicas`：期望副本数。
- `spec.selector.matchLabels`：集合式选择器（比 RC 的等式选择器更灵活）。
- 易错：手动改/删 Deployment 管着的 ReplicaSet —— 会"篡越"Deployment 职责，被纠正。
- 易错：几乎永远通过 Deployment 间接用，不要单独 kubectl create replicaset。

## 类比（帮助理解）
- ReplicaSet 像"值班调度员"：时刻盯着"必须有 3 个厨师在岗"，有人走立刻补；但他不管菜谱升级(滚动更新)，那是店长(Deployment)的事。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 直接用 [[Deployment]] 即可，它内置 ReplicaSet；只有极少数需要"自己精确控制副本且不要滚动更新"的场景才考虑裸用 RS。

## 典型应用 / 我在哪见过
- 第4章 4.1.2/4.1.3：nginx-deployment 自动生成的 ReplicaSet，以及 get/describe replicaset 观察副本与 READY。

## 关联
- 前置知识：[[Pod]] [[Deployment]]
- 相关：[[Label与Selector]] [[滚动更新与回滚]] [[Namespace]]
- 反例/误区：把它当 Deployment 的替代品（缺少版本记录/回滚）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第4章 4.1.2、4.1.3
