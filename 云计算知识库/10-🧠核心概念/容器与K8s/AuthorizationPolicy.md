---
类型: 概念卡
主题: 容器与K8s
tags: [Istio, 安全, 零信任, 服务网格]
创建: 2026-07-21
状态: 已消化
---

# AuthorizationPolicy（Istio 授权策略）

## 一句话定义
Istio 中定义「**谁可以访问哪个服务/接口**」的授权 CRD，是实现服务间**零信任**安全的核心对象。

## 它解决什么问题
- 微服务多了以后，服务间调用默认「裸奔」，没有鉴权
- 东西向流量（服务→服务）一旦被攻破，横向移动毫无阻挡

## 核心原理（大二能懂）
AuthorizationPolicy 由 **Envoy（Sidecar）** 在流量入口处**强制执行**：根据来源身份、目标服务、路径/方法，决定 allow 还是 deny。
- 身份基于 **SPIFFE** 证书（每个 workload 有身份，不是靠 IP）
- `action: ALLOW | DENY`，配合 `selector`（作用于哪些 workload）、`rules`（from/to/when 条件）
- 与 **PeerAuthentication**（管 mTLS 加密）配合：先加密（PeerAuth），再授权（AuthzPolicy）

## 关键参数 / 易错点
- **默认 deny 会直接断服务**——上线前务必先在 dry-run 或用 `ALLOW` 白名单验证
- `from` 用 `source.principal`（身份）而非 `ipBlocks`（IP 会变、不可靠）
- 规则匹配顺序：DENY 优先于 ALLOW
- 易错：以为配了 AuthzPolicy 就安全了，但没开 mTLS，身份可被伪造

## 一个生活类比
大楼门禁系统：PeerAuthentication 是「刷卡进门」（确认你是员工），AuthorizationPolicy 是「你这张卡只能进 3 楼研发区，不能进机房」。

## 设计时怎么用（反推思维）
- 从「这个服务该被谁调用」反推授权规则——最小权限原则
- 敏感服务（支付、用户库）设严格 DENY/ALLOW 白名单
- 多租户场景用 namespace + workload 维度隔离

## 典型应用
- 零信任服务网格
- 多租户 K8s 集群的租户间隔离
- 合规审计（谁访问了什么，Envoy 全记录）

## 关联
- [[Istio]]（它所属的框架）
- [[Envoy]]（真正执行策略的代理）
- [[Service Mesh]] [[服务网格]]（所属的技术范畴）
- [[Sidecar]]（策略挂载点）
- [[安全与认证]]（配合的认证层；mTLS 即双向 TLS 加密）
- [[Gateway]] [[VirtualService]] [[DestinationRule]]（同属 Istio 流量治理）

## 来源
Istio 1.6 官方文档中文版（见 [[21-服务网格Java与存储扩展]]）
