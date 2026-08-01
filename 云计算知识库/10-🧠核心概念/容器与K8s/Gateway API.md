---
类型: 概念
主题: 服务网格/入口路由
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Gateway API

## 一句话定义
> Gateway API 是 Kubernetes 原生的、面向角色的流量治理 API（一组 CRD，如 `Gateway` / `HTTPRoute` / `GRPCRoute` / `TCPRoute`），用来声明「谁负责网络入口、流量怎么路由」，把基础设施、平台运维、应用开发三种角色的职责解耦。

## 它解决什么问题 / 为什么存在
- 老的 [[Ingress入门]] 只能做简单的 `host/path → Service` 转发，表达力太弱（做不了按 header 分流、金丝雀、按权重切流）。
- 各厂商各自扩展导致 API 碎片化：[[Istio]] 有 [[Gateway]]（CRD 在 `networking.istio.io`）、Contour/Gloo 各有私有的入口 CRD，换实现就要改配置。
- Gateway API 用一套标准化、可移植、支持 L4–L7 与流量切分的 CRD 统一了「入口 + 路由」，并且原生支持多租户、跨命名空间引用。

## 核心原理（大二能懂的水平）
- 三个核心资源各管一摊：
  1. **GatewayClass**：由基础设施/厂商提供，定义「一类网关的实现」（类比 `StorageClass`）。比如集群里声明一个 `istio` 类型的 GatewayClass。
  2. **Gateway**：由平台/网络团队拥有，描述「在哪些监听器上监听什么端口/协议/TLS」——它只开「门」，不写「门里怎么走」。
  3. **路由资源 `HTTPRoute` / `GRPCRoute` / `TCPRoute`**：由应用开发团队拥有，把流量从 Gateway 绑定的监听器路由到后端 [[Kubernetes]] `Service`；通过 `parentRefs` 关联到某个 Gateway。
- **职责分离**是精髓：基础设施团队管 GatewayClass（选型），平台团队开 Gateway（开门口），应用团队写 Route（指路）。路由可声明按 header、按权重做金丝雀/AB，支持跨命名空间引用（需 `ReferenceGrant`）。
- 真正实现这套声明的是「具体控制器」（Istio / Contour / Nginx 等），它们 watch 这些 CRD 并把规则落到数据面。

## 关键参数 / 易错点
- Gateway 的 `spec.listeners` 定义 `port` / `protocol` / `hostname`；路由用 `parentRefs` 指向目标 Gateway（不是 Ingress 那种隐式绑定）。
- **名字陷阱**：Gateway API 里的 `Gateway` 和 [[Istio]] 的 `Gateway` 都叫 Gateway，但 API group 不同（`gateway.networking.k8s.io` vs `networking.istio.io`），归属也不同——这正是要单建「Gateway API」这张卡来区分的原因。
- Gateway API 资源属于 `gateway.networking.k8s.io` 这个 API group，需要集群先安装 CRD + 一个实现了它的控制器才生效。

## 类比（帮助理解）
- 大酒店模型：GatewayClass = 「万豪集团的建店标准」；Gateway = 「这家万豪酒店的前台（开哪些门、走什么通道、要不要验 TLS）」；HTTPRoute = 「宴会厅指示牌（VIP 走左边、散客走右边、20% 去新品试吃）」。前台和指示牌由不同部门管理，互不越界。

## 设计时怎么用（反推思维）
> 做多团队共享集群、需要按业务做金丝雀/AB、且不想被某个厂商绑死时，我会用 Gateway API 描述入口与路由，而不是手写厂商私有 CRD。顺序是：先定 GatewayClass（选型）→ 平台团队开 Gateway（开端口/TLS）→ 业务团队写 HTTPRoute（按权重/header 指路）。

## 典型应用 / 我在哪见过
- [[Istio]] 从 1.6 起支持用 Gateway API 取代部分 [[VirtualService]] / [[Gateway]] 的南北向路由（文档「概念」章已出现 `HTTPRoute` 路由资源）。
- GAMMA 子项目正把 Gateway API 扩展到 [[Service Mesh]] 的「东西向流量」，让网格内路由也能用同一套 API。

## 关联
- 前置知识：[[Kubernetes]] [[Ingress入门]]
- 相关：[[Gateway]]（Istio 网关，注意区分）[[VirtualService]] [[Service Mesh]]
- 反例/误区：把 Gateway API 的 `Gateway` 和 Istio 的 `Gateway` 当成同一个东西

## 来源
- Kubernetes 官方 Gateway API 文档（sig-network）；Istio 1.6 官方文档中文版「概念」章提到 `HTTPRoute` 等路由资源（ch02_概念.txt:297）。
- 注：官方 Gateway API 文档为图片/结构型资料，本卡结合章节结构与公开知识补全。
