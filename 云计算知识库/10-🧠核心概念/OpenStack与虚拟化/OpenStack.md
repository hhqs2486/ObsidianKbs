---
类型: 组件参考
组件: OpenStack
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# OpenStack

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：IaaS 云计算管理平台（虚拟化/网络/存储综合）
- 核心用途：把一堆物理服务器的计算、网络、存储资源池化，按需通过 API/Dashboard 交付虚拟机及其周边资源。
- 官方文档链接：https://docs.openstack.org/install-guide/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 一组松耦合、可独立部署的微服务 | 不是单体软件，是"组件全家桶" |
| 数据模型 | 每个服务独立数据库（keystone/glance/nova/neutron/cinder…） | 共用 [[MariaDB-Galera]] |
| 扩展性 | 控制节点多活 + 计算节点横向扩容 | 见 [[控制节点]] [[计算节点]] |
| 性能/规模 | 生产可达数千计算节点 | 依赖消息队列(RabbitMQ)、数据库集群 |

## 与其它组件的关系
- 依赖：[[Keystone]]（认证）、[[Nova]]（计算）、[[Neutron]]（网络）、[[Glance]]（镜像）、[[Cinder]]（块存储）、[[Horizon]]（界面）、[[Swift]]（对象存储）
- 被依赖：上层业务系统、运维平台、CMDB
- 替代/竞品：AWS EC2/私有云、VMware vSphere

## 设计时必看的点
- 部署前提：时间同步（chrony）、`/etc/hosts` 解析一致、消息队列、数据库集群（本书步骤 A、B）。
- 配置要点：所有服务 `[database]`/`[keystone_authtoken]` 的连接地址写 **VIP 主机名 `controller`**，不是具体节点 IP——这是 [[高可用HA]] 的关键（full.txt C–H 节反复出现）。
- 常见坑：各节点 hosts 必须一致；token 用 Memcached 缓存需列全 3 节点；Keystone 的 fernet/credential 密钥要 `scp` 同步到各控制节点（full.txt C 节）。

## 选型结论
> 需要完全掌控底层、做私有云/政务内网/信创环境 → 选 OpenStack。纯弹性、不想运维底座 → 直接用公有云。高可用部署务必按本书"3 控制节点 + VIP + 集群底座"的套路。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：VMware vSphere、AWS EC2
- 相关：[[高可用HA]] [[控制节点]] [[计算节点]] [[Ceph存储]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 A–N（基础环境到 Ceph 集成全流程）。
- https://docs.openstack.org/install-guide/
