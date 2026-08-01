---
类型: 概念
主题: Keepalived
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Keepalived

## 一句话定义
> Keepalived 是基于 VRRP 协议的高可用工具：在一组服务器间"协商"出一个虚拟 IP（VIP），并负责健康检查与故障漂移，主节点挂了 VIP 自动漂到备节点。

## 它解决什么问题 / 为什么存在
- 很多服务需要一个"永远不变的对内地址"。把 VIP 绑在 Keepalived 上，后端真实服务器换 IP、宕机都不影响调用方。
- 它是 OpenStack 高可用里"VIP 该怎么漂"的最常见方案之一，和 [[HAProxy]] 是经典搭档（Keepalived 管 VIP，HAProxy 管转发）。

## 核心原理（大二能懂的水平）
- **VRRP（虚拟路由冗余协议）**：多台机器选一个 Master 持有 VIP，互相发心跳；Master 没了，Backup 按优先级接手 VIP。
- Keepalived 还能对后端做 `vrrp_script` 健康检查（比如探某个端口/进程），不健康就主动让出 VIP。
- 和 [[Pacemaker]] 区别：Keepalived 轻量、专注"VIP 漂移 + 简单健康检查"；Pacemaker 是完整集群资源管理器（能管任意 systemd 资源、设约束）。本书实际用的是 Pacemaker+Corosync 管 VIP，Keepalived 是等价替代思路。

## 关键参数 / 易错点
- `vrrp_instance` 里 `state MASTER/BACKUP`、`priority`、`virtual_ipaddress` 是核心；同一 VRRP 组 `virtual_router_id` 必须一致。
- 多台优先级不能相同，否则脑裂抢 VIP。
- 需 `net.ipv4.ip_nonlocal_bind=1` 才允许 HAProxy 绑定还没飘到本机的 VIP（full.txt B6 节同样改了这个内核参数）。
- 抢占/非抢占模式（`nopreempt`）决定原主恢复后是否抢回 VIP。

## 类比（帮助理解）
> Keepalived 像几个保安轮流举一块"现在由我值班"的牌子(VIP)，谁举手谁接客；举牌的人晕了，下一个立刻接牌，门外的人只认牌子不认人。

## 设计时怎么用（反推思维）
> 需要"一个不变入口 IP + 自动主备切换"、且不想引入重集群管理器时，用 Keepalived+[[HAProxy]]。要更细的资源编排/约束（如本书），用 [[Pacemaker]]。

## 典型应用 / 我在哪见过
- 常见 OpenStack HA：Keepalived(VIP) + HAProxy(分发) 组合。
- 本书 B5/B7 用 [[Pacemaker]]+Corosync 实现同样目标（VIP + haproxy 约束），可对照理解。

## 关联
- 前置知识：[[高可用HA]] [[负载均衡]]
- 相关：[[HAProxy]] [[Pacemaker]] [[控制节点]]
- 反例/误区：优先级相同导致 [[脑裂]]（双主抢 VIP）；没开 `ip_nonlocal_bind` 致 HAProxy 起不来

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 B5（Pacemaker 配 VIP，等价思路）、B6（`net.ipv4.ip_nonlocal_bind=1`）、B7（haproxy 与 vip 约束）。
- Keepalived/VRRP 为通用高可用知识。
