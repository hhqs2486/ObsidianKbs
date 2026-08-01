---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Service

## 一句话定义
> Service 是 K8s 里一组 Pod 的"稳定前台/虚拟入口"：它给后端 Pod 一个固定不变的 IP 和名字，自动做服务发现与负载均衡。

## 它解决什么问题 / 为什么存在
- Pod 的 IP 会随着重建而变，前台/其他服务没法稳定连它。
- 一组相同功能的 Pod 需要被当作"一个服务"来访问，并分摊流量。
- Service 用 [[Label与Selector]] 选中后端 Pod，解耦"调用方"和"具体哪个 Pod 实例"。

## 核心原理（大二能懂的水平）
- Service 有一个虚拟 IP（ClusterIP），本身不跑进程，靠 [[kube-proxy]] 在节点上写 iptables/ipvs 规则把流量转发到后端 Pod 的 Endpoints。
- 底层是：Service(稳定入口) → 通过 selector 找到 Pod → 流量被负载均衡到各个 Pod。
- 类型决定"谁能访问"：ClusterIP（仅集群内）、NodePort（每个节点开固定端口供外部访问）、LoadBalancer（接外部负载均衡器）。
- 配合 [[DNS与服务发现]]（CoreDNS），可用服务名代替 IP 访问。

## 关键参数 / 易错点
- `spec.selector`：标签选择器，选中的 Pod 才进后端；选错就空后端。
- `spec.type`：ClusterIP / NodePort / LoadBalancer（书里还提 ExternalName）。
- `port` vs `targetPort`：port 是 Service 自己的端口，targetPort 是 Pod 容器端口（第5章强调别搞混）。
- 易错：以为 Service IP 能 ping 通——它是虚拟 IP，只转发特定端口流量。
- 易错：NodePort 范围默认 30000-32767。

## 类比（帮助理解）
- Service 像"公司总机/前台"：你只记总机号(ClusterIP)，不用管今天哪个员工(Pod)值班；电话自动转给空闲员工(负载均衡)；员工换班(Pod 重建)也不影响你打总机。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 任何需要被别的服务或外部访问的 Pod，都要配一个 Service；集群内互访用 ClusterIP+服务名，外部访问用 NodePort/LoadBalancer，或进一步用 [[Ingress入门]] 做统一域名路由。

## 典型应用 / 我在哪见过
- 第5章 web-service / nginx-service-nodeport；第11章 mysql-service(NodePort 30006)、demo-service(NodePort)；第8章 tomcat-service(ClusterIP 10.254.12.13)。

## 关联
- 前置知识：[[Pod]] [[Label与Selector]] [[kube-proxy]]
- 相关：[[DNS与服务发现]] [[微服务]] [[负载均衡]] [[Ingress入门]] [[Namespace]] [[滚动更新与回滚]] [[网络模型]]
- 反例/误区：把 Service 当成"会跑业务的实体"（它只是转发规则）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第1章 1.2.5、第5章
