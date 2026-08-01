---
类型: 概念
主题: Volume
tags: [概念]
创建: 2026-07-21
复习: 
状态: 种子
---

# Volume

## 一句话定义
Volume（卷）是 Kubernetes 里**给 Pod 内容器提供存储/共享文件**的抽象：在 Pod 里定义一段存储，挂到容器的某个目录，容器就像读写本地目录一样用它。

## 它解决什么问题 / 为什么存在
- 容器文件系统是临时的，Pod 一死数据就没——Volume 让数据能「活过」容器重启。
- 多容器 Pod 里，两个容器想共享文件/内存——Volume 是共享的最简方式（同一 Pod 内容器挂同一卷即可）。
- 把配置（[[ConfigMap]]）、密钥（[[Secret]]）以文件形式「喂」给容器，也靠 Volume。

## 核心原理（大二能懂的水平）
- 卷定义在 Pod 的 `spec.volumes` 里，容器用 `spec.containers.volumeMounts` 把它挂到某 `mountPath`。
- 卷的生命周期通常跟随 Pod：Pod 在，卷在；Pod 删，卷（以及其中的数据，对 emptyDir 这类）也没了。
- 卷类型很多：`emptyDir`（Pod 内临时共享，节点重启即丢）、`configMap`/`secret`（把配置/密钥当文件挂）、`persistentVolumeClaim`（接持久化存储，见 [[PV与PVC]]）、`hostPath`（挂宿主机目录，少用）等。
- 多容器 Pod 共享卷是「服务网格Sidecar」「Web+文件同步」这类紧耦合场景的基础。

## 关键参数 / 易错点
- `volumeMounts.readOnly: true` 可挂只读；`subPath` 可只挂卷里某个文件/子目录（避免覆盖整个 mountPath）。
- **易错**：`emptyDir` 不是持久化，节点重启数据就没——要持久化请用 [[PV与PVC]]。
- **易错**：`hostPath` 把宿主机目录暴露进容器，是安全隐患（提权风险），生产慎用。
- **易错**：卷里的 ConfigMap/Secret 改动，容器里文件会热更新，但有些应用要自己 reload 才生效。

## 类比（帮助理解）
Volume 像「钉在工位（Pod）上的共享抽屉」：同一工位的几个人（容器）都能开抽屉拿文件；工位拆了（Pod 删），抽屉里临时放的东西（emptyDir）也没了；要长期保存就换成带锁的文件柜（PV）。

## 设计时怎么用（反推思维）
> 做 XX 系统时，我会用它能解决 YY。
做需要「多容器协作共享文件」或「配置/密钥以文件注入」的系统时，我会用 Volume 把 [[ConfigMap]]/[[Secret]] 挂成文件，或给 Sidecar 与主容器共享日志目录；凡是要跨 Pod 重启保数据的，改用 [[PV与PVC]]。

## 典型应用 / 我在哪见过
- 第4章：多容器 Pod 共享卷（Web + 文件同步容器）的例子。
- 第8章：PVC 作为卷挂到 `/data`；第9章：ConfigMap 卷挂到 `/etc/name`。
- 第11章：项目卷（projected volume）挂 ServiceAccount 令牌。

## 关联
- 前置知识：[[Pod]] [[容器]] CGroup（Linux 控制组，资源限额底层机制）
- 相关：[[PV与PVC]]（持久化卷）、[[ConfigMap]] [[Secret]]（常经卷注入）、[[StatefulSet]]（每个 Pod 独立卷）
- 反例/误区：用 emptyDir 当数据库存储（应改 [[PV与PVC]]）

## 来源
- 本书第4章（Pod 共享卷）、第8章（PVC 作卷）、第9章（ConfigMap 卷）。部分 Volume 类型（emptyDir/hostPath/subPath）结合通用知识补全。
