---
类型: 概念
主题: Calico
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Calico

## 一句话定义
Calico 是一个高性能的容器网络（CNI）方案，核心思路是"把每台节点的操作系统协议栈当成一台路由器，用 BGP 路由协议把 Pod 流量在节点间直路路由"，并内置网络策略做隔离。

## 它解决什么问题 / 为什么存在
Overlay 方案（如默认 Flannel VXLAN）有封包开销、性能损耗；且很多方案不支持精细的 Pod 间隔离。Calico 用真实路由代替隧道，性能好，并原生支持 NetworkPolicy（端到端 ACL）。

## 核心原理（大二能懂的水平）
- 转发平面：每个节点跑一个 Felix（agent）配置本机路由/ACL，把操作系统协议栈化为 Router；Pod 流量按主机路由表直路转发，无需封包（BGP 模式下）。
- 控制平面：节点间通过 BGP 互相通告路由（每个节点是一个 BGP Speaker/Peer），形成全网路由；大规模下可用 Route Reflector（RR）避免 Full Mesh。
- 隔离：基于 iptables/IPVS 实现 NetworkPolicy（Pod/Service 级 ACL，支持 TCP/UDP/ICMP）。
- 模式：BGP 直路（性能最好，要求节点二层互通或 BGP 打通）、IPIP（IP-in-IP 封装 overlay，跨二层时用）、VXLAN（另一种 overlay）。

## 关键参数 / 易错点
- BGP 模式要求底层网络"IP 可达/可路由"（二层互通或已打通 BGP）；否则要用 IPIP/VXLAN overlay。
- IPIP/VXLAN 仍是有封装开销的 overlay；纯追求性能选 BGP。
- Calico 默认 Pod CIDR（如 192.168.0.0/16）要和 `kubeadm --pod-network-cidr` 一致。
- 大规模 Full Mesh 连接数爆炸 → 用 RR。

## 类比（帮助理解）
像"每个校区（节点）自己有张地图（路由表），校区之间用广播站（BGP）互相通报'哪栋楼(Pod)在哪'，快递(包)按地图直送，不绕隧道"。

## 设计时怎么用（反推思维）
> 做对网络性能和隔离要求高的微服务集群时，我会选 Calico + BGP（底层可达时），用 NetworkPolicy 给服务间划 ACL，替代"在应用里写死防火墙"。

## 典型应用 / 我在哪见过
- 生产集群主流 CNI；本书把 Calico 列为"将操作系统协议栈化为 Router、模拟传统网络拓扑做路由转发"的代表方案（控制平面/转发平面/隔离）。

## 关联
- 前置知识：[[容器网络]] [[CNI网络]] [[SDN]]
- 相关：[[Flannel]] [[网络模型]] [[微服务架构]]
- 反例/误区：以为 Calico 一定要 overlay（BGP 直路才是它的性能卖点）

## 来源
- 本书 Calico 章（协议栈化 Router、BGP 路由、控制平面/转发平面/隔离）；结合 Calico 官方通用知识（BGP/IPIP/VXLAN/NetworkPolicy）。
