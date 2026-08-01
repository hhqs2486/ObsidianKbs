---
类型: 概念
主题: Ceph集群
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Ceph集群

## 一句话定义
> Ceph 集群是一组协同工作的节点：若干 [[Ceph MON]]（管地图/共识）+ 若干 [[Ceph OSD]]（存数据，每盘一个）+ 可选 MDS（CephFS 元数据），由唯一 `fsid` 标识、用同一份 `ceph.conf` 配置，对外提供统一存储。

## 它解决什么问题 / 为什么存在
- 单台机器存不下、扛不住、会坏。把多台机器的盘聚成一个集群，容量靠加盘线性扩展、坏盘自动重建、靠 MON 共识避免脑裂——这就是 [[高可用HA]] 在存储层的体现。

## 核心原理（大二能懂的水平）
- **健康三态**：`ceph -s` 看集群健康，`HEALTH_OK`(正常) / `HEALTH_WARN`(如 PG 恢复中、某 OSD near full) / `HEALTH_ERR`(如 PG inconsistent、全满)（第一部分 2.2）。
- **地图驱动**：客户端/OSD 都从 MON 拿最新 map；OSD 间用 cluster(后端)网心跳与复制，public(前端)网服务客户端（第二部分 2.4）。
- **自恢复**：OSD 增减、盘坏都会触发 PG 恢复/回填，最终回到 `active+clean`。

## 关键参数 / 易错点
- 起停：老环境用 Upstart(`start/stop ceph-osd id=`)、新环境用 systemd(`systemctl start ceph-osd@id`)、或 `service ceph`（第一部分 1）。
- 维护窗口：停机前 `ceph osd set noout` 防自动重平衡，完事 `ceph osd unset noout`（第二部分 2.2、4）。
- 全局宕机恢复：先给 MON 上电→确认 NTP 时间同步→`unset noout`→`ceph -w` 看同步到 OK（第二部分 4）。
- 单节点宕机：把该节点 OSD 逐个 `out`(触发恢复)→`crush remove`→`auth del`→`osd rm`，最后核对 nova/cinder/glance 正常（第二部分 5）。

## 类比（帮助理解）
> Ceph 集群像一队仓库：几个调度员([[Ceph MON]])+ 一排柜员([[Ceph OSD]])+ 可选的图书管理员(MDS)，共用一本员工手册(`ceph.conf`)和同一个仓库编号(`fsid`)；有人请假(盘坏)其他人自动顶上。

## 设计时怎么用（反推思维）
> 给 [[OpenStack]] 做统一存储后端 → 规划"3 MON(跨故障域) + N OSD(每盘一进程)"的集群，前端/后端网络分离，MON 与控制节点就近部署（第二部分 5 检查 nova/cinder/glance）。

## 典型应用 / 我在哪见过
- 第一部分全章（操作/监控集群）、第二部分 4(全局宕机)/5(单节点宕机) 的恢复流程、第三部分 2(MON 备份) 都是围绕整个集群的运维。

## 关联
- 前置知识：[[Ceph架构]] 分布式存储 [[高可用HA]]
- 相关：[[Ceph MON]] [[Ceph OSD]] [[RADOS]] [[Ceph存储]] [[OpenStack]] [[Cinder]] [[Glance]] [[控制节点]] [[高可用集群]]
- 反例/误区：认为"集群 OK"就是进程在跑——还要看 `ceph -s` 是否 `HEALTH_OK`、PG 是否 `active+clean`（第一部分 2.2）。

## 来源
- 《Ceph 运维手册》第一部分 1（操作集群）、2（监控集群）；第二部分 4（全局宕机恢复）、5（单节点宕机处理）；第三部分 2（MON 备份）。
