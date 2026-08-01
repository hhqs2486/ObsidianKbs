---
类型: 概念
主题: 容器与K8s
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Namespace

## 一句话定义
> Namespace（命名空间）是 K8s 里把集群资源"逻辑分区"的机制：同一集群内能分出多个互不干扰的小环境（如 dev / test / prod）。

## 它解决什么问题 / 为什么存在
- 多团队/多项目共用一个集群时，资源、名字会冲突，权限也难以隔离。
- 需要一个"软隔离"层：名字可以重复（不同命名空间内），配额/权限可按空间管控。

## 核心原理（大二能懂的水平）
- 集群启动自带 `default` 命名空间，不指定就都建在这里。
- 资源（Pod、Service、Deployment…）都属于某个 Namespace；同命名空间内名字唯一，跨空间可重名。
- 配合 `kubectl config` 的 Context，可以切换"当前所在空间"，实现隔离视图（第10章 development/production 示例）。
- 系统组件多放在 `kube-system`。

## 关键参数 / 易错点
- `kubectl apply -f ns.yaml`（kind: Namespace）创建；`kubectl get ns` 查看。
- `-n <命名空间>`：很多命令都要带，否则默认 default，易查错空间。
- 易错：删 Namespace 会连带删除里面所有资源（谨慎）。
- 易错：Namespace 是"逻辑隔离"不是"网络/性能强隔离"，要硬隔离需配合 [[多租户]]/网络策略。

## 类比（帮助理解）
- Namespace 像"写字楼里的楼层/公司隔间"：同一栋楼(集群)里，A公司(dev)和B公司(prod)各用各的工位，名字牌可以重，但彼此不串门；物业(管理员)能按楼层限电(配额)。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
- 一上来就按环境(development/production)或团队划分 Namespace，并用 ResourceQuota/LimitRange 限制每空间用量，而非把所有东西堆在 default。

## 典型应用 / 我在哪见过
- 第1章 1.2.7 介绍；第10章用 development/production 两个 Namespace + Context 演示隔离；第11章为 MySQL 单独建 mysql-ns；第9章 Dashboard 资源在 kube-system。

## 关联
- 前置知识：[[Pod]] [[Service]] [[Deployment]]
- 相关：[[Label与Selector]] [[多租户]] [[资源限制与QoS]] [[RBAC]] [[kube-proxy]]
- 反例/误区：把 Namespace 当安全边界（隔离有限，需额外策略）

## 来源
- 《Kubernetes零基础快速入门 2021.3》第1章 1.2.7、第10章 10.3
