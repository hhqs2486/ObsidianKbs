---
类型: 概念
主题: Envoy
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Envoy

## 一句话定义
Envoy 是一个高性能的 L4/L7 边车（Sidecar）代理，也是 Istio / 大多数 Service Mesh 的数据平面"搬运工"——负责实际拦截、转发、改写、观测服务间流量。

## 它解决什么问题 / 为什么存在
需要一个"既快又能读懂 HTTP/gRPC 等应用层协议"的代理，来承载重试、超时、熔断、负载均衡、指标采集。传统 iptables / L4 代理看不懂应用层，做不了按路径/版本分流。

## 核心原理（大二能懂的水平）
- Envoy 以 Sidecar 形式跑在 Pod 里（见 [[Sidecar]]），通过 IPTables 透明拦截进出 Pod 的流量（不改动应用）。
- 它用"监听器（Listener）+ 路由（Route）+ 集群（Cluster/上游服务）+ 端点（Endpoint）"的管线处理请求。
- 配置由控制平面经 xDS API（LDS/RDS/CDS/EDS…）动态下发——这也是 [[Istio]] 指挥 Envoy 的方式。
- 支持 L4（TCP/UDP）和 L7（HTTP/gRPC）理解，能做按 Header/路径的精细路由、重试、熔断、mTLS。

## 关键参数 / 易错点
- Envoy 是"数据平面"，自己不做决策，全听控制平面下发的 xDS——离开控制平面（如 Istio）它只是个空代理。
- 热重启/动态配置是其强项；但配置错误（如路由环）会导致流量黑洞。
- 资源占用随连接数上升，要设合理连接池（见 Istio DestinationRule）。

## 类比（帮助理解）
像"楼里那个全能前台（见 [[Sidecar]] 类比）：能看懂快递单上的省市区（L7），决定走哪条线、要不要重试、记不记台账"——但它不自己定规矩，规矩来自总部（控制平面 xDS）。

## 设计时怎么用（反推思维）
> 做 Service Mesh 时，我理解 Envoy 就是"被注入到每个服务的代理进程"；调流量/安全时我实际是在配 Istio 的 CRD，再由 Istio 翻译成 xDS 下给 Envoy，不用直接手改 Envoy 配置。

## 典型应用 / 我在哪见过
- Istio 默认数据平面；也可独立作 API 网关/边缘代理；本书微服务治理层落到"Sidecar 代理"这一环即 Envoy 的角色。

## 关联
- 前置知识：[[Sidecar]] [[Service Mesh]] [[Istio]] [[东西向流量]]
- 相关：[[负载均衡]] [[南北向流量]] [[微服务架构]]
- 反例/误区：以为 Envoy 自己会"聪明路由"（它听 xDS，决策在控制平面）

## 来源
- 本书微服务架构实践延伸；结合 Envoy 通用知识（L4/L7 代理、xDS、Listener/Route/Cluster/Endpoint 管线）。本书 PDF 为图片扫描版，结合书名与章节结构整理。
