---
类型: 概念
主题: Kubernetes网络代理
tags: [概念, Kubernetes, 网络, 负载均衡]
创建: 2026-07-21
复习: 
状态: 种子
---

# kube-proxy

## 一句话定义
> kube-proxy 是"每个节点上的网络代理"，负责把访问 Service 虚拟 IP 的流量，转发给当前真正活着的 Pod 后端。

## 它解决什么问题 / 为什么存在
- Service 有个不变的 ClusterIP，但后端 Pod 会频繁变（扩缩容、重建、换节点）。需要一层转发，让"访问固定 IP"总能落到当前活着的 Pod——kube-proxy 维护这层映射。

## 核心原理（大二能懂的水平）
- 监听 APIServer 的 Service 和 Endpoint/EndpointSlice 变化，维护本机转发规则。
- **三代模式**：
  1. **userspace**（早期，性能差，已淘汰）：流量走用户态代理。
  2. **iptables**（长期默认）：用 netfilter 规则做 DNAT；规则多时线性匹配，规模大了会变慢。
  3. **IPVS**（大规模推荐）：基于内核哈希表，支持 rr/wrr/lc/dh 等调度算法，依赖 `ip_vs` 内核模块。
- kube-proxy 只负责 **"Service → Pod" 的集群内转发**；Pod 与 Pod 之间直连靠 [[CNI网络]]。

## 关键参数 / 易错点
- `--proxy-mode` 选 `ipvs` 需提前加载内核模块（`ip_vs`、`ip_vs_rr`、`ip_vs_wrr`、`ip_vs_sh`、`nf_conntrack`）。
- 默认只代理 ClusterIP；外部访问要走 NodePort / LoadBalancer / [[Ingress入门]]。
- **iptables 模式下 Service 上万时**，规则重建慢、转发延迟上升——这正是换 IPVS 的主要理由。
- IPVS 模式需要 `kube-proxy` 以 `--proxy-mode=ipvs` 启动且节点支持。

## 类比（帮助理解）
- 像大楼**总机接线员**：你拨总机号（Service IP），他查当前哪些分机（Pod）空闲，把电话转过去；分机换了人，他默默更新转接表。

## 设计时怎么用（反推思维）
> 集群规模大（上千 Service）时，部署就选 IPVS 模式；排查"Service 不通"时，先看 kube-proxy 日志和 `iptables -t nat -L` / `ipvsadm -Ln` 规则。

## 典型应用 / 我在哪见过
- 集群内 Service 负载均衡、ClusterIP/NodePort 转发；与 [[负载均衡]] 概念互补（kube-proxy 解决集群内，外部 LB 解决集群外）。

## 关联
- 前置知识：[[Service]] [[CNI网络]] [[负载均衡]]
- 相关：[[APIServer]] [[kubelet]]
- 反例/误区：把 kube-proxy 当外部入口（它默认不做 Ingress/7 层路由）。

## 来源
- 本书第 4 章 深入掌握 Service（Service 与 kube-proxy 转发）。
- 本书第 5 章 核心组件的运行机制（kube-proxy 三种模式）。
- 本书第 7 章 网络原理（iptables/IPVS 转发实现）。
