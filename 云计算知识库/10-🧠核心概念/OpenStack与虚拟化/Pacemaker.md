---
类型: 概念
主题: Pacemaker
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Pacemaker

## 一句话定义
> Pacemaker 是 Linux 上最常用的集群资源管理器（CRM）：它决定"哪个资源(VIP/服务)跑在哪台节点、挂了怎么抢回、资源间谁先谁后"，和 Corosync 配合构成完整高可用栈。

## 它解决什么问题 / 为什么存在
- 光有 VIP（[[Keepalived]] 思路）不够：OpenStack 有几十个 systemd 服务，得有人统一管它们的启动、故障重启、约束关系。Pacemaker 就是"集群里的大管家"。
- 本书用它把 VIP 和 HAProxy、以及所有 OpenStack 服务纳入集群，做到任意控制节点故障时自动接管。

## 核心原理（大二能懂的水平）
- **Corosync（底层消息层）**：负责节点间心跳、成员关系、仲裁(quorum)，相当于"投票系统"。
- **Pacemaker（上层 CRM）**：通过资源代理(RA)管理资源。RA 有 ocf/systemd/lsb 等类型——OpenStack 服务多用 `systemd:xxx`。
- **资源约束**：
  - order：先起 vip 再起 lb-haproxy（`pcs constraint order start vip then lb-haproxy-clone`）。
  - colocation：把 haproxy 绑在拥有 vip 的节点（`pcs constraint colocation add lb-haproxy-clone with vip`），避免 haproxy 在没 VIP 的节点空跑（full.txt B7 节）。
- **clone 资源**：`--clone interleave=true` 让服务在每台控制节点都起一份（多活），如 `openstack-keystone`、`openstack-nova-api` 等。

## 关键参数 / 易错点
- 集群属性：`stonith-enabled=false`（本书测试关了 fencing，**生产必须开**，否则 [[脑裂]] 时两节点抢资源会损坏数据）、`no-quorum-policy=ignore`（3 节点可接受，2 节点危险）。
- VIP 资源：`pcs resource create vip ocf:heartbeat:IPaddr2 ip=192.168.122.30 cidr_netmask=24 op monitor interval=30s`（full.txt B5 节）。
- 节点认证用 `hacluster` 用户；`pcs cluster setup --name openstack-cluster controller1 controller2 controller3`。
- 它是 [[高可用集群]] 的实现方式之一（与 K8s 用 etcd 仲裁异曲同工）。

## 类比（帮助理解）
> Pacemaker 像剧组导演：分配角色(资源)给演员(节点)、规定出场顺序(order)、谁和谁必须同台(colocation)，有人罢工立刻换替补；Corosync 是后台的对讲机，保证导演和演员时刻互通。

## 设计时怎么用（反推思维）
> 做"有状态/多 systemd 服务"的集群高可用（数据库、消息队列、OpenStack 控制面）时，用 Pacemaker+Corosync 做资源编排；纯无状态 Web 用 Keepalived+[[HAProxy]] 更轻。

## 典型应用 / 我在哪见过
- 本书 B5 节建集群+VIP、B7 节把 HAProxy 和各 OpenStack 服务注册为 clone 资源并设 order/colocation。

## 关联
- 前置知识：[[高可用HA]] [[高可用集群]]
- 相关：[[Keepalived]] [[HAProxy]] [[控制节点]] [[MariaDB-Galera]]
- 反例/误区：`stonith-enabled=false` 生产留坑；colocation 没配导致 haproxy 与 VIP 分离；2 节点设 `no-quorum-policy=ignore` 易脑裂

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 B5（pacemaker/corosync/fence-agents 安装、集群、VIP）、B7（pcs 资源与约束）。
