---
类型: 组件参考
组件: Swift
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Swift

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：存储（对象存储）
- 核心用途：OpenStack 的"对象存储服务"，提供海量、无结构、通过 HTTP 访问的键值存储（bucket/object），类似 AWS S3。适合存图片、备份、日志、冷数据。
- 官方文档链接：https://docs.openstack.org/swift/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | proxy-server + account/container/object-server + ring | 去中心、可跨地域 |
| 数据模型 | 对象 + 元数据，无传统库 | 用自有的 ring 映射 |
| 扩展性 | 加节点即可扩容，最终一致 | 多副本/纠删码 |
| 性能/规模 | EB 级容量，吞吐随节点线性 | 不适合做数据库/块设备 |

## 与其它组件的关系
- 依赖：自身存储 + 认证（[[Keystone]]）
- 被依赖：需存对象的业务、Glance(可选把镜像放 Swift)、Cinder 备份
- 替代/竞品：[[Ceph存储]] 的 RGW（S3 兼容）、MinIO、AWS S3

## 设计时必看的点
- 部署前提：本书**未实际部署 Swift**（原文开头部只把 Swift 列为 OpenStack 全家桶之一；存储实做走 [[Ceph存储]] 的 rbd，见 L–N 节）。
- 配置要点（通用）：`proxy-server.conf` 配 `authtoken` 指 Keystone；用 `swift-ring-builder` 建 ring 决定数据分布；副本数由 `replicas` 决定。
- 常见坑：ring 重建要重新平衡(rebalance)并分发；对象存储是最终一致，写后立读需读自己写的副本。

## 选型结论
> 要"海量、廉价、HTTP 访问、不常改"的对象数据 → Swift（或 Ceph RGW）。要"可挂载、随机读写、当硬盘用" → [[Cinder]]。本书场景用 Ceph 统一后端，未单独上 Swift。

## 关联
- 用到它的项目：（本书未部署）[[20260721-OpenStackRocky高可用集群部署]] 仅将其列为全家桶
- 同类替代：[[Ceph存储]] RGW、MinIO、AWS S3
- 相关：[[Glance]] [[Cinder]] [[Keystone]] [[Ceph存储]]

## 来源
- 组件能力与定位为 OpenStack 通用知识（Swift 属 OpenStack 核心服务之一）。
- 本书《OpenStack-Rocky高可用集群部署》full.txt 仅将 Swift 列入 OpenStack 组件范畴，实际存储后端以 Ceph（L–N 节）实现，未单独部署 Swift。
