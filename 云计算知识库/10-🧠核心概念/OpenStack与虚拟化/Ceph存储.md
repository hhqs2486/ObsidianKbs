---
类型: 概念
主题: Ceph存储
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Ceph存储

## 一句话定义
> Ceph 是一个统一的分布式存储系统：用一堆普通服务器的磁盘，拼出一个可扩、自愈、高可用的存储池，同时提供块存储(RBD)、对象存储(RGW)、文件系统(CephFS)。

## 它解决什么问题 / 为什么存在
- 云里镜像、虚拟机盘、卷都要存。单机磁盘会满、会坏、不能并发给多台计算节点共享。Ceph 把存储做成"集群"，容量不够加盘、盘坏了自动重建、多副本防丢。
- 在本书里 Ceph 是 [[Glance]]/[[Cinder]]/[[Nova]] 的共享后端：镜像存 images 池、卷存 volumes 池、虚拟机系统盘存 vms 池，做到计算节点无本地状态、便于 live migration。

## 核心原理（大二能懂的水平）
- **CRUSH 算法**：数据放哪块盘不由中心元数据服务器决定，而是用算法算出来——所以没有单点元数据服务，扩展性极好。
- **PG（归置组）**：对象是先映射到 PG，PG 再映射到 OSD（磁盘）。本书建池时 `ceph osd pool create volumes 165`，PG 数要按公式 `pg数×副本数 < 每OSD的PG上限×OSD总数` 估（full.txt L 节）。
- **多副本/EC**：默认 3 副本，一块盘坏，数据从其他副本重建。
- **RBD**：块设备，被 Cinder 当卷、被 Nova 当启动盘挂载（`rbd map`）。

## 关键参数 / 易错点
- 池建好后必须 `ceph osd pool application enable <pool> rbd`，否则集群 `HEALTH_WARN`（full.txt M 节坑）。
- 认证用 cephx：要给 glance/cinder/nova 各建 `client.glance`/`client.cinder` 用户并下发 keyring，权限精确到 pool（full.txt L 节）。
- 计算节点把 `client.cinder` 密钥塞进 libvirt（uuid 一致），否则挂 Ceph 卷失败（full.txt L/N 节）。
- Nova 从 rbd 启动实例要求镜像为 raw（full.txt N 节）。

## 类比（帮助理解）
> Ceph 像把很多抽屉(磁盘)编号后，按"取件码算法(CRUSH)"决定文件放哪；丢一把钥匙(坏盘)时，系统按备份自动补一份到空抽屉，外人完全无感。

## 设计时怎么用（反推思维）
> 要"共享、可扩、高可用"的块/对象存储，且不想被单一存储厂商绑定 → 选 Ceph。若只要单机快盘，直连本地 SSD 更简单。本书把 Ceph 当统一后端，换来计算节点无状态与热迁移能力。

## 典型应用 / 我在哪见过
- 本书 L–N 节：建 volumes/vms/images 三池，Glance 镜像存 rbd、Cinder 卷后端 ceph、Nova 以 rbd 启动实例并 live migration。

## 关联
- 前置知识：[[OpenStack]] [[高可用HA]]
- 相关：[[Glance]] [[Cinder]] [[Nova]] [[计算节点]] [[Swift]]（同为存储，对象 vs 块）
- 反例/误区：把 Ceph 当"普通 NFS"——它是对象/块存储，强一致与自愈才是价值点；故障域规划错了会丢数据

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 L（建池/授权）、M（Glance 集成）、Cinder 集成、N（Nova 集成 / rbd 启动 / live migration）。
