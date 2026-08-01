---
类型: 概念
主题: 虚拟化
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# vCenter

## 一句话定义
> vCenter Server 是 vSphere 的统一管理中心，集中管理多台 ESXi 主机、[[虚拟机]]、资源池、集群与可用性策略。

## 它解决什么问题 / 为什么存在
- 多台 ESXi 各自为政时，资源调度、权限、监控、告警缺乏统一视图，运维靠人肉登录每台主机。
- 企业需要单一控制面来跨主机做高可用、迁移、配额与合规。

## 核心原理（大二能懂的水平）
- vCenter 提供"单一控制面"：集群管理、vMotion 迁移、DRS 资源调度、HA 高可用、权限与告警。
- 操作入口是 vSphere Client / PowerCLI / API——与多年习惯一致。
- 在 vSphere with Kubernetes 中，vCenter 还负责创建和管理 **Kubernetes Namespace**（分配 CPU/内存/存储上限、安全策略、网络边界），把 K8s 的资源隔离和 vSphere 的资源池打通。

## 关键参数 / 易错点
- vCenter 是**管理平面**，不是 Hypervisor 本身——Hypervisor 是 ESXi。两者职责不同、故障域不同。
- 易错：把 vCenter 和 ESXi 混为一谈，导致高可用与备份设计错误（vCenter 本身也需要冗余/备份）。
- 在 vSphere with Kubernetes 里，vCenter 是连接"开发者（用 K8s API）"与"管理员（用 vSphere Client）"的桥梁。

## 类比（帮助理解）
- 像小区物业中心，统管所有楼栋（ESXi）的水电、门禁、维修调度与住户台账；业主（管理员）只跟物业打交道，不用自己爬每栋楼去合闸。

## 设计时怎么用（反推思维）
> 做企业虚拟化平台时，我会用 vCenter 做统一纳管与基于角色的权限隔离（谁能动哪些集群/Namespace），而不是让运维逐台登录 ESXi——管理平面集中化是规模化运维的前提。

## 典型应用 / 我在哪见过
- 多 ESXi 集群统一运维、资源池与 DRS 调度；
- 配合 vSphere with Kubernetes 管理 Namespace，把安全/配额/网络策略下沉到 K8s 层。

## 关联
- 前置知识：[[vSphere]]、[[虚拟机]]
- 相关：[[软件定义数据中心]]、[[超融合]]、[[高可用集群]]、[[Kubernetes]]
- 反例/误区：与 [[OpenStack]] 的 Keystone/Nova 角色类似但生态不同——别混用两者的概念模型。

## 来源
- 《VMware vSphere with Kubernetes 基础知识》白皮书（vmware-vsphere，ch04/ch05：vSphere 管理体验、Namespace 作为管理单元）
