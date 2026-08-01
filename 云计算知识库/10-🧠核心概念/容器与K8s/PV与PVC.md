---
类型: 概念
主题: PV与PVC
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# PV与PVC

## 一句话定义
PV（PersistentVolume，持久化卷）是集群里的**一块存储资源**；PVC（PersistentVolumeClaim，持久化卷申请）是 Pod 向集群「申请使用某块存储」的**许可证**。PV 描述「有什么存储」，PVC 描述「我要用多少、怎么用」，二者绑定后 Pod 才能把 PV 当 [[Volume]] 挂上。

## 它解决什么问题 / 为什么存在
Pod 和节点都可能随时死，容器文件系统又是临时的——数据库、用户上传文件这类**有状态数据必须存在 Pod 之外**。PV/PVC 把「底层存储（云盘/NFS/iSCSI…）」和「应用」解耦：应用只说「我要 10G 可读写的卷」，不用关心背后是 AWS EBS 还是 GCE 磁盘。

## 核心原理（大二能懂的水平）
- 三者关系：外部存储 →（CSI 插件）→ **PV**（集群里的存储对象）→ **PVC**（绑定 PV）→ 挂进 Pod 的 Volume。
- `accessModes`：RWO（ReadWriteOnce，单节点读写，块存储常见）、RWX（ReadWriteMany，多节点读写，NFS 这类文件存储）、ROX（ReadOnlyMany，多节点只读）。
- `persistentVolumeReclaimPolicy`：**Delete**（PVC 释放就删 PV+后端盘，**可能丢数据**，动态置备默认）vs **Retain**（保留 PV，需手动清理复用）。
- **StorageClass** 提供「动态置备」：先建好 SC，出现引用它的 PVC 时，Kubernetes 自动在后端建盘并建 PV——免去了手动建 PV。
- Pod 不能直接绑 PV，必须经由 PVC；PV 容量 ≥ PVC 申请的才能绑。

## 关键参数 / 易错点
- `storageClassName` 要 PV/PVC/SC 三方对得上，否则绑不上（Pending）。
- **易错**：默认 reclaimPolicy 是 Delete，删 PVC 会连数据盘一起删——生产重要数据用 Retain 或设 SC 的 reclaimPolicy。
- **易错**：RWO 的盘不能同时绑多个节点；跨节点共享要选支持 RWX 的后端（如 NFS）。
- **易错**：PV 容量能比 PVC 大（浪费），不能比 PVC 小（绑不上）。

## 类比（帮助理解）
PV 像「公司租的保险柜」，PVC 像「你领的保险柜使用牌」。你不用管保险柜在哪家银行（AWS/GCP），只凭牌子开柜用；牌子交回去（删 PVC），柜子可能被银行直接砸了（Delete）也可能留着（Retain）。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做有持久化需求的系统（数据库、消息队列、用户文件）时，我会给每个需要独立存储的工作负载配 PVC；有状态集群（[[StatefulSet]]）用 `volumeClaimTemplates` 自动按 Pod 建 PVC；并据数据安全等级选 reclaimPolicy 与 StorageClass。

## 典型应用 / 我在哪见过
- 第8章实战：手建 `pv1`（GCE 盘）+ `pvc1`（10Gi, RWO）挂到 `/data`；再用 StorageClass `slow` 动态置备 `pv-ticket`。
- 第10章：StatefulSet 用 `volumeClaimTemplates` 给每个 Pod 自动建 PVC，且缩容保留 PVC。

## 关联
- 前置知识：[[Volume]] [[Pod]] [[StatefulSet]] [[CGroup]]
- 相关：[[ConfigMap]] [[Secret]]（也能挂成卷）、CSI（容器存储接口，存储侧插件标准，与 [[CNI网络]] 网络侧对应）
- 反例/误区：用 emptyDir 存数据库（应改 PV/PVC）

## 来源
- 本书第8章（Kubernetes 存储），`.cache/k8s-handbook/ch16_第8章 Kubernetes存储.txt`。
