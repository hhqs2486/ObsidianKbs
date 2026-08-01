---
类型: 概念
主题: Ceph/对象存储
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Ceph RGW

## 一句话定义
> Ceph RGW（RADOS Gateway，守护进程名 `radosgw`）是构建在 [[RADOS]] 之上的对象存储网关，对外提供兼容 Amazon S3 与 OpenStack Swift 的 RESTful 接口，让应用用业界标准对象 API 读写 [[Ceph存储]] 集群。

## 它解决什么问题 / 为什么存在
- 应用想用对象存储（如 S3）但不想被公有云绑定，或需要在自建 [[Ceph集群]] 上提供对象接口。
- RGW 把 Ceph 底层的对象能力包装成通用 API：一套代码既能对接 AWS S3，也能对接 OpenStack Swift 生态。

## 核心原理（大二能懂的水平）
- `radosgw` 是一个基于 **libfcgi** 的 FastCGI 模块，作为 HTTP REST 网关与 Web 服务器（Apache/Nginx）配合；它本身调用 **librados** 与 [[RADOS]]（即 [[Ceph OSD]]）交互来存取对象。
- 提供两套兼容接口：
  - **S3**：兼容 AWS S3 大子集 —— List/Create/Delete Bucket、Put/Get/Delete/Copy Object、Multipart Upload、Object Versioning、Bucket/Object ACLs 等。
  - **Swift**：兼容 OpenStack Swift 大子集。
  - 二者**共用同一命名空间**，可用一个接口写、另一个接口读。
- RGW 有**自己的用户体系**（`radosgw-admin` 管理 Access Key/Secret Key），与 [[Ceph MON]] 的 cephx 集群认证是两套。
- 关键事实：**Ceph 对象网关不使用 [[CephFS]] 的元数据服务器（MDS）**——对象接口和文件接口走不同路径。

## 关键参数 / 易错点
- `rgw frontends` 配 fastcgi 的 socket 地址（如 `socket_port=9000`）；`[client.radosgw.gateway]` 段配 `keyring`、`log file`、`rgw socket path`。
- S3 认证用 Access Key/Secret Key，由 `radosgw-admin` 创建，与 cephx 用户是两套体系，**别混**。
- 功能子集不完全等于 AWS S3：Bucket Lifecycle / Bucket Policy / Bucket Website / Bucket Notification **不支持**，但 ACLs 支持；Multipart Upload 支持（缺 Copy Part）。
- 扩容靠多 zone / realm 联邦（异地同步）。

## 类比（帮助理解）
- RGW 是 Ceph 集群的「对外营业厅」：后端仓库是 [[RADOS]]（海量货架），营业厅按 S3/Swift 标准单据（API）受理存取；它和内部员工用的提货通道（librados）是两套门面。[[Ceph OSD]] 负责真正把货放上货架。

## 设计时怎么用（反推思维）
> 要自建兼容 S3 的对象存储（给应用/备份/对接 [[OpenStack]] Swift 生态）时，我会在 [[Ceph集群]] 前置一组 `radosgw` 节点，前端挂负载均衡，应用直接用 AWS SDK 即可，无需改代码。它是 [[Ceph存储]] 三大接口（对象/块/文件）中的「对象」那一款。

## 典型应用 / 我在哪见过
- 私有云对象存储、对接 OpenStack（Swift 接口）、作为 S3 兼容存储供大数据/备份使用。
- 与 [[对象存储]] 概念对应；和 [[RBD]]（块）、[[CephFS]]（文件）并列，三者共用同一 [[RADOS]] 底座。

## 关联
- 前置知识：[[RADOS]] [[Ceph OSD]] [[Ceph集群]]
- 相关：[[对象存储]] [[CephFS]] [[Ceph MON]] [[BlueStore]]
- 反例/误区：以为 RGW 走 MDS（其实不用 MDS）

## 来源
- 《ceph详细中文文档》ch85 CEPH 对象网关、ch92 S3 兼容 API、ch96 RADOSGW、ch99 体系结构，原文可引用。
