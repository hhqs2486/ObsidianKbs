---
类型: 概念
主题: Flannel
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Flannel

## 一句话定义
Flannel 是一个轻量、易上手的容器网络（CNI）方案，核心思路是"给每个节点分配一个子网，跨主机 Pod 流量用 Overlay 隧道（默认 VXLAN）封装打通"。

## 它解决什么问题 / 为什么存在
跨主机容器通信最简单的解法——不需要改底层网络、不要求 BGP，装上就能让所有节点 Pod 互通。代价是 overlay 封装有性能损耗、默认不支持网络策略隔离。

## 核心原理（大二能懂的水平）
- 地址管理（IPAM）：用 etcd 或 K8s API 保存"节点→子网"映射，每个节点从自己子网给 Pod 分配 IP。
- 控制平面：etcd 里维护子网分配与节点地址映射。
- 转发平面（backend）：
  - vxlan（默认）：内核做 VXLAN 封装/解封，性能好；
  - host-gw：不封装，直接用主机路由表（要求节点二层互通）；
  - udp：用户态封包，性能差（书里标注"udp 差"），仅兼容老内核。

## 关键参数 / 易错点
- 默认 vxlan 有封装开销（约 10~30% 性能损耗）；追求性能且二层可达时改 host-gw。
- Flannel 默认不支持 NetworkPolicy（要隔离得上 [[Calico]]/Cilium）。
- 子网不能和宿主机/物理网段冲突；`--pod-network-cidr` 要匹配。
- udp backend 性能最差，生产别用。

## 类比（帮助理解）
像"给每个分公司（节点）发一个独立号段，跨公司寄件统一交给总部隧道车（VXLAN）运，到了再拆包送本地"——简单但多一道装卸。

## 设计时怎么用（反推思维）
> 做实验/中小集群、对隔离要求不高时，我会用 Flannel 快速拉起网络；一旦要 Pod 间 ACL 或大流量低延迟，升级到 [[Calico]]（BGP）。

## 典型应用 / 我在哪见过
- 入门与中小集群；本书把 Flannel 列为开源容器网络方案之一（控制平面 etcd、转发平面 udp/vxlan）。

## 关联
- 前置知识：[[容器网络]] [[CNI网络]]
- 相关：[[Calico]] Weave [[SDN]]
- 反例/误区：把 Flannel 当生产级隔离方案（它默认无 NetworkPolicy）

## 来源
- 本书 Flannel 章（控制平面、转发平面 udp/vxlan）；结合 Flannel 官方通用知识（VXLAN/host-gw/udp backend、etcd IPAM）。
