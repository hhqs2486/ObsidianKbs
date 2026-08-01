---
类型: 概念卡
主题: 服务网格
tags: [容器, K8s, 服务网格, Istio, 网络]
创建: 2026-07-21
状态: 种子
---

# Gateway（南北向流量入口）

## 一句话定义
Service Mesh（如 Istio）里专门负责**集群南北向流量**（外部↔集群）的入口资源，定义「哪些端口、哪些域名、用啥协议」对外暴露。

## 它解决什么问题
K8s 原生的 Ingress 管南北向，但 Istio 想在自己的数据面（Envoy）里统一管出入口流量，就需要一个同生态的入口对象——这就是 Gateway：把「对外暴露哪块」和「流量进来后怎么走（VirtualService）」拆成两个资源，职责更清晰。

## 核心原理（大二能懂）
- Gateway 只**声明入口能力**（监听 80/443、绑定某个端口），不写路由规则。
- 真正的「请求 A 域名 → 服务 B」规则写在 [[VirtualService]] 里，VirtualService 通过 `gateways:` 字段挂到某个 Gateway 上。
- 类比：Gateway 像「商场大门 + 楼层指示牌」，VirtualService 像「每层店铺的导购图」。
- 东西向（服务↔服务）流量通常不需要 Gateway，直接走 [[Sidecar]]；只有外部进来的才过 Gateway。

## 关键参数 / 易错点
- `servers.port.number` + `servers.port.protocol`：声明监听端口与协议（HTTP/HTTPS/GRPC）。
- `servers.hosts`：该 Gateway 负责的域名（如 `*.example.com`），不是 IP。
- 易错：忘了在 VirtualService 里用 `gateways:` 关联 Gateway，流量进不来（VirtualService 默认只管网格内）。
- 与 K8s 原生 [[Ingress入门]] 区别：Ingress 是 K8s 标准对象、靠 Ingress Controller；Gateway 是 Istio CRD、走 Envoy 数据面。

## 一个生活类比
Gateway = 小区大门的「访客登记处」（决定谁能进、从哪个门进）；进门后去哪栋楼，由另一张「楼栋导览（VirtualService）」决定。

## 设计时怎么用（反推思维）
- 需求「让外部用户访问我的商城前端」→ 反推：需要 1 个 Gateway（暴露 443）+ 1 个 VirtualService（把域名路由到 frontend 服务）。
- 多团队共用集群 → 每个团队一个 Gateway + 独立域名，互不干扰。

## 典型应用
- Istio Ingress Gateway 对外暴露服务。
- 灰度发布：Gateway 入口不变，VirtualService 切流到不同版本 [[Deployment]]。

## 关联
- 上游/同族：[[Service Mesh]] [[Istio]] [[Envoy]] [[南北向流量]] [[Sidecar]]
- 替代/对比：[[Ingress入门]]（K8s 原生南北向入口）
- 配套：VirtualService、DestinationRule

## 来源
概念归属：容器SDN/微服务批次补充（本书书名为图片扫描版，结合 Istio 通用知识整理）。
