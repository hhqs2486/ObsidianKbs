---
类型: 概念卡
主题: 服务网格
tags: [容器, K8s, 服务网格, Istio, 流量治理]
创建: 2026-07-21
状态: 种子
---

# DestinationRule（流量目标策略）

## 一句话定义
Istio 里定义「后端服务长什么样、怎么挑 Pod」的策略资源：给某个服务定义版本子集（subsets）、负载均衡、熔断、TLS 等「目标侧」规则。

## 它解决什么问题
[[VirtualService]] 负责「流量怎么路由」，但它要路由到哪个「版本」需要有人先声明——DestinationRule 就是那个声明：把 `reviews` 服务拆成 `v1/v2/v3` 子集，并设置连接池、 outlier 熔断、mTLS。没有它，灰度路由无从挂版本。

## 核心原理（大二能懂）
- `host:` 指定作用的服务（如 `reviews.default.svc.cluster.local`）。
- `subsets:` 定义版本标签集合，如 `{name: v2, labels: {version: v2}}`——VirtualService 的 `weight` 就指向这些子集。
- `trafficPolicy:` 配负载均衡（ROUND_ROBIN/least-request）、连接池、熔断（consecutiveErrors）。
- 类比：VirtualService 是「导航把车引到某品牌4S店」，DestinationRule 是「这家店有几个车间（子集）、每个车间接几辆车（连接池）、坏车怎么踢出（熔断）」。

## 关键参数 / 易错点
- 灰度前必须先有 DestinationRule 定义 subset，否则 VirtualService 引用 subset 报错。
- `outlierDetection` 是熔断核心：连续 5 次 5xx 就把该 Pod 踢出负载池一段时间。
- 与 [[Service]] 区别：K8s Service 只选 Pod（按 selector），DestinationRule 还能定义「怎么对待这些 Pod」的策略。

## 一个生活类比
DestinationRule = 餐厅后厨的「出餐规则」：哪几个档口（子集）、每个档口一次接几单（连接池）、连续出错的档口先停单（熔断）。

## 设计时怎么用（反推思维）
- 需求「v2 灰度 + 错误自动隔离」→ 反推：DestinationRule 定义 v1/v2 子集 + outlierDetection；VirtualService 给 v2 设 weight。
- 需求「服务间强制 mTLS」→ 反推：DestinationRule `trafficPolicy.tls.mode: ISTIO_MUTUAL`。

## 典型应用
- 灰度发布的版本子集定义、连接池限流、熔断、服务间 mTLS。

## 关联
- 同族：[[Service Mesh]] [[Istio]] [[Envoy]] [[VirtualService]] [[Gateway]] [[Sidecar]]
- 上游：[[东西向流量]] [[微服务]]

## 来源
概念归属：容器SDN/微服务批次补充（Service Mesh 通用知识整理）。
