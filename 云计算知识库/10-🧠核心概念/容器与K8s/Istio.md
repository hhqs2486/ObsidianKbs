---
类型: 概念
主题: Istio
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Istio

## 一句话定义
Istio 是当下最主流的 Service Mesh 实现——它用 [[Envoy]] 作数据平面 Sidecar，用 istiod 作控制平面，提供流量管理、安全（mTLS）和可观测三大能力，对业务代码零侵入。

## 它解决什么问题 / 为什么存在
在 [[微服务架构]] 里，如何不改一行业务代码就实现灰度发布、按版本分流、服务间加密、统一指标/追踪？Istio 用声明式 CRD（VirtualService / DestinationRule / Gateway 等）把这些都配置化。

## 核心原理（大二能懂的水平）
- 数据平面：每个 Pod 注入 [[Envoy]] Sidecar，拦截进出流量做转发/策略/采集。
- 控制平面 istiod：把用户的流量规则、安全策略编译成 Envoy 能懂的配置，经 xDS 下发给所有 Sidecar；同时签发/轮转 mTLS 证书。
- 关键 CRD：
  - VirtualService：定义"请求怎么路由"（按路径/版本/权重分流，实现灰度）。
  - DestinationRule：定义"目标服务的子集/负载策略/连接池"。
  - Gateway：管理 [[南北向流量]] 的入口/出口（对接 [[Ingress入门]] 思路）。
- 注入：给 Namespace 打标签 `istio-injection=enabled`，新建 Pod 自动加 Sidecar；也可手动注入。

## 关键参数 / 易错点
- Sidecar 注入是"新建 Pod 才生效"，已有 Pod 要重启才会加 Sidecar。
- mTLS 默认是"宽容模式"（Permissive，同时接受明文和加密），要强制加密需显式设 PeerAuthentication。
- VirtualService 的路由匹配顺序敏感，写错优先级会路由错。
- Mesh 增加延迟与运维面，小项目未必划算。

## 类比（帮助理解）
像"快递总部调度系统（istiod）+ 每栋楼的专业前台（Envoy）"：你（开发者）只填一张派单表（VirtualService），总部把指令下发给各前台，前台自动分流/验货/记账。

## 设计时怎么用（反推思维）
> 做需要"按版本灰度、服务间强制 mTLS、全链路指标/追踪"的微服务系统时，我会上 Istio，用 VirtualService/DestinationRule 声明流量，用 PeerAuthentication 开 mTLS，业务代码完全不动。

## 典型应用 / 我在哪见过
- 多集群服务治理、金丝雀发布、零信任网络；与 [[Kubernetes]] + [[Calico]] 组合形成"网络连通 + 服务治理"双层。

## 关联
- 前置知识：[[Service Mesh]] [[Envoy]] [[Sidecar]] [[微服务架构]] [[东西向流量]] [[南北向流量]]
- 相关：[[Kubernetes]] [[Ingress入门]] [[负载均衡]] [[云原生]] [[微服务]]
- 反例/误区：把 Istio Gateway 当唯一入口（它管网格南北向，传统 [[Ingress入门]] 仍可在外层）

## 来源
- 本书微服务架构实践延伸；结合 Istio 通用知识（istiod 控制平面、Envoy 数据平面、Sidecar 注入、VirtualService/DestinationRule/Gateway）。本书 PDF 为图片扫描版，结合书名与章节结构整理。
