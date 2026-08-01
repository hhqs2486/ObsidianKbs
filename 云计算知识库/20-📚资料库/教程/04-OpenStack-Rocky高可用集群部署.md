---
类型: 教程
来源: 《OpenStack-Rocky高可用集群部署》（cnblogs 博客整理实战文，作者 handesimu）
tags: [教程]
创建: 2026-07-21
状态: 已读待消化
---

# OpenStack-Rocky高可用集群部署

## 这条教程在解决什么
把一套 OpenStack Rocky 从"单节点测试"升级成"生产可用的高可用集群"：3 台控制节点（controller1/2/3）+ 计算节点（compute1），用 Pacemaker/Corosync 管 VIP、HAProxy 做多实例分发、MariaDB-Galera 做多主数据库、RabbitMQ 镜像队列做消息总线，再逐一部署 Keystone/Nova/Neutron/Glance/Cinder/Horizon，最后用 Ceph 做统一存储后端。核心目标只有一个：**任意一台控制节点宕机，云照常运行**。

## 关键内容（按 PDF 章节提纲）
- **A. 基础环境**
  - `/etc/hosts`：controller→VIP(192.168.122.30)、controller1/2/3 各指本机管理网 IP（192.168.100.18x）；compute1(184)（full.txt 行 23-29、395-400）。
  - 关 NetworkManager / firewalld / iptables，关 SELinux（`setenforce 0`）。
  - **时间同步**：控制节点 `chrony.conf` 配 `server 127.0.0.1`、`allow 192.168.100.0/24`、`local stratum 10`；其它节点指向 controller1；`chronyc sources` 验证（行 36-62）。
  - 配 `openstack-rocky` yum 源（阿里云镜像），装 `python-openstackclient openstack-selinux`（行 65-73）。
- **B. 配置高可用环境**
  - **B1 MariaDB-Galera**：三节点 `[galera]` 段（`wsrep_cluster_address=gcomm://controller1,controller2,controller3`、`wsrep_sst_method=rsync`）；首节点 `galera_new_cluster`，其余 `service mariadb start`；建 `galera:galera` SST 用户（行 75-142）。
  - **B2 clustercheck**：`clustercheckuser` 授权；xinetd 起 `mysqlchk` 监听 9200，返回 200/503 表示节点是否 synced，供 HAProxy 探活（行 143-187）。
  - **B3 RabbitMQ**：三节点 `.erlang.cookie` 一致；`rabbitmqctl join_cluster --ram`；`set_policy ha-all "^" '{"ha-mode":"all"}'` 镜像队列；`rabbitmq_management` 插件（行 188-253）。文末记录多个排错（crash dump / inconsistent_cluster / 重建集群）。
  - **B4 Memcached**（缓存令牌，无状态多节点，各服务统一调三节点 11211）+ **etcd**（官方文档要求，本文"暂未配"，但给出完整 etcd.conf 与 `etcdctl member list` 验证）（行 253-298）。
  - **B5 Pacemaker/Corosync**：装 `pcs pacemaker corosync fence-agents-all resource-agents`；`pcs cluster setup --name openstack-cluster controller1 controller2 controller3`；关键属性 `stonith-enabled=false`、`no-quorum-policy=ignore`；建 VIP 资源 `ocf:heartbeat:IPaddr2 ip=192.168.122.30`（行 299-401）。
  - **B6 HAProxy**：每台控制节点一份 `haproxy.cfg`，所有 `listen xxx_cluster` 都 `bind 192.168.122.30:端口`，后端指 controller1/2 对应端口，带 `check inter 2000 rise 2 fall 5`；内核开 `net.ipv4.ip_nonlocal_bind=1`、开 rsyslog 收日志（行 403-555）。
  - **B7 pcs 资源**：`pcs resource create lb-haproxy systemd:haproxy --clone`；`pcs constraint order start vip then lb-haproxy-clone`；`pcs constraint colocation add lb-haproxy-clone with vip`（haproxy 必须和 VIP 同节点）（行 556-574）。
- **C. Keystone**：建库+用户；`keystone.conf` 里 `[cache]` 用 Memcached、`[database]` 连 `controller` VIP、`[token] provider=fernet`；`keystone-manage db_sync`；**fernet/credential 密钥 scp 到 controller2/3**；httpd 只 Listen 本机 IP；`keystone-manage bootstrap` 建 admin+3 endpoint；各服务注册为 Pacemaker clone（行 575-695）。
- **D. Glance**：建 glance 库/用户/service/3 endpoint；`glance-api.conf` 配 `stores=file,http`、`default_store=file`、`filesystem_store_datadir`；`glance-manage db_sync`；上传 cirros 验证；注册 glance-api/registry 为 clone（行 696-790）。
- **E. Nova 控制节点**：建 nova_api/nova/nova_cell0/placement 四库；建 nova/placement 用户+service+endpoint；装 api/conductor/scheduler/novncproxy/placement-api；`transport_url` 指三节点 RabbitMQ；`cell_v2` 建 cell1；注册 5 个服务为 clone（行 791-1011）。
- **F. Neutron 控制/网络节点**：建 neutron 库/用户/service/3 endpoint（`http://controller:9696`）；`core_plugin=ml2`、`service_plugins=router`；**`l3_ha=true`、`max_l3_agents_per_router=3`、`min_l3_agents_per_router=2`**（VRRP HA 路由）；配 ML2（flat/vlan/vxlan + linuxbridge）、linuxbridge_agent（物理网卡映射）、l3/dhcp/metadata agent；注册 5 个 agent 为 clone（行 1012-1186）。
- **G. Horizon**：装 `openstack-dashboard`；`local_settings` 配 `OPENSTACK_HOST="controller"`、`CACHES` 指三节点 Memcached、多域支持；经 HAProxy `dashboard_cluster`（VIP:80）多活（行 1187-1224）。
- **H. Cinder 控制节点**：建 cinder 库/用户/service（v2/v3 两个版本 endpoint，`http://controller:8776`）；装 `openstack-cinder`；注册 cinder-api/scheduler 为 clone（api/scheduler 多活，volume 为 active/passive）（行 1225-1291）。
- **I. Nova 计算节点**：装 `openstack-nova-compute`（需加 `[centos-qemu-ev]` 源解决 `qemu-kvm-rhev` 依赖）；`[libvirt] virt_type=kvm`；**不含 `[database]`**；`nova-manage cell_v2 discover_hosts` 注册；`openstack compute service list` 验证（行 1292-1401）。
- **J. Neutron 计算节点**：装 `openstack-neutron-linuxbridge`；只配 `[neutron]` 段；linuxbridge_agent 配 vlan 网卡映射+vxlan；`openstack network agent list --agent-type linux-bridge` 看 `:-)`（行 1401-1504）。
- **K. Cinder 存储节点**：装 `openstack-cinder targetcli`，`enabled_backends=ceph`；`openstack volume service list` 初始为 down（未接 Ceph）（行 1506-1549）。
- **L. Ceph 分布式存储**：建 volumes/vms/images 三池（PG 数按 `pg×副本 < 每OSD的PG上限×OSD数`）；装 `python-rbd`/`ceph-common`；建 `client.glance`/`client.cinder` 用户、下发 keyring 并改属主；把 `client.cinder` 密钥塞进 libvirt（共用 uuid）（行 1550-1630）。
- **M. Glance 集成 Ceph**：`glance-api.conf` 改 `stores=rbd`、`default_store=rbd`、`rbd_store_pool=images`；上传镜像落到 Ceph images 池；`ceph osd pool application enable images rbd` 消 HEALTH_WARN（行 1631-1708）。
- **N. Cinder/Nova 集成 Ceph + 验证**：Cinder 加 `[ceph]` 段 `RBDDriver`、`rbd_pool=volumes`、`rbd_secret_uuid` 与 libvirt 一致；`cinder type-create ceph` + `type-key ... set volume_backend_name=ceph`；生成 ceph 卷验证 up；Nova 配 `[libvirt] images_type=rbd`、`images_rbd_pool=vms`，配 live migration（libvirtd 开 TCP 16509）；用 raw 镜像建 bootable 卷，建 Internal-Network/subnet/router 验证（行 1709-1956）。

## 我卡住/没懂的地方
- **B5 拓扑反转**：标题/开头说"Keepalived+HAProxy"，实际 VIP 与资源编排是用 **Pacemaker+Corosync** 实现的（Keepalived 是等价替代思路，本书没装）。刚读容易混淆"VIP 到底谁管"。
- **no-quorum-policy=ignore + stonith-enabled=false**：作者说是测试简化，但没讲生产该怎么配（fencing 设备、stonith 真开时的脑裂防护），需要补通用知识。
- **Neutron l3_ha（VRRP）vs router_distributed（DVR）**：注释说二者不能同时开，本文选 VRRP，但 DVR 的 SNAT 仍集中——边界情况没展开。
- **etcd "官方要求但暂未配"**：Rocky 里 etcd 主要给 Octavia/某些新服务，本文场景暂未用，但留了配置，需判断哪些组件依赖它。

## 它背后的原理（别只记操作）
- **为什么所有连接都指向 VIP(`controller`)**：调用方只认一个不变地址，后端三节点谁活谁接，这就是 [[高可用HA]] 的"单一入口"思想。
- **为什么数据库要 Galera 多主**：OpenStack 各服务都要写元数据，单主 MySQL 主挂即瘫；Galera 同步多主让三节点都能写、强一致（[[MariaDB-Galera]]）。
- **为什么 RabbitMQ 要镜像队列**：各服务通过消息队列解耦，`ha-all` 策略让队列在全部节点有副本，单节点挂消息不丢。
- **为什么 HAProxy 要 `ip_nonlocal_bind=1`**：HAProxy 绑 VIP，但 VIP 此刻可能不在本机，内核必须允许绑"不属于本机"的地址（[[HAProxy]]）。
- **为什么 Nova 计算节点不连数据库**：计算节点是"执行层"，只听消息队列+API，减少 DB 暴露面、便于横向扩容（[[计算节点]]）。

## 我能复用/改编的点
> 这套"3 控制节点 + VIP + 负载均衡 + 多主 DB + 镜像 MQ"的骨架，不只 OpenStack 能用：任何有状态中间件（Redis、ZooKeeper、自研管控面）想做生产高可用，都可照搬"冗余 + VIP + 健康检查 + 仲裁"四件套（[[高可用HA]]、[[负载均衡]]）。部署步骤里的"先底座(B)后服务(C–N)、配置里地址统一写 VIP"也适合反推成部署 checklist（见 [[20260721-OpenStackRocky高可用集群部署]]）。

## 关联
- 概念：[[OpenStack]] [[Keystone]] [[Nova]] [[Neutron]] [[Glance]] [[Cinder]] [[Horizon]] [[Swift]] [[高可用HA]] [[控制节点]] [[计算节点]] [[虚拟化KVM]] [[Ceph存储]] [[Keepalived]] [[HAProxy]] [[MariaDB-Galera]] [[Pacemaker]] [[负载均衡]] [[高可用集群]] [[RESTfulAPI]]
- 项目：[[20260721-OpenStackRocky高可用集群部署]]

## 来源
- 《OpenStack-Rocky高可用集群部署》全文 `.cache/openstack/full.txt`（26 页博客整理实战文，cnblogs 来源：https://www.cnblogs.com/netonline/p/9201049.html 等）。
