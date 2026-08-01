---
类型: 概念
主题: Kubernetes控制平面入口
tags: [概念, Kubernetes, 控制平面, API]
创建: 2026-07-21
复习: 
状态: 种子
---

# APIServer

## 一句话定义
> kube-apiserver 是 Kubernetes 控制平面的"总前台"和"守门人"——所有组件和用户都通过它与 etcd 通信，所有请求都先过它。

## 它解决什么问题 / 为什么存在
- 集群需要一个**统一入口**做认证、鉴权、准入校验、数据校验，同时屏蔽 etcd 的内部细节、对上层提供稳定 API；APIServer 就是这道统一闸门。
- 没有它，每个组件都直连 etcd、各自实现安全逻辑，既不安全也无法演进。

## 核心原理（大二能懂的水平）
- 提供 **RESTful API**（HTTP + JSON / Protobuf）。`kubectl get pod` 本质是对 APIServer 发了一个 `GET /api/v1/namespaces/default/pods` 的 HTTP 请求。
- 请求处理流水线（写请求）：**认证 Authentication → 鉴权 Authorization（如 [[RBAC]]）→ 准入控制 Admission Control → 校验 → 写入 [[Etcd]]**；读请求则从 etcd/cache 返回。
- **List-Watch 机制**：各组件不是轮询，而是先 `List` 全量再 `Watch` 增量事件（ADDED/MODIFIED/DELETED/BOOKMARK）。这是所有控制器实现"最终一致"的基础。
- **内部版本转换（internal version）**：API 有 group/version（如 `apps/v1`），APIServer 在"存储版本 / 内部版本 / 请求版本"之间做转换，解耦 API 演进与底层存储。
- **高可用**：APIServer 本身无状态，可多实例并列，前面挂 [[负载均衡]]（VIP / 反向代理）。

## 关键参数 / 易错点
- `--etcd-servers` 指向 etcd；`--client-ca-file` / `--tls-cert-file` 负责 HTTPS 与身份认证。
- `--enable-admission-plugins` 决定开启哪些准入插件（如 `PodSecurity`、`ResourceQuota`、`MutatingAdmissionWebhook`）。
- 性能瓶颈常在序列化与 watch 推送；超大规模要调 `--max-requests-inflight` 等参数。
- kubeconfig 里缺少 `ca.crt` 或证书过期，会报 `x509: certificate signed by unknown authority`。
- 所有写操作都带 `resourceVersion` 做乐观锁，并发修改靠重试解决冲突。

## 类比（帮助理解）
- 像公司**前台 + 审批中心**：所有来访（请求）先登记身份（认证），再看有没有权限进对应房间（鉴权），然后过合规审查（准入），最后才写入档案室（etcd）；读档案则刷完身份直接给。

## 设计时怎么用（反推思维）
> 做"让外部系统操作 K8s"的需求（如自研运维平台）时，我不直连 etcd，而是调 APIServer 的 REST 接口或用 client-go，复用它的认证/鉴权/准入；想扩展 API 就走 [[CRD与Operator]] + API 聚合层。

## 典型应用 / 我在哪见过
- kubectl、所有内置控制器、调度器、client-go/各种 SDK 的统一入口；API 聚合层（aggregation layer）把扩展 API 挂载到同一端点。

## 关联
- 前置知识：[[RESTfulAPI]] [[Etcd]]
- 相关：[[RBAC]] [[准入控制]] [[安全与认证]] [[CRD与Operator]]
- 反例/误区：绕过 APIServer 直接改 etcd（破坏校验、版本、准入，状态会错乱）。

## 来源
- 本书第 5 章 核心组件的运行机制（APIServer 架构、List-Watch、版本转换）。
- 本书第 6 章 深入分析集群安全机制（认证、授权、准入在 APIServer 中的链路）。
