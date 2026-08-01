---
类型: 概念
主题: BlueStore
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# BlueStore

## 一句话定义
> BlueStore 是 Ceph 的 OSD 后端存储引擎（取代旧 FileStore），直接管理裸盘/块设备，不经过本地文件系统这一中间层，从而去掉写放大、支持校验/压缩/加密。

## 它解决什么问题 / 为什么存在
- 旧 FileStore 在"本地文件系统(ext4/xfs/btrfs)+journal"之上存对象，存在写放大、xattr 限制(如 ext4 不支持长对象名，破坏 RGW)、性能抖动等问题。BlueStore 直接管裸盘，元数据用 RocksDB 放在一个小分区，数据区自己分配，性能与可靠性都更好。

## 核心原理（大二能懂的水平）
- **裸盘直管**：BlueStore 不再依赖 ext4/xfs 这类文件系统做对象容器，而是直接在块设备上管理空间、做写时分配，避免"先写文件系统再写对象"的双重开销。
- **元数据与数据分离**：对象元数据/分配信息存 RocksDB（通常在一个独立小分区/DB 设备），数据块直接落盘；支持 rocksdb 层校验、整盘校验。
- 对比 FileStore：FileStore 用 `journal` 分区做事务日志（第一部分 7.2、第三部分 4/5 讲的"换 journal/恢复分区表"都是 FileStore 时代操作）；BlueStore 内部仍有类似 WAL 机制，但不再暴露成用户可换的 journal 分区。

## 关键参数 / 易错点
- 本书环境是 Hammer/Jewel，很多运维动作(journal 换盘、分区表恢复)仍是 FileStore 套路；现代 Ceph 默认 BlueStore，升级/新部署不必再手管 journal 分区。
- 部署建议：DB/WAL 放 SSD、数据放 HDD 可提速；但一个驱动器仍建议只服务一个 OSD（第二部分 2.4）。

## 类比（帮助理解）
> FileStore 像"先把货放进纸箱(文件系统)再进柜子(盘)"，多一道手续；BlueStore 像"直接把货按编号塞进柜子格子"，省掉纸箱、更快也更省空间。

## 设计时怎么用（反推思维）
> 新部署 Ceph 后端给 [[OpenStack]] → 默认 BlueStore，DB/WAL 用 SSD 提速；只有维护老集群(Hammer/Jewel)才需要懂 journal 分区与第三部分 4/5 的"换 journal/恢复分区表"。

## 典型应用 / 我在哪见过
- 本书虽以 FileStore 时代命令为主(第一部分 7.2 journal、第二部分 2.4 文件系统选择、第三部分 4/5 journal 与分区表)，但主线要求点明：现代 Ceph 用 BlueStore 直接管裸盘。

## 关联
- 前置知识：[[Ceph OSD]] [[Ceph架构]]
- 相关：[[RADOS]] [[对象存储]]（RGW 受 ext4 xattr 限制催生 BlueStore）[[Ceph集群]]
- 反例/误区：把 BlueStore 和 FileStore 的 journal 分区操作混用——BlueStore 不暴露可换的 journal 分区，第三部分 4/5 的 journal 流程只适用于老 FileStore OSD。

## 来源
- 《Ceph 运维手册》第一部分 7.2（OSD journal 分区）、12（debug filestore/journal）、第二部分 2.4（文件系统 ext4/xfs/btrfs 与 xattr 限制）、第三部分 4/5（更换/恢复 journal 分区）；结合通用 Ceph 知识补全 BlueStore 主线。
