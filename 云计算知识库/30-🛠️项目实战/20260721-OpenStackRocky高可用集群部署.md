---
类型: 项目
tags: [项目]
创建: 2026-07-21
状态: 进行中
---

# 20260721-OpenStackRocky高可用集群部署

> 把《OpenStack-Rocky高可用集群部署》的部署步骤"反推"成一次工程项目：从需求 → 架构 → 选型 → 逐个组件推导 → 运维 → 检查清单。核心主线是**高可用集群**（VIP / 脑裂 / Galera 多主 / HAProxy 后端健康）。

## 1. 需求拆解
- 必须实现（功能）：
  - 一套可创建/管理虚拟机、网络、镜像、云硬盘的私有云（IaaS）。
  - 控制面 3 节点互为备份，任意单台故障不影响业务（认证、调度、网络、镜像、卷 API 不中断）。
  - 计算节点可横向扩容，虚拟机系统盘/数据盘落在共享存储，支持热迁移。
- 非功能/约束（SLA/吞吐/延迟/合规/成本/地域）：
  - SLA：控制面可用性 ≥ 99.99%（全年停机 < 53 分钟）→ 要求控制节点 ≥3 且跨故障域。
  - 一致性：元数据强一致（数据库多主同步）；对象/块存储多副本。
  - 成本：用通用 x86 服务器 + 开源软件，不绑定商业存储。
- 硬约束（版本/资源配额/网络隔离）：
  - 版本锁定 Rocky；每台控制节点多网卡（管理网 192.168.100.x、业务/存储网 192.168.122.x）。
  - 管理网 3 节点 + VIP(192.168.122.30) + compute1(192.168.100.184)。
  - 物理机需 CPU 虚拟化（VT-x/AMD-V）以支持 [[虚拟化KVM]]。

## 2. 架构框图
> 接入层(统一入口) → 控制面(多活服务) → 数据/消息底座 → 计算+存储层，所有 API 经 VIP 收敛。

```
                         ┌──────────────── 客户端 / 运维 ────────────────┐
                                       │ 只认 VIP: controller (192.168.122.30)
                                       ▼
【接入层 / 负载均衡】            HAProxy (每台控制节点一份, 受 Pacemaker 管)
                                bind VIP:80/5000/35357/8774/8776/9292/9696/6080/3306/5672
                                       │  check inter 2000 rise 2 fall 5
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
【控制面 多活服务】          controller1                   controller2                   controller3
  (Pacemaker clone)      Keystone  Nova*   Neutron*    Keystone  Nova*   Neutron*    Keystone  Nova*   Neutron*
                        Glance  Cinder*  Horizon       Glance  Cinder*  Horizon       Glance  Cinder*  Horizon
                        (*api/scheduler 等无状态多活; cinder-volume 为 active/passive)
        │                          │                              │                              │
        └──────────────┬───────────┴──────────────┬───────────────┴──────────────┬──────────────┘
                       ▼                          ▼                              ▼
【数据/消息底座 · 多主/镜像】   MariaDB-Galera(多主同步)   RabbitMQ(镜像队列 ha-all)   Memcached(无状态)   etcd(可选)
                                clustercheck(xinetd:9200) 健康探测 ──► HAProxy 摘掉未 synced 节点
                       ▼
【VIP 与资源编排】   Pacemaker + Corosync
                    VIP(192.168.122.30) ──order──► lb-haproxy ──colocation──► 同节点
                    (quorum 仲裁; 本书 stonith 关、no-quorum-policy=ignore)
                       │
                       ▼
【计算+存储层】   compute1: nova-compute(libvirtd+KVM) + linuxbridge-agent + cinder-volume(ceph) + ceph-common
                  └─ Ceph 集群:  pools volumes / vms / images (RBD), 多副本, CRUSH 分布
```

- 协议：服务间走 HTTP/[[RESTfulAPI]]（经 Keystone 鉴权）+ AMQP（RabbitMQ）消息；存储走 RBD(librados)。

## 3. 技术选型
| 层级 | 组件 | 选型理由 | 替代 |
|------|------|----------|------|
| 虚拟化 | [[虚拟化KVM]] | Linux 内核原生、近裸机性能、OpenStack 默认 | VMware、Xen |
| 认证 | [[Keystone]] | OpenStack 统一身份/服务目录，无替代 | LDAP(仅后端) |
| 计算 | [[Nova]] | IaaS 计算事实标准，配合 KVM | 无 |
| 网络 | [[Neutron]] (linuxbridge+vxlan, l3_ha) | 租户隔离+HA 路由，避免网络节点单点 | OVN/OVS |
| 镜像 | [[Glance]] | 镜像注册分发，可接 Ceph | 无 |
| 块存储 | [[Cinder]] + [[Ceph存储]](RBD) | 统一后端、可挂、可热迁移 | 裸 LVM、企业阵列 |
| 对象存储 | (本文未部署; 可用 Ceph RGW) | — | [[Swift]]、MinIO |
| 界面 | [[Horizon]] | 统一 Web 控制台 | openstackclient |
| 数据库 | [[MariaDB-Galera]] | 多主同步强一致，任节点可写 | 单主 MHA、etcd(不存关系数据) |
| 消息队列 | RabbitMQ(镜像队列) | 服务解耦、消息不丢 | Kafka(需自适配) |
| 令牌缓存 | Memcached(多节点) | 无状态、三节点共享缓存 | Redis |
| VIP/资源编排 | [[Pacemaker]]+Corosync | 完整 CRM：VIP+资源约束+quorum | [[Keepalived]](仅 VIP)+自写脚本 |
| 负载均衡 | [[HAProxy]] | 高性能 TCP/HTTP 多后端健康探活 | LVS、[[负载均衡]]硬件 |
| 共享存储 | [[Ceph存储]] | 统一块/对象、自愈、可扩、无单点 | 商业 SAN、分布式文件 |

## 4. 部署推导（逐个组件）
> 每个组件都回答"为什么需要"，杜绝"教程里这么配"。

- **chrony（时间同步）**：Galera / RabbitMQ / Ceph 都靠时钟一致判断顺序与租约；不同步会写冲突、脑裂误判。→ 控制节点为 server，其余指向它。
- **/etc/hosts + 关防火墙/SELinux**：部署期消除名字解析与包过滤干扰；生产应改为放行必要端口而非全关。
- **[[MariaDB-Galera]]**：所有服务元数据都在这。单库=单点 → 多主三节点，任挂照常。`wsrep_sst_auth=galera:galera`、首节点 `galera_new_cluster`。
- **clustercheck(xinetd:9200)**：给 HAProxy 一个"本节点 Galera 是否 synced"的判断点，返回 503 即摘流量，避免把写发到未同步节点。
- **RabbitMQ 镜像队列(`ha-all`)**：Nova/Neutron/Cinder 都经消息解耦；队列只在单节点会丢消息/阻塞 → `ha-mode:all` 全副本。
- **Memcached(多节点)**：Keystone token 缓存；无状态，各服务列全三节点即天然高可用（[[高可用HA]] 里"无状态多实例"范式）。
- **[[Pacemaker]]+Corosync**：前面的 VIP/服务需要一个"大管家"决定跑哪、挂了怎么抢、谁先谁后。`vip` → `lb-haproxy` 的 order/colocation 保证 HAProxy 永远在持 VIP 的节点。
- **[[HAProxy]]**：把"3 份服务"收敛到 1 个 VIP:端口；`ip_nonlocal_bind=1` 允许绑未持有 VIP 的本机。每个 `listen` 段后端带 `check`，自动剔障。
- **[[Keystone]]**：没有它，其它服务连不上（都要 `auth_url=http://controller:5000`）。fernet 密钥必须三节点一致，否则 token 校验分裂。
- **[[Glance]]**：Nova 起实例、Cinder 建卷都从镜像来；后端改 rbd 后镜像落在 Ceph，三控制节点共享，无本地孤岛。
- **[[Nova]]**：真正"造虚拟机"的调度与执行；控制面 5 个服务多活，计算节点经 cell_v2 注册；`virt_type=kvm`。
- **[[Neutron]]**：实例要联网。VRRP(`l3_ha`) 让路由在多 l3 agent 间漂移 VIP，避免网络节点单点；linuxbridge+vxlan 做租户Overlay。
- **[[Cinder]]**：给实例挂持久盘；后端 ceph 让卷可跨计算节点挂载、支持热迁移；`volume_backend_name=ceph` 经 volume type 选中。
- **[[Horizon]]**：给不敲命令的人用；无状态多节点 + HAProxy source 粘滞即可。
- **[[Ceph存储]]**：统一块/镜像后端，使计算节点无本地状态 → 故障可迁移；三池 volumes/vms/images，多副本自愈；cephx 按 pool 授权。
- **计算节点/存储节点**：算力与 cinder-volume 落点；cinder-volume 初未接 Ceph 时状态 down，接 Ceph 后 up——说明"后端决定服务是否可用"。

## 5. 运维要点
- 监控/告警（指标/日志/链路）：
  - HAProxy stats 页(:1080)看各后端 UP/DOWN；clustercheck 探 Galera synced 状态。
  - Ceph：`ceph -s` 看 HEALTH_OK/WARN；池未 `application enable` 会 WARN。
  - Pacemaker：`pcs status` / `pcs resource` 看 VIP 与 clone 资源分布；关注 DC 与 quorum。
  - 日志：HAProxy 经 rsyslog 落 `/var/log/haproxy.log`；各服务 systemd journal。
- 扩缩容策略：
  - 计算节点：加机器 → 装 nova-compute+linuxbridge+ceph-common → `cell_v2 discover_hosts` 自动纳管。
  - 控制节点：加第 4 台需同步 hosts/Galera/HAProxy/Pacemaker 成员与 fernet 密钥。
  - Ceph：加 OSD 扩容；PG 数规划好避免后期 resize 成本高。
- 备份/容灾/高可用：
  - 数据库：Galera 多副本即实时备份；定期 `mysqldump`/物理备份到异地。
  - Ceph：多副本(默认3)防盘坏；跨机房需搭多故障域/纠删码。
  - **脑裂防护**：生产必须开 `stonith-enabled=true` 并配 fence 设备（IPMI/SSH），本书测试环境关了是隐患；quorum 保证少数派停止写入。
  - VIP 漂移演练：手动停持 VIP 节点的 haproxy/关机，验证请求无缝切到其它节点。
- 升级与回滚：
  - OpenStack 跨版本升级用官方 `nova-status upgrade check` 等先做就绪检查（本文 E 节已用到）。
  - 配置走版本管理；Pacemaker 资源改动先 `--force` 演练；Ceph 滚动重启 OSD。

## 6. 检查清单
- [ ] 控制节点 ≥3 且跨故障域，时钟 chrony 同步（`chronyc sources` 正常）
- [ ] /etc/hosts 三节点一致，`controller` 解析到 VIP
- [ ] 防火墙/SELinux 策略已明确（非简单全关），必要端口放行
- [ ] MariaDB-Galera 三节点同步（`wsrep_local_state=4/Synced`），clustercheck 返回 200
- [ ] RabbitMQ 镜像队列 `ha-all` 生效，`rabbitmqctl cluster_status` 正常
- [ ] Memcached 三节点 11211 可达，各服务 `memcache_servers` 列全
- [ ] Pacemaker 集群 up，VIP(192.168.122.30) 存活，`stonith` 生产已开，`no-quorum-policy` 按节点数设定
- [ ] HAProxy `ip_nonlocal_bind=1` 已开，各 `listen` 段后端 `check` 正常，stats 页可见
- [ ] 所有服务 `[database]`/`[keystone_authtoken]` 连 VIP(`controller`) 而非具体 IP
- [ ] Keystone fernet/credential 密钥已同步到全部控制节点
- [ ] Neutron `l3_ha` 已开，网络 agent 状态 `:-)`；VIP/路由可在 l3 agent 间漂移
- [ ] Ceph 三池已建且 `application enable rbd`，`ceph -s` HEALTH_OK，keyring 属主正确
- [ ] Glance/Cinder/Nova 已接 Ceph（images/volumes/vms 落 rbd），volume service up
- [ ] 计算节点 `virt_type=kvm`、已 `discover_hosts`、nova-compute 状态 up
- [ ] live migration 验证：Ceph 启动盘实例可跨计算节点迁移
- [ ] 端到端验证：建网络/子网/路由、从 raw 镜像建 bootable 卷起实例成功

## 复盘
- 做对的地方：
  - 严格"先底座(B)后服务(C–N)"，配置地址统一写 VIP，是高可用落地的关键纪律。
  - 用 Pacemaker 的 order/colocation 把 VIP 与 HAProxy 绑死，避免空跑。
  - Ceph 统一后端让计算节点无状态，热迁移才可行。
- 下次改进：
  - 生产必须启用 stonith/fencing，补齐脑裂防护；2 节点场景不要用 `no-quorum-policy=ignore`。
  - Galera SST 改 `xtrabackup-v2` 减少锁表；HAProxy stats 密码、Memcached 端口暴露需收敛。
  - etcd 按实际依赖决定是否部署（本文"暂未配"需评估 Octavia 等新组件）。
- 关联笔记：[[04-OpenStack-Rocky高可用集群部署]] ｜ 概念：[[OpenStack]] [[高可用HA]] [[控制节点]] [[计算节点]] [[虚拟化KVM]] [[Ceph存储]] [[Keepalived]] [[HAProxy]] [[MariaDB-Galera]] [[Pacemaker]] [[负载均衡]] [[高可用集群]] [[RESTfulAPI]]
