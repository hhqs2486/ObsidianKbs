---
类型: 概念
tags: [云计算知识库, 容器与K8s]
主题: 容器与K8s
创建: 2026-07-22
状态: 种子
---

# Kubernetes v1.36

> 代号 **ハル (Haru)**，发布于 2026-04-22。最新 patch 1.36.2（2026-06-09）。K8s 版本支持窗口说明见末尾。

## 一句话定义
Kubernetes v1.36（Haru）是 2026 年首个大版本，共 70 项增强：18 项 GA、25 项 Beta、25 项 Alpha。安全加固（User Namespaces GA、Mutating Admission Policies GA）、AI/ML 工作量调度（Workload-Aware Scheduling Alpha、DRA 持续成熟）、API 可扩展性是三大主线。

## 核心特性（按成熟度）

### Stable (GA) —— 生产级，可直接依赖
| 特性 | 说明 |
|------|------|
| **User Namespaces for Pods** | `hostUsers: false`，容器内 root 映射为主机非特权用户，无需 gVisor/Kata |
| **Mutating Admission Policies** | CEL 原生变更准入，无需维护外部 webhook 服务器，GitOps 友好 |
| **Fine-grained Kubelet API Authorization** | kubelet 端点按最小权限授权（`/metrics` ≠ `/exec`），合规团队终于等到了 |
| **SELinux Volume Mounting** | `mount -o context=XYZ` 替代逐文件重标签，Pod 启动大幅提速 |
| **OCI VolumeSource** | 把任意 OCI 镜像当 Volume 挂载——模型权重、数据集、配置包分发不再耦进应用镜像 |
| **VolumeGroupSnapshot** | 跨多个 PVC 一次性创建 crash-consistent 快照 |
| **DRA 多项 GA** | Prioritized Alternatives、AdminAccess for ResourceClaims、扩展 PodResources |
| **Declarative Validation** | validation-gen 驱动，API 校验从手写 Go 代码迁移到声明式 CEL 规则 |
| **Mutable Scheduling Directives for Suspended Jobs** | Job 挂起时可改 node affinity/tolerations/resources，恢复后直接用新配置 |

### Beta —— 默认开启，值得在 staging 测试
- **In-Place Vertical Scaling for Pod-Level Resources**：Pod 级别 CPU/内存原地调整，不重启容器
- **HPA Scale to Zero**：HPA 可将负载缩到 0 副本（自 v1.16 Alpha 近十年终于 Beta）
- **CRI List Streaming**：kubelet 流式接收容器列表，高密度节点内存峰值显著降低
- **Memory QoS (cgroup v2)**：分层内存保护，减少同节点 workload 争抢
- **DRA Partitionable Devices / Consumable Capacity / Device Taints**：设备可分区、可消费容量、可污点驱逐
- **Gang Scheduling (Workload-Aware Scheduling)**：PodGroup 原子调度，分布式训练不再半死不活

### Alpha —— 预览，不建议生产
- **Workload-Aware Scheduling (WAS) 架构**：Workload API（静态模板）+ PodGroup API（运行时状态）分离设计，为后续拓扑感知调度和抢占铺路
- **Pod-level Resource Manager**：kubelet 拓扑/CPU/内存管理器从容器级进化到 Pod 级
- **Manifest-based Admission Control**：准入配置以声明式清单文件管理，集群引导期安全窗口缩小
- **Workload-Aware Preemption**：抢占以 PodGroup 为原子单位，不再逐 Pod 逐出——分布式训练"7/8 running"死锁有救了

## 重大退役与弃用
- **Ingress NGINX 退役**（2026-03-24）：SIG Network + SRC 联合决定，不再发版/修 bug/补 CVE。已有部署继续跑，Helm Chart 仍可用。
- **Service `.spec.externalIPs` 弃用**：已知安全隐患（CVE-2020-8554 中间人攻击），计划 v1.43 移除

## Kubernetes 版本现状（2026-07-22）
| 版本 | 状态 | EOL / 预计 EOL |
|------|------|---------------|
| **1.36** | ✅ 活跃维护，最新 1.36.2 | 2027-06 |
| 1.35 | ✅ 活跃维护 | 2027-02 |
| 1.34 | ✅ 活跃维护 | 2026-10 |
| 1.33 | ❌ EOL | 2026-06-28 |
| 1.32 | ❌ EOL | 2026-02-28 |

> K8s 版本支持周期：N-2 策略，每个版本约 14 个月（发布后 12 个月 + 2 个月对齐季度）。

## 关联
- 前置：[[Kubernetes]] [[Kubernetes升级]]
- AI/ML 调度：[[GPU资源调度]] [[容器编排]]
- 安全：[[安全与认证]] [[准入控制]] [[RBAC]]
- 事件驱动/无服务：[[Knative]]
- 已退役：[[ingress-nginx]]

## 类比
K8s v1.36 像买了房之后把门窗全换成防盗级别——User Namespaces 是把 root 锁在屋里、Mutating Admission Policies 是不用再雇保安公司写外挂、OCI Volume 是把重型家具拆成模块化组件。

## 来源
- Kubernetes v1.36 Release Blog（kubernetes.io, 2026-04-22）
- InfoQ: Kubernetes v1.36 Released (2026-05)
- Cloudraft / PerfectScale release analysis (2026)
