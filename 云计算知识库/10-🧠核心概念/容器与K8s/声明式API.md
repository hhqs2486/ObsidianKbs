---
类型: 概念
主题: 声明式API
tags: [概念, 声明式, API, 云原生]
创建: 2026-07-21
复习: 
状态: 种子
---

# 声明式API

## 一句话定义
> 声明式 API 是"你告诉系统『想要什么状态』（spec），由系统自己想办法达到，而不是你一步步下命令（imperative）"的接口风格——Kubernetes 的 API 就是声明式的。

## 它解决什么问题 / 为什么存在
- 命令式（imperative）要你写出"怎么做到"的每一步，出错难恢复、难并发、难审计；声明式只描述目标，系统负责收敛，天然适合分布式系统的自愈与并发协作。

## 核心原理（大二能懂的水平）
- 对象有 **spec（期望）**和 **status（实际）**两个字段；你只改 spec，控制器调谐 status 逼近 spec（见 [[ControllerManager]] [[容器编排]]）。
- 通过 `kubectl apply`（而非 `kubectl create`/`run`）提交，K8s 用 last-applied 注解做三方 diff 合并。
- 配合 **List-Watch**（见 [[APIServer]]），控制器持续感知变化并收敛，无需轮询。
- 对比：命令式像"把门打开"（动作），声明式像"门要开着"（状态）。

## 关键参数 / 易错点
- `kubectl apply` 用 `metadata.annotations.kubectl.kubernetes.io/last-applied-configuration` 记录上次配置，便于合并；手改后再 apply 可能冲突，可用 `--server-side` 服务端应用。
- 声明式不保证"立即"达成，只保证"最终"达成（最终一致性）。
- 过程性任务（一次性跑完就结束）不适合纯声明式，用 [[Job与CronJob]] 或脚本表达。

## 类比（帮助理解）
- 像点外卖填"要一份少辣的牛肉面"（声明目标），而不是指挥厨师"先烧水、再下面、加辣度0"（命令步骤）；餐厅自己保证最后端上来的是你要的那碗。

## 设计时怎么用（反推思维）
> 做"希望系统长期维持某状态"的需求（如"始终有 3 个副本在线"）时，我用声明式对象 + 控制器，而非一次性命令——系统重启/抖动后仍能自愈回目标。

## 典型应用 / 我在哪见过
- K8s 所有资源（Deployment/Pod/Service…）、Terraform、Ansible（部分）。

## 关联
- 前置知识：[[容器编排]] [[APIServer]]
- 相关：[[ControllerManager]] [[CRD与Operator]] [[RESTfulAPI]]
- 反例/误区：用一堆 `kubectl run`/`create` 当"基础设施即代码"（丢失声明式合并与自愈能力）。

## 来源
- 本书第 1 章 Kubernetes 入门（声明式 vs 命令式）；第 5 章 核心组件的运行机制（List-Watch 与调谐循环）。
- 本书第 9 章 Kubernetes 开发指南（基于声明式 API 扩展）。
