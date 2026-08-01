---
类型: 概念
主题: MariaDB-Galera
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# MariaDB-Galera

## 一句话定义
> MariaDB-Galera 是带 Galera 同步复制插件的 MariaDB：多个数据库节点组成"多主"集群，任意节点写入，数据同步到所有节点，节点间强一致。

## 它解决什么问题 / 为什么存在
- OpenStack 所有服务（Keystone/Nova/Neutron/Glance/Cinder…）的元数据都存在同一个数据库里。单机 MySQL 一挂，全云瘫痪。
- 普通主从复制是异步、单写，主挂要手动切。Galera 是**多主同步**：3 台都可读写，任一台挂了另外两台照常服务，天然契合 [[高可用HA]]。

## 核心原理（大二能懂的水平）
- **同步复制（virtually synchronous）**：事务在本地提交前，要先在集群里"认证"通过、广播到其它节点写成功，才算提交——所以各节点数据一致。
- **wsrep（Write Set Replication）**：节点间传的是"写集"，不是 binlog 重放。节点加入时用 SST（State Snapshot Transfer，本书用 rsync）做一次全量同步，之后增量追。
- 写入不是"自动冲突解决"：两个节点同时改同一行会有一个认证失败（rollback），应用层要重试。
- 前文 [[HAProxy]] 的 `galera_cluster` 后端就是这三台，配 `clustercheck` 探 9200 判断节点是否 synced。

## 关键参数 / 易错点
- `[galera]` 段：`wsrep_cluster_address="gcomm://controller1,controller2,controller3"`、`wsrep_cluster_name`、`wsrep_node_name/address`、`wsrep_sst_method`（本书 rsync）。
- **首节点启动要用 `galera_new_cluster`**，其它节点普通 `service mariadb start`（full.txt B1 节）。
- **脑裂风险**：网络分区后两半各写各的会冲突。靠 quorum（少数派停止写入）保护自己，生产配合 fencing。
- `wsrep_sst_method=rsync` 全量同步会锁表、慢；生产常用 `xtrabackup-v2`。
- 认证用户 `galera:galera`（`wsrep_sst_auth`）和三节点要一致。

## 类比（帮助理解）
> Galera 像三个誊写员同抄一本账：每人写完一行都要先让另外两人也抄上、点头确认，才落笔；任一人请假，另两人继续，账本始终一致。

## 设计时怎么用（反推思维）
> 需要"多节点、强一致、可写可读"的关系型存储（云元数据、订单类） → Galera 多主。若只是缓存/日志类弱一致，单主异步复制更轻。本书把整个 OpenStack 库放 Galera。

## 典型应用 / 我在哪见过
- 本书 B1 节：三控制节点装 `mariadb-server-galera`，配 Galera 段，首节点 `galera_new_cluster`，B2 配 `clustercheck` 供 HAProxy 探活。

## 关联
- 前置知识：[[高可用HA]]
- 相关：[[控制节点]] [[HAProxy]] [[Keystone]] [[Nova]] [[Neutron]] [[Glance]] [[Cinder]] [[Pacemaker]]
- 反例/误区：网络分区致 [[脑裂]]；SST 用 rsync 锁表；首节点没用 `galera_new_cluster` 起不起来

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 B1（Galera 配置与启动）、B2（clustercheck/xinetd 心跳）、B6（HAProxy galera_cluster 后端）。
