---
类型: 组件参考
组件: Glance
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Glance

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：存储（镜像）
- 核心用途：OpenStack 的"镜像服务"，负责虚拟机镜像（qcow2/raw/…）的注册、存储、分发；[[Nova]] 启动实例时从 Glance 取镜像。
- 官方文档链接：https://docs.openstack.org/glance/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | glance-api（对外）+ glance-registry（元数据，Rocky 起已弱化） | 本书 D 节两服务都装 |
| 数据模型 | 独立库 glance | 本书 D 节 |
| 扩展性 | 后端 store 可插拔（file/rbd/http…） | 本书先用 file，后改 rbd |
| 性能/规模 | 镜像大，放 [[Ceph存储]] 便于多节点共享 | `default_store=rbd` |

## 与其它组件的关系
- 依赖：[[Keystone]]（认证）、[[MariaDB-Galera]]（元数据）、后端存储（file 或 [[Ceph存储]]）
- 被依赖：[[Nova]]（建实例）、[[Cinder]]（从镜像建卷）、[[Horizon]]
- 替代/竞品：无（镜像核心）；容器镜像仓库(如 Harbor)不属 OpenStack 范畴

## 设计时必看的点
- 部署前提：装 `openstack-glance python-glance`（full.txt D 节）；在 Keystone 建 glance 用户+service+3 个 endpoint，URL 用 `http://controller:9292`。
- 配置要点：`[glance_store] stores=file,http`、`default_store=file`、`filesystem_store_datadir=/var/lib/glance/images`；`[database]`/`[keystone_authtoken]` 连 VIP。
- **Ceph 后端集成**：改 `[glance_store] stores=rbd`、`default_store=rbd`、`rbd_store_pool=images`、`rbd_store_user=glance`，并 `show_image_direct_url=true`（full.txt M 节）；镜像实际落在 Ceph images 池（`rbd ls images` 可查）。
- 常见坑：Ceph images 池建好后要 `ceph osd pool application enable images rbd`，否则集群 HEALTH_WARN（full.txt M 节）。

## 选型结论
> 虚拟机镜像统一管理就靠 Glance；镜像量大、要跨节点共享、配合 Cinder/Nova 热迁移 → 后端用 [[Ceph存储]]（本书做法）。小环境本地 file 存储也行。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：无（镜像核心）
- 相关：[[Nova]] [[Cinder]] [[Ceph存储]] [[Keystone]] [[控制节点]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 D（Glance 控制节点）、M（Glance 集成 Ceph）。
