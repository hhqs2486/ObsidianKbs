---
类型: 概念
主题: Ceph MON
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Ceph MON

## 一句话定义
> MON（Monitor，监视器）是 Ceph 的"调度员+地图管理员"：维护 monmap/osdmap/pgmap 等集群地图，靠 Paxos 变体让多个 MON 对地图达成共识（quorum），客户端和 OSD 都从它拿最新地图。

## 它解决什么问题 / 为什么存在
- 集群需要一份"谁在、数据在哪"的权威地图，且这份地图在多个节点间必须一致。MON 用共识算法保证这一点；没有 MON 或 MON 不达 quorum，整个集群不可服务（第二部分 1）。

## 核心原理（大二能懂的水平）
- **共识与法定人数**：MON 用 Paxos 变体，需要"大多数"在线才能形成 quorum（如 3 个里至少 2 个）。建议奇数个(≥3)；加 MON 一次加 2 个（第一部分 6）。
- **MON 状态**：`leader`/`peon`；启动中可能是 `probing`(找同伴)/`electing`(选举)/`synchronizing`(同步数据库)（第二部分 1.4）。
- **数据库**：MON 把地图存在 key/value 库（LevelDB）`/var/lib/ceph/mon/$cluster-$hostname/store.db`；所有 MON 数据都在这目录，备份它即可恢复 MON（第三部分 2）。

## 关键参数 / 易错点
- **时钟偏移**：MON 间默认允许最大偏移 0.05s，超了报 `clock skew`；用 NTP 同步（第二部分 1 "时钟偏移"）。
- **改 MON IP 的正确姿势**：不能只改 `ceph.conf`，要先加新 IP 的 MON→达 quorum→删旧 MON→最后更新 `ceph.conf`（第一部分 10）。
- **磁盘满**：MON 检测到本地盘空间不足会自停，日志见 `reached critical levels of available space`（第二部分 1 "磁盘空间不足导致 MON DOWN"）。
- 数据库坏了：多数情况从健康 MON 同步即可；全坏才用 OSD 上的 map 重建（第二部分 1.5）。

## 类比（帮助理解）
> MON 像仓库门口的"调度台+平面图保管员"：好几张一样的平面图(地图)分放多个台子，台子们投票决定哪份最新；顾客进门先问台子"东西在几号柜"，台子挂了或台子们吵不拢(无 quorum)，仓库就暂停营业。

## 设计时怎么用（反推思维）
> 部署 Ceph 后端给 [[OpenStack]] 时，MON 必须≥3 且分散在不同故障域，否则一次宕机就丢 quorum、[[Cinder]]/[[Glance]] 全挂（第二部分 5、第三部分 3）。

## 典型应用 / 我在哪见过
- 第一部分 6 增删 MON、10 改 MON IP、2.7 查 MON/quorum 状态；第二部分 1 全套 MON 故障排查；第三部分 2 MON 备份与全坏恢复。

## 关联
- 前置知识：[[Ceph架构]] [[Ceph集群]] [[高可用HA]]
- 相关：[[Ceph OSD]] [[RADOS]] [[Ceph存储]] [[控制节点]]（MON 常与控制节点同机或邻近）
- 反例/误区：以为"改 ceph.conf 里的 addr 就能换 MON IP"——MON 之间靠 monmap 互认，只改 conf 不生效（第一部分 10）。

## 来源
- 《Ceph 运维手册》第一部分 6（增删 MON）、10（改 MON IP）、2.7（MON 状态）；第二部分 1（MON 故障：quorum/时钟偏移/数据库/磁盘满）；第三部分 2（MON 备份恢复）。
