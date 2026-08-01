---
类型: 概念
主题: RADOS
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# RADOS

## 一句话定义
> RADOS（Reliable Autonomic Distributed Object Store，可靠自治分布式对象存储）是 Ceph 的底座对象存储层：无论块([[RBD]])、文件([[CephFS]])还是对象([[对象存储]])接口，最终数据都是 RADOS 里的对象。客户端经 librados 直接读写。

## 它解决什么问题 / 为什么存在
- 块/文件/对象三种接口语义差异巨大，但"如何把对象可靠地分布到一堆盘上、坏了自动修"是共性问题。RADOS 把这一层抽出来统一实现，三种接口都建在它之上——这就是 Ceph "一套底座、三种接口"的关键。

## 核心原理（大二能懂的水平）
- **对象 → PG → OSD**：每个对象先按哈希映射到某个 PG（归置组），PG 再按 CRUSH 算法分配到一组 [[Ceph OSD]]（第一部分 4.4 `ceph osd map` 可见 `object -> pg -> up [osds]`）。
- **客户端直连**：客户端拿地图后自己用 CRUSH 算落点、直接连 OSD，无需中心元数据服务器（第一部分 9 CRUSH 介绍）。
- **自修复**：OSD 挂了，PG 在其副本间恢复/回填，集群自动回到 `active+clean`（第一部分 4.2）。

## 关键参数 / 易错点
- `rados` 命令行是直接操作 RADOS 对象的工具：`rados put/get/ls/rm`、`rados -p <pool> df`、`rados bench`（第一部分 4.4、第三部分 1）。
- PG 数不是越多越好：每 OSD 默认上限 300 个 PG，超了报 `too many PGs per OSD`（第二部分 3.9）。
- 对象名由"池名+对象名"即可定位；池号见 `ceph osd lspools`（第一部分 4.4）。

## 类比（帮助理解）
> RADOS 是仓库的"地基+货架编号规则"：不管你用"借移动硬盘"(RBD)、"公共阅览室"(CephFS)还是"网页寄包裹"(对象)哪种方式进门，东西最终都被按同一套编号规则放进同一排货架([[Ceph OSD]])。

## 设计时怎么用（反推思维）
> 要理解任何 Ceph 接口的性能/可靠性 → 先想它落到 RADOS 的哪个 PG、哪组 OSD；调优先调 RADOS 层（PG 数、CRUSH 故障域、副本数），而非各接口分别调。

## 典型应用 / 我在哪见过
- 全书主线：第一部分 4.4 用 `rados put` 写对象并 `ceph osd map` 定位；第一部分 8/9 存储池与 CRUSH 都是 RADOS 层的配置；第三部分 1 用 `rados bench` 实测 PG/PGP。

## 关联
- 前置知识：[[Ceph架构]] 分布式存储
- 相关：[[Ceph OSD]] [[Ceph MON]] [[RBD]] [[CephFS]] [[对象存储]] [[BlueStore]] [[Ceph集群]]
- 反例/误区：以为 RBD/CephFS/RGW "各存各的"——它们只是不同入口，底层全是 RADOS 同一批对象。

## 来源
- 《Ceph 运维手册》第一部分 4.4（对象定位 `rados put`/`ceph osd map`）、8（存储池）、9（CRUSH）；第二部分 3（PG 故障）；第三部分 1（`rados bench`）。
