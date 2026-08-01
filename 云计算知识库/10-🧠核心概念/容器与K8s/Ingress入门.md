---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Ingress入门

## 一句话定义
> Ingress 是 K8s 里"统一对外暴露 HTTP/HTTPS 服务"的入口规则：用域名和路径把外部请求路由到集群内的不同 Service，相当于集群的"反向代理/网关"。

## 它解决什么问题 / 为什么存在
- [[Service]] 的 NodePort 每个服务占一个高端口、LoadBalancer 每个服务要一个外部 IP，服务多了难管理、成本高。
- 想要"一个域名按路径/子域名分流到多个服务"（如 a.com/api → 服务A，a.com/web → 服务B），需要七层路由。
- Ingress 提供这种"域名+路径 → Service"的七层路由，且常附带 TLS、重写等能力。

## 核心原理（大二能懂的水平）
- Ingress 只是"规则声明"（YAML），真正干活的是 Ingress Controller（如 nginx-ingress、Traefik），它运行在集群里、监听 Ingress 规则并配置底层代理。
- 流程：外部请求 → Ingress Controller（监听 80/443）→ 按 Ingress 规则匹配 host/path → 转发到对应 Service → Service 再负载到 Pod。
- 书里第5章只讲到 ClusterIP/NodePort/LoadBalancer 三种 Service；Ingress 是这三种之外的"更优对外方案"，是社区标准做法。

## 关键参数 / 易错点
- `spec.rules[].host`：域名；`http.paths[].path`：路径；`backend.service.name/port`：转到的 Service。
- `tls`：配置 HTTPS 证书。
- 易错：只建 Ingress 资源没装 Ingress Controller → 规则不生效。
- 易错：把 Ingress 当成 Service 本身（它只是路由规则，后端必须还是 Service）。
- 易错：NodePort/LoadBalancer 是四层（IP+端口），Ingress 是七层（域名+路径），关注点不同。

## 类比（帮助理解）
- Ingress 像"公司前台的总分机+导航"：访客报"找 api 部门/找 web 部门"(域名+路径)，前台(Controller)按登记表(Ingress 规则)把人领到对应办公室(Service)；而 NodePort 像是给每个办公室单独开一扇外门，门太多就乱。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 对外提供多个 Web 服务时，优先一个 Ingress 域名 + 多路径/子域名路由到各 Service，而不是给每个服务开 NodePort；需要 HTTPS 就在 Ingress 上统一挂证书。

## 典型应用 / 我在哪见过
- 本书第5章只覆盖 ClusterIP/NodePort/LoadBalancer，未专讲 Ingress；本卡结合 Kubernetes 通用知识整理，作为 Service 对外暴露的进阶方案。可与 [[Service]] [[负载均衡]] [[DNS与服务发现]] 联动。

## 关联
- 前置知识：[[Service]] [[Pod]] [[负载均衡]]
- 相关：[[Namespace]] [[DNS与服务发现]] [[网络模型]] [[云原生]]
- 反例/误区：以为建了 Ingress 对象就能通（还需 Ingress Controller）

## 来源
- 本书第5章仅覆盖 ClusterIP/NodePort/LoadBalancer；Ingress 部分结合 Kubernetes 通用知识整理（本书未专设 Ingress 章节）
