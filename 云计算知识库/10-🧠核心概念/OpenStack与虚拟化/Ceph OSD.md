---
类型: 概念
主题: Ceph OSD
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Ceph OSD

## 一句话定义
> OSD（Object Storage Daemon，对象存储守护进程）是 Ceph 真正干活的"柜子"：一个 `ceph-osd` 进程守一块盘，负责存对象、做副本/纠删、数据恢复与再平衡、向 [[Ceph MON]] 报心跳。

## 它解决什么问题 / 为什么存在
- 没有 OSD 就没有地方存数据。集群容量 = 所有 OSD 之和，可靠性 = 坏盘后副本从其他 OSD 自动重建。OSD 是 [[RADOS]] 的存储执行单元。

## 核心原理（大二能懂的水平）
- **up / in 状态机**：`up`=进程在跑，`in`=在集群内(能分数据)。正常应是 `up & in`。`down & in` 是异常（第一部分 3）。OSD 挂掉默认 300s 后被标成 `out`，CRUSH 不再给它派 PG、触发恢复（第一部分 3）。
- **Acting Set / Up Set**：PG 实际落在哪组 OSD 叫 acting set，正在服务读写的是 up set；多数情况两者一致（第一部分 4.1）。
- **journal（FileStore 时代）**：写先落日志再确认，把随机写变顺序写；可放到独立 SSD 提速（第一部分 7.2）。现代 [[BlueStore]] 已改变这一层。

## 关键参数 / 易错点
- 一个驱动器只服务一个 OSD；日志最好独立 SSD，否则共享盘会成瓶颈（第二部分 2.4）。
- 每 OSD 规划约 1GB 内存，进入恢复时内存会飙升（第二部分 2.4）。
- OSD 占用≥95% 集群拒写（`mon osd full ratio`），≥85% 告警 `near full`（第二部分 2.4）。
- 增/删 OSD：`ceph-deploy osd prepare/activate`、`ceph osd crush add/reweight`、`ceph osd out/in`、`ceph osd rm`（第一部分 7）。
- 调权重/主亲和：`ceph osd crush reweight`、`ceph osd primary-affinity`（第一部分 9.5/9.3）。

## 类比（帮助理解）
> 每个 OSD 像一个带锁的储物柜+柜员：顾客把包裹(对象)交给它，它负责复印备份(副本)放到别的柜子、柜子坏了它自动从别处补货(恢复)，并定时向调度员([[Ceph MON]])报"我还活着"。

## 设计时怎么用（反推思维）
> 要扩集群容量或换坏盘 → 加/删 OSD，并用 `ceph osd crush add` 把它放进正确的故障域（host/rack）。想让某慢盘少当主副本 → 调低 `primary-affinity`（第一部分 9.3）。

## 典型应用 / 我在哪见过
- 第一部分 7 增删 OSD、第一部分 3/4 监控 OSD 与 PG、第二部分 2 OSD 故障（龟速/flapping）、第二部分 5 单节点宕机摘除 OSD。
- 第三部分 4/5 换 journal、恢复被清掉的分区表，本质都是在一块 OSD 盘上动手术。

## 关联
- 前置知识：[[Ceph架构]] [[RADOS]] [[Ceph集群]]
- 相关：[[Ceph MON]] [[BlueStore]] [[RBD]]（块镜像最终落在 OSD）[[高可用HA]]
- 反例/误区：把 OSD 和"一块裸盘"画等号忽略进程——OSD 是"进程+盘+journal"的整体，删 OSD 要先 `out` 等恢复再 `rm`（第一部分 7.3）。

## 来源
- 《Ceph 运维手册》第一部分 3（监控 OSD）、4（监控 PG）、7（增删 OSD）、9（CRUSH/权重）；第二部分 2（OSD 故障处理）、5（单节点宕机）；第三部分 4/5（journal 与分区表）。
