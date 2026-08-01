---
类型: 概念
主题: HAProxy
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# HAProxy

## 一句话定义
> HAProxy 是一款高性能的 TCP/HTTP 负载均衡器与反向代理：把打到 VIP 的流量，按策略分发到后端多个真实服务实例，并做健康检查，实现"多活 + 故障剔除"。

## 它解决什么问题 / 为什么存在
- OpenStack 每个服务（Keystone/Nova/Neutron/Glance/Cinder/Horizon、MariaDB、RabbitMQ）在 3 台控制节点各跑一份。客户端只连一个 VIP，谁来把请求分到 3 份上？HAProxy。
- 它让"多实例"对调用方透明，且某实例挂了自动摘掉，是 [[高可用HA]] 的流量入口核心件。

## 核心原理（大二能懂的水平）
- 配置文件里 `listen xxx_cluster` 是"一个转发规则"：`bind VIP:端口` 监听，`server 节点名 IP:端口 check ...` 列出后端，`balance` 选算法。
- 健康检查语法：`check inter 2000 rise 2 fall 5` = 每 2 秒探一次，连续 2 次 OK 算活，连续 5 次失败算死（full.txt B6 节大量出现）。
- HTTP 类服务（如 keystone 5000、glance 9292）用 `option httpchk`；纯 TCP（mysql 3306、rabbitmq 5672、galera）用 `mode tcp` + `option tcpka`。
- 与 [[Keepalived]] / [[Pacemaker]] 配合：HAProxy 本身也要高可用，所以每台控制节点都装 HAProxy，由集群管理器把 HAProxy 绑在拥有 VIP 的节点上（full.txt B7 节 colocation）。

## 关键参数 / 易错点
- 必须 `net.ipv4.ip_nonlocal_bind=1`：HAProxy 要 bind VIP，而 VIP 此刻可能不在本机（full.txt B6 节）。
- MariaDB 后端健康检查依赖 `clustercheck`（xinetd 监听 9200），Galera 未 synced 返回 503 → HAProxy 摘掉该节点（full.txt B2 节）。
- dashboard 用 `balance source`（按源 IP 粘滞，保持会话）；API 多可用 `roundrobin`。
- 监控页 `listen stats` bind 1080，账号 admin:admin（生产要改）。

## 类比（帮助理解）
> HAProxy 像餐厅门口的领位员：客人(VIP请求)只找领位台，领位员看哪桌(后端节点)空闲且健康就把人领过去；某桌在收拾(故障)就暂时不派客。

## 设计时怎么用（反推思维）
> 任何"多实例无状态服务需要一个统一入口 + 自动剔障"的场景，都用 [[负载均衡]] + HAProxy。OpenStack 把所有 API 收敛到 VIP:端口，是最典型用法。

## 典型应用 / 我在哪见过
- 本书 B6 节：`dashboard_cluster`/`galera_cluster`/`rabbitmq_cluster`/`*_api_cluster` 等一大票 listen 段，全部 `bind 192.168.122.30:端口`，后端指向 controller1/2 的对应端口。

## 关联
- 前置知识：[[高可用HA]] [[负载均衡]]
- 相关：[[Keepalived]] [[Pacemaker]] [[MariaDB-Galera]] [[控制节点]] [[Keystone]] [[Nova]] [[Neutron]] [[Glance]] [[Cinder]]
- 反例/误区：漏开 `ip_nonlocal_bind` 致 HAProxy 起不来；后端没配 `check` 导致把流量发给已死节点

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 B2（clustercheck 心跳）、B6（haproxy.cfg 全文）、B7（haproxy 受 Pacemaker 管理）。
