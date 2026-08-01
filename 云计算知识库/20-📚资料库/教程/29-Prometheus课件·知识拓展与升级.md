---
类型: 教程
资料: Prometheus课件笔记（云原生大礼包#9）
tags: [教程]
创建: 2026-07-21
---

# Prometheus 课件·知识拓展与升级（K8s 集群升级）

> 源：V2.0 `chap09 知识拓展`（kubernetes升级.docx + 第八章 知识拓展.ppt）。主题为 **Kubernetes 生产集群版本升级**实操。

## 概述
本章给出 K8s 集群"动版本"的实操步骤：先把最关键的 etcd 备份好，再逐层升级控制平面、节点、附加组件。是运维必须掌握的保命技能。详见概念卡 [[Kubernetes升级]]。

## 核心要点（按课件结构）
- **第一步永远备份 etcd**：
  - v2：`etcdctl --ca-file/--key-file/--cert-file --endpoints ... member list`
  - v3：`export ETCDCTL_API=3` 后 `etcdctl --cacert/--key/--cert --endpoints ... member list`
- **升级 etcd**：停止 etcd → 替换 `etcd` 与 `etcdctl` 二进制 → 启动 → 确认 member 正常。
- **升级节点**：`kubectl drain <node> --delete-local-data --force --ignore-daemonsets` 驱逐 → 升级 kubelet/kubeadm → `kubectl uncordon <node>`，逐节点进行。
- **升级附加组件**：Calico（按官方 upgrade 文档）、CoreDNS（`git clone coredns/coredns`、`coredns/deployment`）。

## 关联概念卡
- 主线：[[Kubernetes升级]] [[Etcd]] [[Kubernetes]] [[kubectl]] [[集群搭建kubeadm]]
- 升级对象：[[Calico]] [[高可用集群]] [[滚动更新与回滚]]

## 来源
- V2 章09：`.cache/V2章09拓展/full.txt`
