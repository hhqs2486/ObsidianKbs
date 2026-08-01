---
类型: 概念
主题: 
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Route

## 一句话定义
> Route 是 [[OpenShift]] 自己的"流量入口"资源：把一个域名绑定到某个 [[Service]]，由集群内置的 Router（定制 HAProxy）把外部请求转发到对应 Pod。它相当于 OpenShift 世界里的 Ingress。

## 它解决什么问题 / 为什么存在
- [[Service]] 的 IP 只在集群内部可见，外部用户访问不到。[[Kubernetes]] 原生用 [[Ingress入门]] + Ingress Controller 解决；OpenShift 则用一等公民 Route + Router 解决，配置更贴合企业场景（第3章 3.2.6）。

## 核心原理（大二能懂的水平）
- 用户创建 Route 对象，绑定域名 + 关联 Service；Router 组件加载 Route 规则。外部请求打到 Router 所在节点的 80/443，Router 按域名转发到后端 Service 关联的 Pod（第3章）。
- Router 是一个跑在容器里的定制 HAProxy，且用 Host 网络模式监听计算节点端口（第10章）；当 Pod 数量/状态变化时，OpenShift 自动更新 Router 配置，保证请求总落到正确 Pod。
- 一个对外、一个对内：Router 负责"集群外 → 集群内"，Service 负责"集群内 → Pod"。两者分工不同（第3章 易错点）。

## 关键参数 / 易错点
- 易错：混淆 Router 和 Service——Router 对外、Service 对内（第3章）。
- Route 可配 TLS Termination（edge / passthrough / reencrypt）、path、weight（灰度/分流）。
- 默认域名形如 `<app>.<project>.router.default.svc.cluster.local`，可改成 `myapp.apps.example.com`（第5章）。
- `oc get route` 查看；Route 与 Service、Deployment Config 都是 Template 里可参数化的对象（第14章）。

## 类比（帮助理解）
- Route 像公司的"前台/总机"：外部打电话（请求）先到总机（Router），总机按分机号（域名）转给对应部门（Service → Pod）。

## 设计时怎么用（反推思维）
> 做"给每个业务应用自动发对外域名"的平台时，我会给每个应用建 Route 并绑定 `*.apps.example.com` 通配域名，由 Router 统一做 TLS 终止和分流，而不让每个应用自己暴露端口。

## 典型应用 / 我在哪见过
- OpenShift 所有对外暴露的 Web 应用都走 Route；多租户下不同项目的 Route 域名天然隔离。
- 对比：原生 K8s 用 [[Ingress入门]] + Nginx/HAProxy Ingress Controller；OpenShift 3.x 用 Route，4.x 也兼容原生 Ingress。

## 关联
- 前置知识：[[Service]] [[Kubernetes]] [[负载均衡]]
- 相关：[[OpenShift]] [[Ingress入门]] [[Source-to-Image]] [[多租户]] [[网络模型]]
- 反例/误区：[[Ingress入门]]（原生入口，Route 是其 OpenShift 对等物）

## 来源
- 开源容器云 OpenShift（第3章 3.2.6 Router 与 Route；第5章 5.2.4 服务连通 Service 与 Route；第10章 10.1.1 Router 主机网络模式）。
