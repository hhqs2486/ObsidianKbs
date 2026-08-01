---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Kubernetes升级

## 一句话定义
> 对生产 K8s 集群做**有序的版本滚动升级**：依次升级控制平面（etcd / kube-apiserver / controller-manager / scheduler）、各工作节点 kubelet，以及 Calico、CoreDNS 等附加组件，目标是在业务不中断的前提下把集群从一个小版本推到下一个小版本。

## 它解决什么问题 / 为什么存在
- K8s 版本迭代快（约每季度一个小版本），不升级会踩不到安全补丁、新特性，且版本落后太多后"想升也升不动"（跨版本不兼容）。
- 升级是高危操作：顺序错、漏备份 etcd，可能整集群不可用。本课件的升级实操强调"**etcd 备份是救命稻草**"。

## 核心原理（大二能懂的水平）
**总体顺序：先备后升、先控制平面后节点、逐节点驱逐再升级。**

1. **备份 etcd**（最关键一步）：
   - v2 命令：`etcdctl --ca-file ... --key-file ... --cert-file ... --endpoints ... member list`
   - v3 命令：`export ETCDCTL_API=3` 后 `etcdctl --cacert ... --key ... --cert ... --endpoints ... member list`
   - 务必先 `etcdctl snapshot save` 落盘再动。
2. **升级 etcd**：停止 etcd → 替换 `etcd` 和 `etcdctl` 二进制 → 启动，确认 `member list` 正常。
3. **驱逐节点**：`kubectl drain <node> --delete-local-data --force --ignore-daemonsets`（忽略 DaemonSet，否则驱逐不完）。
4. **升级控制平面组件**：用 `kubeadm upgrade` 依次升 kube-apiserver / controller-manager / scheduler（或替换静态 Pod 清单）。
5. **升级节点 kubelet/kubeadm**：在节点上替换二进制并 `systemctl restart kubelet`。
6. **恢复调度**：`kubectl uncordon <node>`，再对下一个节点重复 3–6。
7. **升级附加组件**：Calico（按官方 upgrade 文档）、CoreDNS（`git clone coredns/coredns`、`coredns/deployment`）。

## 关键参数 / 易错点
- **版本偏差策略**：控制平面最多领先 kubelet 一个小版本；**禁止跨多个小版本跳升**，必须一步一步来。
- **易错**：忘了先备份 etcd——一旦升级翻车，没有备份等于无 rollback。
- **易错**：`drain` 时不加 `--ignore-daemonsets`，导致 DaemonSet（如 Calico、监控 agent）卡住无法驱逐。
- **易错**：先升 kubelet 后升控制平面（顺序反了会报版本不兼容）。
- **回滚**：控制平面组件大多以静态 Pod 运行，可把清单回退到旧版本镜像；节点可 `kubeadm upgrade` 到旧版。

## 类比（帮助理解）
升级像"给飞行中的飞机换引擎"：先拍下完整图纸（etcd 备份），一次只拆一台发动机（逐节点 drain），换完试转正常再放开调度（uncordon），全部换完再升级副翼（Calico/CoreDNS）。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做"生产集群长期运行必须跟版本"的场景时，我会把升级做成 runbook：升级前强制 etcd 快照 + 跑一遍 `kubectl get nodes` 确认健康 → 严格按"控制平面→节点(逐台 drain/uncordon)→附加组件"顺序 → 每步后验证 `kubectl get cs` 与核心 Pod 状态。

## 典型应用 / 我在哪见过
- V2 章09（知识拓展）：kubernetes升级.docx 给出 etcd 备份/替换、节点 drain、calico/coredns 升级实操步骤。

## 关联
- 前置/核心：[[Etcd]] [[Kubernetes]] [[kubectl]] [[集群搭建kubeadm]] [[高可用集群]]
- 升级对象：[[Calico]] [[滚动更新与回滚]]（节点滚动升级思路）

## 来源
- V2 章09（知识拓展）：`.cache/V2章09拓展/full.txt`（kubernetes升级.docx）
- 本卡结合 K8s 升级通用知识整理（课件为课件文档，结合章节结构整理）。
