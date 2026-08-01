---
类型: 概念
主题: RESTfulAPI
tags: [概念, REST, API, Web]
创建: 2026-07-21
复习: 
状态: 种子
---

# RESTfulAPI

## 一句话定义
> RESTful API 是"用 HTTP 的 GET/POST/PUT/DELETE 等方法和 URL 资源路径来增删改查资源"的接口风格；Kubernetes 的 APIServer 就是一个大型 RESTful API。

## 它解决什么问题 / 为什么存在
- 分布式系统需要一套统一、无状态、可缓存、易扩展的通信约定；REST 用 HTTP 语义把"操作"标准化，前后端/工具链都能轻松对接。

## 核心原理（大二能懂的水平）
- 资源用 URL 表示：`/api/v1/namespaces/{ns}/pods/{name}`；方法对应动作：GET 读、POST 建、PUT 整体改、PATCH 局部改、DELETE 删。
- **无状态**：每个请求自带全部上下文（认证 token 在 Header），服务端不保存会话——便于横向扩展（见 [[APIServer]] 高可用）。
- 表示层用 JSON（也支持 Protobuf）。
- K8s 的 API 分层：core（`/api/v1`）、named groups（`/apis/apps/v1`），用 group/version 做版本演进（见 [[APIServer]] 内部版本转换）。
- 客户端（kubectl、client-go）本质都是 REST 调用；你也能用 `curl --cacert` + 证书直接调。

## 关键参数 / 易错点
- URL 大小写/复数敏感：`/pods` 不是 `/pod`；资源名用复数。
- 认证在 Header（`Authorization: Bearer <token>`）或客户端证书（mTLS）。
- PATCH 有不同策略（merge/strategic/apply）；用错会改错字段。
- 无状态意味着服务端不记"上一页"，分页用 `continue` token。

## 类比（帮助理解）
- 像图书馆的"索书号 + 借还规则"：每本书（资源）有固定编号（URL），借/还/查/删对应标准动作（HTTP 方法），管理员（服务端）不记得你是谁，每次都看你证件（无状态）。

## 设计时怎么用（反推思维）
> 做"要对外暴露系统能力"的需求时，我用 REST 风格设计资源 URL + 标准方法，客户端用统一方式调用；对接 K8s 时直接调其 REST 接口而非改源码。

## 典型应用 / 我在哪见过
- K8s APIServer、各大云服务 API、Web 后端。

## 关联
- 前置知识：[[APIServer]]
- 相关：[[声明式API]] [[容器编排]]
- 反例/误区：把 REST 当 RPC 用（每个动作一个自定义 URL，失去统一语义与可缓存性）。

## 来源
- 本书第 5 章 核心组件的运行机制（APIServer 的 RESTful 接口与版本转换）。
- REST 架构风格（Fielding 论文；HTTP 语义）。
