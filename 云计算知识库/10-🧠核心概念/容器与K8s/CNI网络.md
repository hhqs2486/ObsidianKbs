---
类型: 概念
主题: Kubernetes容器网络
tags: [概念, Kubernetes, 网络, CNI]
创建: 2026-07-21
复习: 
状态: 种子
---

# CNI网络

## 一句话定义
> CNI（Container Network Interface）是容器网络的"插头标准"——它定义了一套插件接口，让 K8s 不用管底层怎么通，只要插件按规范把 Pod 接进网络即可。

## 它解决什么问题 / 为什么存在
- 不同网络方案（Flannel/Calico/Cilium…）实现千差万别，K8s 不可能内置每一种。CNI 把"网络怎么配"抽象成标准接口，kubelet 在容器创建时调用插件即可，实现"可插拔"。

## 核心原理（大二能懂的水平）
- CNI 规范只定义**插件可执行文件 + JSON 配置文件**的交互：kubelet（经 CRI）在容器创建时调用插件，传入容器 netns、接口名等，插件负责把 Pod 接进网络并返回分配的 IP。
- 四类操作：**ADD**（把容器加入网络）、**DEL**（移除）、**CHECK**（校验状态）、**VERSION**（版本协商）。
- 两个子规范：**CNI Plugin**（负责把容器接到网络，底层可用 bridge/veth/隧道等）和 **IPAM Plugin**（负责分配/回收 IP，如 host-local、DHCP）。
- **K8s 网络模型三约定**：每个 Pod 有独立 IP（IP-per-Pod）；同节点 Pod 互通无需 NAT；Pod 与 Node 互通无需 NAT；所有组件（含未跑在 Pod 里的进程）都能直连 Pod IP。
- 常见实现：Flannel（Overlay VXLAN，简单）、Calico（BGP 路由 + 网络策略）、Cilium（eBPF，高性能+可观测）。

## 关键参数 / 易错点
- `--pod-network-cidr` 必须与 CNI 插件的 IP 池一致（如 Calico 默认 192.168.0.0/16），否则 Pod 拿不到 IP。
- Overlay 方案有封包开销（VXLAN 约 10~30% 性能损耗）；大流量场景用 BGP 直路更优。
- **Network Policy 不是所有 CNI 都支持**（Flannel 默认不支持，Calico/Cilium 支持）。
- MTU 设置不当会导致大包分片、偶发超时（Overlay 要留封包头空间）。

## 类比（帮助理解）
- 像墙壁**插座标准**（国标/美标）：电器（容器）只要按插座规格做插头，插上就有电；至于电怎么从发电厂来（Overlay/BGP），电器不用管。

## 设计时怎么用（反推思维）
> 选 CNI 时按"规模 + 是否需要网络策略 + 性能"权衡：需要 Pod 间微服务隔离就选支持 Network Policy 的（Calico/Cilium）；纯简单实验可用 Flannel。

## 典型应用 / 我在哪见过
- Flannel / Calico / Cilium / Weave 等都是 CNI 插件；kubelet 通过 `/etc/cni/net.d/` 加载配置并调用。

## 关联
- 前置知识：[[网络模型]]
- 相关：[[kubelet]] [[kube-proxy]] [[多租户]]
- 反例/误区：以为 kube-proxy 管 Pod 间通信（其实 CNI 管 Pod 直连，kube-proxy 只管 Service→Pod 转发）。

## 来源
- 本书第 7 章 网络原理（CNI 规范、IPAM、Overlay/BGP、网络模型）。
- CNI 规范官方文档（ADD/DEL/CHECK/VERSION、CNI Plugin 与 IPAM）。
