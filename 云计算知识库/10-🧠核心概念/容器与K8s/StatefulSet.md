---
类型: 概念
主题: StatefulSet
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# StatefulSet

## 一句话定义
StatefulSet 是 Kubernetes 用来部署**有状态应用**（数据库、消息队列等会保存数据的应用）的控制器，它让每个 Pod 拥有**稳定且可预知的名字、DNS 主机名和绑定的存储卷**。

## 它解决什么问题 / 为什么存在
[[Deployment]] 管的 Pod 名字随机、IP 会变、存储不跟随——适合无状态服务。但数据库这类应用需要「我是节点 2、我的数据盘就是这块、我的同伴能按名字找到我」。StatefulSet 提供这种「稳定身份」，让 Pod 像牲畜群里被编号、记名的成员，挂了换一个同名的顶上，连的还是同一块盘。

## 核心原理（大二能懂的水平）
- Pod 命名规则：`<StatefulSet名>-<从0开始的序号>`，如 `tkb-sts-0/1/2`。
- 有序创建/删除（默认 `OrderedReady`）：前一个 Pod 运行且就绪，才建下一个；缩容先删最高序号。避免有状态集群同时重启丢数据。
- 用 **headless Service**（`clusterIP: None`）作 governing Service，给每个 Pod 生成可预测的 DNS：`pod名.svc名.namespace.svc.cluster.local`，同伴据此互相发现。
- `volumeClaimTemplates`：每新建一个 Pod 自动建一个**独立 PVC**，命名 `<模板名>-<sts名>-<序号>`；缩容删 Pod **保留 PVC**，再扩容重连旧盘——防数据丢。
- 滚动升级从**最高索引**的 Pod 开始，逐个替换。

## 关键参数 / 易错点
- `serviceName` 必须指向一个存在的 headless Service，否则 DNS 记录建不出来。
- **易错**：删除 StatefulSet 默认不按序删 Pod，建议先 `kubectl scale sts ... --replicas=0` 再删，避免应用被瞬间拍停。
- **易错**：PVC 不会因为 Pod/StatefulSet 删除而自动删，要手动清，否则盘越积越多。
- `podManagementPolicy: Parallel` 可改成并行（类似 Deployment），但滚动升级仍有序。

## 类比（帮助理解）
StatefulSet 像「有编号的交响乐团乐手」：每个人有固定座位号和名字（Pod 名），谱子（数据）放在贴着自己名字的谱架上（PVC）。某人请假，替补坐同一个号、看同一份谱，观众（其他服务）按座位号找人，演出不中断。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做数据库、Elasticsearch、ZooKeeper 这类「每个实例身份固定、数据要跟随实例」的系统时，我会用 StatefulSet + headless Service + 每实例 PVC；无状态服务则继续用 [[Deployment]]，别乱用 StatefulSet。

## 典型应用 / 我在哪见过
- 第10章实战：用 StorageClass `flash` + headless Service `dullahan` + StatefulSet `tkb-sts`（3 副本 mongo 风格），演示有序扩容、缩容保留 PVC、Pod 故障重建同名同卷。

## 关联
- 前置知识：[[Pod]] [[Deployment]] [[Service]] [[PV与PVC]] [[Volume]] [[DNS与服务发现]]
- 相关：[[DaemonSet]]（另一种特殊控制器）、[[Label与Selector]]、[[滚动更新与回滚]]
- 反例/误区：把无状态 Web 用 StatefulSet 跑（应改 Deployment）

## 来源
- 本书第10章（StatefulSet），`.cache/k8s-handbook/ch18_第10章 StatefulSet.txt`。
