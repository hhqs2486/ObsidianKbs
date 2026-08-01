---
类型: 概念卡
主题: 服务网格
tags: [容器, K8s, 服务网格, Istio, 流量治理]
创建: 2026-07-21
状态: 种子
---

# VirtualService（流量路由规则）

## 一句话定义
Istio 里定义「请求怎么走」的核心路由资源：把某个主机/域名的流量，按规则分流到后端 [[Service]] 的不同版本或不同服务。

## 它解决什么问题
[[Service Mesh]] 要把「服务发现 + 路由 + 灰度 + 熔断」从应用代码里抽出来。VirtualService 就是这套路由逻辑的声明处——不改业务代码就能做按比例灰度、按 header 路由、超时/重试。

## 核心原理（大二能懂）
- VirtualService 通过 `hosts:` 指定它管哪个服务（如 `reviews.default.svc.cluster.local`），通过 `gateways:` 决定挂到哪个 [[Gateway]]（对外）还是网格内（对内）。
- `http:` 路由里写 `route:` → `destination.host/subnet`，可加 `weight` 做灰度（v1 90% / v2 10%）。
- 类比：VirtualService 像「电话总机的转接规则表」——拨某个号（host），按规则转给不同分机（版本）。

## 关键参数 / 易错点
- `weight` 之和必须为 100，否则报错。
- 灰度要配合 [[DestinationRule]] 定义 `subsets`（版本子集），否则 VirtualService 不知道 v2 是啥。
- 易错：忘记 `gateways:` 关联，外部流量进不来（默认只生效于网格内服务间）。
- 与 K8s [[Service]] 区别：Service 只做「负载均衡到一组 Pod」；VirtualService 做「按内容智能路由 + 治理策略」。

## 一个生活类比
VirtualService = 打车 App 的「派单策略」：同一起点（host），按策略把单派给不同司机（版本），还能 90% 派老司机、10% 派新人练手（灰度）。

## 设计时怎么用（反推思维）
- 需求「新版本先放 10% 流量观察」→ 反推：VirtualService 里给 v2 设 weight:10 + DestinationRule 定义 v2 subset。
- 需求「把 /api/v2 路由到新服务」→ 反推：match uri prefix + route 到目标服务。

## 典型应用
- 金丝雀/蓝绿发布、A/B 测试、故障注入、重试超时。

## 关联
- 同族：[[Service Mesh]] [[Istio]] [[Envoy]] [[Gateway]] [[DestinationRule]] [[Sidecar]]
- 上游概念：[[东西向流量]] [[微服务]]

## 来源
概念归属：容器SDN/微服务批次补充（Service Mesh 通用知识整理）。
