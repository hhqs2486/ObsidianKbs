---
类型: 概念
主题: 高可用
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# 高可用HA

## 一句话定义
> 高可用（HA, High Availability）是通过"冗余 + 自动故障转移"，让服务在单点故障时仍能对外提供，目标是把不可用时间压到极低（例如全年 99.99%，约 53 分钟）。

## 它解决什么问题 / 为什么存在
- 单台控制节点一宕机，整个云（认证、计算调度、网络、镜像）就全瘫。对生产环境这是不可接受的。
- HA 让 3 个控制节点互为备份：任意一个挂掉，流量自动切到健康节点，用户基本无感知。
- 本质是在"成本（多买机器）"和"可用性"之间做权衡。

## 核心原理（大二能懂的水平）
- **冗余**：关键组件（数据库、消息队列、各 API 服务）都跑 ≥3 份，谁挂了还有别人顶着。
- **虚拟 IP（VIP）**：客户端永远只连一个 IP（本书里叫 `controller`，如 `192.168.122.30`），这个 IP 实际"漂"在某台健康节点上；节点挂了，VIP 漂到别的节点。
- **健康检查**：负载均衡器对后端做探测，例如 HAProxy 里 `check inter 2000 rise 2 fall 5`（每 2 秒探一次，连续 2 次成功算活，连续 5 次失败算死）；Galera 用 `clustercheck` 脚本返回 200/503 判断节点是否 synced。
- **仲裁（quorum）**：避免"脑裂"——3 节点时 ≥2 票才算合法集群。本书用 `pcs property set no-quorum-policy=ignore` 简化测试。
- **资源编排**：Pacemaker/Corosync 负责"先起 VIP，再起 HAProxy"，并用 colocation 约束把 HAProxy 绑在拥有 VIP 的节点上（见 [[Pacemaker]]）。

## 关键参数 / 易错点
- **脑裂（split-brain）**：网络分区后两套节点都以为自己是主，抢写同一份数据 → 数据损坏。解决靠 fencing（stonith 强制关机）、quorum。本书 `stonith-enabled=false` 是测试环境简化，**生产必须开启 stonith 并配 fence 设备**。
- **VIP 与 HAProxy 必须 colocate**：否则 HAProxy 会在没有 VIP 的节点空跑，请求进不来。
- **Galera `wsrep_sst_method=rsync`** 全量同步会锁表，生产更常用 `xtrabackup-v2`。
- **`no-quorum-policy=ignore`** 在 2 节点时很危险；3 节点可接受。

## 类比（帮助理解）
> 像三个值班医生共用一个"对外电话号"(VIP)，电话总接给当下健康的那位；如果两人同时抢着接电话（脑裂），就靠排班规则(quorum/fencing)决定谁有资格接，避免开错药。

## 设计时怎么用（反推思维）
> 做云、数据库、网关这类系统时，先问"哪一点是单点"，就把那一点做成"多活 + VIP + 健康检查 + 仲裁"。不要为了 HA 而 HA，先算 SLA 再决定冗余度。

## 典型应用 / 我在哪见过
- 本书：controller1/2/3 三控制节点 + [[Keepalived]] 思路的 VIP（实际用 [[Pacemaker]]）+ [[HAProxy]] + [[MariaDB-Galera]] + RabbitMQ 镜像队列。
- 同类：K8s 的 [[高可用集群]]（也是多控制节点 + VIP + etcd 仲裁）。

## 关联
- 前置知识：[[控制节点]] [[计算节点]]
- 相关：[[Keepalived]] [[HAProxy]] [[MariaDB-Galera]] [[Pacemaker]] [[负载均衡]] [[高可用集群]]
- 反例/误区：[[脑裂]]（网络分区抢主，须靠 quorum/fencing 杜绝）

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 B1–B7（MariaDB-Galera / clustercheck / RabbitMQ 镜像队列 / Memcached / Pacemaker+Corosync / HAProxy）。
- 高可用定义与脑裂原理为通用架构知识。
