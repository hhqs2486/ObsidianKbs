---
类型: 概念
主题: RBD
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# RBD

## 一句话定义
> RBD（RADOS Block Device，Ceph 块存储接口）把 [[RADOS]] 池里的对象拼成一块"虚拟硬盘"(镜像)，可 map 成 `/dev/rbdX` 挂到主机，或经 libvirt 给虚拟机当系统盘/数据盘。

## 它解决什么问题 / 为什么存在
- 虚拟机/容器要的是"一块盘"，不是对象。RBD 在对象存储底座上提供块设备语义（随机读写、快照、克隆），让 Ceph 能当云硬盘后端。

## 核心原理（大二能懂的水平）
- 一个 RBD 镜像 = 一堆 RADOS 对象，对象名前缀形如 `rbd_data.<poolid>.<imgid>`（第三部分 7/8）。镜像被切成多个对象(默认 4MB)，这些对象经 PG 散到不同 [[Ceph OSD]]。
- 客户端用 `rbd map` 把镜像映射成块设备；[[OpenStack]] 里 [[Cinder]] 直接用 librbd 把卷做成 RBD 镜像，[[Nova]] 可让实例从 RBD 启动。

## 关键参数 / 易错点
- **删不掉**：镜像被占用(`watchers`)时 `rbd rm` 报 `image has watchers - not removing`；要先在客户端 `rbd unmap` 或等崩溃客户端 30s 超时（第三部分 10）。
- **真实容量**：`rbd info` 显示的是预分配大小，`rbd du`（Jewel+）才显示实际使用；老版本用 `rbd diff` 累加（第三部分 8）。
- **Cinder 删卷卡死**：集群扩容后 OSD 变多，Cinder 删卷要和所有 OSD 建连接，容易 `Too many open files`；需把 cinder-volume/glance-api 的 `nofile` 调到 65535（第三部分 3）。
- 查镜像落在哪些 PG/OSD：用 `rbd-loc` 脚本逐对象 `ceph osd map`（第三部分 7）。

## 类比（帮助理解）
> RBD 像一个"云硬盘"：外表是块硬盘，里面其实是仓库里一排编号箱子的合集；你往硬盘写第 N 字节，其实写了某个箱子的某一格。

## 设计时怎么用（反推思维）
> 给云做"可快照、可克隆、可挂到任意计算节点"的云硬盘 → 用 RBD 当 [[Cinder]] 卷后端；要让实例系统盘也能漂移 → 让 [[Nova]] 从 RBD 启动。记得给 cinder-volume 留够文件描述符（第三部分 3）。

## 典型应用 / 我在哪见过
- 第二部分 5 单节点宕机后检查 `cinder`/`glance`/`nova` 是否正常；第三部分 3 Cinder/Glance FD 调优、7/8/10 RBD 定位/真实大小/watcher。
- 第一部分 4.4 用 `rados put` 写入对象、`ceph osd map` 定位对象，是理解 RBD 落盘的基础。

## 关联
- 前置知识：[[RADOS]] [[Ceph OSD]] [[Ceph架构]]
- 相关：[[Ceph集群]] [[OpenStack]] [[Cinder]] [[Glance]] [[Nova]] [[虚拟化KVM]] [[Ceph存储]]
- 反例/误区：把 RBD 当"本地盘"用不关心 watchers——忘了 unmap 就永远删不掉镜像（第三部分 10）。

## 来源
- 《Ceph 运维手册》第一部分 4.4（对象定位）、第二部分 5（单节点宕机与 Cinder/Glance/Nova 检查）、第三部分 3（Cinder/Glance FD）、7/8/10（RBD 位置/大小/watcher）。
