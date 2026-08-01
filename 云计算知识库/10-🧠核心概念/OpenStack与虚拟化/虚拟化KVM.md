---
类型: 概念
主题: 虚拟化KVM
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# 虚拟化KVM

## 一句话定义
> KVM（Kernel-based Virtual Machine）是 Linux 内核自带的虚拟化技术：把 Linux 变成 hypervisor，让一台物理机同时跑多个相互隔离的虚拟机（VM）。

## 它解决什么问题 / 为什么存在
- 一台物理服务器算力很强，但往往只跑一个应用，利用率低。虚拟化把"一台大机器"切成"多台小机器"，互不干扰、按需分配，是 IaaS 的基石。
- OpenStack 的算力就来自 KVM：[[Nova]] 调度的每个实例，底层都是一个 KVM 虚拟机。

## 核心原理（大二能懂的水平）
- CPU 要有硬件虚拟化扩展（Intel VT-x / AMD-V）。开启后，Linux 加载 `kvm` 内核模块，每个虚拟机表现为一个普通进程，由内核调度。
- 用户态用 **QEMU** 模拟设备（网卡、磁盘），KVM 负责跑客户机 CPU 指令——所以常说 "QEMU-KVM"。
- `libvirtd` 是管理 KVM 的守护进程，OpenStack 通过它（driver=virt_type=kvm）创建/删除虚拟机、挂载 Ceph 卷。
- 镜像格式：qcow2（支持快照/薄备）、raw（Ceph 启动盘要求 raw，本书 N 节用 `qemu-img convert` 转 raw）。

## 关键参数 / 易错点
- nova.conf 必须 `[libvirt] virt_type=kvm`；若没开 CPU 虚拟化会回退 QEMU（纯软件，极慢）。
- 计算节点要装 `qemu-kvm-rhev`（本书 I 节需加 `[centos-qemu-ev]` 源）。
- Ceph 后端启动时镜像必须是 raw（full.txt N 节：qcow2 会报错）。
- `live migration` 依赖 libvirtd 开 TCP 监听（`listen_tcp=1`、`auth_tcp=none`，本书 N 节，生产应加 TLS/认证）。

## 类比（帮助理解）
> KVM 像在一栋楼(物理机)里用隔板隔出多个独立公寓(虚拟机)，每户水电(CPU/内存)独立计量，但共用大楼地基(内核)；libvirtd 是物业，负责分房和维修。

## 设计时怎么用（反推思维）
> 选虚拟化方案时：要接近裸机性能、跑通用 Linux/Windows → KVM；要密度极高、秒级启停、配合 [[容器编排]] → 考虑容器（由其他 agent 负责）。OpenStack 场景默认 KVM。

## 典型应用 / 我在哪见过
- 本书 I 节 `virt_type=kvm`；N 节 KVM + Ceph rbd 启动实例、并配置 live migration。

## 关联
- 前置知识：[[计算节点]] [[OpenStack]]
- 相关：[[Nova]] [[Ceph存储]] [[虚拟化KVM]]（自身）
- 反例/误区：把 KVM 和 [[容器]] 混为一谈——KVM 虚拟化的是整台机器(含内核)，容器共享宿主机内核（概念卡由其他 agent 负责）

## 来源
- 《OpenStack-Rocky高可用集群部署》full.txt 步骤 I（nova-compute / virt_type=kvm）、N（libvirt / live migration / rbd 启动）。
- KVM/QEMU/libvirt 关系为通用虚拟化知识。
