---
类型: 组件参考
组件: Nova
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Nova

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：计算（虚拟化）
- 核心用途：OpenStack 的"计算服务"，负责虚拟机的生命周期——创建、调度、开关机、迁移、console 访问。
- 官方文档链接：https://docs.openstack.org/nova/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | 拆成 nova-api / scheduler / conductor / compute / consoleauth / novncproxy 等多进程 | 控制节点跑除 compute 外全部，计算节点跑 nova-compute |
| 数据模型 | 独立库 nova / nova_api / nova_cell0 / placement | 本书 E 节建 4 个库 |
| 扩展性 | 计算节点横向加；cell 架构支持超大集群 | cell_v2 |
| 性能/规模 | 单集群数千节点；调度依赖 [[Placement]] | placement 在 Rocky 已独立 |

## 与其它组件的关系
- 依赖：[[Keystone]]（认证）、[[Glance]]（取镜像）、[[Neutron]]（挂网络）、[[Cinder]]（挂卷）、[[Placement]]（资源盘点）、消息队列、[[MariaDB-Galera]]
- 被依赖：[[Horizon]]、最终用户
- 替代/竞品：无直接替代（计算核心）；底层 hypervisor 可换（本书用 [[虚拟化KVM]]）

## 设计时必看的点
- 部署前提：控制节点装 `openstack-nova-api/conductor/scheduler/novncproxy/placement-api`；计算节点装 `openstack-nova-compute`（full.txt E、I 节）。
- 配置要点：`transport_url` 指向 3 节点 RabbitMQ；`[database]` 连 VIP；`[vnc] novncproxy_port=6080` 经 HAProxy 的 `nova_vncproxy_cluster` 暴露。
- 常见坑：计算节点 nova.conf **没有** `[database]`/`[placement_database]`（只连 RabbitMQ+API），否则连库不安全（full.txt I 节）；`[libvirt] virt_type=kvm` 必修；新计算节点要 `nova-manage cell_v2 discover_hosts`。
- 调度与资源：Placement API 记录每台计算节点的 CPU/内存/磁盘，调度器据此选宿主机。

## 选型结论
> OpenStack 计算面事实标准，配合 KVM 即可交付弹性虚拟机；要无状态秒级启停选 [[容器编排]]（其他 agent 负责）。本书把 Nova 控制服务全做成 Pacemaker clone 多活。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：无（IaaS 计算核心）
- 相关：[[Keystone]] [[Glance]] [[Neutron]] [[Cinder]] [[Placement]] [[虚拟化KVM]] [[计算节点]] [[控制节点]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 E（Nova 控制节点）、I（Nova 计算节点）、N（Nova 集成 Ceph / live migration）。
