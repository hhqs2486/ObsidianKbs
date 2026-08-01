---
类型: 教程
来源: 《Ceph 运维手册》（ceph-handbook，Ubuntu14.04 Hammer / CentOS7 Jewel）
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# 《Ceph 运维手册》教程笔记

## 这条教程在解决什么
- 面向二线运维的实战速查：把 Ceph 的"常用操作 / 故障处理 / 进阶"三部分操作沉淀成可照着敲的命令集，让学员能起停、监控、扩缩容、救 MON/OSD/PG 故障，并理解**「Ceph 用 [[RADOS]] 统一管理块([[RBD]])/文件([[CephFS]])/对象([[对象存储]]) 三种存储、靠 [[Ceph MON]] 管集群地图 + [[Ceph OSD]] 存数据、[[BlueStore]] 直接管裸盘」**这条主线，以及它作为 [[OpenStack]]（[[Cinder]]/[[Glance]]/[[Swift]] 后端）的统一存储底座。

## 关键内容（按 PDF 章节提纲）
**第一部分：常用操作**
- 1. 操作集群：Upstart(`start/stop ceph-osd id=`)、systemd(`systemctl start ceph-osd@id`)、`service ceph` 三种起停方式（第一部分 1）。
- 2. 监控集群：`ceph -s/-w/health`、`ceph df`、`ceph osd stat/tree`、`ceph mon stat/quorum_status -f json-pretty`、`ceph mds stat`、管理套接字 `ceph daemon osd.0 help`（第一部分 2）。
- 3. 监控 OSD：`up/in` 状态机，`down` 默认 300s 标 `out` 触发恢复（第一部分 3）。
- 4. 监控 PG：acting/up set、`ceph pg dump_stuck`、`ceph osd map {pool} {obj}` 定位对象（`object -> pg -> up [osds]`）（第一部分 4）。
- 5. 用户管理：能力 caps（`mon 'allow rwx'`、`osd 'allow * pool=...'`）、`ceph-authtool` 管 keyring（第一部分 5）。
- 6. 增删 MON：手动 `ceph-mon --mkfs` + `ceph mon add/remove`；`ceph-deploy mon create/destroy`；必须保证剩余能达 quorum（第一部分 6）。
- 7. 增删 OSD：`ceph-deploy disk zap/prepare/activate`；手动 `ceph osd create/crush add/out/rm`（第一部分 7）。
- 8. 操作 Pool：`ceph osd pool create` 副本池 vs 纠删池、`size`/`min_size`/`quota`/`mksnap`（第一部分 8）。
- 9. 管理 CRUSH：getcrushmap→crushtool 反编译→改设备/桶/规则→重编译→setcrushmap；`primary-affinity`、SSD/HDD 双树分层（第一部分 9）。
- 10. 改 MON IP：先加新 IP 的 MON→达 quorum→删旧 MON→最后改 `ceph.conf`（第一部分 10）。
- 11. 改集群配置：运行时 `ceph tell {daemon}.* injectargs` 或 `ceph daemon {id} config set`（重启失效）（第一部分 11）。
- 12. 日志调试：子系统 `debug {sub}=log/mem`，`/etc/logrotate.d/ceph` 加快滚动（第一部分 12）。

**第二部分：故障处理**
- 1. MON 故障：先确认进程/网络/`ceph -s`；`mon_status` 看 `probing/electing/synchronizing`；时钟偏移默认 >0.05s 告警(NTP)；数据库 LevelDB 崩溃从健康 MON 同步、全坏用 OSD 上 map 重建；磁盘满会自停（第二部分 1）。
- 2. OSD 故障：`ceph osd set noout` 停机维护防重平衡；起不来查配置/路径/线程数；满 95% 拒写、85% 告警；龟速多因网络/共享盘/恢复限流；`flapping` 用 `noup/nodown` 临时挡（第二部分 2）。
- 3. PG 故障：`stale/inactive/unclean` 卡住；`unfound` 对象(`ceph pg mark_unfound_lost`)；`inconsistent` 用 `ceph pg repair`；`too many/few PGs per OSD`（第二部分 3）。
- 4. 全局宕机恢复：先给 MON 上电→确认 NTP→`ceph osd unset noout`→`ceph -w` 等 `HEALTH_OK`（第二部分 4）。
- 5. 单节点宕机：OSD 逐个 `out`(恢复)→`crush remove`→`auth del`→`osd rm`，最后核对 nova/cinder/glance（第二部分 5）。

**第三部分：Ceph 进阶**
- 1. PG 与 PGP 区别：`pg_num` 增加只让 PG 内对象**分裂**(不迁移)，`pgp_num` 增加才让 PG **分布变动**(不分裂)（用 `rados bench` 实测）（第三部分 1）。
- 2. MON 备份/恢复：停 MON 打包 `/var/lib/ceph/mon` + `/etc/ceph/`；全坏时解压到新节点、新建 monmap、注入、起 MON、推配置、重启 OSD（第三部分 2）。
- 3. Cinder/Glance 最大 FD：集群扩容后删 RBD 卷 `Too many open files`，cinder-volume/glance-api 的 `nofile` 调 65535（第三部分 3）。
- 4/5. 换 journal、恢复被 `disk zap` 清掉的分区表（FileStore 时代操作）（第三部分 4/5）。
- 6. PG 卡 `active+remapped`：`chooseleaf_vary_r` 默认 0 之坑，调 `ceph osd crush tunables optimal`（第三部分 6）。
- 7/8/9/10. 查 RBD 镜像位置(`rbd-loc`)、RBD 真实大小(`rbd du`/`rbd diff`)、统计每 OSD 的 PG 数、查 RBD 使用者(`rados listwatchers`)（第三部分 7–10）。

## 我卡住/没懂的地方
- **PG 与 PGP 的区别**：为什么 `pg_num` 增加只"分裂"不"迁移"、要再调 `pgp_num` 才迁移？第三部分 1 用 `rados bench` 实测把两者讲透了——PG 是"目录个数"，PGP 是"OSD 分布组合数"。
- **`chooseleaf_vary_r` 为什么默认 0 会卡 `remapped`**：第三部分 6 点出 CRUSH 的 straw 算法小坑，调 `optimal` 或设为 1~5。

## 它背后的原理（别只记操作）
- **对象→PG→OSD**：所有数据最终都是 [[RADOS]] 里的对象，经 CRUSH 算落点，客户端直连 OSD，无中心元数据服务器（第一部分 4.4、9）。
- **MON 共识**：[[Ceph MON]] 用 Paxos 变体维护 map，需"大多数"在线形成 quorum（奇数≥3）（第一部分 6、第二部分 1）。
- **状态机与自愈**：OSD `up&in` 才正常；`down` 300s→`out`→PG 在副本间恢复/回填，最终回到 `active+clean`（第一部分 3/4.2）。
- **容量保护**：`mon osd full ratio` 0.95 拒写、`nearfull` 0.85 告警（第二部分 2.4）。

## 我能复用/改编的点
- 扩缩容：加盘前用 pgcalc 估算 PG 数；`ceph-deploy osd prepare/activate` 一键加 OSD（第一部分 7、8.2）。
- 故障演练清单：维护窗口 `ceph osd set noout`→停机→`unset noout`；OSD 震荡用 `noup/nodown` 临时挡（第二部分 2.2/2.5）。
- 接 [[OpenStack]]：[[Cinder]]/[[Glance]]/[[Nova]] 都指向 Ceph 池；cinder-volume 集群扩容后必须调大 `nofile`(65535)，否则删 RBD 卷卡死（第三部分 3、第二部分 5）。

## 关联
- 概念：[[Ceph架构]] [[RADOS]] [[Ceph OSD]] [[Ceph MON]] [[RBD]] [[CephFS]] [[对象存储]] [[BlueStore]] [[Ceph集群]]
- 项目：[[Ceph存储]]（统一后端视角）；[[OpenStack]] [[Cinder]] [[Glance]] [[Swift]] [[Nova]] [[高可用HA]] [[虚拟化KVM]] [[控制节点]] [[高可用集群]]
- 注：分布式存储 为其他 agent 归属、本库暂无同名卡，此处以纯文本引用。

## 来源
- 《Ceph 运维手册》第一部分（常用操作）、第二部分（故障处理）、第三部分（Ceph 进阶）；环境 Ubuntu 14.04 Hammer + CentOS 7 Jewel（ch02 简介）。
