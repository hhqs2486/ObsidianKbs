---
类型: 组件参考
组件: Cinder
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Cinder

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：存储（块存储）
- 核心用途：OpenStack 的"块存储服务"，给虚拟机提供可挂载的云硬盘（volume），支持创建、快照、扩容、备份、从镜像建卷。
- 官方文档链接：https://docs.openstack.org/cinder/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | cinder-api / cinder-scheduler / cinder-volume | api+scheduler 多活；volume 接具体后端 |
| 数据模型 | 独立库 cinder | 本书 H 节 |
| 扩展性 | 后端可插拔（LVM/iSCSI/Ceph/NetApp…） | `enabled_backends` |
| 性能/规模 | 后端决定；本书用 [[Ceph存储]] 多副本 | `volume_backend_name=ceph` |

## 与其它组件的关系
- 依赖：[[Keystone]]、[[Nova]]（挂载卷）、[[Glance]]（从镜像建卷）、消息队列、[[MariaDB-Galera]]
- 被依赖：[[Nova]] 实例、[[Horizon]]
- 替代/竞选：与 [[Swift]]（对象存储）互补；裸 LVM 是单节点替代

## 设计时必看的点
- 部署前提：控制节点装 `openstack-cinder` 跑 api/scheduler；存储节点装 `openstack-cinder-volume targetcli`，配 `enabled_backends=ceph`（full.txt H、K 节）。
- 配置要点：`transport_url` 指 3 节点 RabbitMQ；`glance_api_servers=http://controller:9292`；`[keystone_authtoken]` 连 VIP。
- **Ceph 后端集成**：`[ceph]` 段 `volume_driver=cinder.volume.drivers.rbd.RBDDriver`、`rbd_pool=volumes`、`rbd_user=cinder`、`rbd_secret_uuid=<与 libvirt 一致>`（full.txt "Cinder 集成 Ceph"）。须 `cinder type-create ceph` + `cinder type-key ceph set volume_backend_name=ceph` 才能选中后端。
- 常见坑：不接 Ceph 时 `cinder-volume` 状态是 down（full.txt K 节验证）；多后端必须建 volume type 区分。

## 选型结论
> 要"可挂载、可持久、像物理硬盘"的存储 → Cinder。要"海量非结构化文件/对象" → [[Swift]]。要统一后端与热迁移 → 后端用 [[Ceph存储]]（本书做法）。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：裸 LVM、企业存储阵列驱动
- 相关：[[Nova]] [[Glance]] [[Swift]] [[Ceph存储]] [[Keystone]] [[控制节点]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 H（Cinder 控制节点）、K（Cinder 存储节点）、"Cinder 集成 Ceph"/N（建 volume type、生成 ceph 卷）。
