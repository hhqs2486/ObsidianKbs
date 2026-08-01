---
类型: 概念
主题: DNS与服务发现
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# DNS与服务发现

## 一句话定义
**服务发现**是微服务互相「找到对方并连接」的机制；在 Kubernetes 里靠**集群内部 DNS（CoreDNS）**实现：每个 [[Service]] 创建时自动注册 DNS，Pod 通过名字解析到 Service 的 ClusterIP，再由 [[kube-proxy]] 转发到后端 Pod。

## 它解决什么问题 / 为什么存在
[[微服务]] 之间要通信，但 Pod IP 随时变（扩容/重启/故障）。如果写死 IP，一变就断。服务发现让「调用方只认服务名」，底层 IP 怎么变都不用改代码——这是云原生应用能弹性伸缩的前提。

## 核心原理（大二能懂的水平）
- **服务注册**：每建一个 Service，集群 DNS（CoreDNS，跑在 kube-system 的 `kube-dns` Service 后）就自动加一条「服务名→ClusterIP」记录；它由控制器监听 [[APIServer]] 实现，应用无需主动注册。
- **解析**：每个容器 `/etc/resolv.conf` 被注入集群 DNS 地址 + 搜索域（如 `default.svc.cluster.local`）。查 `ent` 会拼成 FQDN `ent.default.svc.cluster.local` 去问 DNS。
- **转发**：拿到 ClusterIP 后发请求，但 ClusterIP 在「服务网络」无路由，节点内核经 kube-proxy（IPVS）**捕获**并转发到某健康 Pod。
- **跨 namespace**：同 ns 用短名，跨 ns 必须用 FQDN（如 `ent.prod.svc.cluster.local`）。
- 也可用环境变量发现，但只在 Pod 创建时注入、不更新，**不推荐**（第6章）。

## 关键参数 / 易错点
- **易错**：跨命名空间用短名 `ent` 解析不到，必须写全 FQDN。
- **易错**：CoreDNS 挂了全集群解析失败——排错先 `kubectl get deploy -n kube-system -l k8s-app=kube-dns` 看 coredns 是否 Running。
- **易错**：依赖环境变量做服务发现会 stale，新 Service 看不见，坚持用 DNS。

## 类比（帮助理解）
DNS 服务发现像「公司内线通讯录」：你只管拨「张三分机」（服务名），总机（CoreDNS）把分机翻成实际工位号（ClusterIP），再由前台（kube-proxy）转接到张三当前坐的那张桌子（Pod）。张三换工位（Pod 重启）你完全无感。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做多微服务互相调用的系统时，我会让每个服务只通过「对方 Service 名」通信（代码里写服务名而非 IP），跨环境/跨 namespace 用 FQDN；有状态集群（[[StatefulSet]]）则用 headless Service 拿到每个 Pod 的稳定 DNS 做点对点发现。

## 典型应用 / 我在哪见过
- 第6章：服务发现靠 DNS（推荐）或环境变量（不推荐）；kube-dns 注册。
- 第7章实战：`enterprise`/`voyager` 两微服务经集群 DNS 互访；dev/prod 两 namespace 用短名 vs FQDN；排错查 coredns。

## 关联
- 前置知识：[[Service]] [[Pod]] [[kube-proxy]] [[Namespace]] [[网络模型]]
- 相关：[[微服务]]（服务发现是微服务的命脉）、[[StatefulSet]]（headless 做点对点发现）、[[负载均衡]]
- 反例/误区：用环境变量做服务发现（应改 DNS）

## 来源
- 本书第6章（服务发现）、第7章（服务发现深入，含 CoreDNS/kube-dns/解析流程/排错），`.cache/k8s-handbook/ch14~ch15_*.txt`。
