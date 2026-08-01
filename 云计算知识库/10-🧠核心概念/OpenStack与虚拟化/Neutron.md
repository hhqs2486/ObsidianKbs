---
类型: 组件参考
组件: Neutron
tags: [组件参考]
创建: 2026-07-21
状态: 待精读
---

# Neutron

## 基本信息
- 类别（编排/虚拟化/监控/网络/存储/CI）：网络
- 核心用途：OpenStack 的"网络服务"，负责虚拟二层/三层网络、租户隔离、路由、浮动 IP、安全组、DHCP。
- 官方文档链接：https://docs.openstack.org/neutron/rocky/

## 关键能力/参数（摘录）
| 维度 | 说明 | 备注 |
|------|------|------|
| 架构角色 | neutron-server + linuxbridge-agent + l3-agent + dhcp-agent + metadata-agent | 控制/网络节点与计算节点都装 agent |
| 数据模型 | 独立库 neutron | 本书 F 节 |
| 扩展性 | L2 用 linuxbridge + vxlan；L3 用 HA 路由器 | 本书用 linuxbridge 机制驱动 |
| 性能/规模 | 网络节点易成瓶颈 → 本书 l3_ha/dvr 提升可用 | `l3_ha=true`、`router_distributed` |

## 与其它组件的关系
- 依赖：[[Keystone]]、[[Nova]]（端口状态回写 nova）、[[MariaDB-Galera]]、消息队列
- 被依赖：[[Nova]] 实例联网、[[Horizon]]
- 替代/竞品：无（网络核心）；机制驱动可换 OVS（本书用 linuxbridge）

## 设计时必看的点
- 部署前提：装 `openstack-neutron openstack-neutron-ml2 openstack-neutron-linuxbridge`（full.txt F 节）。
- 配置要点：`core_plugin=ml2`、`service_plugins=router`、`allow_overlapping_ips=True`；`[ml2]` 里 `type_drivers=flat,vlan,vxlan`、`mechanism_drivers=linuxbridge,l2population`；linuxbridge_agent 把网络类型映射到物理网卡（`physical_interface_mappings = external:eth1,vlan:eth3`）。
- **L3 高可用**：`l3_ha=true` + `max_l3_agents_per_router=3` + `min_l3_agents_per_router=2`，用 VRRP 在多个 l3 agent 间漂移 router VIP；`router_distributed=true` 走 DVR（但 VRRP 与 DVR 不能同时开，本书选 VRRP）（full.txt F 节注释）。
- 常见坑：`net.bridge.bridge-nf-call-iptables=1` 内核参数要开；计算节点只配 `[neutron]` 段指向 VIP；`neutron-linuxbridge-agent` 状态须 `:-)` 才健康。

## 选型结论
> OpenStack 网络事实标准；要简单稳定选 linuxbridge + vxlan，要性能/复杂 overlay 选 OVS。多租户云必须开 `l3_ha` 避免网络节点单点。

## 关联
- 用到它的项目：[[20260721-OpenStackRocky高可用集群部署]]
- 同类替代：无（网络核心）
- 相关：[[Nova]] [[Keystone]] [[控制节点]] [[计算节点]] [[高可用HA]]

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 F（Neutron 控制/网络节点）、J（Neutron 计算节点）。
